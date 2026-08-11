import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';
import { executeRunInBackground } from '@/lib/runner/execution-service';
import { waitUntil } from '@vercel/functions';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const CreateRunSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100, 'Brand name too long'),
  brandDomain: z.string().max(200).optional(),
  competitors: z
    .array(z.string().min(1).max(100))
    .min(1, 'At least 1 competitor is required')
    .max(5, 'Maximum 5 competitors per run'),
  engines: z
    .array(z.enum(['gemini']))
    .min(1, 'At least 1 AI engine is required'),
  prompts: z
    .array(z.string().min(5, 'Prompt too short').max(500, 'Prompt too long (max 500 chars)'))
    .min(1, 'At least 1 prompt is required')
    .max(10, 'Maximum 10 prompts per run'),
});

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before starting another analysis.',
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = CreateRunSchema.parse(body);

    // Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Live analysis is currently unavailable. GEMINI_API_KEY is not configured.' },
        { status: 503 }
      );
    }

    // Find or create Brand
    let brand = await prisma.brand.findFirst({
      where: { name: { equals: validated.brandName, mode: 'insensitive' } },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: validated.brandName,
          domain:
            validated.brandDomain ||
            `${validated.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `Tracked brand: ${validated.brandName}`,
        },
      });
    }

    // Save Competitors (upsert)
    for (const compName of validated.competitors) {
      await prisma.competitor.upsert({
        where: {
          brandId_name: { brandId: brand.id, name: compName },
        },
        update: {},
        create: {
          name: compName,
          brandId: brand.id,
          domain: `${compName.toLowerCase().replace(/\s+/g, '')}.com`,
        },
      });
    }

    // Create Run record in DB
    const run = await prisma.run.create({
      data: {
        brandId: brand.id,
        status: 'QUEUED',
        progressCurrent: 0,
        progressTotal: validated.prompts.length * validated.engines.length,
        currentStep: 'Initializing Analysis',
        currentStepDetail: 'Queued live AI analysis...',
        enginesUsed: JSON.stringify(validated.engines),
        competitorNames: JSON.stringify(validated.competitors),
        promptTexts: JSON.stringify(validated.prompts),
      },
    });

    // Background execution using waitUntil (Vercel) or fire-and-forget (local)
    const runPromise = executeRunInBackground(run.id);

    if (typeof waitUntil === 'function') {
      waitUntil(runPromise);
    } else {
      // Local dev: fire and forget
      runPromise.catch((err) =>
        console.error(`[Runner] Background execution error:`, err)
      );
    }

    return NextResponse.json({
      id: run.id,
      status: 'QUEUED',
      message: 'Analysis queued. Poll /api/runs/{id}/progress for updates.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('[API /api/runs] POST error:', error);
    return NextResponse.json(
      { error: 'Unable to start the analysis. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    );
  }
}
