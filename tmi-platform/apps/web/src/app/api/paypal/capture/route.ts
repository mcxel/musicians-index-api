// api/paypal/capture/route.ts — Server-side PayPal order capture
// Called after PayPal JS SDK onApprove() fires on the client.

import { NextRequest, NextResponse } from "next/server";
import { normalizePayPal, dispatch } from "@/lib/payments/GatewayDispatcher";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const orderId = body.orderId as string | undefined;
  const userId  = body.userId  as string | undefined;
  const recipientId = body.recipientId as string | undefined;
  const type    = (body.type as string | undefined) ?? "tip";

  if (!orderId || !userId) {
    return NextResponse.json({ error: "orderId and userId required" }, { status: 400 });
  }

  const PAYPAL_CLIENT_ID     = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_BASE          = process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
  }

  // Get access token
  const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "PayPal auth failed" }, { status: 502 });
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Capture order
  const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!captureRes.ok) {
    const errBody = await captureRes.json().catch(() => ({}));
    return NextResponse.json({ error: "Capture failed", details: errBody }, { status: 502 });
  }

  const captureData = await captureRes.json() as {
    id: string;
    status: string;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{ id: string; amount: { value: string; currency_code: string } }>;
      };
    }>;
    payer?: { email_address?: string; payer_id?: string };
  };

  if (captureData.status !== "COMPLETED") {
    return NextResponse.json({ error: `Order not completed: ${captureData.status}` }, { status: 400 });
  }

  const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture) {
    return NextResponse.json({ error: "No capture found" }, { status: 400 });
  }

  const tx = normalizePayPal({
    id: capture.id,
    amount: capture.amount,
    custom_id: [userId, recipientId, type].join(":"),
    payer: captureData.payer,
  });

  const result = dispatch(tx);

  return NextResponse.json({
    ok: result.success,
    orderId,
    captureId: capture.id,
    amount: capture.amount,
    ledgerEntryId: result.ledgerEntryId,
    error: result.error,
  });
}
