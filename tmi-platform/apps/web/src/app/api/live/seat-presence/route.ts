export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { seatFanAtPosition, listAudiencePresence } from "@/lib/audience/tmiAudienceSeatPresenceEngine";
import { emitAudienceReaction, type TmiAudienceReaction } from "@/lib/audience/tmiAudienceReactionEngine";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import { seatGeometryFromSeatId } from "@/lib/audience/tmiFanAvatarSeatAssignment";

// Venue Runtime Divergence Audit (2026-06-20): this route used to call
// joinAudienceSeat(), which ran assignSeatForFan() against its own
// independent seat pool — disconnected from audienceRuntimeEngine.ts (the
// canonical room-membership engine /api/live/audience already uses, adopted
// by ArenaImmersivePanel, VenueImmersiveRoom, and the lobby entry flow). That
// meant a fan could hold two different "seats" in the same room depending on
// which panel rendered them. Fixed: "join" here now takes the REAL seatId
// /api/live/audience already assigned and derives geometry from it via
// seatGeometryFromSeatId() instead of minting a second, independent seat.
// This route's remaining real job is presence/reaction state (cheering,
// voting, etc.) layered on top of that canonical seat — not seat assignment.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const roomId = searchParams.get("room");
  if (!roomId) return NextResponse.json({ error: "room required" }, { status: 400 });
  return NextResponse.json({ audience: listAudiencePresence(roomId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomId, fanId, tier, seatId, reaction } = body as {
      action: string;
      roomId: string;
      fanId: string;
      tier?: TmiSeatTier;
      seatId?: string;
      reaction?: TmiAudienceReaction;
    };

    if (!roomId || !fanId) {
      return NextResponse.json({ error: "roomId and fanId required" }, { status: 400 });
    }

    switch (action) {
      case "join": {
        if (!tier || !seatId) {
          return NextResponse.json({ error: "tier and seatId required" }, { status: 400 });
        }
        const seat = seatGeometryFromSeatId(seatId, 8, 4);
        const presence = seatFanAtPosition(fanId, roomId, tier, seat);
        return NextResponse.json({ presence, audience: listAudiencePresence(roomId) });
      }
      case "reaction": {
        if (!reaction) return NextResponse.json({ error: "reaction required" }, { status: 400 });
        const event = emitAudienceReaction({ roomId, fanId, reaction });
        return NextResponse.json({ event, audience: listAudiencePresence(roomId) });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
