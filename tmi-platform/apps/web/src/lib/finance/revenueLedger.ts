// lib/finance/revenueLedger.ts — TMI platform revenue ledger + split engine
// Aligns with RevenueSplitEngine / creatorCommerceSplitConfig FREE→DIAMOND ladder.
// Ticket path: Rule 17 — venue cut only, no artist inventory share.

import {
  calculateRevenueSplitByPreset,
  creatorCommerceSplitConfig,
  isCreatorCommercePreset,
  type CreatorCommercePreset,
} from "@/lib/commerce/RevenueSplitEngine";
import { REVENUE_SPLITS } from "@/lib/stripe/products";

export type TransactionType =
  | "subscription" | "tip" | "booking" | "ticket" | "beat_license"
  | "nft" | "sponsor" | "advertiser" | "artist_spotlight"
  | "fan_club" | "meet_greet" | "shoutout" | "refund" | "payout"
  | "merch" | "store";

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

const ledger: LedgerEntry[] = [];
let counter = 1;

function generateId(): string {
  return `TXN-${Date.now()}-${String(counter++).padStart(4, "0")}`;
}

/** Map ledger type → RevenueSplitEngine preset key */
function presetForType(type: TransactionType): string {
  switch (type) {
    case "beat_license":
      return "beat";
    case "artist_spotlight":
      return "ad";
    case "advertiser":
      return "ad";
    case "sponsor":
      return "ad";
    default:
      return type;
  }
}

function computeCuts(
  type: TransactionType,
  grossAmount: number,
  sellerTier?: string | null,
): { platformCut: number; creatorCut: number } {
  const preset = presetForType(type);

  if (isCreatorCommercePreset(preset)) {
    const cfg = creatorCommerceSplitConfig(sellerTier);
    const result = calculateRevenueSplitByPreset(
      preset as CreatorCommercePreset,
      grossAmount,
      0,
      sellerTier,
    );
    return {
      platformCut: result.splits.platform.cents,
      creatorCut: result.splits.artist.cents,
    };
  }

  if (preset === "ticket") {
    const result = calculateRevenueSplitByPreset("ticket", grossAmount, 0);
    // Rule 17: venue receives the seller cut; artist = 0
    return {
      platformCut: result.splits.platform.cents,
      creatorCut: result.splits.venue.cents,
    };
  }

  if (preset === "booking") {
    const result = calculateRevenueSplitByPreset("booking", grossAmount, 0);
    return {
      platformCut: result.splits.platform.cents + result.splits.big_ace.cents,
      creatorCut: result.splits.artist.cents + result.splits.venue.cents,
    };
  }

  if (preset === "subscription") {
    const result = calculateRevenueSplitByPreset("subscription", grossAmount, 0);
    return {
      platformCut: result.splits.platform.cents + result.splits.big_ace.cents,
      creatorCut: 0,
    };
  }

  // Fallback: REVENUE_SPLITS fractions (FREE-tier aligned)
  const split = REVENUE_SPLITS[type.toUpperCase() as keyof typeof REVENUE_SPLITS] ?? { platform: 1.0 };
  const platformCut = Math.round(grossAmount * (("platform" in split ? split.platform : 1)));
  return { platformCut, creatorCut: grossAmount - platformCut };
}

export function recordTransaction(
  type: TransactionType,
  grossAmount: number,
  userId: string,
  recipientId?: string,
  stripePaymentId?: string,
  metadata?: Record<string, string>,
): LedgerEntry {
  const sellerTier = metadata?.sellerTier ?? metadata?.tier ?? null;
  const { platformCut, creatorCut } = computeCuts(type, grossAmount, sellerTier);

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
  const end = periodEnd ?? Date.now();
  const entries = ledger.filter(
    (e) => e.createdAt >= start && e.createdAt <= end && e.status === "completed",
  );

  const byType = {} as Record<TransactionType, number>;
  let totalGross = 0;
  let totalPlatformRevenue = 0;
  let totalCreatorPayouts = 0;
  let pendingPayouts = 0;

  for (const e of ledger) {
    if (e.status === "pending") pendingPayouts += e.creatorCut;
  }

  for (const e of entries) {
    totalGross += e.grossAmount;
    totalPlatformRevenue += e.platformCut;
    totalCreatorPayouts += e.creatorCut;
    byType[e.type] = (byType[e.type] ?? 0) + e.grossAmount;
  }

  return {
    totalGross,
    totalPlatformRevenue,
    totalCreatorPayouts,
    pendingPayouts,
    byType,
    periodStart: start,
    periodEnd: end,
  };
}

export function getLedger(): LedgerEntry[] {
  return [...ledger];
}

/** @deprecated alias — prefer getLedger() */
export function getLedgerEntries(): LedgerEntry[] {
  return getLedger();
}

export function getRecentTransactions(limit = 50): LedgerEntry[] {
  return [...ledger].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
