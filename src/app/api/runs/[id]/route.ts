import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseTables, inMemStore } from '@/lib/prisma/client';
import { demoCompletedRun } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id === 'run-demo-001') {
    return NextResponse.json(demoCompletedRun);
  }

  try {
    await ensureDatabaseTables();

    let run: any = null;
    try {
      run = await prisma.run.findUnique({
        where: { id },
        include: {
          brand: true,
          results: {
            include: {
              prompt: true,
              engine: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          visibilityMetrics: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          insights: {
            include: {
              brief: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch {
      run = null;
    }

    const memRun = inMemStore.runs.get(id);

    if (!run && memRun) {
      return NextResponse.json({
        id: memRun.id,
        brandName: memRun.brandName,
        brandDomain: memRun.brandDomain || '',
        status: memRun.status,
        startedAt: memRun.startedAt,
        completedAt: memRun.completedAt,
        error: memRun.error,
        competitorNames: memRun.competitorNames,
        enginesUsed: memRun.enginesUsed,
        promptIds: memRun.promptIds,
        metrics: memRun.metrics || null,
        results: memRun.results || [],
        insights: memRun.insights || [],
      });
    }

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const latestMetric = run.visibilityMetrics[0];

    const formattedReport = {
      id: run.id,
      brandName: run.brand.name,
      brandDomain: run.brand.domain,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      error: run.error,
      competitorNames: JSON.parse(run.competitorNames || '[]'),
      enginesUsed: JSON.parse(run.enginesUsed || '[]'),
      promptIds: JSON.parse(run.promptIds || '[]'),
      metrics: latestMetric
        ? {
            visibilityScore: latestMetric.visibilityScore,
            mentionRate: latestMetric.mentionRate,
            avgPosition: latestMetric.avgPosition,
            shareOfMentions: latestMetric.shareOfMentions,
            engineBreakdown: JSON.parse(latestMetric.engineBreakdown || '[]'),
            competitorShares: JSON.parse(latestMetric.competitorShares || '[]'),
          }
        : null,
      results: run.results.map((r: any) => ({
        id: r.id,
        promptId: r.promptId,
        promptText: r.prompt?.text || 'Prompt',
        engineId: r.engineId,
        engineName: r.engine?.displayName || r.engine?.name || 'AI Engine',
        rawResponse: r.rawResponse,
        mentioned: r.mentioned,
        position: r.position,
        competitorsMentioned: JSON.parse(r.competitorsMentioned || '[]'),
        sentiment: r.sentiment,
        relevantClaims: JSON.parse(r.relevantClaims || '[]'),
        evidence: JSON.parse(r.evidence || '[]'),
        confidence: r.confidence,
        status: r.status,
        statusLabel: r.statusLabel,
      })),
      insights: run.insights.map((i: any) => ({
        id: i.id,
        competitorName: i.competitorName,
        promptText: i.promptText,
        observation: i.observation,
        whyCompetitorWon: i.whyCompetitorWon,
        evidenceText: i.evidenceText,
        hypothesis: i.hypothesis,
        recommendedAction: i.recommendedAction,
        contentType: i.contentType,
        contentAngle: i.contentAngle,
        suggestedEvidence: i.suggestedEvidence,
        confidence: i.confidence,
        limitations: i.limitations,
        brief: i.brief
          ? {
              id: i.brief.id,
              title: i.brief.title,
              targetQuery: i.brief.targetQuery,
              visibilityGap: i.brief.visibilityGap,
              competitorAdvantage: i.brief.competitorAdvantage,
              contentType: i.brief.contentType,
              strategicAngle: i.brief.strategicAngle,
              formatType: i.brief.formatType,
              primaryAsset: i.brief.primaryAsset,
              evidenceToInclude: i.brief.evidenceToInclude,
              recommendedStructure: JSON.parse(i.brief.recommendedStructure || '[]'),
              reasoning: i.brief.reasoning,
              confidence: i.brief.confidence,
              limitations: i.brief.limitations,
              winningCompetitors: JSON.parse(i.brief.winningCompetitors || '[]'),
            }
          : null,
      })),
    };

    return NextResponse.json(formattedReport);
  } catch (err) {
    console.error(`[API /api/runs/${id}] GET Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch run analysis' }, { status: 500 });
  }
}
