import { NextResponse } from 'next/server';
import { demoCompetitorAnalysis } from '@/lib/demo/data';

export async function GET() {
  return NextResponse.json(demoCompetitorAnalysis);
}
