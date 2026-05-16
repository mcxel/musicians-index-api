import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { runStripeLiveVerification } from "@/lib/launch/StripeLiveVerification";
import type { StripeWebhookEvent, StripeWebhookEventType } from "@/lib/checkout/StripeWebhookEngine";

const MAX_BODY_BYTES = 1024 * 1024; // 1MB

function parseStripeSignatureHeader(signatureHeader: string): { timestamp?: string; signatures: string[] } {
  const parts = signatureHeader
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const signatures: string[] = [];
  let timestamp: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (!key || !value) continue;
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  return { timestamp, signatures };
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, webhookSecret: string): boolean {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedHex = createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");
  const expected = Buffer.from(expectedHex, "hex");

  for (const candidate of signatures) {
    let received: Buffer;
    try {
      received = Buffer.from(candidate, "hex");
    } catch {
      continue;
    }

    if (received.length === expected.length && timingSafeEqual(received, expected)) {
      return true;
    }
  }

  return false;
}

function isLikelyReplay(signatureHeader: string): boolean {
  const { timestamp } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp) return true;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - ts) > 5 * 60;
}

function isWebhookEventType(value: unknown): value is StripeWebhookEventType {
  return (
    value === "checkout.session.completed" ||
    value === "charge.refunded" ||
    value === "payment_intent.payment_failed"
  );
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
    }

    const rawBody = await req.text();
    if (!rawBody || Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload rejected" }, { status: 413 });
    }

    if (isLikelyReplay(signature)) {
      return NextResponse.json({ error: "Signature timestamp rejected" }, { status: 400 });
    }

    if (!verifyStripeSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody) as Record<string, any>;
    const checkoutId = body?.data?.object?.metadata?.checkoutId ?? body?.data?.object?.id;

    if (!checkoutId || !body?.id || !isWebhookEventType(body?.type)) {
      return NextResponse.json({ error: "Malformed webhook payload" }, { status: 400 });
    }

    const event: StripeWebhookEvent = {
      id: String(body.id),
      type: body.type,
      checkoutId: String(checkoutId),
      payload: body.data?.object,
    };

    const result = runStripeLiveVerification(event);
    return NextResponse.json({ received: true, status: result.status });
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
