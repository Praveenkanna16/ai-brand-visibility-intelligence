import { NextResponse } from 'next/server';
import { demoTrends } from '@/lib/demo/data';

export async function GET() {
  return NextResponse.json(demoTrends);
}
