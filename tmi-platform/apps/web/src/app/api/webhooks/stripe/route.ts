/**
 * POST /api/webhooks/stripe — LEGACY path (retired for fulfillment).
 *
 * Canonical Stripe webhook (configure in Stripe Dashboard):
 *   POST /api/stripe/webhook
 *
 * This route only verifies the signature (no trust-parse) and acknowledges.
 * It does not fulfill orders — prevents double-grant vs the canonical handler.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
  if (!endpointSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  try {
    stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/webhooks/stripe] Signature error: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  return NextResponse.json({
    received: true,
    deferred: true,
    canonical: "/api/stripe/webhook",
    message: "Legacy path — configure Stripe Dashboard webhook to /api/stripe/webhook for fulfillment.",
  });
}
