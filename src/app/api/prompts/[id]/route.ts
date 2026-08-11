import { NextResponse } from 'next/server';
import { demoRunResults, demoPrompts } from '@/lib/demo/data';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = demoRunResults.find((r) => r.id === id || r.promptId === id) || demoRunResults[0];
  const prompt = demoPrompts.find((p) => p.id === result.promptId) || demoPrompts[0];

  return NextResponse.json({
    result,
    prompt,
  });
}
