import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGauntletState, resolveGauntletMatch } from "@/lib/gauntlet/PersistentGauntletEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

const STAFF_ROLES = new Set(["ADMIN", "STAFF", "SUPERADMIN", "OWNER"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId = "cypher-room", winnerId } = body;

    if (!winnerId) {
      return NextResponse.json({ ok: false, error: "Winner ID required" }, { status: 400 });
    }

    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
    }

    const state = getOrCreateGauntletState(roomId);
    const match = state.activeMatch;
    if (!match) {
      return NextResponse.json({ ok: false, error: "No active match to resolve" }, { status: 409 });
    }

    // Only the two combatants on stage — or platform staff overriding — may
    // decide a match, and the winner must be one of the two on stage. This
    // was previously an unauthenticated, unrestricted endpoint: any caller
    // could crown any winnerId for any room.
    const isCombatant = session.user.id === match.championId || session.user.id === match.challengerId;
    const isStaff = STAFF_ROLES.has(session.user.role.toUpperCase());
    if (!isCombatant && !isStaff) {
      return NextResponse.json({ ok: false, error: "Only the two combatants on stage may resolve this match" }, { status: 403 });
    }
    if (winnerId !== match.championId && winnerId !== match.challengerId) {
      return NextResponse.json({ ok: false, error: "Winner must be one of the two combatants on stage" }, { status: 400 });
    }

    const resolved = resolveGauntletMatch(roomId, winnerId, session.user.id);
    return NextResponse.json({ ok: true, state: resolved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
