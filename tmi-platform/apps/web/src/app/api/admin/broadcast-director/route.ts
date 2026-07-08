export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { activateDirectorMode, getDirectorPlan, listDirectorModes } from '@/lib/broadcast/BroadcastDirectorEngine';

export function GET() {
  return NextResponse.json({
    modes: listDirectorModes(),
    plan: getDirectorPlan(),
    updatedAtMs: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = String(body.mode ?? 'MISSION_CONTROL') as any;
    const plan = activateDirectorMode(mode);
    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}