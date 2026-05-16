/**
 * RevenueLedgerEngine
 * Central financial truth layer for platform revenue.
 */

import type { RevenueSourceType, RevenueSplit } from "./RevenueSplitEngine";

export type RevenueLedgerEntry = {
  ledgerEntryId: string;
  revenueSource: RevenueSourceType;
  customerId: string;
  sellerId: string;
  sellerType?: string;
  productId: string;
  orderId?: string;
  checkoutId?: string;
  grossCents: number;
  subtotalCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
  split: RevenueSplit;
  status: "recorded" | "refunded" | "reversed";
  createdAtMs: number;
};

const ledgerEntries: RevenueLedgerEntry[] = [];
let ledgerCounter = 0;

export function recordRevenueLedgerEntry(input: {
  revenueSource: RevenueSourceType;
  customerId: string;
  sellerId: string;
  sellerType?: string;
  productId: string;
  grossCents: number;
  subtotalCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
  split: RevenueSplit;
  orderId?: string;
  checkoutId?: string;
}): RevenueLedgerEntry {
  const existing = ledgerEntries.find((entry) => {
    if (input.checkoutId && entry.checkoutId === input.checkoutId) return true;
    if (input.orderId && entry.orderId === input.orderId) return true;
    return false;
  });

  if (existing) {
    return existing;
  }

  const entry: RevenueLedgerEntry = {
    ledgerEntryId: `rev-ledger-${++ledgerCounter}`,
    revenueSource: input.revenueSource,
    customerId: input.customerId,
    sellerId: input.sellerId,
    sellerType: input.sellerType,
    productId: input.productId,
    orderId: input.orderId,
    checkoutId: input.checkoutId,
    grossCents: input.grossCents,
    subtotalCents: input.subtotalCents,
    platformFeeCents: input.platformFeeCents,
    taxCents: input.taxCents,
    totalCents: input.totalCents,
    split: input.split,
    status: "recorded",
    createdAtMs: Date.now(),
  };

  ledgerEntries.unshift(entry);
  return entry;
}

export function markRevenueLedgerEntryRefunded(ledgerEntryId: string): RevenueLedgerEntry {
  const entry = ledgerEntries.find((item) => item.ledgerEntryId === ledgerEntryId);
  if (!entry) throw new Error(`Ledger entry ${ledgerEntryId} not found`);
  entry.status = "refunded";
  return entry;
}

export function markRevenueLedgerEntryReversed(ledgerEntryId: string): RevenueLedgerEntry {
  const entry = ledgerEntries.find((item) => item.ledgerEntryId === ledgerEntryId);
  if (!entry) throw new Error(`Ledger entry ${ledgerEntryId} not found`);
  entry.status = "reversed";
  return entry;
}

export function listRevenueLedgerEntries(filters?: {
  revenueSource?: RevenueSourceType;
  sellerId?: string;
  customerId?: string;
  status?: RevenueLedgerEntry["status"];
}): RevenueLedgerEntry[] {
  return ledgerEntries.filter((entry) => {
    if (filters?.revenueSource && entry.revenueSource !== filters.revenueSource) return false;
    if (filters?.sellerId && entry.sellerId !== filters.sellerId) return false;
    if (filters?.customerId && entry.customerId !== filters.customerId) return false;
    if (filters?.status && entry.status !== filters.status) return false;
    return true;
  });
}

export function getRevenueBySource(revenueSource: RevenueSourceType): {
  revenueSource: RevenueSourceType;
  grossCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
  entryCount: number;
} {
  const entries = listRevenueLedgerEntries({ revenueSource, status: "recorded" });
  return {
    revenueSource,
    grossCents: entries.reduce((sum, entry) => sum + entry.grossCents, 0),
    platformFeeCents: entries.reduce((sum, entry) => sum + entry.platformFeeCents, 0),
    taxCents: entries.reduce((sum, entry) => sum + entry.taxCents, 0),
    totalCents: entries.reduce((sum, entry) => sum + entry.totalCents, 0),
    entryCount: entries.length,
  };
}

export function getRevenueBySeller(sellerId: string): {
  sellerId: string;
  grossCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
  entryCount: number;
} {
  const entries = listRevenueLedgerEntries({ sellerId, status: "recorded" });
  return {
    sellerId,
    grossCents: entries.reduce((sum, entry) => sum + entry.grossCents, 0),
    platformFeeCents: entries.reduce((sum, entry) => sum + entry.platformFeeCents, 0),
    taxCents: entries.reduce((sum, entry) => sum + entry.taxCents, 0),
    totalCents: entries.reduce((sum, entry) => sum + entry.totalCents, 0),
    entryCount: entries.length,
  };
}

export function getRevenueLedgerEntryByCheckoutId(checkoutId: string): RevenueLedgerEntry | null {
  return ledgerEntries.find((entry) => entry.checkoutId === checkoutId) ?? null;
}

export function summarizeLedgerTotals(): {
  grossCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
} {
  return ledgerEntries.reduce(
    (acc, entry) => {
      if (entry.status !== "recorded") return acc;
      acc.grossCents += entry.grossCents;
      acc.platformFeeCents += entry.platformFeeCents;
      acc.taxCents += entry.taxCents;
      acc.totalCents += entry.totalCents;
      return acc;
    },
    { grossCents: 0, platformFeeCents: 0, taxCents: 0, totalCents: 0 }
  );
}
