/**
 * SubscriptionReceiptEngine
 * Generates receipt payloads for subscription purchases.
 * References tax logic from SubscriptionTaxEngine (repo-canonical).
 */

import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import type { TaxRegion } from "./SubscriptionTaxEngine";
import { calculateTax, getTaxRate } from "./SubscriptionTaxEngine";
import type { BillingInterval } from "./SubscriptionPlanEngine";
import { getSubscriptionPlan } from "./SubscriptionPlanEngine";

export type SubscriptionReceiptPayload = {
  receiptId: string;
  subscriptionId: string;
  accountType: AccountType;
  tier: SubscriptionTier;
  billingInterval: BillingInterval;
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  currency: "USD";
  renewalDateIso: string;
  issuedAtMs: number;
};

const PLATFORM_FEE_RATE = 0.03;

function nextRenewalDate(now: Date, interval: BillingInterval): string {
  const next = new Date(now);
  if (interval === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next.toISOString().slice(0, 10);
}

export function buildSubscriptionReceiptPayload(args: {
  subscriptionId: string;
  accountType: AccountType;
  tier: SubscriptionTier;
  billingInterval: BillingInterval;
  region?: TaxRegion;
}): SubscriptionReceiptPayload {
  const region: TaxRegion = args.region ?? "US_DEFAULT";
  const plan = getSubscriptionPlan(args.accountType, args.tier);
  const subtotalCents =
    args.billingInterval === "monthly" ? plan.monthlyPriceCents : plan.yearlyPriceCents;
  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(subtotalCents, taxRateBps);
  const platformFeeCents = Math.round(subtotalCents * PLATFORM_FEE_RATE);
  const totalCents = subtotalCents + taxCents + platformFeeCents;
  const now = new Date();

  return {
    receiptId: `sub-rcpt-${Date.now()}-${args.subscriptionId}`,
    subscriptionId: args.subscriptionId,
    accountType: args.accountType,
    tier: args.tier,
    billingInterval: args.billingInterval,
    subtotalCents,
    taxCents,
    platformFeeCents,
    totalCents,
    currency: "USD",
    renewalDateIso: nextRenewalDate(now, args.billingInterval),
    issuedAtMs: now.getTime(),
  };
}
