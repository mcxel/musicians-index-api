export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFanCreditsBalance } from "@/lib/points/pointsFulfillment";
import { quotePointsDiscount } from "@/lib/points/PointDiscountEngine";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";

/**
 * POST /api/points/discount-quote
 * Body: { productPriceCents, sellerUserId?, pointsToRedeem? }
 * Honest quote for UI — does not spend.
 */
export async function POST(req: NextRequest) {
  let body: {
    productPriceCents?: number;
    sellerUserId?: string;
    pointsToRedeem?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const P = Math.floor(Number(body.productPriceCents ?? 0));
  if (!Number.isFinite(P) || P < 0) {
    return NextResponse.json({ error: "productPriceCents required" }, { status: 400 });
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const buyer = fanEmail
    ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() }, select: { id: true } })
    : null;
  const balance = buyer ? await getFanCreditsBalance(buyer.id) : 0;
  const sellerTier = body.sellerUserId
    ? await resolveSellerCommerceTier(body.sellerUserId)
    : "FREE";

  const quote = quotePointsDiscount({
    productPriceCents: P,
    sellerTier,
    pointsAvailable: balance,
    pointsToRedeem: body.pointsToRedeem ?? 0,
  });

  return NextResponse.json({
    ...quote,
    pointsBalance: balance,
    buyerId: buyer?.id ?? null,
  });
}
