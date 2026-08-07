export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";
import {
  expressPurchaseInterest,
  getBeatFeeLabel,
  getFeaturedBeat,
  listRecentFeatured,
  markBeatFeatured,
  placeBeatAuctionBid,
  settleBeatAuction,
  getAuction,
} from "@/lib/beats/BeatPurchaseInterestEngine";

/**
 * GET  — recent featured beats (for purchase prompts)
 * POST  — mark featured | express interest | bid | settle
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    featured: listRecentFeatured(20),
    feeLabel: getBeatFeeLabel(),
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "interest");

  if (action === "feature") {
    const beatId = String(body.beatId ?? "");
    if (!beatId) {
      return NextResponse.json({ ok: false, error: "beatId required" }, { status: 400 });
    }

    let beatTitle = typeof body.beatTitle === "string" ? body.beatTitle : "";
    let broadcastTag = typeof body.broadcastTag === "string" ? body.broadcastTag : "";
    let listPriceCents = Math.floor(Number(body.listPriceCents ?? 0));
    let producerId: string | null =
      typeof body.producerId === "string" ? body.producerId : null;

    if (!beatTitle || !listPriceCents) {
      const beat = await prisma.beat.findUnique({ where: { id: beatId } }).catch(() => null);
      if (beat) {
        beatTitle = beatTitle || beat.title;
        broadcastTag = broadcastTag || beat.producerName || "";
        listPriceCents = listPriceCents || beat.basicPrice;
        producerId = producerId || beat.producerId;
      }
    }

    const row = markBeatFeatured({
      beatId,
      beatTitle: beatTitle || "Untitled Beat",
      broadcastTag: broadcastTag || "Producer",
      producerId,
      listPriceCents: listPriceCents || 2999,
      roomId: typeof body.roomId === "string" ? body.roomId : undefined,
      lane: typeof body.lane === "string" ? body.lane : undefined,
    });

    return NextResponse.json({ ok: true, featured: row, feeLabel: getBeatFeeLabel() });
  }

  if (action === "interest") {
    const auth = await getTmiAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Log in required" }, { status: 401 });
    }
    const beatId = String(body.beatId ?? "");
    const result = expressPurchaseInterest({
      beatId,
      userId: auth.user.id,
      displayName: auth.user.name,
    });
    if (!result.ok) {
      return NextResponse.json(result, { status: result.exclusiveBlocked ? 409 : 400 });
    }
    return NextResponse.json({ ...result, feeLabel: getBeatFeeLabel() });
  }

  if (action === "bid") {
    const auth = await getTmiAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Log in required" }, { status: 401 });
    }
    const result = placeBeatAuctionBid({
      auctionId: String(body.auctionId ?? ""),
      userId: auth.user.id,
      amountCents: Math.floor(Number(body.amountCents ?? 0)),
    });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ ...result, feeLabel: getBeatFeeLabel() });
  }

  if (action === "settle") {
    const result = settleBeatAuction(String(body.auctionId ?? ""));
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({
      ...result,
      feeLabel: getBeatFeeLabel(),
      checkoutHint: "Winner pays via /api/beats/checkout with auction amount.",
    });
  }

  if (action === "status") {
    const beatId = String(body.beatId ?? "");
    const featured = getFeaturedBeat(beatId);
    const auction = featured?.auctionId ? getAuction(featured.auctionId) : undefined;
    return NextResponse.json({ ok: true, featured, auction, feeLabel: getBeatFeeLabel() });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
