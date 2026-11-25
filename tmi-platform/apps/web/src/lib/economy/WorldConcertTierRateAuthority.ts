/**
 * WorldConcertTierRateAuthority — World Concert commission = performer membership tier rate.
 *
 * FINAL OWNER LAW: WORLD_CONCERT_TMI_CUT = TICKET_GMV × PERFORMER_TIER_RATE
 * Canonical ladder reused from RevenueSplitEngine.CREATOR_COMMERCE_PLATFORM_FEE_BPS
 * (FREE 20% → DIAMOND 8%). No second ladder. Not flat 18%.
 *
 * Seller controls face price — this module does not clamp min/max ticket dollars.
 */

import {
  CREATOR_COMMERCE_PLATFORM_FEE_BPS,
  normalizeCommerceTier,
  type CommerceMembershipTier,
} from "@/lib/commerce/RevenueSplitEngine";

export const WORLD_CONCERT_TIER_RATE_POLICY_ID = "tmi-world-concert-tier-rate-v1" as const;

/** Exact tier → rate mapping discovered in CREATOR_COMMERCE_PLATFORM_FEE_BPS. */
export const WORLD_CONCERT_TIER_RATE_BPS = CREATOR_COMMERCE_PLATFORM_FEE_BPS;

export type WorldConcertTierQuote = {
  policyId: typeof WORLD_CONCERT_TIER_RATE_POLICY_ID;
  performerTier: CommerceMembershipTier;
  platformRateBps: number;
  platformRatePercent: number;
  sellerKeepsPercent: number;
  fanPaysCents: number;
  tmiCutCents: number;
  performerSideCents: number;
};

export function resolveWorldConcertTierRateBps(tier?: string | null): number {
  return WORLD_CONCERT_TIER_RATE_BPS[normalizeCommerceTier(tier)];
}

export function resolveWorldConcertTierRatePercent(tier?: string | null): number {
  return resolveWorldConcertTierRateBps(tier) / 100;
}

/** Pure quote — face price is seller-controlled; no min/max clamp here. */
export function quoteWorldConcertTierCut(input: {
  fanPaysCents: number;
  performerTier?: string | null;
}): WorldConcertTierQuote {
  const fanPaysCents = Math.max(0, Math.round(input.fanPaysCents));
  const performerTier = normalizeCommerceTier(input.performerTier);
  const platformRateBps = WORLD_CONCERT_TIER_RATE_BPS[performerTier];
  const tmiCutCents = Math.floor((fanPaysCents * platformRateBps) / 10_000);
  return {
    policyId: WORLD_CONCERT_TIER_RATE_POLICY_ID,
    performerTier,
    platformRateBps,
    platformRatePercent: platformRateBps / 100,
    sellerKeepsPercent: (10_000 - platformRateBps) / 100,
    fanPaysCents,
    tmiCutCents,
    performerSideCents: fanPaysCents - tmiCutCents,
  };
}

export function listWorldConcertTierRateTable(): Array<{
  tier: CommerceMembershipTier;
  rateBps: number;
  ratePercent: number;
}> {
  return (Object.keys(WORLD_CONCERT_TIER_RATE_BPS) as CommerceMembershipTier[]).map((tier) => ({
    tier,
    rateBps: WORLD_CONCERT_TIER_RATE_BPS[tier],
    ratePercent: WORLD_CONCERT_TIER_RATE_BPS[tier] / 100,
  }));
}
