import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');

  try {
    // Find the latest completed run for this brand or any brand
    const whereClause: any = { status: { in: ['COMPLETED', 'PARTIAL'] } };
    if (brandId) {
      whereClause.brandId = brandId;
    }

    const latestRun = await prisma.run.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { brand: true },
    });

    if (!latestRun) {
      return NextResponse.json({
        emptyState: true,
        message: 'No completed analysis found. Run a live analysis first.',
        shareOfVoice: [],
        avgPositions: [],
        frequentClaims: [],
        competitiveSignal: '',
      });
    }

    // Get visibility metric for competitor shares
    const metric = await prisma.visibilityMetric.findFirst({
      where: { runId: latestRun.id },
      orderBy: { createdAt: 'desc' },
    });

    const competitorShares = metric ? JSON.parse(metric.competitorShares || '[]') : [];

    // Get all results for position calculation
    const results = await prisma.runResult.findMany({
      where: { runId: latestRun.id, status: 'completed' },
      include: { prompt: true },
    });

    // Calculate per-competitor average positions
    const competitorNames: string[] = JSON.parse(latestRun.competitorNames || '[]');
    const allNames = [latestRun.brand.name, ...competitorNames];

    const avgPositions: Array<{ name: string; position: number }> = [];

    for (const name of allNames) {
      const positions: number[] = [];
      for (const r of results) {
        if (name === latestRun.brand.name) {
          if (r.mentioned && r.position) positions.push(r.position);
        } else {
          const mentioned: string[] = JSON.parse(r.competitorsMentioned || '[]');
          if (mentioned.includes(name) && r.position) {
            positions.push(r.position);
          }
        }
      }
      if (positions.length > 0) {
        const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
        avgPositions.push({ name, position: Number(avg.toFixed(1)) });
      }
    }

    avgPositions.sort((a, b) => a.position - b.position);

    // Extract frequent claims from results
    const frequentClaims: Array<{ competitor: string; claim: string; frequency: string }> = [];
    const claimCounts: Record<string, number> = {};

    for (const r of results) {
      const claims: string[] = JSON.parse(r.relevantClaims || '[]');
      const mentioned: string[] = JSON.parse(r.competitorsMentioned || '[]');
      for (const comp of mentioned) {
        for (const claim of claims) {
          const key = `${comp}::${claim}`;
          claimCounts[key] = (claimCounts[key] || 0) + 1;
        }
      }
    }

    const sortedClaims = Object.entries(claimCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    for (const [key, count] of sortedClaims) {
      const [competitor, claim] = key.split('::');
      frequentClaims.push({
        competitor,
        claim: `"${claim}"`,
        frequency: `Cited in ${count} of ${results.length} results`,
      });
    }

    // Competitive signal
    const topCompetitor = competitorShares
      .filter((c: any) => c.name !== latestRun.brand.name)
      .sort((a: any, b: any) => b.share - a.share)[0];

    const competitiveSignal = topCompetitor
      ? `${topCompetitor.name} leads competitor visibility with ${topCompetitor.share}% share of mentions across analyzed prompts.`
      : 'No competitor mentions detected in the current analysis.';

    return NextResponse.json({
      brandName: latestRun.brand.name,
      runId: latestRun.id,
      shareOfVoice: competitorShares,
      avgPositions,
      frequentClaims,
      competitiveSignal,
    });
  } catch (err) {
    console.error('[API /api/competitors] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch competitor analysis' },
      { status: 500 }
    );
  }
}
