export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { isRoomActivePhase1, PHASE_1_BOTS } from '@/lib/bots/Phase1LaunchConfig';

export async function POST(req: NextRequest) {
  try {
    const { roomId, fanId } = await req.json() as { roomId?: string; fanId?: string };
    if (!roomId) return NextResponse.json({ ok: false, error: 'roomId required' }, { status: 400 });

    const active = isRoomActivePhase1(roomId);
    return NextResponse.json({
      ok: true,
      roomId,
      fanId: fanId ?? 'fan-guest',
      botsEnabled: active,
      config: active ? PHASE_1_BOTS : null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'POST with { roomId, fanId } to check bot activation status' });
}
