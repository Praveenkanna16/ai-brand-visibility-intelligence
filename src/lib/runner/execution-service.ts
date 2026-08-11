import { prisma } from '@/lib/prisma/client';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { ExtractorAgent } from '@/lib/extraction/extractor';
import { ScoringCalculator, ScoringInput } from '@/lib/scoring/calculator';
import { RecommendationAgent } from '@/lib/recommendations/agent';
import { BriefGenerator } from '@/lib/recommendations/brief-generator';

const MAX_CONCURRENCY = 2;

async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let currentIndex = 0;

  async function next(): Promise<void> {
    const idx = currentIndex++;
    if (idx >= items.length) return;
    results[idx] = await fn(items[idx], idx);
    await next();
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => next()
  );
  await Promise.all(workers);
  return results;
}

export async function executeRunInBackground(runId: string): Promise<void> {
  console.log(`[Runner] Starting execution for runId: ${runId}`);

  try {
    // 1. Fetch Run from DB (the ONLY source of truth)
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { brand: true },
    });

    if (!run) {
      console.error(`[Runner] Run ${runId} not found in database.`);
      return;
    }

    const brandId = run.brandId;
    const brandName = run.brand.name;
    const competitors: string[] = JSON.parse(run.competitorNames || '[]');
    const engines: string[] = JSON.parse(run.enginesUsed || '["gemini"]');
    const promptTexts: string[] = JSON.parse(run.promptTexts || '[]');
    const totalSteps = promptTexts.length * engines.length;

    // 2. Update status to RUNNING
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

    // 3. Ensure AIEngine record exists
    let engineRecord = await prisma.aIEngine.findUnique({
      where: { name: 'gemini' },
    });

    if (!engineRecord) {
      engineRecord = await prisma.aIEngine.create({
        data: {
          name: 'gemini',
          provider: 'gemini',
          modelId: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          displayName: 'Gemini',
          color: '#8E75B2',
        },
      });
    }

    // 4. Create Prompt records and build work items
    const workItems: Array<{
      promptText: string;
      promptId: string;
      engineName: string;
      engineId: string;
    }> = [];

    for (const promptText of promptTexts) {
      let promptRecord = await prisma.prompt.findFirst({
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

      for (const engineName of engines) {
        workItems.push({
          promptText,
          promptId: promptRecord.id,
          engineName,
          engineId: engineRecord.id,
        });
      }
    }

    // 5. Process prompts with bounded concurrency
    const executionResults: Array<{
      promptText: string;
      rawResponse: string;
      mentioned: boolean;
      position: number | null;
      competitorsMentioned: string[];
      engineName: string;
      engineColor: string;
      sentiment: string | null;
      status: 'completed' | 'failed';
    }> = [];

    let completedCount = 0;
    let failedCount = 0;

    await processWithConcurrency(workItems, MAX_CONCURRENCY, async (item, _idx) => {
      completedCount++;

      await prisma.run.update({
        where: { id: runId },
        data: {
          progressCurrent: completedCount,
          currentStep: 'Querying AI Engines',
          currentStepDetail: `[${completedCount}/${totalSteps}] Querying Gemini for: "${item.promptText.substring(0, 50)}..."`,
        },
      });

      // Call Gemini
      let rawResponse = '';
      let callFailed = false;

      try {
        const provider = LLMProviderFactory.getProvider('gemini');
        const llmRes = await provider.generateResponse(item.promptText, {
          systemPrompt:
            'You are a neutral consumer guide and product analyst. Provide an unbiased, comprehensive answer comparing leading brands and tools. List specific brand names when relevant.',
        });
        rawResponse = llmRes.rawResponse;
      } catch (llmErr: any) {
        console.error(`[Runner] Gemini call failed for "${item.promptText}":`, llmErr?.message);
        callFailed = true;
        rawResponse = '';
      }

      if (callFailed || !rawResponse) {
        // Mark as FAILED — do NOT enter extraction/scoring
        failedCount++;
        try {
          await prisma.runResult.create({
            data: {
              runId,
              promptId: item.promptId,
              engineId: item.engineId,
              rawResponse: null,
              mentioned: null,
              status: 'failed',
              statusLabel: 'Gemini API Error',
            },
          });
        } catch (dbErr) {
          console.error('[Runner] Failed to save failed result:', dbErr);
        }

        executionResults.push({
          promptText: item.promptText,
          rawResponse: '',
          mentioned: false,
          position: null,
          competitorsMentioned: [],
          engineName: 'Gemini',
          engineColor: '#8E75B2',
          sentiment: null,
          status: 'failed',
        });
        return;
      }

      // Extract
      await prisma.run.update({
        where: { id: runId },
        data: {
          currentStep: 'Extracting Brand Mentions',
          currentStepDetail: `Analyzing mentions for "${brandName}"...`,
        },
      });

      const extraction = await ExtractorAgent.extract(rawResponse, brandName, competitors);

      // Store result
      try {
        await prisma.runResult.create({
          data: {
            runId,
            promptId: item.promptId,
            engineId: item.engineId,
            rawResponse,
            mentioned: extraction.mentioned,
            mentionType: extraction.mentioned ? 'direct' : 'not_mentioned',
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
      } catch (dbErr) {
        console.error('[Runner] Failed to save run result:', dbErr);
      }

      executionResults.push({
        promptText: item.promptText,
        rawResponse,
        mentioned: extraction.mentioned,
        position: extraction.position,
        competitorsMentioned: extraction.competitorsMentioned,
        engineName: 'Gemini',
        engineColor: '#8E75B2',
        sentiment: extraction.sentiment,
        status: 'completed',
      });
    });

    // 6. Calculate Metrics (only from completed results)
    await prisma.run.update({
      where: { id: runId },
      data: {
        currentStep: 'Calculating Visibility Metrics',
        currentStepDetail: 'Computing visibility scores and competitor share of voice...',
      },
    });

    const validResults = executionResults.filter((r) => r.status === 'completed');

    const scoringInput: ScoringInput = {
      targetBrand: brandName,
      allCompetitors: competitors,
      results: validResults,
    };

    const metrics = ScoringCalculator.calculate(scoringInput);

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

    // 7. Detect Gaps & Generate Recommendations
    await prisma.run.update({
      where: { id: runId },
      data: {
        currentStep: 'Generating Strategic Recommendations',
        currentStepDetail: 'Analyzing visibility gaps and generating evidence-backed briefs...',
      },
    });

    const gaps = validResults.filter(
      (r) => !r.mentioned && r.competitorsMentioned.length > 0
    );

    for (const gap of gaps) {
      const winningCompetitor = gap.competitorsMentioned[0] || 'Competitor';

      try {
        const gapAnalysis = await RecommendationAgent.analyzeGap({
          targetBrand: brandName,
          winningCompetitor,
          promptText: gap.promptText,
          rawResponse: gap.rawResponse,
        });

        // Calculate actual competitor position from extraction data
        const competitorPosition = gap.competitorsMentioned.indexOf(winningCompetitor) + 1 || null;

        const insight = await prisma.insight.create({
          data: {
            runId,
            brandId,
            competitorName: winningCompetitor,
            promptText: gap.promptText,
            brandMentioned: false,
            brandStatus: 'NOT MENTIONED',
            competitorMentioned: true,
            competitorPosition,
            competitorCiteRate: null, // Unknown from single prompt
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

        // Create Brief
        const briefData = BriefGenerator.generateBriefFromInsight({
          ...insight,
          competitorName: winningCompetitor,
        });

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
        console.error(
          `[Runner] Error generating gap analysis for ${winningCompetitor}:`,
          gapErr
        );
      }
    }

    // 8. Complete Run
    const finalStatus = failedCount >= totalSteps ? 'FAILED' : failedCount > 0 ? 'PARTIAL' : 'COMPLETED';

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        progressCurrent: totalSteps,
        currentStep: 'Analysis Complete',
        currentStepDetail: `Analyzed ${validResults.length} prompt(s) successfully.${failedCount > 0 ? ` ${failedCount} prompt(s) failed.` : ''}`,
        error: failedCount > 0 ? `${failedCount} of ${totalSteps} prompt(s) failed during execution.` : null,
      },
    });

    console.log(`[Runner] Run ${runId} finished with status: ${finalStatus}`);
  } catch (err: any) {
    console.error(`[Runner] Critical failure for run ${runId}:`, err);
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
      // DB update failed too
    }
  }
}
