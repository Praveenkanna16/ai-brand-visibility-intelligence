import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { demoDashboard } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await context.params;

  if (brandId === 'demo' || brandId === 'brand-demo') {
    return NextResponse.json({ ...demoDashboard, isDemo: true });
  }

  try {
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: brandId },
          { name: brandId },
        ],
      },
    });

    const runs = brand
      ? await prisma.run.findMany({
          where: { brandId: brand.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            visibilityMetrics: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            insights: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        })
      : [];

    if (!brand || runs.length === 0) {
      const latestRunAny = await prisma.run.findFirst({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          visibilityMetrics: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          insights: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!latestRunAny) {
        return NextResponse.json({
          emptyState: true,
          brandName: brandId,
          message: 'No analysis found for this brand. Run a live analysis to see real metrics.',
        });
      }

      const metric = latestRunAny.visibilityMetrics[0];
      return NextResponse.json({
        isDemo: false,
        brandId: latestRunAny.brandId,
        brandName: latestRunAny.brand.name,
        brandDomain: latestRunAny.brand.domain,
        visibilityScore: metric?.visibilityScore ?? 0,
        mentionRate: metric?.mentionRate ?? 0,
        avgPosition: metric?.avgPosition ?? 0,
        shareOfMentions: metric?.shareOfMentions ?? 0,
        competitorShares: metric ? JSON.parse(metric.competitorShares || '[]') : [],
        engineBreakdown: metric ? JSON.parse(metric.engineBreakdown || '[]') : [],
        insights: latestRunAny.insights.map((i: any) => ({
          id: i.id,
          competitorName: i.competitorName,
          promptText: i.promptText,
          observation: i.observation,
          whyCompetitorWon: i.whyCompetitorWon,
          evidenceText: i.evidenceText,
          hypothesis: i.hypothesis,
          recommendedAction: i.recommendedAction,
        })),
        recentRuns: [
          {
            id: latestRunAny.id,
            brandName: latestRunAny.brand.name,
            status: latestRunAny.status,
            createdAt: latestRunAny.createdAt,
            completedAt: latestRunAny.completedAt,
          },
        ],
      });
    }

    const latestRun = runs.find((r: any) => r.status === 'COMPLETED') || runs[0];
    const metric = latestRun?.visibilityMetrics[0];

    return NextResponse.json({
      isDemo: false,
      brandId: brand.id,
      brandName: brand.name,
      brandDomain: brand.domain,
      visibilityScore: metric?.visibilityScore ?? 0,
      mentionRate: metric?.mentionRate ?? 0,
      avgPosition: metric?.avgPosition ?? 0,
      shareOfMentions: metric?.shareOfMentions ?? 0,
      competitorShares: metric ? JSON.parse(metric.competitorShares || '[]') : [],
      engineBreakdown: metric ? JSON.parse(metric.engineBreakdown || '[]') : [],
      insights: (latestRun?.insights || []).map((i: any) => ({
        id: i.id,
        competitorName: i.competitorName,
        promptText: i.promptText,
        observation: i.observation,
        whyCompetitorWon: i.whyCompetitorWon,
        evidenceText: i.evidenceText,
        hypothesis: i.hypothesis,
        recommendedAction: i.recommendedAction,
      })),
      recentRuns: runs.map((r: any) => ({
        id: r.id,
        brandName: brand.name,
        status: r.status,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (err) {
    console.error(`[API /api/dashboard/${brandId}] GET Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
