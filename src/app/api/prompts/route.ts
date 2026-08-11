import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');

  try {
    // If runId specified, get results for that run
    if (runId) {
      const results = await prisma.runResult.findMany({
        where: { runId },
        include: { prompt: true, engine: true },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({
        results: results.map((r) => ({
          id: r.id,
          runId: r.runId,
          promptId: r.promptId,
          engineId: r.engineId,
          rawResponse: r.rawResponse,
          mentioned: r.mentioned,
          mentionType: r.mentionType,
          position: r.position,
          competitorsMentioned: JSON.parse(r.competitorsMentioned || '[]'),
          sentiment: r.sentiment,
          relevantClaims: JSON.parse(r.relevantClaims || '[]'),
          evidence: JSON.parse(r.evidence || '[]'),
          confidence: r.confidence,
          status: r.status,
          statusLabel: r.statusLabel,
          createdAt: r.createdAt,
          prompt: r.prompt ? { id: r.prompt.id, text: r.prompt.text, category: r.prompt.category } : null,
          engine: r.engine ? { id: r.engine.id, name: r.engine.name, displayName: r.engine.displayName, color: r.engine.color } : null,
        })),
      });
    }

    // Default: get results from latest completed run
    const latestRun = await prisma.run.findFirst({
      where: { status: { in: ['COMPLETED', 'PARTIAL'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestRun) {
      return NextResponse.json({
        emptyState: true,
        message: 'No completed analysis found. Run a live analysis first.',
        results: [],
      });
    }

    const results = await prisma.runResult.findMany({
      where: { runId: latestRun.id },
      include: { prompt: true, engine: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      runId: latestRun.id,
      results: results.map((r) => ({
        id: r.id,
        runId: r.runId,
        promptId: r.promptId,
        engineId: r.engineId,
        rawResponse: r.rawResponse,
        mentioned: r.mentioned,
        mentionType: r.mentionType,
        position: r.position,
        competitorsMentioned: JSON.parse(r.competitorsMentioned || '[]'),
        sentiment: r.sentiment,
        relevantClaims: JSON.parse(r.relevantClaims || '[]'),
        evidence: JSON.parse(r.evidence || '[]'),
        confidence: r.confidence,
        status: r.status,
        statusLabel: r.statusLabel,
        createdAt: r.createdAt,
        prompt: r.prompt ? { id: r.prompt.id, text: r.prompt.text, category: r.prompt.category } : null,
        engine: r.engine ? { id: r.engine.id, name: r.engine.name, displayName: r.engine.displayName, color: r.engine.color } : null,
      })),
    });
  } catch (err) {
    console.error('[API /api/prompts] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch prompt results' },
      { status: 500 }
    );
  }
}
