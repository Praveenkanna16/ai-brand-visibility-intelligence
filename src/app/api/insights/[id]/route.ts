import { NextResponse } from 'next/server';
import { demoInsights } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const insight = demoInsights.find((i) => i.id === id) || demoInsights[0];
  return NextResponse.json(insight);
}
