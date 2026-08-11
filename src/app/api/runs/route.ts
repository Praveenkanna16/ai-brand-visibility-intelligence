import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, ensureDatabaseTables, inMemStore } from '@/lib/prisma/client';
import { executeRunInBackground } from '@/lib/runner/execution-service';
import { waitUntil } from '@vercel/functions';

const CreateRunSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  brandDomain: z.string().optional(),
  competitors: z.array(z.string()).min(1, 'At least 1 competitor is required'),
  engines: z.array(z.string()).min(1, 'At least 1 AI engine is required'),
  prompts: z.array(z.string()).min(1, 'At least 1 prompt is required').max(10, 'Maximum 10 prompts per run'),
});

export async function POST(request: Request) {
  try {
    await ensureDatabaseTables();

    const body = await request.json();
    const validated = CreateRunSchema.parse(body);

    // 1. Find or create Brand in DB
    let brand: any = null;
    try {
      brand = await prisma.brand.findFirst({
        where: { name: { equals: validated.brandName } },
      });

      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: validated.brandName,
            domain: validated.brandDomain || `${validated.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
            description: `Tracked brand for ${validated.brandName}`,
          },
        });
      }
    } catch {
      brand = {
        id: `b-${Date.now()}`,
        name: validated.brandName,
        domain: validated.brandDomain || `${validated.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
      };
    }

    // 2. Save Competitors
    for (const compName of validated.competitors) {
      try {
        const existingComp = await prisma.competitor.findFirst({
          where: { brandId: brand.id, name: compName },
        });
        if (!existingComp) {
          await prisma.competitor.create({
            data: {
              name: compName,
              brandId: brand.id,
              domain: `${compName.toLowerCase().replace(/\s+/g, '')}.com`,
            },
          });
        }
      } catch {
        // Continue fallback
      }
    }

    // 3. Create Persistent Run Record
    let runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    try {
      const run = await prisma.run.create({
        data: {
          brandId: brand.id,
          status: 'QUEUED',
          progressCurrent: 0,
          progressTotal: validated.prompts.length * validated.engines.length,
          currentStep: 'Initializing Analysis',
          currentStepDetail: 'Queued live AI analysis job...',
          enginesUsed: JSON.stringify(validated.engines),
          competitorNames: JSON.stringify(validated.competitors),
          promptIds: JSON.stringify(validated.prompts),
        },
      });
      runId = run.id;
    } catch (err) {
      console.warn('[API /api/runs] Prisma run create warning, using in-memory store:', err);
    }

    // Store in global memory map for cross-lambda resilience
    inMemStore.runs.set(runId, {
      id: runId,
      brandId: brand.id,
      brandName: brand.name,
      brandDomain: brand.domain || undefined,
      status: 'QUEUED',
      progressCurrent: 0,
      progressTotal: validated.prompts.length * validated.engines.length,
      currentStep: 'Initializing Analysis',
      currentStepDetail: 'Queued live AI analysis job...',
      enginesUsed: validated.engines,
      competitorNames: validated.competitors,
      promptIds: validated.prompts,
      startedAt: new Date(),
      results: [],
      insights: [],
    });

    // 4. Trigger Async Execution Service (using @vercel/functions waitUntil if on Vercel)
    const runPromise = executeRunInBackground(runId).catch((err) => {
      console.error(`[API /api/runs] Execution error for run ${runId}:`, err);
    });

    if (process.env.VERCEL === '1') {
      waitUntil(runPromise);
    }

    return NextResponse.json({
      id: runId,
      status: 'QUEUED',
      message: 'Live analysis job created and queued',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('[API /api/runs] POST error:', error);
    return NextResponse.json({ error: 'Unable to start the analysis. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureDatabaseTables();
    const runs = await prisma.run.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true,
        visibilityMetrics: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return NextResponse.json(runs);
  } catch (err) {
    console.error('[API /api/runs] GET error:', err);
    return NextResponse.json(Array.from(inMemStore.runs.values()));
  }
}
