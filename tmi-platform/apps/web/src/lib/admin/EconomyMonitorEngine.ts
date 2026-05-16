/**
 * EconomyMonitorEngine
 * Live revenue, payout, and economy health monitoring for admin dashboard.
 */

export type TransactionType =
  | "subscription"
  | "ticket-sale"
  | "tip"
  | "sponsor"
  | "advertiser"
  | "beat-sale"
  | "merch"
  | "prize-payout"
  | "refund"
  | "tmicoin-purchase"
  | "entry-fee";

export interface EconomyTransaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  userId: string;
  recipientId?: string;
  metadata?: Record<string, string>;
  timestamp: number;
  isRefund: boolean;
}

export interface RevenueStream {
  type: TransactionType;
  totalCents: number;
  transactionCount: number;
  last24hCents: number;
  last7dCents: number;
}

export interface EconomySnapshot {
  timestamp: string;
  totalRevenueCents: number;
  totalPayoutsCents: number;
  netRevenueCents: number;
  last24hRevenueCents: number;
  last7dRevenueCents: number;
  activeSubscriptions: number;
  streams: RevenueStream[];
  recentTransactions: EconomyTransaction[];
  topEarners: { userId: string; amountCents: number }[];
  flaggedTransactions: EconomyTransaction[];
}

export class EconomyMonitorEngine {
  private static _instance: EconomyMonitorEngine | null = null;

  private _transactions: EconomyTransaction[] = [];
  private _subscriptionCount: number = 0;
  private _listeners: Set<(snapshot: EconomySnapshot) => void> = new Set();

  static getInstance(): EconomyMonitorEngine {
    if (!EconomyMonitorEngine._instance) {
      EconomyMonitorEngine._instance = new EconomyMonitorEngine();
    }
    return EconomyMonitorEngine._instance;
  }

  // ── Recording ─────────────────────────────────────────────────────────────

  recordTransaction(tx: Omit<EconomyTransaction, "id" | "timestamp">): EconomyTransaction {
    const full: EconomyTransaction = {
      ...tx,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    this._transactions.push(full);
    if (this._transactions.length > 10_000) this._transactions.shift();
    this._emit();
    return full;
  }

  recordRevenue(type: TransactionType, amountCents: number, userId: string, metadata?: Record<string, string>): void {
    this.recordTransaction({ type, amountCents, userId, isRefund: false, metadata });
  }

  recordPayout(amountCents: number, recipientId: string, type: TransactionType = "prize-payout"): void {
    this.recordTransaction({ type, amountCents, userId: "platform", recipientId, isRefund: false });
  }

  recordRefund(amountCents: number, userId: string, type: TransactionType = "ticket-sale"): void {
    this.recordTransaction({ type, amountCents: -amountCents, userId, isRefund: true });
  }

  setSubscriptionCount(count: number): void {
    this._subscriptionCount = count;
    this._emit();
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────

  getSnapshot(): EconomySnapshot {
    const now = Date.now();
    const d24 = now - 86_400_000;
    const d7  = now - 7 * 86_400_000;

    const revenue = this._transactions.filter((t) => !t.isRefund && t.amountCents > 0);
    const payouts = this._transactions.filter((t) => t.type === "prize-payout" || t.type === "refund" || t.amountCents < 0);

    const totalRevenueCents = revenue.reduce((s, t) => s + t.amountCents, 0);
    const totalPayoutsCents = payouts.reduce((s, t) => s + Math.abs(t.amountCents), 0);
    const last24hRevenueCents = revenue.filter((t) => t.timestamp >= d24).reduce((s, t) => s + t.amountCents, 0);
    const last7dRevenueCents = revenue.filter((t) => t.timestamp >= d7).reduce((s, t) => s + t.amountCents, 0);

    const types: TransactionType[] = [
      "subscription", "ticket-sale", "tip", "sponsor", "advertiser",
      "beat-sale", "merch", "prize-payout", "refund", "tmicoin-purchase", "entry-fee",
    ];

    const streams: RevenueStream[] = types.map((type) => {
      const typeTxs = this._transactions.filter((t) => t.type === type);
      return {
        type,
        totalCents: typeTxs.reduce((s, t) => s + t.amountCents, 0),
        transactionCount: typeTxs.length,
        last24hCents: typeTxs.filter((t) => t.timestamp >= d24).reduce((s, t) => s + t.amountCents, 0),
        last7dCents: typeTxs.filter((t) => t.timestamp >= d7).reduce((s, t) => s + t.amountCents, 0),
      };
    });

    // Top earners
    const earnerMap = new Map<string, number>();
    for (const t of revenue) {
      if (t.recipientId) earnerMap.set(t.recipientId, (earnerMap.get(t.recipientId) ?? 0) + t.amountCents);
    }
    const topEarners = [...earnerMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, amountCents]) => ({ userId, amountCents }));

    // Flagged: suspiciously large single transactions
    const flaggedTransactions = this._transactions.filter((t) => t.amountCents > 50_000_00);

    return {
      timestamp: new Date().toISOString(),
      totalRevenueCents,
      totalPayoutsCents,
      netRevenueCents: totalRevenueCents - totalPayoutsCents,
      last24hRevenueCents,
      last7dRevenueCents,
      activeSubscriptions: this._subscriptionCount,
      streams,
      recentTransactions: this._transactions.slice(-50),
      topEarners,
      flaggedTransactions,
    };
  }

  getTransactionsByUser(userId: string, limit = 50): EconomyTransaction[] {
    return this._transactions.filter((t) => t.userId === userId || t.recipientId === userId).slice(-limit);
  }

  getTotalRevenueCents(): number {
    return this._transactions.filter((t) => !t.isRefund && t.amountCents > 0).reduce((s, t) => s + t.amountCents, 0);
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onSnapshot(cb: (snapshot: EconomySnapshot) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(): void {
    const snap = this.getSnapshot();
    for (const cb of this._listeners) cb(snap);
  }
}

export const economyMonitorEngine = EconomyMonitorEngine.getInstance();
