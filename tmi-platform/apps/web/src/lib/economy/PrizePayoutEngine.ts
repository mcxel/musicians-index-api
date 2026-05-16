/**
 * PrizePayoutEngine
 * Manages prize distribution for shows, battles, and contests.
 */

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
}

const DEFAULT_PRIZE_STRUCTURE: PrizeTier[] = [
  { place: 1, label: "Champion",   cashUsd: 1000, tmicoin: 10000, additionalPrizes: ["Crown badge", "Magazine feature", "Recording session"] },
  { place: 2, label: "Runner-up",  cashUsd: 500,  tmicoin: 5000,  additionalPrizes: ["Silver badge", "Magazine mention"] },
  { place: 3, label: "Third",      cashUsd: 250,  tmicoin: 2500,  additionalPrizes: ["Bronze badge"] },
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
  ): PayoutRecord | null {
    const tiers = this.getStructure(showId);
    const tier = tiers.find((t) => t.place === place);
    if (!tier) return null;

    const record: PayoutRecord = {
      id: Math.random().toString(36).slice(2),
      showId,
      userId,
      displayName,
      place,
      prizeTier: tier,
      method,
      cashAmountCents: tier.cashUsd * 100,
      tmicoinAmount: tier.tmicoin,
      status: "pending",
      initiatedAt: Date.now(),
    };

    this._payouts.set(record.id, record);
    this._emit(record);
    return record;
  }

  processPayouts(showId: string, results: { userId: string; displayName: string; place: number }[]): PayoutRecord[] {
    const records: PayoutRecord[] = [];
    for (const result of results) {
      const record = this.initiatePayout(showId, result.userId, result.displayName, result.place);
      if (record) records.push(record);
    }
    return records;
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
