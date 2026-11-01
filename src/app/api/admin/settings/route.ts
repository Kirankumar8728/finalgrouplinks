import { NextResponse } from 'next/server';
import { getContentSettings, updateContentSettings } from '@/src/lib/content-settings';

export async function GET() {
  const settings = getContentSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const updatedSettings = updateContentSettings(body);
  return NextResponse.json(updatedSettings);
}
