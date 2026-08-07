export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { isRoomActivePhase1, PHASE_1_BOTS } from "@/lib/bots/Phase1LaunchConfig";
import { activateSoftLaunchBots } from "@/lib/bots/activateSoftLaunchBots";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { roomId?: string; fanId?: string };
    const { roomId, fanId } = body;
    const result = activateSoftLaunchBots();

    if (!roomId) {
      return NextResponse.json({
        ok: true,
        botsActivated: result.namedBots.length,
        dutyBotsActive: result.dutyBotsActive,
        health: result.health,
        phase1: result.phase1,
      });
    }

    const active = isRoomActivePhase1(roomId);
    return NextResponse.json({
      ok: true,
      roomId,
      fanId: fanId ?? "fan-guest",
      botsEnabled: active,
      botsActivated: result.namedBots.length,
      dutyBotsActive: result.dutyBotsActive,
      health: result.health,
      config: active ? PHASE_1_BOTS : null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const result = activateSoftLaunchBots();
  return NextResponse.json({
    ok: true,
    botsActivated: result.namedBots.length,
    dutyBotsActive: result.dutyBotsActive,
    health: result.health,
    phase1: result.phase1,
    message: "POST with { roomId, fanId } to activate bots and check room phase status",
  });
}