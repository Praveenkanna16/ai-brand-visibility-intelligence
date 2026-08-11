import { NextResponse } from 'next/server';
import { demoCompletedRun } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return NextResponse.json(demoCompletedRun);
}
