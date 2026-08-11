import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { demoBrief, demoInsights } from '@/lib/demo/data';
import { BriefGenerator } from '@/lib/recommendations/brief-generator';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id.startsWith('ins-demo') || id === 'ins-001') {
    return NextResponse.json(demoBrief);
  }

  try {
    const brief = await prisma.brief.findFirst({
      where: { insightId: id },
      include: {
        insight: {
          include: { brand: true },
        },
      },
    });

    if (brief) {
      return NextResponse.json({
        id: brief.id,
        insightId: brief.insightId,
        title: brief.title,
        targetQuery: brief.targetQuery,
        visibilityGap: brief.visibilityGap,
        competitorAdvantage: brief.competitorAdvantage,
        contentType: brief.contentType,
        strategicAngle: brief.strategicAngle,
        formatType: brief.formatType,
        primaryAsset: brief.primaryAsset,
        evidenceToInclude: brief.evidenceToInclude,
        recommendedStructure: JSON.parse(brief.recommendedStructure || '[]'),
        reasoning: brief.reasoning,
        confidence: brief.confidence,
        limitations: brief.limitations,
        analystNote: brief.analystNote,
        status: brief.status,
        winningCompetitors: JSON.parse(brief.winningCompetitors || '[]'),
        createdAt: brief.createdAt,
      });
    }

    // Fallback: generate brief on demand if insight exists
    const insight = await prisma.insight.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (insight) {
      const generated = BriefGenerator.generateBriefFromInsight(insight as any);
      return NextResponse.json(generated);
    }

    return NextResponse.json(demoBrief);
  } catch (err) {
    console.error(`[API /api/insights/${id}/brief] Error:`, err);
    return NextResponse.json(demoBrief);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id.startsWith('ins-demo') || id === 'ins-001') {
    return NextResponse.json(demoBrief);
  }

  try {
    const insight = await prisma.insight.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!insight) {
      return NextResponse.json(demoBrief);
    }

    const briefData = BriefGenerator.generateBriefFromInsight(insight as any);

    let brief = await prisma.brief.findFirst({
      where: { insightId: id },
    });

    if (brief) {
      brief = await prisma.brief.update({
        where: { id: brief.id },
        data: {
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
        },
      });
    } else {
      brief = await prisma.brief.create({
        data: {
          insightId: id,
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
        },
      });
    }

    return NextResponse.json(briefData);
  } catch (err) {
    console.error(`[API /api/insights/${id}/brief] POST Error:`, err);
    return NextResponse.json(demoBrief);
  }
}
