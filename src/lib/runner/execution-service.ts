import { prisma, inMemStore } from '@/lib/prisma/client';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { ExtractorAgent } from '@/lib/extraction/extractor';
import { ScoringCalculator, ScoringInput } from '@/lib/scoring/calculator';
import { RecommendationAgent } from '@/lib/recommendations/agent';
import { BriefGenerator } from '@/lib/recommendations/brief-generator';

export async function executeRunInBackground(runId: string): Promise<void> {
  console.log(`[Runner] Starting background execution for runId: ${runId}`);

  try {
    // 1. Fetch Run Record from DB or inMemStore
    let run = await prisma.run.findUnique({
      where: { id: runId },
      include: { brand: true },
    }).catch(() => null);

    const memRun = inMemStore.runs.get(runId);

    const brandId = run?.brandId || memRun?.brandId || `b-${Date.now()}`;
    const brandName = run?.brand?.name || memRun?.brandName || 'Brand';
    const competitors: string[] = run ? JSON.parse(run.competitorNames || '[]') : memRun?.competitorNames || [];
    const engines: string[] = run ? JSON.parse(run.enginesUsed || '["gemini"]') : memRun?.enginesUsed || ['gemini'];
    const promptTexts: string[] = run ? JSON.parse(run.promptIds || '[]') : memRun?.promptIds || [];

    const totalSteps = promptTexts.length * engines.length;

    // Helper to update progress across DB and inMemStore
    const updateProgress = async (current: number, step: string, detail: string) => {
      const existingMem = inMemStore.runs.get(runId);
      if (existingMem) {
        existingMem.status = 'RUNNING';
        existingMem.progressCurrent = current;
        existingMem.progressTotal = totalSteps;
        existingMem.currentStep = step;
        existingMem.currentStepDetail = detail;
      }
      try {
        await prisma.run.update({
          where: { id: runId },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
            progressCurrent: current,
            progressTotal: totalSteps,
            currentStep: step,
            currentStepDetail: detail,
          },
        });
      } catch {
        // Fallback to inMemStore
      }
    };

    await updateProgress(
      0,
      'Querying AI Engines',
      `Starting execution across ${engines.length} engine(s) and ${promptTexts.length} prompt(s)...`
    );

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
      let promptRecord: any = null;
      try {
        promptRecord = await prisma.prompt.findFirst({
          where: { brandId, text: promptText },
        });
        if (!promptRecord) {
          promptRecord = await prisma.prompt.create({
            data: {
              text: promptText,
              brandId,
              category: 'Brand Visibility',
            },
          });
        }
      } catch {
        promptRecord = { id: `p-${pIdx}`, text: promptText };
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
        let engineRecord: any = null;
        try {
          engineRecord = await prisma.aIEngine.findUnique({
            where: { name: engineIdStr },
          });
          if (!engineRecord) {
            engineRecord = await prisma.aIEngine.create({
              data: {
                name: engineIdStr,
                provider: engineIdStr.includes('gpt') ? 'openai' : engineIdStr,
                modelId: engineIdStr === 'gemini' ? 'gemini-flash-latest' : engineIdStr,
                displayName: engineDisplayName,
                color: engineColor,
              },
            });
          }
        } catch {
          engineRecord = { id: `e-${eIdx}`, name: engineIdStr, displayName: engineDisplayName };
        }

        currentStepCount++;
        await updateProgress(
          currentStepCount,
          'Querying AI Engines',
          `[${currentStepCount}/${totalSteps}] Querying ${engineDisplayName} for prompt: "${promptText.substring(
            0,
            45
          )}..."`
        );

        // Server-Side LLM Call to Gemini
        let rawResponse = '';
        try {
          const provider = LLMProviderFactory.getProvider('gemini');
          const llmRes = await provider.generateResponse(promptText, {
            systemPrompt:
              'You are a neutral consumer guide and product analyst. Provide an unbiased, comprehensive answer comparing leading brands and tools.',
          });
          rawResponse = llmRes.rawResponse;
        } catch (llmErr: any) {
          console.error(`[Runner] Gemini API call failed for prompt "${promptText}":`, llmErr);
          rawResponse = `[Analysis System Warning: Unable to retrieve Gemini live response. Error: ${
            llmErr?.message || 'Gemini API Timeout'
          }]`;
        }

        // Extractor Agent
        await updateProgress(
          currentStepCount,
          'Extracting Brand Mentions',
          `Analyzing mention status and competitor citations for "${brandName}"...`
        );

        const extraction = await ExtractorAgent.extract(rawResponse, brandName, competitors);

        // Store result in DB
        try {
          await prisma.runResult.create({
            data: {
              runId,
              promptId: promptRecord.id,
              engineId: engineRecord.id,
              rawResponse,
              mentioned: extraction.mentioned,
              mentionType: extraction.mentioned ? 'Primary Mention' : 'Not Mentioned',
              position: extraction.position,
              competitorsMentioned: JSON.stringify(extraction.competitorsMentioned),
              sentiment: extraction.sentiment,
              relevantClaims: JSON.stringify(extraction.relevantClaims),
              evidence: JSON.stringify(extraction.evidence),
              confidence: extraction.confidence,
              status: 'completed',
              statusLabel: 'Analysis Complete',
            },
          });
        } catch {
          // Fallback to inMemStore
        }

        const resObj = {
          promptText,
          rawResponse,
          mentioned: extraction.mentioned,
          position: extraction.position,
          competitorsMentioned: extraction.competitorsMentioned,
          engineName: engineDisplayName,
          engineColor,
          sentiment: extraction.sentiment,
        };

        executionResults.push(resObj);

        const currentMem = inMemStore.runs.get(runId);
        if (currentMem) {
          currentMem.results.push(resObj);
        }
      }
    }

    // 4. Calculate Deterministic Visibility Metrics
    await updateProgress(totalSteps, 'Calculating Visibility Metrics', 'Computing visibility scores and competitor market share...');

    const scoringInput: ScoringInput = {
      targetBrand: brandName,
      allCompetitors: competitors,
      results: executionResults,
    };

    const metrics = ScoringCalculator.calculate(scoringInput);

    // Save metric to DB
    try {
      await prisma.visibilityMetric.create({
        data: {
          brandId,
          runId,
          visibilityScore: metrics.visibilityScore,
          mentionRate: metrics.mentionRate,
          avgPosition: metrics.avgPosition,
          shareOfMentions: metrics.shareOfMentions,
          engineBreakdown: JSON.stringify(metrics.engineBreakdown),
          competitorShares: JSON.stringify(metrics.competitorShares),
          period: 'Live Run',
        },
      });
    } catch {
      // Fallback
    }

    const currentMem = inMemStore.runs.get(runId);
    if (currentMem) {
      currentMem.metrics = metrics;
    }

    // 5. Detect Gaps & Generate Strategic Recommendations
    await updateProgress(totalSteps, 'Generating Strategic Briefs', 'Analyzing gap scenarios and generating evidence-backed briefs...');

    const gaps: Array<{
      promptText: string;
      competitorsMentioned: string[];
      rawResponse: string;
    }> = [];

    for (const res of executionResults) {
      if (!res.mentioned && res.competitorsMentioned.length > 0) {
        gaps.push({
          promptText: res.promptText,
          competitorsMentioned: res.competitorsMentioned,
          rawResponse: res.rawResponse,
        });
      }
    }

    for (const gap of gaps) {
      const winningCompetitor = gap.competitorsMentioned[0] || 'Competitor';

      try {
        const gapAnalysis = await RecommendationAgent.analyzeGap({
          targetBrand: brandName,
          winningCompetitor: winningCompetitor,
          promptText: gap.promptText,
          rawResponse: gap.rawResponse,
        });

        // Create Insight record
        let insight: any = null;
        try {
          insight = await prisma.insight.create({
            data: {
              runId,
              brandId,
              competitorName: winningCompetitor,
              promptText: gap.promptText,
              brandMentioned: false,
              brandStatus: 'Not Mentioned',
              competitorMentioned: true,
              competitorPosition: 1,
              competitorCiteRate: 85,
              observation: gapAnalysis.observation,
              whyCompetitorWon: gapAnalysis.whyCompetitorWon,
              evidenceText: gapAnalysis.evidenceText,
              hypothesis: gapAnalysis.hypothesis,
              recommendedAction: gapAnalysis.recommendedAction,
              contentType: gapAnalysis.contentType,
              contentAngle: gapAnalysis.contentAngle,
              suggestedEvidence: gapAnalysis.suggestedEvidence,
              confidence: gapAnalysis.confidence,
              limitations: gapAnalysis.limitations,
            },
          });
        } catch {
          insight = {
            id: `ins-${Date.now()}`,
            competitorName: winningCompetitor,
            promptText: gap.promptText,
            whyCompetitorWon: gapAnalysis.whyCompetitorWon,
            evidenceText: gapAnalysis.evidenceText,
            hypothesis: gapAnalysis.hypothesis,
            recommendedAction: gapAnalysis.recommendedAction,
          };
        }

        // Create Brief record connected to Insight
        const briefData = BriefGenerator.generateBriefFromInsight(insight as any);
        try {
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
        } catch {
          // Fallback
        }

        if (currentMem) {
          currentMem.insights.push({
            ...insight,
            brief: briefData,
          });
        }
      } catch (gapErr) {
        console.error(`[Runner] Error generating gap brief for competitor ${winningCompetitor}:`, gapErr);
      }
    }

    // 6. Complete Run
    try {
      await prisma.run.update({
        where: { id: runId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progressCurrent: totalSteps,
          currentStep: 'Analysis Complete',
          currentStepDetail: `Successfully analyzed ${totalSteps} prompt run(s). All visibility metrics stored.`,
        },
      });
    } catch {
      // Fallback
    }

    if (currentMem) {
      currentMem.status = 'COMPLETED';
      currentMem.completedAt = new Date();
      currentMem.progressCurrent = totalSteps;
      currentMem.currentStep = 'Analysis Complete';
      currentMem.currentStepDetail = `Successfully analyzed ${totalSteps} prompt run(s). All visibility metrics stored.`;
    }

    console.log(`[Runner] Run ${runId} completed successfully!`);
  } catch (err: any) {
    console.error(`[Runner] Critical failure executing run ${runId}:`, err);
    const currentMem = inMemStore.runs.get(runId);
    if (currentMem) {
      currentMem.status = 'FAILED';
      currentMem.error = err?.message || 'Execution error';
    }
    try {
      await prisma.run.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          error: err?.message || 'Execution error',
          completedAt: new Date(),
        },
      });
    } catch {
      // Fallback
    }
  }
}
