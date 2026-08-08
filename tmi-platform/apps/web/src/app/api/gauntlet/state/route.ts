import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGauntletState, enqueueGauntletChallenger, removeGauntletChallenger } from "@/lib/gauntlet/PersistentGauntletEngine";

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId") ?? "cypher-room";
  const state = getOrCreateGauntletState(roomId);
  return NextResponse.json({ ok: true, state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomId = "cypher-room", userId, displayName, role } = body;

    if (action === "enqueue") {
      const state = enqueueGauntletChallenger(roomId, { userId, displayName, role });
      return NextResponse.json({ ok: true, state });
    }

    if (action === "dequeue" || action === "leave") {
      const state = removeGauntletChallenger(roomId, userId);
      return NextResponse.json({ ok: true, state });
    }

    const state = getOrCreateGauntletState(roomId);
    return NextResponse.json({ ok: true, state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
