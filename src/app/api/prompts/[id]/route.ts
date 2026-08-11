import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const result = await prisma.runResult.findFirst({
      where: {
        OR: [{ id }, { promptId: id }],
      },
      include: {
        prompt: true,
        engine: true,
        run: {
          include: { brand: true },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Prompt result not found' }, { status: 404 });
    }

    return NextResponse.json({
      result: {
        id: result.id,
        runId: result.runId,
        promptId: result.promptId,
        engineId: result.engineId,
        engineName: result.engine?.displayName || result.engine?.name || 'Gemini',
        rawResponse: result.rawResponse,
        mentioned: result.mentioned,
        mentionType: result.mentionType,
        position: result.position,
        competitorsMentioned: JSON.parse(result.competitorsMentioned || '[]'),
        sentiment: result.sentiment,
        relevantClaims: JSON.parse(result.relevantClaims || '[]'),
        evidence: JSON.parse(result.evidence || '[]'),
        confidence: result.confidence,
        status: result.status,
        statusLabel: result.statusLabel,
        createdAt: result.createdAt,
      },
      prompt: result.prompt
        ? {
            id: result.prompt.id,
            text: result.prompt.text,
            category: result.prompt.category,
          }
        : null,
      brandName: result.run?.brand?.name || 'Target Brand',
    });
  } catch (err) {
    console.error(`[API /api/prompts/${id}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch prompt details' }, { status: 500 });
  }
}
