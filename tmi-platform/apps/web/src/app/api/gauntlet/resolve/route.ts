import { NextRequest, NextResponse } from "next/server";
import { resolveGauntletMatch } from "@/lib/gauntlet/PersistentGauntletEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId = "cypher-room", winnerId, authorizedBy = "ADMIN_JUDGING_ENGINE" } = body;

    if (!winnerId) {
      return NextResponse.json({ ok: false, error: "Winner ID required" }, { status: 400 });
    }

    const state = resolveGauntletMatch(roomId, winnerId, authorizedBy);
    return NextResponse.json({ ok: true, state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
