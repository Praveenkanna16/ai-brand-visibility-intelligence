import { prisma } from '@/lib/prisma/client';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { ExtractorAgent } from '@/lib/extraction/extractor';
import { ScoringCalculator, ScoringInput } from '@/lib/scoring/calculator';
import { RecommendationAgent } from '@/lib/recommendations/agent';
import { BriefGenerator } from '@/lib/recommendations/brief-generator';

export async function executeRunInBackground(runId: string): Promise<void> {
  console.log(`[Runner] Starting background execution for runId: ${runId}`);

  try {
    // 1. Fetch Run Record
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { brand: true },
    });

    if (!run) {
      console.error(`[Runner] Run not found: ${runId}`);
      return;
    }

    const brandName = run.brand.name;
    const competitors: string[] = JSON.parse(run.competitorNames || '[]');
    const engines: string[] = JSON.parse(run.enginesUsed || '["gemini"]');
    const promptTexts: string[] = JSON.parse(run.promptIds || '[]');

    const totalSteps = promptTexts.length * engines.length;

    // 2. Update Run Status to RUNNING
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        progressCurrent: 0,
        progressTotal: totalSteps,
        currentStep: 'Querying AI Engines',
        currentStepDetail: `Starting execution across ${engines.length} engine(s) and ${promptTexts.length} prompt(s)...`,
      },
    });

    const executionResults: Array<{
      promptText: string;
      rawResponse: string;
      mentioned: boolean;
      position: number | null;
      competitorsMentioned: string[];
      engineName: string;
      engineColor: string;
      sentiment: string | null;
    }> = [];

    let currentStepCount = 0;

    // 3. Process Each Prompt x Engine
    for (let pIdx = 0; pIdx < promptTexts.length; pIdx++) {
      const promptText = promptTexts[pIdx];

      // Ensure Prompt model record exists in DB
      let promptRecord = await prisma.prompt.findFirst({
        where: { brandId: run.brandId, text: promptText },
      });
      if (!promptRecord) {
        promptRecord = await prisma.prompt.create({
          data: {
            text: promptText,
            brandId: run.brandId,
            category: 'Brand Visibility',
          },
        });
      }

      for (let eIdx = 0; eIdx < engines.length; eIdx++) {
        const engineIdStr = engines[eIdx];
        const engineDisplayName =
          engineIdStr === 'gemini'
            ? 'Gemini Advanced'
            : engineIdStr === 'openai' || engineIdStr === 'chatgpt'
            ? 'ChatGPT (GPT-4)'
            : engineIdStr === 'anthropic' || engineIdStr === 'claude'
            ? 'Claude 3.5'
            : engineIdStr === 'perplexity'
            ? 'Perplexity Pro'
            : engineIdStr;

        const engineColor =
          engineIdStr === 'gemini'
            ? '#8E75B2'
            : engineIdStr.includes('gpt')
            ? '#10A37F'
            : engineIdStr.includes('claude')
            ? '#D97706'
            : '#2563EB';

        // Ensure AIEngine record exists in DB
        let engineRecord = await prisma.aIEngine.findUnique({
          where: { name: engineIdStr },
        });
        if (!engineRecord) {
          engineRecord = await prisma.aIEngine.create({
            data: {
              name: engineIdStr,
              provider: engineIdStr,
              modelId: 'default',
              displayName: engineDisplayName,
              color: engineColor,
            },
          });
        }

        // Update progress detail
        await prisma.run.update({
          where: { id: runId },
          data: {
            currentStep: 'Querying AI Engines',
            currentStepDetail: `[${currentStepCount + 1}/${totalSteps}] Querying ${engineDisplayName} for prompt: "${promptText.substring(0, 45)}..."`,
          },
        });

        let rawResponse = '';
        let extraction: any = null;

        try {
          // Send query to AI Provider
          const provider = LLMProviderFactory.getProvider(engineIdStr, engineRecord.id);
          const aiRes = await provider.generateResponse(promptText, {
            systemPrompt:
              'Answer the user question comprehensively, accurately, and objectively. Mention relevant products, tools, and platforms where applicable.',
          });
          rawResponse = aiRes.rawResponse;

          // Run Structured Extraction
          extraction = await ExtractorAgent.extract(rawResponse, brandName, competitors);
        } catch (err: any) {
          console.error(`[Runner] Error querying ${engineIdStr} for prompt "${promptText}":`, err);
          rawResponse = `Analysis query encountered provider notice: ${err.message || String(err)}`;
          extraction = {
            mentioned: false,
            position: null,
            competitorsMentioned: [],
            sentiment: null,
            relevantClaims: ['Provider request limit / notice'],
            evidence: [{ source: 'System', title: 'Provider Notice', description: err.message || 'Execution error' }],
            confidence: 0.5,
          };
        }

        // Save RunResult to Database
        const runResult = await prisma.runResult.create({
          data: {
            runId: run.id,
            promptId: promptRecord.id,
            engineId: engineRecord.id,
            rawResponse,
            mentioned: extraction.mentioned,
            position: extraction.position,
            competitorsMentioned: JSON.stringify(extraction.competitorsMentioned || []),
            sentiment: extraction.sentiment,
            relevantClaims: JSON.stringify(extraction.relevantClaims || []),
            evidence: JSON.stringify(extraction.evidence || []),
            confidence: extraction.confidence || 0.9,
            status: extraction.mentioned
              ? 'favorable'
              : extraction.competitorsMentioned?.length > 0
              ? 'gap_detected'
              : 'needs_optimization',
            statusLabel: extraction.mentioned ? 'Mentioned' : 'Gap Detected',
          },
        });

        executionResults.push({
          promptText,
          rawResponse,
          mentioned: extraction.mentioned,
          position: extraction.position,
          competitorsMentioned: extraction.competitorsMentioned || [],
          engineName: engineDisplayName,
          engineColor,
          sentiment: extraction.sentiment,
        });

        currentStepCount++;
        await prisma.run.update({
          where: { id: runId },
          data: {
            progressCurrent: currentStepCount,
          },
        });
      }
    }

    // 4. Calculate Deterministic Metrics
    await prisma.run.update({
      where: { id: runId },
      data: {
        currentStep: 'Calculating Visibility Metrics',
        currentStepDetail: 'Aggregating Share of Voice, Average Position, and Per-Engine Scores...',
      },
    });

    const scoringInput: ScoringInput = {
      targetBrand: brandName,
      results: executionResults,
      allCompetitors: competitors,
    };

    const computedMetrics = ScoringCalculator.calculate(scoringInput);

    // Save VisibilityMetric to DB
    await prisma.visibilityMetric.create({
      data: {
        brandId: run.brandId,
        runId: run.id,
        visibilityScore: computedMetrics.visibilityScore,
        mentionRate: computedMetrics.mentionRate,
        avgPosition: computedMetrics.avgPosition,
        shareOfMentions: computedMetrics.shareOfMentions,
        engineBreakdown: JSON.stringify(computedMetrics.engineBreakdown),
        competitorShares: JSON.stringify(computedMetrics.competitorShares),
        period: '7D',
      },
    });

    // 5. Visibility Gap Detection & AI Investigation Briefs
    await prisma.run.update({
      where: { id: runId },
      data: {
        currentStep: 'Generating Strategic Briefs',
        currentStepDetail: 'Analyzing competitive visibility gaps and building content briefs...',
      },
    });

    // Find gaps where target brand was NOT mentioned but competitors WERE
    const gapResults = executionResults.filter(
      (r) => !r.mentioned && r.competitorsMentioned.length > 0
    );

    for (const gap of gapResults) {
      const winningCompetitor = gap.competitorsMentioned[0];
      try {
        const recommendationResult = await RecommendationAgent.analyzeGap({
          promptText: gap.promptText,
          rawResponse: gap.rawResponse,
          targetBrand: brandName,
          winningCompetitor,
        });

        // Save Insight to DB
        const insight = await prisma.insight.create({
          data: {
            runId: run.id,
            brandId: run.brandId,
            competitorName: winningCompetitor,
            promptText: gap.promptText,
            brandMentioned: false,
            brandStatus: 'NOT MENTIONED',
            competitorMentioned: true,
            observation: recommendationResult.observation,
            whyCompetitorWon: recommendationResult.whyCompetitorWon,
            evidenceText: recommendationResult.evidenceText,
            hypothesis: recommendationResult.hypothesis,
            recommendedAction: recommendationResult.recommendedAction,
            contentType: recommendationResult.contentType,
            contentAngle: recommendationResult.contentAngle,
            suggestedEvidence: recommendationResult.suggestedEvidence,
            confidence: recommendationResult.confidence,
            limitations: recommendationResult.limitations,
          },
        });

        // Create Brief record connected to Insight
        const briefData = BriefGenerator.generateBriefFromInsight(insight as any);
        await prisma.brief.create({
          data: {
            insightId: insight.id,
            title: briefData.title,
            targetQuery: briefData.targetQuery,
            visibilityGap: briefData.visibilityGap,
            competitorAdvantage: briefData.competitorAdvantage,
            contentType: briefData.contentType,
            strategicAngle: briefData.strategicAngle,
            formatType: briefData.formatType,
            primaryAsset: briefData.primaryAsset,
            evidenceToInclude: briefData.evidenceToInclude,
            recommendedStructure: JSON.stringify(briefData.recommendedStructure),
            reasoning: briefData.reasoning,
            confidence: briefData.confidence,
            limitations: briefData.limitations,
            analystNote: briefData.analystNote,
            status: 'generated',
            winningCompetitors: JSON.stringify(gap.competitorsMentioned),
          },
        });
      } catch (gapErr) {
        console.error(`[Runner] Error generating gap brief for competitor ${winningCompetitor}:`, gapErr);
      }
    }

    // 6. Complete Run
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        progressCurrent: totalSteps,
        currentStep: 'Analysis Complete',
        currentStepDetail: `Analysis finished. ${executionResults.length} result(s) evaluated.`,
      },
    });

    console.log(`[Runner] Run ${runId} completed successfully!`);
  } catch (error: any) {
    console.error(`[Runner] Run ${runId} failed with critical error:`, error);
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        error: error?.message || String(error),
        currentStep: 'Analysis Failed',
        currentStepDetail: error?.message || 'Execution error encountered',
      },
    });
  }
}
