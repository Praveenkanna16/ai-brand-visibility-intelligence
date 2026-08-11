import { NextResponse } from 'next/server';
import { z } from 'zod';
import { demoCompletedRun } from '@/lib/demo/data';

const CreateRunSchema = z.object({
  brandName: z.string().min(1),
  brandDomain: z.string().optional(),
  competitors: z.array(z.string()),
  engines: z.array(z.string()),
  prompts: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateRunSchema.parse(body);

    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode) {
      return NextResponse.json({
        id: 'run-demo-001',
        status: 'QUEUED',
        message: 'Analysis job created (Demo Mode)',
        run: demoCompletedRun,
      });
    }

    // Real mode fallback: generate run ID
    const runId = `run-${Date.now()}`;
    return NextResponse.json({
      id: runId,
      status: 'QUEUED',
      message: 'Analysis job created',
      params: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }
}
