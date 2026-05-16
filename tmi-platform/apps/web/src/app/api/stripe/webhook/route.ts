export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { recordStripeEvent } from "@/lib/stripe/stripe-telemetry-store";

const MAX_BODY_BYTES = 1024 * 1024; // 1MB
const FORWARD_TIMEOUT_MS = 8000;
const REPLAY_WINDOW_SECS = 300;       // Stripe's standard replay window
const FINGERPRINT_TTL_MS = 10 * 60 * 1000; // 10 min (2× the replay window)

const ALLOWED_API_BASES = new Set([
  "https://tmi-api.themusiciansindex.com",
  process.env.NEXT_PUBLIC_API_URL,
].filter(Boolean) as string[]);

// Fingerprint cache: v1 sig prefix → expiresAt; prevents duplicate event replay at the edge
const fingerprintCache = new Map<string, number>();

function isAllowedApiBase(value: string): boolean {
  return ALLOWED_API_BASES.has(value);
}

function withTimeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

function emitWebhookTelemetry(event: string, meta: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ event, service: "stripe-webhook", ts: Date.now(), ...meta }));
  recordStripeEvent(event, meta);
}

function extractStripeTimestamp(sig: string): number | null {
  const match = sig.match(/t=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function buildFingerprint(sig: string): string {
  const v1 = sig.match(/v1=([a-f0-9]+)/)?.[1];
  return v1 ? `v1:${v1.slice(0, 24)}` : `raw:${sig.slice(0, 40)}`;
}

function purgeFingerprintCache(): void {
  const now = Date.now();
  for (const [key, exp] of fingerprintCache) {
    if (now > exp) fingerprintCache.delete(key);
  }
}

function checkAndRegisterFingerprint(sig: string): { isReplay: boolean; fingerprint: string } {
  purgeFingerprintCache();
  const fingerprint = buildFingerprint(sig);
  const isReplay = fingerprintCache.has(fingerprint);
  if (!isReplay) {
    fingerprintCache.set(fingerprint, Date.now() + FINGERPRINT_TTL_MS);
  }
  return { isReplay, fingerprint };
}

export async function POST(req: NextRequest) {
  try {
    // Content-type gate
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      emitWebhookTelemetry("malformed_payload_rejected", { reason: "bad-content-type", contentType });
      return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
    }

    // Signature presence gate
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      emitWebhookTelemetry("invalid_signature_rejected", { reason: "missing-header" });
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    }

    // Timestamp staleness gate — reject replays older than REPLAY_WINDOW_SECS
    const stripeTimestamp = extractStripeTimestamp(signature);
    if (stripeTimestamp !== null) {
      const nowSecs = Math.floor(Date.now() / 1000);
      const ageSecs = nowSecs - stripeTimestamp;
      if (ageSecs > REPLAY_WINDOW_SECS) {
        emitWebhookTelemetry("replay_attack_detected", { ageSecs, stripeTimestamp });
        return NextResponse.json({ error: "Webhook timestamp too old" }, { status: 400 });
      }
    }

    // Duplicate event fingerprint gate
    const { isReplay, fingerprint } = checkAndRegisterFingerprint(signature);
    if (isReplay) {
      emitWebhookTelemetry("duplicate_event_rejected", { fingerprint });
      return NextResponse.json({ error: "Duplicate event" }, { status: 200 }); // 200 so Stripe stops retrying
    }

    // Allowlist gate
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://tmi-api.themusiciansindex.com";
    if (!isAllowedApiBase(apiBase)) {
      emitWebhookTelemetry("upstream_failure", { reason: "allowlist-rejected", apiBase });
      return NextResponse.json({ error: "Webhook forwarding unavailable" }, { status: 503 });
    }

    // Payload size gate
    const rawBody = await req.arrayBuffer();
    if (rawBody.byteLength === 0 || rawBody.byteLength > MAX_BODY_BYTES) {
      emitWebhookTelemetry("malformed_payload_rejected", { reason: "size-violation", bytes: rawBody.byteLength });
      return NextResponse.json({ error: "Payload rejected" }, { status: 413 });
    }

    // Edge signature pre-verification — rejects forged payloads before they reach the backend.
    // Only runs when STRIPE_WEBHOOK_SECRET is configured; falls through otherwise.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const stripe = getStripe();
      if (stripe) {
        try {
          stripe.webhooks.constructEvent(Buffer.from(rawBody), signature, webhookSecret);
        } catch (verifyErr) {
          console.error("[stripe/webhook] Signature verification failed:", verifyErr);
          emitWebhookTelemetry("invalid_signature_rejected", { reason: "crypto-verify-failed" });
          return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
        }
      }
    }

    // Forward to backend (which holds final Stripe authority)
    const upstream = await fetch(`${apiBase}/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": signature,
      },
      body: rawBody,
      signal: withTimeoutSignal(FORWARD_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!upstream.ok) {
      console.error(`[stripe/webhook] Upstream returned ${upstream.status}`);
      emitWebhookTelemetry("upstream_failure", { status: upstream.status });
      return NextResponse.json({ error: "Webhook forwarding failed" }, { status: 502 });
    }

    emitWebhookTelemetry("webhook_verified", { fingerprint });
    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      console.error("[stripe/webhook] Upstream timeout");
      emitWebhookTelemetry("upstream_timeout", {});
      return NextResponse.json({ error: "Webhook service timeout" }, { status: 504 });
    }
    console.error("[stripe/webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
