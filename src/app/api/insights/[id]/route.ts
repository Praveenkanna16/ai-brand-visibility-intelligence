import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const insight = await prisma.insight.findUnique({
      where: { id },
      include: {
        brand: true,
        brief: true,
        run: true,
      },
    });

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: insight.id,
      runId: insight.runId,
      brandId: insight.brandId,
      brandName: insight.brand?.name || 'Target Brand',
      competitorName: insight.competitorName,
      promptText: insight.promptText,
      brandMentioned: insight.brandMentioned,
      brandStatus: insight.brandStatus,
      competitorMentioned: insight.competitorMentioned,
      observation: insight.observation,
      whyCompetitorWon: insight.whyCompetitorWon,
      evidenceText: insight.evidenceText,
      hypothesis: insight.hypothesis,
      recommendedAction: insight.recommendedAction,
      contentType: insight.contentType,
      contentAngle: insight.contentAngle,
      suggestedEvidence: insight.suggestedEvidence,
      confidence: insight.confidence,
      limitations: insight.limitations,
      createdAt: insight.createdAt,
      brief: insight.brief
        ? {
            id: insight.brief.id,
            title: insight.brief.title,
            targetQuery: insight.brief.targetQuery,
            visibilityGap: insight.brief.visibilityGap,
            competitorAdvantage: insight.brief.competitorAdvantage,
            contentType: insight.brief.contentType,
            strategicAngle: insight.brief.strategicAngle,
            formatType: insight.brief.formatType,
            primaryAsset: insight.brief.primaryAsset,
            evidenceToInclude: insight.brief.evidenceToInclude,
            recommendedStructure: JSON.parse(insight.brief.recommendedStructure || '[]'),
            reasoning: insight.brief.reasoning,
            confidence: insight.brief.confidence,
            limitations: insight.brief.limitations,
            status: insight.brief.status,
          }
        : null,
    });
  } catch (err) {
    console.error(`[API /api/insights/${id}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch insight' }, { status: 500 });
  }
}
