/**
 * PayoutEngine
 * Payout scheduling and execution for artists, venues, merchants, promoters, and bookings.
 */

import { listRevenueLedgerEntries, type RevenueLedgerEntry } from "./RevenueLedgerEngine";

export type PayoutRecipientType = "artist" | "venue" | "merchant" | "promoter" | "booking";
export type PayoutStatus = "pending" | "available" | "paid" | "failed" | "rolled-back";

export type PayoutRecord = {
  payoutId: string;
  recipientId: string;
  recipientType: PayoutRecipientType;
  amountCents: number;
  sourceLedgerIds: string[];
  status: PayoutStatus;
  createdAtMs: number;
  paidAtMs?: number;
};

const payouts: PayoutRecord[] = [];
let payoutCounter = 0;

export function createPayout(input: {
  recipientId: string;
  recipientType: PayoutRecipientType;
  amountCents: number;
  sourceLedgerIds: string[];
}): PayoutRecord {
  const payout: PayoutRecord = {
    payoutId: `payout-${++payoutCounter}`,
    recipientId: input.recipientId,
    recipientType: input.recipientType,
    amountCents: input.amountCents,
    sourceLedgerIds: input.sourceLedgerIds,
    status: "pending",
    createdAtMs: Date.now(),
  };

  payouts.unshift(payout);
  return payout;
}

export function markPayoutAvailable(payoutId: string): PayoutRecord {
  const payout = payouts.find((item) => item.payoutId === payoutId);
  if (!payout) throw new Error(`Payout ${payoutId} not found`);
  payout.status = "available";
  return payout;
}

export function markPayoutPaid(payoutId: string): PayoutRecord {
  const payout = payouts.find((item) => item.payoutId === payoutId);
  if (!payout) throw new Error(`Payout ${payoutId} not found`);
  payout.status = "paid";
  payout.paidAtMs = Date.now();
  return payout;
}

export function markPayoutFailed(payoutId: string): PayoutRecord {
  const payout = payouts.find((item) => item.payoutId === payoutId);
  if (!payout) throw new Error(`Payout ${payoutId} not found`);
  payout.status = "failed";
  return payout;
}

export function rollbackPayout(payoutId: string): PayoutRecord {
  const payout = payouts.find((item) => item.payoutId === payoutId);
  if (!payout) throw new Error(`Payout ${payoutId} not found`);
  payout.status = "rolled-back";
  return payout;
}

export function createPayoutFromLedgerEntry(input: {
  ledgerEntry: RevenueLedgerEntry;
  recipientId: string;
  recipientType: PayoutRecipientType;
}): PayoutRecord | null {
  const existing = payouts.find((payout) =>
    payout.recipientId === input.recipientId && payout.sourceLedgerIds.includes(input.ledgerEntry.ledgerEntryId)
  );
  if (existing) {
    return existing;
  }

  const amountCents = resolveRecipientAmount(input.ledgerEntry, input.recipientType);
  if (amountCents <= 0) {
    return null;
  }

  return createPayout({
    recipientId: input.recipientId,
    recipientType: input.recipientType,
    amountCents,
    sourceLedgerIds: [input.ledgerEntry.ledgerEntryId],
  });
}

export function getPayoutsByLedgerEntryId(ledgerEntryId: string): PayoutRecord[] {
  return payouts.filter((payout) => payout.sourceLedgerIds.includes(ledgerEntryId));
}

export function listPayouts(recipientId?: string): PayoutRecord[] {
  if (!recipientId) return [...payouts];
  return payouts.filter((payout) => payout.recipientId === recipientId);
}

export function buildPayoutCandidatesForRecipient(input: {
  recipientId: string;
  recipientType: PayoutRecipientType;
}): {
  sourceLedgerIds: string[];
  amountCents: number;
} {
  const entries = listRevenueLedgerEntries({ sellerId: input.recipientId, status: "recorded" });

  const amountCents = entries.reduce((sum, entry) => {
    switch (input.recipientType) {
      case "artist":
        return sum + entry.split.artistCents;
      case "venue":
        return sum + entry.split.venueCents;
      case "merchant":
        return sum + entry.split.merchantCents;
      case "promoter":
        return sum + entry.split.promoterCents;
      case "booking":
        return sum + entry.split.artistCents + entry.split.venueCents;
      default:
        return sum;
    }
  }, 0);

  return {
    sourceLedgerIds: entries.map((entry) => entry.ledgerEntryId),
    amountCents,
  };
}

function resolveRecipientAmount(
  ledgerEntry: RevenueLedgerEntry,
  recipientType: PayoutRecipientType
): number {
  switch (recipientType) {
    case "artist":
      return ledgerEntry.split.artistCents;
    case "venue":
      return ledgerEntry.split.venueCents;
    case "merchant":
      return ledgerEntry.split.merchantCents;
    case "promoter":
      return ledgerEntry.split.promoterCents;
    case "booking":
      return ledgerEntry.split.artistCents + ledgerEntry.split.venueCents;
    default:
      return 0;
  }
}
