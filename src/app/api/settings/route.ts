import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const latestBrand = await prisma.brand.findFirst({
      orderBy: { updatedAt: 'desc' },
      include: {
        competitors: true,
      },
    });

    if (!latestBrand) {
      return NextResponse.json({
        brand: {
          name: '',
          domain: '',
          description: '',
        },
        competitors: [],
        engines: [
          { id: 'engine-gemini', name: 'gemini', displayName: 'Gemini (Live)', enabled: true },
        ],
      });
    }

    return NextResponse.json({
      brand: {
        name: latestBrand.name,
        domain: latestBrand.domain || '',
        description: latestBrand.description || '',
      },
      competitors: latestBrand.competitors.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain || '',
      })),
      engines: [
        { id: 'engine-gemini', name: 'gemini', displayName: 'Gemini (Live)', enabled: true },
      ],
    });
  } catch (err) {
    console.error('[API /api/settings] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { brandName, brandDomain, brandDescription } = body;

    if (!brandName) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const updated = await prisma.brand.upsert({
      where: { id: body.brandId || 'default' },
      update: {
        name: brandName,
        domain: brandDomain,
        description: brandDescription,
      },
      create: {
        name: brandName,
        domain: brandDomain,
        description: brandDescription,
      },
    });

    return NextResponse.json({
      brand: {
        name: updated.name,
        domain: updated.domain || '',
        description: updated.description || '',
      },
    });
  } catch (err) {
    console.error('[API /api/settings] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
