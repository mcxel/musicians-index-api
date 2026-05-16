/**
 * StripeWebhookEngine
 * Webhook handling for payment success/fail/refund and fulfillment trigger.
 */

import { requestRefund, approveRefund, processRefund } from "../revenue/RefundEngine";
import { getRevenueLedgerEntryByCheckoutId } from "../revenue/RevenueLedgerEngine";
import { getPayoutsByLedgerEntryId } from "../revenue/PayoutEngine";
import {
  markCheckoutPaid,
  markCheckoutFailed,
  markCheckoutRefunded,
  type UniversalCheckoutResult,
} from "./UniversalCheckoutEngine";

export type StripeWebhookEventType =
  | "checkout.session.completed"
  | "payment_intent.payment_failed"
  | "charge.refunded";

export type StripeWebhookEvent = {
  id: string;
  type: StripeWebhookEventType;
  checkoutId: string;
  payload?: Record<string, string | number | boolean>;
};

export type StripeWebhookResult = {
  eventId: string;
  checkoutId: string;
  status: "paid" | "failed" | "refunded";
  fulfillmentTriggered: boolean;
  receiptId?: string;
  ledgerEntryId?: string;
  payoutIds?: string[];
  refundId?: string;
};

const webhookEvents: StripeWebhookEvent[] = [];

function triggerFulfillment(checkoutId: string): boolean {
  // Stub fulfillment trigger point for domain-specific engines.
  return Boolean(checkoutId);
}

export function handleStripeWebhook(event: StripeWebhookEvent): StripeWebhookResult {
  webhookEvents.unshift(event);

  if (event.type === "checkout.session.completed") {
    const result: UniversalCheckoutResult = markCheckoutPaid(event.checkoutId);
    const fulfillmentTriggered = triggerFulfillment(event.checkoutId);
    return {
      eventId: event.id,
      checkoutId: event.checkoutId,
      status: "paid",
      fulfillmentTriggered,
      receiptId: result.receipt.receiptId,
      ledgerEntryId: result.ledgerEntry?.ledgerEntryId,
      payoutIds: result.payouts.map((payout) => payout.payoutId),
    };
  }

  if (event.type === "payment_intent.payment_failed") {
    markCheckoutFailed(event.checkoutId);
    return {
      eventId: event.id,
      checkoutId: event.checkoutId,
      status: "failed",
      fulfillmentTriggered: false,
    };
  }

  markCheckoutRefunded(event.checkoutId);
  const ledgerEntry = getRevenueLedgerEntryByCheckoutId(event.checkoutId);
  let refundId: string | undefined;
  let payoutIds: string[] | undefined;

  if (ledgerEntry) {
    const payouts = getPayoutsByLedgerEntryId(ledgerEntry.ledgerEntryId);
    const refund = requestRefund({
      ledgerEntryId: ledgerEntry.ledgerEntryId,
      reason: String(event.payload?.reason ?? "stripe-refund"),
      amountCents: ledgerEntry.totalCents,
      payoutId: payouts[0]?.payoutId,
    });
    approveRefund(refund.refundId);
    processRefund(refund.refundId);
    refundId = refund.refundId;
    payoutIds = payouts.map((payout) => payout.payoutId);
  }

  return {
    eventId: event.id,
    checkoutId: event.checkoutId,
    status: "refunded",
    fulfillmentTriggered: false,
    ledgerEntryId: ledgerEntry?.ledgerEntryId,
    payoutIds,
    refundId,
  };
}

export function listStripeWebhookEvents(): StripeWebhookEvent[] {
  return [...webhookEvents];
}
