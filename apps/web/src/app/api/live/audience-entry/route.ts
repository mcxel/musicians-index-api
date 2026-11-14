import { NextRequest, NextResponse } from "next/server";
import { registerAudienceEntry } from "@/lib/broadcast/GlobalLiveSessionRegistry";
import { getSessionByRoomId } from "@/lib/broadcast/globalLiveSessionStore";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { datingAccessPayload, isDatingExperience } from "@/lib/trustSafety/DatingExperiencePolicy";
import { evaluateDatingJoinForUserId } from "@/lib/trustSafety/datingExperienceGuard";
import { hasValidTicketForRoom } from "@/lib/live/liveRoomPrivacyGate";

export const dynamic = "force-dynamic";

interface AudienceEntryBody {
  roomId?: string;
  viewerId?: string;
  countryCode?: string;
  countryName?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  let body: AudienceEntryBody = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const roomId = body.roomId?.trim();
  if (!roomId) {
    return NextResponse.json({ ok: false, error: "roomId is required" }, { status: 400 });
  }

  const datingRef = { roomId, slug: roomId, id: roomId };
  if (isDatingExperience(datingRef)) {
    const auth = await getTmiAuth();
    const decision = await evaluateDatingJoinForUserId(auth?.user?.id ?? "", datingRef);
    if (!decision.allowed) {
      return NextResponse.json({ ok: false, ...datingAccessPayload(decision) }, { status: 403 });
    }
  }

  // SECURITY (2026-09-23): this is the real, directly-callable API that grants
  // audience presence — it must enforce ticketed access itself, not rely on
  // the room page's render-time check alone ("do not rely solely on
  // page-level redirects if protected media/session APIs remain accessible
  // directly"). Host always passes; anyone else needs a real issued ticket.
  const existingSession = getSessionByRoomId(roomId);
  if (existingSession && String(existingSession.privacy).toUpperCase() === "PAID_ENTRY") {
    const auth = await getTmiAuth();
    const isHost = Boolean(auth?.user?.id && existingSession.userId === auth.user.id);
    if (!isHost) {
      const hasTicket = await hasValidTicketForRoom(auth?.user?.id, roomId);
      if (!hasTicket) {
        return NextResponse.json(
          { ok: false, error: "ticket_required", reason: "A ticket for this event is required to enter." },
          { status: 403 },
        );
      }
    }
  }

  const session = registerAudienceEntry({
    roomId,
    viewerId: body.viewerId,
    countryCode: body.countryCode,
    countryName: body.countryName,
    source: body.source,
  });

  if (!session) {
    return NextResponse.json({ ok: false, error: "Live session not found for room" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    roomId,
    recentAudienceEntries: session.recentAudienceEntries,
    audienceCountries: session.audienceCountries,
    lastAudienceEntryAt: session.lastAudienceEntryAt,
  });
}
