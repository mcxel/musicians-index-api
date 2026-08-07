/**
 * Fan points discount on performer items/music — everyone wins, nobody loses cash.
 *
 * Locked model:
 * 1. Performer lists at price P.
 * 2. Fan may redeem prepaid points (Wallet.fanCredits) up to a safe cap.
 * 3. Fan cash charge = P − discount (discount = points × face value, capped).
 * 4. Performer payout + platform fee are computed on full P (tier ladder).
 *    Discount is funded by burning prepaid points liability — not by cutting
 *    performer share or waiving platform fee on P.
 * 5. Cap: cash charge never below Stripe minimum; refuse/lower redeem if unsafe.
 */

import {
  calculateCreatorCommerceSplit,
  normalizeCommerceTier,
  type CommerceMembershipTier,
} from "@/lib/commerce/RevenueSplitEngine";

/** Face value: 100 pts ↔ $0.99 (starter pack parity). Integer: 99¢ / 100 pts. */
export const POINTS_FACE_VALUE_NUMERATOR_CENTS = 99;
export const POINTS_FACE_VALUE_DENOMINATOR_POINTS = 100;

/** Stripe Card minimum practical floor for Checkout line items. */
export const STRIPE_MIN_CHARGE_CENTS = 50;

export type PointsDiscountQuote = {
  ok: boolean;
  productPriceCents: number;
  sellerTier: CommerceMembershipTier;
  /** Platform fee on full P */
  platformFeeCents: number;
  /** Performer / seller share on full P */
  sellerShareCents: number;
  pointsRequested: number;
  pointsApplied: number;
  discountCents: number;
  cashChargeCents: number;
  maxRedeemablePoints: number;
  reason?: string;
  /** Honest UI copy */
  summary: string;
};

export function pointsToDiscountCents(points: number): number {
  const p = Math.max(0, Math.floor(points));
  return Math.floor((p * POINTS_FACE_VALUE_NUMERATOR_CENTS) / POINTS_FACE_VALUE_DENOMINATOR_POINTS);
}

export function discountCentsToPoints(discountCents: number): number {
  const d = Math.max(0, Math.floor(discountCents));
  // ceil so we never under-burn relative to cash reduction
  return Math.ceil((d * POINTS_FACE_VALUE_DENOMINATOR_POINTS) / POINTS_FACE_VALUE_NUMERATOR_CENTS);
}

/**
 * Max points that can safely redeem against P without cash falling below Stripe min
 * (or below 0 when P itself is under Stripe min — then no discount path).
 */
export function maxSafeRedeemablePoints(productPriceCents: number): number {
  const P = Math.max(0, Math.floor(productPriceCents));
  if (P <= 0) return 0;
  if (P <= STRIPE_MIN_CHARGE_CENTS) return 0;
  const maxDiscount = P - STRIPE_MIN_CHARGE_CENTS;
  return discountCentsToPoints(maxDiscount);
}

export function quotePointsDiscount(input: {
  productPriceCents: number;
  sellerTier?: string | null;
  pointsAvailable: number;
  pointsToRedeem?: number;
}): PointsDiscountQuote {
  const P = Math.max(0, Math.floor(input.productPriceCents));
  const tier = normalizeCommerceTier(input.sellerTier);
  const split = calculateCreatorCommerceSplit(P, 0, tier);
  const platformFeeCents = split.splits.platform.cents;
  const sellerShareCents = split.splits.artist.cents;

  const available = Math.max(0, Math.floor(input.pointsAvailable));
  const maxSafe = maxSafeRedeemablePoints(P);
  const maxRedeemablePoints = Math.min(available, maxSafe);

  const requested = Math.max(0, Math.floor(input.pointsToRedeem ?? 0));
  if (requested <= 0) {
    return {
      ok: true,
      productPriceCents: P,
      sellerTier: tier,
      platformFeeCents,
      sellerShareCents,
      pointsRequested: 0,
      pointsApplied: 0,
      discountCents: 0,
      cashChargeCents: P,
      maxRedeemablePoints,
      summary: `Pay $${(P / 100).toFixed(2)} cash · seller tier ${tier} fee on full price`,
    };
  }

  if (maxRedeemablePoints <= 0) {
    return {
      ok: false,
      productPriceCents: P,
      sellerTier: tier,
      platformFeeCents,
      sellerShareCents,
      pointsRequested: requested,
      pointsApplied: 0,
      discountCents: 0,
      cashChargeCents: P,
      maxRedeemablePoints: 0,
      reason: P <= STRIPE_MIN_CHARGE_CENTS
        ? "Price too low for points discount (Stripe minimum)"
        : "No redeemable points available",
      summary: "Points discount unavailable for this price — pay full cash.",
    };
  }

  const pointsApplied = Math.min(requested, maxRedeemablePoints);
  let discountCents = pointsToDiscountCents(pointsApplied);
  // Never exceed P − Stripe min
  const maxDiscount = Math.max(0, P - STRIPE_MIN_CHARGE_CENTS);
  if (discountCents > maxDiscount) {
    discountCents = maxDiscount;
  }
  const cashChargeCents = P - discountCents;

  // Final safety: cash must cover Stripe min; settlement on P still funded by points liability
  if (cashChargeCents < STRIPE_MIN_CHARGE_CENTS) {
    return {
      ok: false,
      productPriceCents: P,
      sellerTier: tier,
      platformFeeCents,
      sellerShareCents,
      pointsRequested: requested,
      pointsApplied: 0,
      discountCents: 0,
      cashChargeCents: P,
      maxRedeemablePoints,
      reason: "Discount would drop cash below Stripe minimum — lower points redeem",
      summary: `Max safe redeem: ${maxRedeemablePoints} pts`,
    };
  }

  const lowered = pointsApplied < requested;
  return {
    ok: true,
    productPriceCents: P,
    sellerTier: tier,
    platformFeeCents,
    sellerShareCents,
    pointsRequested: requested,
    pointsApplied,
    discountCents,
    cashChargeCents,
    maxRedeemablePoints,
    reason: lowered ? `Redeem capped at ${pointsApplied} pts (safe max ${maxRedeemablePoints})` : undefined,
    summary: `Cash $${(cashChargeCents / 100).toFixed(2)} + ${pointsApplied} pts (−$${(discountCents / 100).toFixed(2)}) · performer + platform settled on full $${(P / 100).toFixed(2)} (${tier})`,
  };
}
