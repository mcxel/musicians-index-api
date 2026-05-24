// lib/finance/RefundRiskEngine.ts — Hold windows + chargeback risk scoring

import type { TransactionType } from "./revenueLedger";

// Hold window in ms before a creator payout is eligible
export const HOLD_WINDOWS_MS: Record<TransactionType, number> = {
  tip:             24 * 60 * 60 * 1000,    // 24 hours
  shoutout:        24 * 60 * 60 * 1000,    // 24 hours
  meet_greet:      48 * 60 * 60 * 1000,    // 48 hours
  beat_license:    72 * 60 * 60 * 1000,    // 72 hours
  nft:             72 * 60 * 60 * 1000,    // 72 hours
  fan_club:        7  * 24 * 60 * 60 * 1000, // 7 days (monthly sub)
  subscription:    7  * 24 * 60 * 60 * 1000, // 7 days
  ticket:          0,                       // after event + 24h (handled by scheduler)
  booking:         7  * 24 * 60 * 60 * 1000, // 7 days
  sponsor:         7  * 24 * 60 * 60 * 1000, // 7 days
  advertiser:      7  * 24 * 60 * 60 * 1000, // 7 days
  artist_spotlight: 72 * 60 * 60 * 1000,   // 72 hours
  refund:          0,
  payout:          0,
};

// Minimum payout threshold per creator type
export const PAYOUT_THRESHOLDS_CENTS: Record<string, number> = {
  performer: 1000,  // $10
  producer:  1000,  // $10
  venue:     5000,  // $50
  fan:       500,   // $5 (fan referral rewards)
  default:   1000,
};

export type HoldRecord = {
  transactionId: string;
  type: TransactionType;
  creatorCut: number;
  recipientId: string;
  heldAt: number;
  releaseAt: number;
  status: "held" | "released" | "disputed";
};

const holds: HoldRecord[] = [];

export function createHold(
  transactionId: string,
  type: TransactionType,
  creatorCut: number,
  recipientId: string
): HoldRecord {
  const windowMs = HOLD_WINDOWS_MS[type] ?? HOLD_WINDOWS_MS.tip;
  const hold: HoldRecord = {
    transactionId,
    type,
    creatorCut,
    recipientId,
    heldAt: Date.now(),
    releaseAt: Date.now() + windowMs,
    status: "held",
  };
  holds.push(hold);
  return hold;
}

export function getReleasableHolds(recipientId?: string): HoldRecord[] {
  const now = Date.now();
  return holds.filter(
    h => h.status === "held"
      && h.releaseAt <= now
      && (!recipientId || h.recipientId === recipientId)
  );
}

export function releaseHold(transactionId: string): boolean {
  const hold = holds.find(h => h.transactionId === transactionId);
  if (!hold || hold.status !== "held") return false;
  hold.status = "released";
  return true;
}

export function disputeHold(transactionId: string): boolean {
  const hold = holds.find(h => h.transactionId === transactionId);
  if (!hold) return false;
  hold.status = "disputed";
  return true;
}

export function meetsPayoutThreshold(amountCents: number, recipientType = "default"): boolean {
  const threshold = PAYOUT_THRESHOLDS_CENTS[recipientType] ?? PAYOUT_THRESHOLDS_CENTS.default;
  return amountCents >= threshold;
}

export function getHoldSummary(): { held: number; releasable: number; disputed: number } {
  const now = Date.now();
  return {
    held:       holds.filter(h => h.status === "held" && h.releaseAt > now).length,
    releasable: holds.filter(h => h.status === "held" && h.releaseAt <= now).length,
    disputed:   holds.filter(h => h.status === "disputed").length,
  };
}
