import { NextResponse } from 'next/server';
import { demoDashboard } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await context.params;
  return NextResponse.json(demoDashboard);
}
