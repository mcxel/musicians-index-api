export const dynamic = "force-dynamic";
/**
 * POST /api/yo/purchase
 *
 * Creates a Stripe Checkout session for purchasing a locked YoPho card release.
 *
 * Body: { cardId: string }
 *
 * The creator sets the price via YoCardLockEngine's YoCardSaleConfig.
 * TMI's platform share is taken via Stripe's application_fee_amount (future)
 * or settled manually via the RevenueLedger. For now the checkout is a
 * one-party payment — platform fee logic wired in a future billing pass.
 *
 * Rule 20: this route does NOT fabricate purchase data.
 * Rule 23: no money flows unless a real Stripe session is created.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getStripe } from "@/lib/stripe/client";
import { getYoPhoCard } from "@/lib/yopho/YoPhoCardStore";
import type { YoCardSaleConfig } from "@/lib/yopho/YoCardLockEngine";

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const auth = await getTmiAuth();
  if (!auth?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Body ────────────────────────────────────────────────────────────────────
  let cardId: string | undefined;
  try {
    const body = await req.json();
    cardId = typeof body.cardId === "string" ? body.cardId.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  // ── Fetch card ──────────────────────────────────────────────────────────────
  const card = getYoPhoCard(cardId);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const lockPolicy = card.documentJson?.lockPolicy;
  if (!lockPolicy || lockPolicy.state !== "LOCKED") {
    return NextResponse.json(
      { error: "This release is not currently for sale" },
      { status: 400 },
    );
  }

  const sale: YoCardSaleConfig | null = lockPolicy.sale ?? null;
  if (!sale || !sale.isForSale) {
    return NextResponse.json(
      { error: "This release is not configured for sale" },
      { status: 400 },
    );
  }

  // ── Edition limit check ──────────────────────────────────────────────────────
  if (sale.editionLimit !== null && sale.soldCount >= sale.editionLimit) {
    return NextResponse.json(
      { error: "This edition is sold out" },
      { status: 410 },
    );
  }

  // ── Stripe ──────────────────────────────────────────────────────────────────
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment system unavailable" },
      { status: 503 },
    );
  }

  const origin = req.nextUrl.origin;
  const artistDisplay = card.displayName ?? "Artist";
  const productTitle = card.documentJson?.title ?? card.displayName ?? "YoArtifact Release";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: (sale.currency ?? "usd").toLowerCase(),
          unit_amount: sale.priceCents,
          product_data: {
            name: productTitle,
            description: `by ${artistDisplay}`,
          },
        },
      },
    ],
    metadata: {
      type: "yo_artifact_purchase",
      cardId,
      buyerId: auth.user.id,
      buyerEmail: auth.user.email ?? "",
      artistDisplay,
      includesRawExport: sale.includesRawExport ? "1" : "0",
    },
    success_url: `${origin}/collection?yo_purchased=1&cardId=${encodeURIComponent(cardId)}`,
    cancel_url: `${origin}/collection?yo_cancelled=1`,
    customer_email: auth.user.email ?? undefined,
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}
