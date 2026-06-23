import { NextRequest, NextResponse } from "next/server";
import { registerAudienceEntry } from "@/lib/broadcast/GlobalLiveSessionRegistry";

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
