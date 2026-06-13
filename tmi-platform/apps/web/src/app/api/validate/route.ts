export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true, valid: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, valid: true });
}
