import { NextResponse } from 'next/server';
import { demoSettings } from '@/lib/demo/data';

let currentSettings = { ...demoSettings };

export async function GET() {
  return NextResponse.json(currentSettings);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    currentSettings = {
      ...currentSettings,
      ...body,
    };
    return NextResponse.json(currentSettings);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
