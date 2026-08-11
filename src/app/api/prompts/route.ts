import { NextResponse } from 'next/server';
import { demoRunResults, demoPrompts } from '@/lib/demo/data';

export async function GET() {
  return NextResponse.json({
    prompts: demoPrompts,
    results: demoRunResults,
  });
}
