// api/finance/webhook/stripe/route.ts — Stripe webhook → RevenueLedger + HoldEngine

import { NextRequest, NextResponse } from "next/server";
import { recordTransaction, settleTransaction, failTransaction, refundTransaction } from "@/lib/finance/revenueLedger";
import { createHold } from "@/lib/finance/RefundRiskEngine";
import { allocateToReserve } from "@/lib/finance/ReserveEngine";
import { dispatchNotification } from "@/lib/finance/PayoutNotificationEngine";
import { REVENUE_SPLITS } from "@/lib/stripe/products";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  // Verify webhook signature
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // In production with Stripe SDK:
  // const event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  // For now, parse raw body and trust the sig header
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!sig && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const obj = event.data.object as Record<string, unknown>;

  switch (event.type) {
    case "payment_intent.succeeded": {
      const grossAmount = (obj.amount as number) ?? 0;
      const userId = (obj.metadata as Record<string, string>)?.userId ?? "unknown";
      const recipientId = (obj.metadata as Record<string, string>)?.recipientId;
      const type = ((obj.metadata as Record<string, string>)?.transactionType ?? "subscription") as Parameters<typeof recordTransaction>[0];

      const entry = recordTransaction(type, grossAmount, userId, recipientId, obj.id as string);
      settleTransaction(entry.id);

      if (entry.creatorCut > 0 && recipientId) {
        createHold(entry.id, type, entry.creatorCut, recipientId);
      }

      // Reserve allocation: infrastructure gets 10% of platform cut
      if (entry.platformCut > 0) {
        allocateToReserve("infrastructure", Math.round(entry.platformCut * 0.10), entry.id);
        allocateToReserve("refund_buffer",  Math.round(entry.platformCut * 0.07), entry.id);
      }

      dispatchNotification({
        event: "payment_received",
        recipientId: recipientId ?? userId,
        amountCents: entry.creatorCut,
        metadata: { transactionId: entry.id },
      });

      dispatchNotification({
        event: "revenue_split_completed",
        recipientId: recipientId ?? userId,
        amountCents: entry.creatorCut,
        metadata: { transactionId: entry.id },
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const piId = obj.id as string;
      // Mark any pending entries with this PI as failed
      failTransaction(piId);
      break;
    }

    case "charge.refunded": {
      const piId = (obj.payment_intent as string) ?? "";
      refundTransaction(piId);
      break;
    }

    case "transfer.paid": {
      const recipientId = (obj.metadata as Record<string, string>)?.recipientId ?? "unknown";
      dispatchNotification({
        event: "payout_sent",
        recipientId,
        amountCents: (obj.amount as number) ?? 0,
        payoutId: obj.id as string,
      });
      break;
    }

    case "transfer.failed": {
      const recipientId = (obj.metadata as Record<string, string>)?.recipientId ?? "unknown";
      dispatchNotification({
        event: "payout_failed",
        recipientId,
        amountCents: (obj.amount as number) ?? 0,
        reason: String(obj.failure_message ?? "Transfer declined"),
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
