import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await context.params;

  try {
    // Find brand by ID or by name
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: brandId },
          { name: { equals: brandId, mode: 'insensitive' } },
        ],
      },
    });

    if (!brand) {
      // Try to find any brand with completed runs
      const latestRun = await prisma.run.findFirst({
        where: { status: { in: ['COMPLETED', 'PARTIAL'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          visibilityMetrics: { take: 1, orderBy: { createdAt: 'desc' } },
          insights: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });

      if (!latestRun) {
        return NextResponse.json({
          emptyState: true,
          brandName: brandId,
          message: 'No analysis found. Run a live analysis to see real metrics.',
        });
      }

      return formatDashboardResponse(latestRun, [latestRun]);
    }

    const runs = await prisma.run.findMany({
      where: { brandId: brand.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        visibilityMetrics: { take: 1, orderBy: { createdAt: 'desc' } },
        insights: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (runs.length === 0) {
      return NextResponse.json({
        emptyState: true,
        brandName: brand.name,
        message: 'No analysis found for this brand. Run a live analysis to see real metrics.',
      });
    }

    const latestRun = runs.find((r) => r.status === 'COMPLETED' || r.status === 'PARTIAL') || runs[0];

    return formatDashboardResponse({ ...latestRun, brand }, runs.map((r) => ({ ...r, brand })));
  } catch (err) {
    console.error(`[API /api/dashboard/${brandId}] GET Error:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

function formatDashboardResponse(latestRun: any, allRuns: any[]) {
  const metric = latestRun.visibilityMetrics?.[0];
  const brand = latestRun.brand;

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
    insights: (latestRun.insights || []).map((i: any) => ({
      id: i.id,
      competitorName: i.competitorName,
      promptText: i.promptText,
      observation: i.observation,
      whyCompetitorWon: i.whyCompetitorWon,
      evidenceText: i.evidenceText,
      hypothesis: i.hypothesis,
      recommendedAction: i.recommendedAction,
    })),
    recentRuns: allRuns.map((r: any) => ({
      id: r.id,
      brandName: r.brand?.name || brand.name,
      status: r.status,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    })),
  });
}
