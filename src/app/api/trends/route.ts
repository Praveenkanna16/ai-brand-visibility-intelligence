import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    // Get all visibility metrics ordered by creation date
    const metrics = await prisma.visibilityMetric.findMany({
      orderBy: { createdAt: 'asc' },
      include: { run: true },
    });

    if (metrics.length === 0) {
      return NextResponse.json({
        emptyState: true,
        message: 'Run multiple analyses to see trends over time.',
        trends: [],
      });
    }

    const trends = metrics.map((m) => ({
      date: m.createdAt.toISOString().split('T')[0],
      visibilityScore: m.visibilityScore,
      shareOfVoice: m.shareOfMentions,
      avgPosition: m.avgPosition || 0,
      brandMentions: Math.round((m.mentionRate / 100) * (m.run?.progressTotal || 1)),
      runId: m.runId,
    }));

    return NextResponse.json({
      trends,
      latest: trends[trends.length - 1] || null,
      earliest: trends[0] || null,
    });
  } catch (err) {
    console.error('[API /api/trends] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
