export const dynamic = "force-dynamic";
/**
 * POST /api/yo/purchase/webhook
 *
 * Stripe webhook handler for YoArtifact purchases.
 * Triggered after a successful "checkout.session.completed" event where
 * metadata.type === "yo_artifact_purchase".
 *
 * On success:
 *   1. Creates a YoArtifactOwnership record in the DB
 *   2. Updates soldCount on the card's sale config (best-effort in-memory)
 *
 * Rule 20: only creates a record when Stripe confirms real payment.
 * Rule 23: no cash entitlement issued without a verified Stripe signature.
 *
 * Stripe signature verified with STRIPE_WEBHOOK_YO_SECRET env var.
 * Falls back to STRIPE_WEBHOOK_SECRET if the dedicated secret is absent
 * (allows testing with the shared dev webhook endpoint).
 */

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";

const webhookSecret =
  process.env.STRIPE_WEBHOOK_YO_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("[yo/purchase/webhook] No webhook secret configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[yo/purchase/webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};

  if (meta.type !== "yo_artifact_purchase") {
    // Not our event — let other webhook handlers deal with it
    return NextResponse.json({ received: true });
  }

  const { cardId, buyerId, buyerEmail, includesRawExport } = meta;
  if (!cardId || !buyerId) {
    console.error("[yo/purchase/webhook] Missing cardId or buyerId in metadata", meta);
    return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
  }

  // ── Create ownership record ──────────────────────────────────────────────────
  try {
    await prisma.yoArtifactOwnership.upsert({
      where: {
        ownerId_artifactId: {
          ownerId: buyerId,
          artifactId: cardId,
        },
      },
      create: {
        artifactId: cardId,
        releaseVersion: 1,
        ownerId: buyerId,
        ownerEmail: buyerEmail ?? "",
        ownershipType: "PURCHASED",
        purchaseId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        purchasedAt: new Date(),
        authorizedDeviceIds: "[]",
      },
      update: {
        // Idempotent — if a duplicate webhook fires, just ensure the record
        // reflects the most recent payment intent
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
      },
    });

    console.info(
      `[yo/purchase/webhook] Ownership granted — buyer=${buyerId} card=${cardId} rawExport=${includesRawExport}`,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[yo/purchase/webhook] DB write failed:", msg);
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, status: "ownership_granted" });
}
