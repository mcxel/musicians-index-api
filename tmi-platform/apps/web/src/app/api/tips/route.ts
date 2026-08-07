export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import {
  resolveFanUserIdFromEmail,
  resolveTipArtistUserId,
  tipSplitCents,
} from "@/lib/tips/tipFulfillment";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";

/**
 * POST /api/tips
 * Creates a Stripe Checkout session for a tip (payment mode).
 * Webhook grant path: checkout.session.completed metadata.type === "tip"
 *
 * Body: { recipientId?: string, artistSlug?: string, amount: number (dollars or cents), roomId?: string, roomSlug?: string }
 * Amount: values <= 500 treated as dollars (UI legacy); values > 500 treated as cents.
 */
export async function POST(req: NextRequest) {
  let body: {
    recipientId?: string;
    artistSlug?: string;
    amount?: number;
    roomId?: string;
    roomSlug?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const artistKey = (body.artistSlug || body.recipientId || "").trim();
  if (!artistKey) {
    return NextResponse.json({ error: "recipientId or artistSlug required" }, { status: 400 });
  }

  const rawAmount = Number(body.amount);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }
  // Live UI historically sends dollars ($1–$50); TipButton/checkout send cents.
  const amountCents = rawAmount <= 500 ? Math.round(rawAmount * 100) : Math.round(rawAmount);
  if (amountCents < 100) {
    return NextResponse.json({ error: "Minimum tip is $1.00" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const artistUserId = await resolveTipArtistUserId(artistKey);
  if (!artistUserId) {
    return NextResponse.json(
      {
        error: "Artist account not found for tip recipient — tip requires a provisioned performer",
        code: "ARTIST_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  const fanEmail = req.cookies.get("tmi_user_email")?.value ?? "";
  const fanUserId = (await resolveFanUserIdFromEmail(fanEmail)) ?? "guest";
  const fanDisplayName = fanEmail ? fanEmail.split("@")[0] : "Fan";
  const roomId = body.roomId || body.roomSlug || "";
  const { origin } = req.nextUrl;
  const sellerTier = await resolveSellerCommerceTier(artistUserId);
  const { artistShare, platformFee, feeLabel } = tipSplitCents(amountCents, sellerTier);

  try {
    const tipSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Tip for @${artistKey}`,
              description: feeLabel,
            },
          },
        },
      ],
      success_url: `${origin}/payment-success?type=tip&artist=${encodeURIComponent(artistKey)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: roomId
        ? `${origin}/live/${encodeURIComponent(roomId)}`
        : `${origin}/home/1`,
      ...(fanEmail ? { customer_email: fanEmail } : {}),
      metadata: {
        type: "tip",
        artistId: artistUserId,
        artistSlug: artistKey,
        roomId,
        fanId: fanUserId,
        fanDisplayName,
        fanName: fanDisplayName,
        sellerTier,
        artistShareCents: String(artistShare),
        platformFeeCents: String(platformFee),
        feePreset: "tip",
      },
    });

    if (!tipSession.url) {
      return NextResponse.json({ error: "No Stripe checkout URL returned" }, { status: 502 });
    }

    return NextResponse.json({ url: tipSession.url, sessionId: tipSession.id });
  } catch (err) {
    console.error("[api/tips]", err);
    return NextResponse.json({ error: "Failed to create tip checkout" }, { status: 500 });
  }
}
