/**
 * POST /api/finance/webhook/stripe
 *
 * Finance-ledger side effects only (RevenueLedger / holds / reserves).
 * Canonical fulfillment webhook (tiers, tips, tickets, ownership):
 *   POST /api/stripe/webhook  ← configure this URL in Stripe Dashboard
 *
 * Signature required — no trust-parse of unverified JSON.
 */
import { NextRequest, NextResponse } from "next/server";
import { recordTransaction, settleTransaction, failTransaction, refundTransaction } from "@/lib/finance/revenueLedger";
import { createHold } from "@/lib/finance/RefundRiskEngine";
import { allocateToReserve } from "@/lib/finance/ReserveEngine";
import { dispatchNotification } from "@/lib/finance/PayoutNotificationEngine";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> }; id: string };
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET) as typeof event;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[finance/webhook/stripe] Signature Error: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
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

      if (entry.platformCut > 0) {
        allocateToReserve("infrastructure", Math.round(entry.platformCut * 0.10), entry.id);
        allocateToReserve("refund_buffer", Math.round(entry.platformCut * 0.07), entry.id);
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
      failTransaction(obj.id as string);
      break;
    }

    case "charge.refunded": {
      refundTransaction((obj.payment_intent as string) ?? "");
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

    default:
      break;
  }

  return NextResponse.json({ received: true, financeLedger: true });
}
