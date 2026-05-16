/**
 * SubscriptionRoutingEngine
 * All route paths for subscription lifecycle.
 */

import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import type { BillingInterval } from "./SubscriptionPlanEngine";

export type SubscriptionRoutes = {
  planRoute: string;
  checkoutRoute: string;
  manageRoute: string;
  upgradeRoute: string;
};

export function buildSubscriptionRoutes(args: {
  accountType: AccountType;
  tier: SubscriptionTier;
  billingInterval?: BillingInterval;
  currentSubscriptionId?: string;
}): SubscriptionRoutes {
  const interval = args.billingInterval ?? "monthly";
  const base = `/subscriptions/${args.accountType}`;

  return {
    planRoute: `${base}/plans/${args.tier}`,
    checkoutRoute: `${base}/checkout?tier=${args.tier}&interval=${interval}`,
    manageRoute: args.currentSubscriptionId
      ? `${base}/manage/${args.currentSubscriptionId}`
      : `${base}/manage`,
    upgradeRoute: `${base}/upgrade?from=${args.tier}`,
  };
}

export function buildUpgradeRoute(accountType: AccountType, fromTier: SubscriptionTier): string {
  return `/subscriptions/${accountType}/upgrade?from=${fromTier}`;
}
