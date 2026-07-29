export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isRoomRejoinBlocked } from "@/lib/trustSafety";

/**
 * GET /api/trust-safety/rejoin-check?roomId=&userId=
 * Used by Fan Lobby before presence sync — honest block when restricted.
 */
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId");
  const userId = req.nextUrl.searchParams.get("userId");
  if (!roomId || !userId) {
    return NextResponse.json({ error: "roomId and userId required" }, { status: 400 });
  }

  try {
    const blocked = await isRoomRejoinBlocked(userId, roomId);
    return NextResponse.json({ ok: true, blocked });
  } catch (err) {
    // Fail open on DB errors so lobby stays usable — log honestly.
    console.warn("[trust-safety/rejoin-check]", err);
    return NextResponse.json({ ok: true, blocked: false, warning: "check_unavailable" });
  }
}
