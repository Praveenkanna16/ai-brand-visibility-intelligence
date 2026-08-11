import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseTables } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await ensureDatabaseTables();

    const run = await prisma.run.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const enginesUsed: string[] = JSON.parse(run.enginesUsed || '["gemini"]');
    const pct =
      run.progressTotal > 0
        ? Math.round((run.progressCurrent / run.progressTotal) * 100)
        : 0;
    const isCompleted = run.status === 'COMPLETED' || run.status === 'PARTIAL';

    const steps = [
      {
        number: 1,
        label: 'Querying AI Engines',
        status:
          isCompleted || run.progressCurrent > 0
            ? 'completed'
            : run.status === 'RUNNING'
            ? 'processing'
            : 'pending',
      },
      {
        number: 2,
        label: 'Extracting Brand Mentions',
        status:
          isCompleted || run.progressCurrent >= Math.ceil(run.progressTotal * 0.5)
            ? 'completed'
            : run.progressCurrent > 0
            ? 'processing'
            : 'pending',
      },
      {
        number: 3,
        label: 'Calculating Visibility Metrics',
        status: isCompleted
          ? 'completed'
          : run.currentStep === 'Calculating Visibility Metrics'
          ? 'processing'
          : 'pending',
      },
      {
        number: 4,
        label: 'Generating Strategic Recommendations',
        status: isCompleted
          ? 'completed'
          : run.currentStep === 'Generating Strategic Recommendations'
          ? 'processing'
          : 'pending',
      },
    ];

    const engines = enginesUsed.map((e) => ({
      name: e === 'gemini' ? 'Gemini' : e,
      abbreviation: e === 'gemini' ? 'GEM' : e.substring(0, 3).toUpperCase(),
      status: isCompleted ? 'completed' : run.status === 'RUNNING' ? 'syncing' : 'queued',
    }));

    return NextResponse.json({
      id: run.id,
      brandName: run.brand.name,
      status: run.status,
      progressCurrent: run.progressCurrent,
      progressTotal: run.progressTotal,
      currentStep: run.currentStep || 'Processing',
      currentStepDetail: run.currentStepDetail || '',
      pctComplete: pct,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      error: run.error,
      steps,
      engines,
    });
  } catch (err: any) {
    console.error(`[API /api/runs/${id}/progress] Error:`, err);
    return NextResponse.json(
      { error: `Failed to fetch progress: ${err?.message || String(err)}` },
      { status: 500 }
    );
  }
}
