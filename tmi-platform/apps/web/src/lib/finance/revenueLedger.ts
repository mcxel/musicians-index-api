// lib/finance/revenueLedger.ts — TMI platform revenue ledger + split engine

import { REVENUE_SPLITS } from "@/lib/stripe/products";

export type TransactionType =
  | "subscription" | "tip" | "booking" | "ticket" | "beat_license"
  | "nft" | "sponsor" | "advertiser" | "artist_spotlight"
  | "fan_club" | "meet_greet" | "shoutout" | "refund" | "payout";

export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

export type LedgerEntry = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  grossAmount: number;       // in cents
  platformCut: number;       // in cents
  creatorCut: number;        // in cents
  stripePaymentId?: string;
  userId: string;            // payer
  recipientId?: string;      // creator/artist/venue receiving cut
  metadata?: Record<string, string>;
  createdAt: number;
  settledAt?: number;
};

export type RevenueSnapshot = {
  totalGross: number;
  totalPlatformRevenue: number;
  totalCreatorPayouts: number;
  pendingPayouts: number;
  byType: Record<TransactionType, number>;
  periodStart: number;
  periodEnd: number;
};

// In-memory ledger (replace with DB persistence in production)
const ledger: LedgerEntry[] = [];
let counter = 1;

function generateId(): string {
  return `TXN-${Date.now()}-${String(counter++).padStart(4, "0")}`;
}

export function recordTransaction(
  type: TransactionType,
  grossAmount: number,
  userId: string,
  recipientId?: string,
  stripePaymentId?: string,
  metadata?: Record<string, string>
): LedgerEntry {
  const split = REVENUE_SPLITS[type.toUpperCase() as keyof typeof REVENUE_SPLITS] ?? { platform: 1.0 };
  const platformCut = Math.round(grossAmount * (("platform" in split ? split.platform : 1)));
  const creatorCut  = grossAmount - platformCut;

  const entry: LedgerEntry = {
    id: generateId(),
    type,
    status: "pending",
    grossAmount,
    platformCut,
    creatorCut,
    stripePaymentId,
    userId,
    recipientId,
    metadata,
    createdAt: Date.now(),
  };

  ledger.push(entry);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:transaction", { detail: entry }));
  }

  return entry;
}

export function settleTransaction(id: string): boolean {
  const entry = ledger.find((e) => e.id === id);
  if (!entry) return false;
  entry.status = "completed";
  entry.settledAt = Date.now();
  return true;
}

export function failTransaction(id: string): boolean {
  const entry = ledger.find((e) => e.id === id);
  if (!entry) return false;
  entry.status = "failed";
  return true;
}

export function refundTransaction(id: string): boolean {
  const entry = ledger.find((e) => e.id === id);
  if (!entry || entry.status !== "completed") return false;
  entry.status = "refunded";
  // Create reverse entry
  ledger.push({
    ...entry,
    id: generateId(),
    type: "refund",
    grossAmount: -entry.grossAmount,
    platformCut: -entry.platformCut,
    creatorCut: -entry.creatorCut,
    status: "completed",
    createdAt: Date.now(),
    settledAt: Date.now(),
  });
  return true;
}

export function getRevenueSnapshot(periodStart?: number, periodEnd?: number): RevenueSnapshot {
  const start = periodStart ?? 0;
  const end   = periodEnd   ?? Date.now();
  const entries = ledger.filter(
    (e) => e.createdAt >= start && e.createdAt <= end && e.status === "completed"
  );

  const byType = {} as Record<TransactionType, number>;
  let totalGross = 0;
  let totalPlatformRevenue = 0;
  let totalCreatorPayouts = 0;

  for (const e of entries) {
    byType[e.type] = (byType[e.type] ?? 0) + e.grossAmount;
    totalGross += e.grossAmount;
    totalPlatformRevenue += e.platformCut;
    totalCreatorPayouts  += e.creatorCut;
  }

  const pending = ledger
    .filter((e) => e.status === "pending" && e.creatorCut > 0)
    .reduce((sum, e) => sum + e.creatorCut, 0);

  return { totalGross, totalPlatformRevenue, totalCreatorPayouts, pendingPayouts: pending, byType, periodStart: start, periodEnd: end };
}

export function getLedger(): LedgerEntry[] {
  return [...ledger];
}

export function getRecentTransactions(limit = 50): LedgerEntry[] {
  return [...ledger].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
