/**
 * EntryFeeIsolationEngine
 * Ensures contest entry fees never count as XP. Separates fee payments from XP economy.
 * Critical: paying to enter a contest cannot be a shortcut to XP gains.
 */

export type FeeType = "contest-entry" | "battle-entry" | "show-registration" | "cypher-slot" | "vip-queue";

export interface EntryFeeRecord {
  id: string;
  userId: string;
  feeType: FeeType;
  showId?: string;
  contestId?: string;
  amountCents: number;
  tmicoinCharged: number;
  xpAwarded: number;          // always 0 — enforced by this engine
  paidAt: number;
  refundEligibleUntil: number;
  isRefunded: boolean;
}

export interface XPTransaction {
  userId: string;
  xpAmount: number;
  source: string;
  sourceId?: string;
  timestamp: number;
}

export interface FeeIsolationReport {
  totalFeesCollectedCents: number;
  totalFeesCollectedTmicoins: number;
  totalXPFromFees: number; // should always be 0
  isClean: boolean;        // true when no XP leaked from fees
  violations: string[];
}

export class EntryFeeIsolationEngine {
  private static _instance: EntryFeeIsolationEngine | null = null;

  private _fees: Map<string, EntryFeeRecord> = new Map();
  private _xpLog: XPTransaction[] = [];
  private _feeSourceIds: Set<string> = new Set();

  static getInstance(): EntryFeeIsolationEngine {
    if (!EntryFeeIsolationEngine._instance) {
      EntryFeeIsolationEngine._instance = new EntryFeeIsolationEngine();
    }
    return EntryFeeIsolationEngine._instance;
  }

  // ── Fee recording ──────────────────────────────────────────────────────────

  recordFee(
    userId: string,
    feeType: FeeType,
    amountCents: number,
    tmicoinCharged: number,
    options: {
      showId?: string;
      contestId?: string;
      refundWindowMs?: number;
    } = {},
  ): EntryFeeRecord {
    const record: EntryFeeRecord = {
      id: Math.random().toString(36).slice(2),
      userId,
      feeType,
      showId: options.showId,
      contestId: options.contestId,
      amountCents,
      tmicoinCharged,
      xpAwarded: 0,          // hard zero — never award XP for paying entry fees
      paidAt: Date.now(),
      refundEligibleUntil: Date.now() + (options.refundWindowMs ?? 2 * 60 * 60 * 1000),
      isRefunded: false,
    };

    this._fees.set(record.id, record);
    this._feeSourceIds.add(record.id);
    return record;
  }

  // ── XP award (safe path) ──────────────────────────────────────────────────

  awardXP(userId: string, xpAmount: number, source: string, sourceId?: string): XPTransaction | null {
    // Block any XP award whose sourceId matches a fee record
    if (sourceId && this._feeSourceIds.has(sourceId)) {
      console.warn(`[EntryFeeIsolation] Blocked XP award from entry fee source: ${sourceId}`);
      return null;
    }

    // Block sources that smell like entry fees
    const blockedSources = ["entry-fee", "contest-entry", "battle-entry", "registration-fee", "show-fee"];
    if (blockedSources.some((b) => source.toLowerCase().includes(b))) {
      console.warn(`[EntryFeeIsolation] Blocked XP award from suspected fee source: ${source}`);
      return null;
    }

    const tx: XPTransaction = {
      userId,
      xpAmount,
      source,
      sourceId,
      timestamp: Date.now(),
    };
    this._xpLog.push(tx);
    return tx;
  }

  // ── Refund ────────────────────────────────────────────────────────────────

  refundFee(feeId: string): boolean {
    const fee = this._fees.get(feeId);
    if (!fee) return false;
    if (Date.now() > fee.refundEligibleUntil) return false;
    if (fee.isRefunded) return false;
    fee.isRefunded = true;
    return true;
  }

  // ── Audit ──────────────────────────────────────────────────────────────────

  generateReport(): FeeIsolationReport {
    const fees = [...this._fees.values()];
    const totalXPFromFees = fees.reduce((s, f) => s + f.xpAwarded, 0);
    const violations: string[] = [];

    if (totalXPFromFees > 0) {
      violations.push(`XP leak detected: ${totalXPFromFees} XP awarded from entry fees`);
    }

    for (const tx of this._xpLog) {
      if (tx.sourceId && this._feeSourceIds.has(tx.sourceId)) {
        violations.push(`XP transaction ${tx.sourceId} references a fee record`);
      }
    }

    return {
      totalFeesCollectedCents: fees.filter((f) => !f.isRefunded).reduce((s, f) => s + f.amountCents, 0),
      totalFeesCollectedTmicoins: fees.filter((f) => !f.isRefunded).reduce((s, f) => s + f.tmicoinCharged, 0),
      totalXPFromFees,
      isClean: violations.length === 0,
      violations,
    };
  }

  getFee(id: string): EntryFeeRecord | null {
    return this._fees.get(id) ?? null;
  }

  getFeesForUser(userId: string): EntryFeeRecord[] {
    return [...this._fees.values()].filter((f) => f.userId === userId);
  }

  getXPLogForUser(userId: string): XPTransaction[] {
    return this._xpLog.filter((t) => t.userId === userId);
  }
}

export const entryFeeIsolationEngine = EntryFeeIsolationEngine.getInstance();
