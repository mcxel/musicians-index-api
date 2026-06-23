/**
 * PrizePayoutEngine
 * Manages prize distribution for shows, battles, and contests.
 */

import { revenueFirstRewardsGovernor, type FinancialHealthSnapshot, type RewardGovernorDecision } from '@/lib/economy/RevenueFirstRewardsGovernor';

const MAX_PAYOUT_RATIO = 0.40; // Max 40% of revenue goes to prizes

/**
 * Validates the "Revenue Protection Rule": Never pay out more than a % of contest revenue.
 */
export const validatePayout = (revenue: number, proposedPrize: number) => {
  const allowed = revenue * MAX_PAYOUT_RATIO;
  if (proposedPrize > allowed) {
    throw new Error(`[TMI Engine] Payout exceeds revenue protection ratio. Max allowed: $${allowed}`);
  }
  return true;
};

export type PayoutMethod = "cash" | "tmicoin" | "store-credit" | "beat-pack" | "merch" | "recording-session" | "nft";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "on-hold";

export interface PrizeTier {
  place: number;
  label: string;
  cashUsd: number;
  tmicoin: number;
  additionalPrizes: string[];
}

export interface PayoutRecord {
  id: string;
  showId: string;
  userId: string;
  displayName: string;
  place: number;
  prizeTier: PrizeTier;
  method: PayoutMethod;
  cashAmountCents: number;
  tmicoinAmount: number;
  status: PayoutStatus;
  initiatedAt: number;
  completedAt?: number;
  failureReason?: string;
  transactionRef?: string;
  rewardPhase?: RewardGovernorDecision['phase'];
  governanceNotes?: string[];
}

export interface PayoutFundingContext {
  contestRevenueCents?: number;
  prizeAllocationRate?: number;
  snapshotOverride?: Partial<FinancialHealthSnapshot>;
}

const DEFAULT_PRIZE_STRUCTURE: PrizeTier[] = [
  { place: 1, label: "Champion",   cashUsd: 1000, tmicoin: 10000, additionalPrizes: ["Crown badge", "Magazine feature", "Recording session"] },
  { place: 2, label: "Runner-up",  cashUsd: 500,  tmicoin: 5000,  additionalPrizes: ["Silver badge", "Magazine mention"] },
  { place: 3, label: "Third",      cashUsd: 250,  tmicoin: 2500,  additionalPrizes: ["RUBY badge"] },
  { place: 4, label: "Semi",       cashUsd: 0,    tmicoin: 1000,  additionalPrizes: ["Participation badge"] },
  { place: 5, label: "Semi",       cashUsd: 0,    tmicoin: 1000,  additionalPrizes: ["Participation badge"] },
];

export class PrizePayoutEngine {
  private static _instance: PrizePayoutEngine | null = null;

  private _payouts: Map<string, PayoutRecord> = new Map();
  private _structures: Map<string, PrizeTier[]> = new Map();
  private _listeners: Set<(payout: PayoutRecord) => void> = new Set();

  static getInstance(): PrizePayoutEngine {
    if (!PrizePayoutEngine._instance) {
      PrizePayoutEngine._instance = new PrizePayoutEngine();
    }
    return PrizePayoutEngine._instance;
  }

  setPrizeStructure(showId: string, tiers: PrizeTier[]): void {
    this._structures.set(showId, tiers);
  }

  getStructure(showId: string): PrizeTier[] {
    return this._structures.get(showId) ?? DEFAULT_PRIZE_STRUCTURE;
  }

  initiatePayout(
    showId: string,
    userId: string,
    displayName: string,
    place: number,
    method: PayoutMethod = "cash",
    fundingContext?: PayoutFundingContext,
  ): PayoutRecord | null {
    const tiers = this.getStructure(showId);
    const tier = tiers.find((t) => t.place === place);
    if (!tier) return null;

    const governorDecision = revenueFirstRewardsGovernor.evaluate(fundingContext?.snapshotOverride);

    const governanceNotes: string[] = [];
    let effectiveMethod: PayoutMethod = method;
    let effectiveCashCents = tier.cashUsd * 100;
    let effectiveStatus: PayoutStatus = 'pending';
    let failureReason: string | undefined;

    if (!governorDecision.allowCashRewards && effectiveCashCents > 0) {
      effectiveMethod = governorDecision.allowPlatformCredits ? 'store-credit' : 'tmicoin';
      effectiveCashCents = 0;
      effectiveStatus = 'on-hold';
      failureReason = 'cash_rewards_locked_by_revenue_governor';
      governanceNotes.push(
        `cash reward converted to ${effectiveMethod} (${governorDecision.phase} phase)`
      );
    }

    if (
      effectiveCashCents > 0 &&
      typeof fundingContext?.contestRevenueCents === 'number'
    ) {
      const budget = revenueFirstRewardsGovernor.assessContestBudget({
        contestRevenueCents: fundingContext.contestRevenueCents,
        proposedPrizePoolCents: effectiveCashCents,
        allocationRate: fundingContext.prizeAllocationRate,
        snapshotOverride: fundingContext.snapshotOverride,
      });

      if (!budget.allowed) {
        effectiveMethod = governorDecision.allowPlatformCredits ? 'store-credit' : 'tmicoin';
        effectiveCashCents = 0;
        effectiveStatus = 'on-hold';
        failureReason = 'contest_budget_gate_rejected_cash_reward';
        governanceNotes.push(...budget.reasons);
      } else {
        validatePayout(budget.contestRevenueCents / 100, effectiveCashCents / 100);
      }
    }

    const record: PayoutRecord = {
      id: Math.random().toString(36).slice(2),
      showId,
      userId,
      displayName,
      place,
      prizeTier: tier,
      method: effectiveMethod,
      cashAmountCents: effectiveCashCents,
      tmicoinAmount: tier.tmicoin,
      status: effectiveStatus,
      initiatedAt: Date.now(),
      failureReason,
      rewardPhase: governorDecision.phase,
      governanceNotes,
    };

    this._payouts.set(record.id, record);
    this._emit(record);
    return record;
  }

  processPayouts(
    showId: string,
    results: { userId: string; displayName: string; place: number }[],
    method: PayoutMethod = 'cash',
    fundingContext?: PayoutFundingContext,
  ): PayoutRecord[] {
    const records: PayoutRecord[] = [];
    for (const result of results) {
      const record = this.initiatePayout(
        showId,
        result.userId,
        result.displayName,
        result.place,
        method,
        fundingContext,
      );
      if (record) records.push(record);
    }
    return records;
  }

  setFinancialSnapshot(snapshot: Partial<FinancialHealthSnapshot>): FinancialHealthSnapshot {
    return revenueFirstRewardsGovernor.setFinancialSnapshot(snapshot);
  }

  getRewardGovernorStatus(snapshotOverride?: Partial<FinancialHealthSnapshot>): RewardGovernorDecision {
    return revenueFirstRewardsGovernor.evaluate(snapshotOverride);
  }

  markPaid(payoutId: string, transactionRef: string): PayoutRecord | null {
    const payout = this._payouts.get(payoutId);
    if (!payout || payout.status !== "pending") return null;
    payout.status = "paid";
    payout.completedAt = Date.now();
    payout.transactionRef = transactionRef;
    this._emit(payout);
    return payout;
  }

  markFailed(payoutId: string, reason: string): PayoutRecord | null {
    const payout = this._payouts.get(payoutId);
    if (!payout) return null;
    payout.status = "failed";
    payout.failureReason = reason;
    payout.completedAt = Date.now();
    this._emit(payout);
    return payout;
  }

  getPayout(id: string): PayoutRecord | null {
    return this._payouts.get(id) ?? null;
  }

  getPayoutsForShow(showId: string): PayoutRecord[] {
    return [...this._payouts.values()].filter((p) => p.showId === showId);
  }

  getPayoutsForUser(userId: string): PayoutRecord[] {
    return [...this._payouts.values()].filter((p) => p.userId === userId);
  }

  getPendingPayouts(): PayoutRecord[] {
    return [...this._payouts.values()].filter((p) => p.status === "pending");
  }

  getTotalPaidCents(): number {
    return [...this._payouts.values()]
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.cashAmountCents, 0);
  }

  onPayout(cb: (payout: PayoutRecord) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(payout: PayoutRecord): void {
    for (const cb of this._listeners) cb(payout);
  }
}

export const prizePayoutEngine = PrizePayoutEngine.getInstance();
