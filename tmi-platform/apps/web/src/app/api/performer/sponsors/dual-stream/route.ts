import { NextRequest, NextResponse } from "next/server";
import {
  listDualStreamForPerformer,
  setHuntedSponsorLive,
  syncLiveRoomSponsors,
} from "@/lib/commerce/DualStreamSponsorshipEngine";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const performerId = req.nextUrl.searchParams.get("performerId");
  if (!performerId) {
    return NextResponse.json({ error: "performerId required" }, { status: 400 });
  }
  const streams = await listDualStreamForPerformer(performerId);
  return NextResponse.json({
    ok: true,
    house: streams.house,
    hunted: streams.hunted,
    advertiseHref: "/sponsors/advertise",
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    performerId?: string;
    sponsorId?: string;
    enabled?: boolean;
    roomId?: string;
  };
  if (!body.performerId || !body.sponsorId || typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "performerId, sponsorId, enabled required" },
      { status: 400 },
    );
  }
  setHuntedSponsorLive(body.performerId, body.sponsorId, body.enabled);
  let overlays = null;
  if (body.roomId) {
    overlays = await syncLiveRoomSponsors({
      roomId: body.roomId,
      performerId: body.performerId,
    });
  }
  const streams = await listDualStreamForPerformer(body.performerId);
  return NextResponse.json({ ok: true, house: streams.house, hunted: streams.hunted, overlays });
}
