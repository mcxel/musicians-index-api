/**
 * TreasuryBalanceRule — Rule 23 net-positive guard (constants + pure checks).
 *
 * Never pay out more than collected for that event/tx.
 * Platform fee + treasury buffer are withheld before artist settle.
 * Investor/treasury allocation is a stub only — no fabricated dividend numbers.
 */

import {
  revenueFirstRewardsGovernor,
  type RewardGovernorDecision,
} from "@/lib/economy/RevenueFirstRewardsGovernor";

/** Basis points of net (post-tax) reserved as platform treasury buffer after fee split. */
export const TREASURY_BUFFER_BPS = 0;

/**
 * Absolute floor: artist settle cents must never exceed the artist share already
 * computed by RevenueSplitEngine for that cleared transaction.
 */
export const NEVER_PAY_MORE_THAN_COLLECTED = true as const;

export type ClearedFundsInput = {
  /** Gross collected from the payer (Stripe confirmed). */
  grossCollectedCents: number;
  /** Platform fee already withheld (tier ladder). */
  platformFeeCents: number;
  /** Artist/seller share after fee split. */
  artistShareCents: number;
  /** Optional tax portion already separated. */
  taxCents?: number;
};

export type TreasuryGuardResult = {
  allowed: boolean;
  maxArtistPayoutCents: number;
  reasons: string[];
  governor: RewardGovernorDecision;
};

/**
 * Max artist payout for a single cleared tx = artistShare only.
 * Never invents extra cash from treasury for creator commerce.
 */
export function maxArtistPayoutForClearedTx(input: ClearedFundsInput): number {
  const gross = Math.max(0, Math.floor(input.grossCollectedCents));
  const fee = Math.max(0, Math.floor(input.platformFeeCents));
  const artist = Math.max(0, Math.floor(input.artistShareCents));
  const tax = Math.max(0, Math.floor(input.taxCents ?? 0));

  // Identity: fee + artist + tax ≤ gross (rounding may leave unallocated pennies)
  const accounted = fee + artist + tax;
  if (accounted > gross) {
    return Math.max(0, gross - fee - tax);
  }
  return artist;
}

export function assertNetPositiveSettle(
  input: ClearedFundsInput,
  requestedPayoutCents: number,
): TreasuryGuardResult {
  const governor = revenueFirstRewardsGovernor.evaluate();
  const reasons: string[] = [];
  const maxArtistPayoutCents = maxArtistPayoutForClearedTx(input);
  const requested = Math.max(0, Math.floor(requestedPayoutCents));

  if (NEVER_PAY_MORE_THAN_COLLECTED && requested > maxArtistPayoutCents) {
    reasons.push("requested_payout_exceeds_cleared_artist_share");
  }
  if (input.grossCollectedCents <= 0) {
    reasons.push("no_cleared_gross_collected");
  }
  if (requested > input.grossCollectedCents) {
    reasons.push("requested_payout_exceeds_gross_collected");
  }

  // Platform must retain its fee — never settle artist using platform fee dollars
  const platformRetained = Math.max(0, Math.floor(input.platformFeeCents));
  if (requested + platformRetained > input.grossCollectedCents + Math.max(0, input.taxCents ?? 0)) {
    reasons.push("settle_would_consume_platform_fee_or_tax");
  }

  return {
    allowed: reasons.length === 0,
    maxArtistPayoutCents,
    reasons,
    governor,
  };
}

/**
 * Investor/treasury allocation stub — only reports real coffers/governor state.
 * Does not fabricate dividend yields or "$ tens of thousands" figures.
 */
export function treasuryAllocationStub(): {
  status: "stub";
  note: string;
  rewardPhase: RewardPhase;
  treasuryBufferBps: number;
} {
  const decision = revenueFirstRewardsGovernor.evaluate();
  return {
    status: "stub",
    note:
      "Treasury investor allocation is not active. Platform retains creator-commerce fee only; Big Ace = 0 on creator paths.",
    rewardPhase: decision.phase,
    treasuryBufferBps: TREASURY_BUFFER_BPS,
  };
}

type RewardPhase = RewardGovernorDecision["phase"];
