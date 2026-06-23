export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { isRoomActivePhase1, PHASE_1_BOTS } from '@/lib/bots/Phase1LaunchConfig';
import { activateDefaultBots, getHealthSummary } from '@/lib/bots/BotActivationEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { roomId?: string; fanId?: string };
    const { roomId, fanId } = body;

    // Always activate the full named bot roster on any POST to this endpoint.
    // activateDefaultBots() is idempotent — safe to call multiple times.
    const bots = activateDefaultBots();
    const health = getHealthSummary();

    // If a roomId is provided, also check Phase 1 room-specific config.
    if (!roomId) {
      return NextResponse.json({
        ok: true,
        botsActivated: bots.length,
        health,
      });
    }

    const active = isRoomActivePhase1(roomId);
    return NextResponse.json({
      ok: true,
      roomId,
      fanId: fanId ?? 'fan-guest',
      botsEnabled: active,
      botsActivated: bots.length,
      health,
      config: active ? PHASE_1_BOTS : null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
  }
}

export async function GET() {
  const bots = activateDefaultBots();
  const health = getHealthSummary();
  return NextResponse.json({
    ok: true,
    botsActivated: bots.length,
    health,
    message: 'POST with { roomId, fanId } to activate bots and check room phase status',
  });
}
