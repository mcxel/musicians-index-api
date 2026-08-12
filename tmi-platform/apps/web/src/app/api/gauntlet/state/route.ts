import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGauntletState, enqueueGauntletChallenger, removeGauntletChallenger } from "@/lib/gauntlet/PersistentGauntletEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId") ?? "cypher-room";
  const state = getOrCreateGauntletState(roomId);
  return NextResponse.json({ ok: true, state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomId = "cypher-room" } = body;

    // Identity always comes from the real session, never the request body —
    // a client-supplied userId/displayName would let anyone queue as anyone.
    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
    }

    if (action === "enqueue") {
      const state = enqueueGauntletChallenger(roomId, {
        userId: session.user.id,
        displayName: session.user.name,
        role: session.user.role,
      });
      return NextResponse.json({ ok: true, state });
    }

    if (action === "dequeue" || action === "leave") {
      const state = removeGauntletChallenger(roomId, session.user.id);
      return NextResponse.json({ ok: true, state });
    }

    const state = getOrCreateGauntletState(roomId);
    return NextResponse.json({ ok: true, state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
