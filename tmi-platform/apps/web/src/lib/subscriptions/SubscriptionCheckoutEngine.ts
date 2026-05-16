/**
 * SubscriptionCheckoutEngine
 * Drives the full subscription purchase flow:
 * select plan → create checkout → confirm payment → emit receipt + entitlement
 */

import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import type { BillingInterval } from "./SubscriptionPlanEngine";
import { getSubscriptionPlan } from "./SubscriptionPlanEngine";
import { buildSubscriptionReceiptPayload, type SubscriptionReceiptPayload } from "./SubscriptionReceiptEngine";
import { resolveEntitlement, type SubscriptionEntitlement } from "./SubscriptionEntitlementEngine";
import type { TaxRegion } from "./SubscriptionTaxEngine";

export type SubscriptionCheckoutStatus = "draft" | "pending-payment" | "paid" | "failed" | "cancelled";

export type SubscriptionPaymentIntentPayload = {
  intentId: string;
  amountCents: number;
  currency: "USD";
  clientSecret: string;
  billingInterval: BillingInterval;
};

export type SubscriptionCheckoutSession = {
  checkoutId: string;
  subscriptionId: string;
  userId: string;
  accountType: AccountType;
  selectedTier: SubscriptionTier;
  billingInterval: BillingInterval;
  checkoutAmountCents: number;
  checkoutStatus: SubscriptionCheckoutStatus;
  paymentIntent: SubscriptionPaymentIntentPayload;
  receiptId?: string;
  createdAtMs: number;
};

export type SubscriptionCheckoutResult = {
  checkout: SubscriptionCheckoutSession;
  receipt: SubscriptionReceiptPayload;
  entitlement: SubscriptionEntitlement;
};

const sessions: SubscriptionCheckoutSession[] = [];
const activeSubscriptions = new Map<string, { tier: SubscriptionTier; subscriptionId: string; entitlement: SubscriptionEntitlement }>();
let checkoutCounter = 0;
let subscriptionCounter = 0;

function buildPaymentIntent(amountCents: number, checkoutId: string, billingInterval: BillingInterval): SubscriptionPaymentIntentPayload {
  return {
    intentId: `sub-intent-${checkoutId}`,
    amountCents,
    currency: "USD",
    clientSecret: `sub-secret-${checkoutId}-${Date.now()}`,
    billingInterval,
  };
}

export function createSubscriptionCheckout(input: {
  userId: string;
  accountType: AccountType;
  selectedTier: SubscriptionTier;
  billingInterval: BillingInterval;
  region?: TaxRegion;
}): SubscriptionCheckoutSession {
  const plan = getSubscriptionPlan(input.accountType, input.selectedTier);
  const checkoutAmountCents =
    input.billingInterval === "monthly" ? plan.monthlyPriceCents : plan.yearlyPriceCents;

  const checkoutId = `sub-checkout-${++checkoutCounter}`;
  const subscriptionId = `sub-${++subscriptionCounter}-${input.userId}`;

  const session: SubscriptionCheckoutSession = {
    checkoutId,
    subscriptionId,
    userId: input.userId,
    accountType: input.accountType,
    selectedTier: input.selectedTier,
    billingInterval: input.billingInterval,
    checkoutAmountCents,
    checkoutStatus: "pending-payment",
    paymentIntent: buildPaymentIntent(checkoutAmountCents, checkoutId, input.billingInterval),
    createdAtMs: Date.now(),
  };

  sessions.unshift(session);
  return session;
}

export function confirmSubscriptionCheckout(input: {
  checkoutId: string;
  region?: TaxRegion;
}): SubscriptionCheckoutResult {
  const session = sessions.find((s) => s.checkoutId === input.checkoutId);
  if (!session) throw new Error("Subscription checkout session not found");
  if (session.checkoutStatus !== "pending-payment") {
    throw new Error("Checkout is not in pending-payment state");
  }

  const receipt = buildSubscriptionReceiptPayload({
    subscriptionId: session.subscriptionId,
    accountType: session.accountType,
    tier: session.selectedTier,
    billingInterval: session.billingInterval,
    region: input.region,
  });

  const entitlement = resolveEntitlement(session.accountType, session.selectedTier);

  session.checkoutStatus = "paid";
  session.receiptId = receipt.receiptId;

  activeSubscriptions.set(session.userId, {
    tier: session.selectedTier,
    subscriptionId: session.subscriptionId,
    entitlement,
  });

  return { checkout: session, receipt, entitlement };
}

export function getActiveSubscription(userId: string) {
  return activeSubscriptions.get(userId) ?? null;
}

export function failSubscriptionCheckout(checkoutId: string): SubscriptionCheckoutSession {
  const session = sessions.find((s) => s.checkoutId === checkoutId);
  if (!session) throw new Error("Subscription checkout session not found");
  session.checkoutStatus = "failed";
  return session;
}

export function cancelSubscriptionCheckout(checkoutId: string): SubscriptionCheckoutSession {
  const session = sessions.find((s) => s.checkoutId === checkoutId);
  if (!session) throw new Error("Subscription checkout session not found");
  session.checkoutStatus = "cancelled";
  return session;
}

export function listSubscriptionCheckoutSessions(): SubscriptionCheckoutSession[] {
  return [...sessions];
}
