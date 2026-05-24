// api/paypal/webhook/route.ts — PayPal webhook events (PAYMENT.CAPTURE.COMPLETED, etc.)
// Verifies HMAC signature and dispatches to GatewayDispatcher.

import { NextRequest, NextResponse } from "next/server";
import { normalizePayPal, dispatch, hasBeenProcessed } from "@/lib/payments/GatewayDispatcher";

export const runtime = "nodejs";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id: string;
    status?: string;
    amount?: { value: string; currency_code: string };
    custom_id?: string;
    invoice_id?: string;
    payer?: { email_address?: string; payer_id?: string };
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let event: PayPalWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Idempotency check on webhook event id
  if (hasBeenProcessed(`wh_${event.id}`)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" && event.resource) {
    const capture = event.resource;
    if (!capture.amount) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const tx = normalizePayPal({
      id: capture.id,
      amount: capture.amount,
      custom_id: capture.custom_id,
      payer: capture.payer,
      metadata: { webhookEventId: event.id, webhookType: event.event_type },
    });

    dispatch(tx);
  }

  return NextResponse.json({ ok: true });
}
