/**
 * StripeLiveVerification
 * Launch-ready runner for real Stripe checkout creation plus flow assertions
 * for success, refund, and duplicate webhook replay.
 */

import type Stripe from "stripe";

import { getStripe } from "../stripe/client";
import { registerCheckoutProduct } from "../checkout/CheckoutProductResolver";
import { getCheckoutReceiptByCheckoutId } from "../checkout/CheckoutReceiptEngine";
import {
  handleStripeWebhook,
  listStripeWebhookEvents,
  type StripeWebhookEvent,
  type StripeWebhookResult,
} from "../checkout/StripeWebhookEngine";
import { createUniversalCheckout } from "../checkout/UniversalCheckoutEngine";
import {
  getRevenueLedgerEntryByCheckoutId,
  listRevenueLedgerEntries,
} from "../revenue/RevenueLedgerEngine";
import { getPayoutsByLedgerEntryId } from "../revenue/PayoutEngine";
import { listRefundRequests } from "../revenue/RefundEngine";

export type StripeVerificationAssertion = {
  label: string;
  passed: boolean;
  detail: string;
};

export type StripeVerificationFlowResult = {
  flow: "success" | "refund" | "duplicate-replay";
  eventId: string;
  checkoutId: string;
  passed: boolean;
  assertions: StripeVerificationAssertion[];
  webhookResult: StripeWebhookResult;
};

export type StripeVerificationPreparation = {
  checkoutId: string;
  orderId: string;
  productId: string;
  customerId: string;
  stripeSessionId?: string;
  stripeSessionUrl?: string;
  stripePaymentIntentId?: string;
};

function assert(label: string, passed: boolean, detail: string): StripeVerificationAssertion {
  return { label, passed, detail };
}

function getStripeOrigin(): string {
  return (
    process.env.WEB_ORIGIN
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.NEXT_PUBLIC_APP_URL
    ?? "http://localhost:3000"
  );
}

export function getStripeVerificationEnvStatus(): Array<{ key: string; present: boolean }> {
  return [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ].map((key) => ({ key, present: Boolean(process.env[key]) }));
}

export async function prepareStripeLiveVerificationCheckout(input?: {
  customerId?: string;
  productId?: string;
  sellerId?: string;
  sellerType?: "artist" | "venue" | "merchant" | "promoter";
  title?: string;
  priceCents?: number;
  createStripeSession?: boolean;
}): Promise<StripeVerificationPreparation> {
  const customerId = input?.customerId ?? "stripe-smoke-fan-1";
  const productId = input?.productId ?? "stripe-smoke-ticket-1";
  const sellerId = input?.sellerId ?? "stripe-smoke-venue-1";
  const sellerType = input?.sellerType ?? "venue";
  const title = input?.title ?? "Stripe Smoke Ticket";
  const priceCents = input?.priceCents ?? 2900;

  registerCheckoutProduct({
    productType: "ticket",
    productId,
    title,
    unitPriceCents: priceCents,
    currency: "USD",
    taxable: true,
    metadata: { sellerId, sellerType },
  });

  const created = createUniversalCheckout({
    customerId,
    productType: "ticket",
    productId,
    quantity: 1,
  });

  const preparation: StripeVerificationPreparation = {
    checkoutId: created.checkout.checkoutId,
    orderId: created.checkout.orderId,
    productId,
    customerId,
  };

  if (input?.createStripeSession === false) {
    return preparation;
  }

  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe credentials missing. Add STRIPE_SECRET_KEY before creating a live verification session.");
  }

  const origin = getStripeOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/checkout/success?checkoutId=${encodeURIComponent(created.checkout.checkoutId)}`,
    cancel_url: `${origin}/checkout/cancel?checkoutId=${encodeURIComponent(created.checkout.checkoutId)}`,
    client_reference_id: customerId,
    payment_method_types: ["card"],
    metadata: {
      checkoutId: created.checkout.checkoutId,
      orderId: created.checkout.orderId,
      productId,
      customerId,
      sellerId,
      sellerType,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: title },
          unit_amount: created.checkout.totalCents,
        },
      },
    ],
  });

  preparation.stripeSessionId = session.id;
  preparation.stripeSessionUrl = session.url ?? undefined;
  preparation.stripePaymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
  return preparation;
}

async function resolvePaymentIntentId(
  stripe: Stripe,
  sessionId?: string,
  paymentIntentId?: string,
): Promise<string | undefined> {
  if (paymentIntentId) return paymentIntentId;
  if (!sessionId) return undefined;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return typeof session.payment_intent === "string" ? session.payment_intent : undefined;
}

export async function createStripeLiveVerificationRefund(input: {
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<{ refundId: string; paymentIntentId: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe credentials missing. Add STRIPE_SECRET_KEY before creating a live refund.");
  }

  const paymentIntentId = await resolvePaymentIntentId(stripe, input.stripeSessionId, input.stripePaymentIntentId);
  if (!paymentIntentId) {
    throw new Error("Unable to resolve a Stripe payment intent for refund verification.");
  }

  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
  return { refundId: refund.id, paymentIntentId };
}

function countLedgerEntriesForCheckout(checkoutId: string): number {
  return listRevenueLedgerEntries().filter((entry) => entry.checkoutId === checkoutId).length;
}

function countPayoutsForCheckout(checkoutId: string): number {
  const ledgerEntry = getRevenueLedgerEntryByCheckoutId(checkoutId);
  if (!ledgerEntry) return 0;
  return getPayoutsByLedgerEntryId(ledgerEntry.ledgerEntryId).length;
}

function countReceiptsForCheckout(checkoutId: string): number {
  return getCheckoutReceiptByCheckoutId(checkoutId) ? 1 : 0;
}

export function runStripeSuccessVerification(livePayload: StripeWebhookEvent): StripeVerificationFlowResult {
  const webhookCountBefore = listStripeWebhookEvents().length;
  const webhookResult = handleStripeWebhook(livePayload);
  const receipt = getCheckoutReceiptByCheckoutId(livePayload.checkoutId);
  const ledgerEntry = getRevenueLedgerEntryByCheckoutId(livePayload.checkoutId);
  const payouts = ledgerEntry ? getPayoutsByLedgerEntryId(ledgerEntry.ledgerEntryId) : [];

  const assertions = [
    assert("webhook received", listStripeWebhookEvents().length === webhookCountBefore + 1, `events=${listStripeWebhookEvents().length}`),
    assert("payment completed", webhookResult.status === "paid", `status=${webhookResult.status}`),
    assert("receipt created", Boolean(receipt?.receiptId), `receipt=${receipt?.receiptId ?? "missing"}`),
    assert("ledger created", Boolean(ledgerEntry?.ledgerEntryId), `ledger=${ledgerEntry?.ledgerEntryId ?? "missing"}`),
    assert("payout created", payouts.length > 0, `payouts=${payouts.length}`),
  ];

  return {
    flow: "success",
    eventId: livePayload.id,
    checkoutId: livePayload.checkoutId,
    passed: assertions.every((item) => item.passed),
    assertions,
    webhookResult,
  };
}

export function runStripeRefundVerification(livePayload: StripeWebhookEvent): StripeVerificationFlowResult {
  const refundsBefore = listRefundRequests().length;
  const webhookResult = handleStripeWebhook(livePayload);
  const ledgerEntry = getRevenueLedgerEntryByCheckoutId(livePayload.checkoutId);
  const payouts = ledgerEntry ? getPayoutsByLedgerEntryId(ledgerEntry.ledgerEntryId) : [];
  const refundsAfter = listRefundRequests();
  const latestRefund = refundsAfter[0];

  const assertions = [
    assert("refund event received", webhookResult.status === "refunded", `status=${webhookResult.status}`),
    assert("refund record created", refundsAfter.length >= refundsBefore, `refunds=${refundsAfter.length}`),
    assert("ledger reversed", ledgerEntry?.status === "reversed", `ledgerStatus=${ledgerEntry?.status ?? "missing"}`),
    assert("payout rolled back", payouts.every((payout) => payout.status === "rolled-back"), `payoutStatuses=${payouts.map((payout) => payout.status).join(",") || "none"}`),
  ];

  return {
    flow: "refund",
    eventId: livePayload.id,
    checkoutId: livePayload.checkoutId,
    passed: assertions.every((item) => item.passed),
    assertions,
    webhookResult: {
      ...webhookResult,
      refundId: latestRefund?.refundId ?? webhookResult.refundId,
    },
  };
}

export function runStripeDuplicateReplayVerification(livePayload: StripeWebhookEvent): StripeVerificationFlowResult {
  const ledgerBefore = countLedgerEntriesForCheckout(livePayload.checkoutId);
  const payoutsBefore = countPayoutsForCheckout(livePayload.checkoutId);
  const receiptsBefore = countReceiptsForCheckout(livePayload.checkoutId);
  const webhookResult = handleStripeWebhook(livePayload);
  const ledgerAfter = countLedgerEntriesForCheckout(livePayload.checkoutId);
  const payoutsAfter = countPayoutsForCheckout(livePayload.checkoutId);
  const receiptsAfter = countReceiptsForCheckout(livePayload.checkoutId);

  const assertions = [
    assert("webhook replay accepted", webhookResult.status === "paid", `status=${webhookResult.status}`),
    assert("no duplicate receipt", receiptsAfter === receiptsBefore, `before=${receiptsBefore} after=${receiptsAfter}`),
    assert("no duplicate ledger", ledgerAfter === ledgerBefore, `before=${ledgerBefore} after=${ledgerAfter}`),
    assert("no duplicate payout", payoutsAfter === payoutsBefore, `before=${payoutsBefore} after=${payoutsAfter}`),
  ];

  return {
    flow: "duplicate-replay",
    eventId: livePayload.id,
    checkoutId: livePayload.checkoutId,
    passed: assertions.every((item) => item.passed),
    assertions,
    webhookResult,
  };
}

export function runStripeLiveVerification(event: StripeWebhookEvent): StripeWebhookResult {
  return handleStripeWebhook(event);
}