import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { demoRunProgress } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id === 'run-demo-001') {
    return NextResponse.json(demoRunProgress);
  }

  try {
    const run = await prisma.run.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const enginesUsed: string[] = JSON.parse(run.enginesUsed || '["gemini"]');
    const pct = run.progressTotal > 0 ? Math.round((run.progressCurrent / run.progressTotal) * 100) : 0;

    const isCompleted = run.status === 'COMPLETED';

    const steps = [
      {
        number: 1,
        label: 'Querying AI Engines',
        status: isCompleted || run.progressCurrent > 0 ? 'completed' : run.status === 'RUNNING' ? 'processing' : 'pending',
      },
      {
        number: 2,
        label: 'Extracting Brand Mentions',
        status: isCompleted || run.progressCurrent >= Math.ceil(run.progressTotal * 0.5) ? 'completed' : run.progressCurrent > 0 ? 'processing' : 'pending',
      },
      {
        number: 3,
        label: 'Calculating Visibility Metrics',
        status: isCompleted ? 'completed' : run.currentStep === 'Calculating Visibility Metrics' ? 'processing' : 'pending',
      },
      {
        number: 4,
        label: 'Generating Strategic Recommendations',
        status: isCompleted ? 'completed' : run.currentStep === 'Generating Strategic Briefs' ? 'processing' : 'pending',
      },
    ];

    const engines = enginesUsed.map((e) => {
      const engineDone = isCompleted || run.progressCurrent >= run.progressTotal;
      const engineSyncing = run.status === 'RUNNING';
      return {
        name: e === 'gemini' ? 'Gemini Advanced' : e === 'openai' ? 'ChatGPT (GPT-4)' : e === 'anthropic' ? 'Claude 3.5' : e,
        abbreviation: e === 'gemini' ? 'GEM' : e === 'openai' ? 'GPT' : e === 'anthropic' ? 'CLA' : e.substring(0, 3).toUpperCase(),
        status: engineDone ? 'completed' : engineSyncing ? 'syncing' : 'queued',
      };
    });

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
  } catch (err) {
    console.error(`[API /api/runs/${id}/progress] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
