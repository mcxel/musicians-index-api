import { NextRequest, NextResponse } from "next/server";
import {
  listDualStreamForPerformer,
  setHuntedSponsorLive,
  syncLiveRoomSponsors,
  getLiveDualStreamSummary,
} from "@/lib/commerce/DualStreamSponsorshipEngine";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const performerId = req.nextUrl.searchParams.get("performerId");
  if (!performerId?.trim()) {
    return NextResponse.json({ error: "performerId required" }, { status: 400 });
  }
  const dual = await listDualStreamForPerformer(performerId.trim());
  return NextResponse.json({
    house: dual.house,
    hunted: dual.hunted,
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

  if (!body.performerId?.trim() || !body.sponsorId?.trim()) {
    return NextResponse.json({ error: "performerId and sponsorId required" }, { status: 400 });
  }

  setHuntedSponsorLive(body.performerId.trim(), body.sponsorId.trim(), Boolean(body.enabled));

  let overlays = null;
  if (body.roomId) {
    overlays = await syncLiveRoomSponsors({
      roomId: body.roomId,
      performerId: body.performerId.trim(),
    });
  }

  const dual = await listDualStreamForPerformer(body.performerId.trim());
  return NextResponse.json({
    ok: true,
    house: dual.house,
    hunted: dual.hunted,
    liveSummary: body.roomId ? getLiveDualStreamSummary(body.roomId) : null,
    overlays,
  });
}
