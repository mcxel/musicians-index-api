/**
 * TMI Creator Economy — fee notes.
 *
 * Creator commerce (beats, tips, NFT primary, merch/store, shoutouts, etc.):
 * Use RevenueSplitEngine creatorCommerceSplitConfig(sellerTier).
 * Ladder: FREE 20% · PRO 18% · RUBY 16% · SILVER 14% · GOLD 12% · PLATINUM 10% · DIAMOND 8%.
 * Seller keeps the rest. Big Ace = 0 on creator commerce.
 *
 * Distinct from:
 * - Tickets: Venue/Promoter authority (Rule 17)
 * - Subscriptions / ads / sponsor placements: non-creator presets
 * - Commerce Connector service fee (external storefront deep-link): 5% below
 */

import {
  CREATOR_COMMERCE_PLATFORM_FEE_BPS,
  normalizeCommerceTier,
  type CommerceMembershipTier,
} from "@/lib/commerce/RevenueSplitEngine";

/** Basis points: 500 = 5.00% TMI commerce service fee on connector path. */
export const TMI_COMMERCE_SERVICE_FEE_BPS = 500;

export function commerceServiceFeePercent(): number {
  return TMI_COMMERCE_SERVICE_FEE_BPS / 100;
}

export function formatCommerceServiceFeeLabel(): string {
  const pct = TMI_COMMERCE_SERVICE_FEE_BPS / 100;
  return `${pct}% TMI service fee`;
}

/** Fee cents from a gross sale in cents (floor). */
export function computeCommerceServiceFeeCents(grossCents: number): number {
  if (grossCents <= 0) return 0;
  return Math.floor((grossCents * TMI_COMMERCE_SERVICE_FEE_BPS) / 10_000);
}

export function creatorPlatformFeePercent(tier?: string | null): number {
  const t = normalizeCommerceTier(tier);
  return CREATOR_COMMERCE_PLATFORM_FEE_BPS[t] / 100;
}

export function creatorPlatformFeeBps(tier?: string | null): number {
  return CREATOR_COMMERCE_PLATFORM_FEE_BPS[normalizeCommerceTier(tier)];
}

export type { CommerceMembershipTier };
