/**
 * BookingCommissionPolicy — owner-locked flat 18% TMI platform cut (all tiers).
 * Consumes PlatformCutAuthority — no invented per-tier discounts in this pass.
 */

import {
  TMI_PLATFORM_CUT_PERCENT,
  PLATFORM_CUT_POLICY_ID,
  quoteBookingCut,
} from "@/lib/economy/PlatformCutAuthority";

export type MembershipTier =
  | "FREE"
  | "PRO"
  | "RUBY"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export interface BookingCommissionPolicyConfig {
  policyId: string;
  /** Flat 18% — owner-resolved; no longer PRODUCT_POLICY_REQUIRED. */
  percentByTier: Record<MembershipTier, number>;
  freeRemainsEligible: true;
  diamondMostFavorable: true;
  platformCutPolicyId: typeof PLATFORM_CUT_POLICY_ID;
}

const FLAT_18 = TMI_PLATFORM_CUT_PERCENT;

export const BOOKING_COMMISSION_POLICY: BookingCommissionPolicyConfig = {
  policyId: "tmi-booking-commission-v1-18",
  percentByTier: {
    FREE: FLAT_18,
    PRO: FLAT_18,
    RUBY: FLAT_18,
    SILVER: FLAT_18,
    GOLD: FLAT_18,
    PLATINUM: FLAT_18,
    DIAMOND: FLAT_18,
  },
  freeRemainsEligible: true,
  diamondMostFavorable: true,
  platformCutPolicyId: PLATFORM_CUT_POLICY_ID,
};

export type CommissionResolveResult =
  | { ok: true; percent: number; tier: MembershipTier }
  | { ok: false; reason: "PRODUCT_POLICY_REQUIRED"; tier: MembershipTier };

export function resolveBookingCommissionPercent(tier: MembershipTier): CommissionResolveResult {
  const percent = BOOKING_COMMISSION_POLICY.percentByTier[tier];
  return { ok: true, percent, tier };
}

export function isBookingEligibleForTier(_tier: MembershipTier): boolean {
  return BOOKING_COMMISSION_POLICY.freeRemainsEligible;
}

/** Cents helper — always uses canonical PlatformCutAuthority. */
export function quoteBookingCommissionCents(bookingGmvCents: number) {
  return quoteBookingCut(bookingGmvCents);
}
