/**
 * LiveTipEngine
 * Live tipping during room sessions.
 * Routes tips through the revenue ledger (live-tip source type).
 * Tracks per-performer and per-room totals.
 */

import { recordRevenueLedgerEntry } from "@/lib/revenue/RevenueLedgerEngine";
import { calculateRevenueSplit } from "@/lib/revenue/RevenueSplitEngine";
import { createPayoutFromLedgerEntry } from "@/lib/revenue/PayoutEngine";

export type TipStatus = "pending" | "confirmed" | "refunded";

export type LiveTip = {
  tipId: string;
  roomId: string;
  fromFanId: string;
  fromDisplayName: string;
  toPerformerId: string;
  toDisplayName: string;
  amountCents: number;
  message?: string;
  status: TipStatus;
  ledgerEntryId?: string;
  sentAtMs: number;
  confirmedAtMs?: number;
};

export type PerformerTipTotal = {
  performerId: string;
  roomId: string;
  totalCents: number;
  tipCount: number;
  lastTipAtMs?: number;
};

// --- in-memory store ---
const tips: LiveTip[] = [];
const performerTotals: Map<string, PerformerTipTotal> = new Map(); // key: `${roomId}:${performerId}`
let tipCounter = 0;

// --- Write API ---

export function sendLiveTip(input: {
  roomId: string;
  fromFanId: string;
  fromDisplayName: string;
  toPerformerId: string;
  toDisplayName: string;
  amountCents: number;
  message?: string;
}): LiveTip {
  const tipId = `live-tip-${++tipCounter}`;

  const tip: LiveTip = {
    tipId,
    roomId: input.roomId,
    fromFanId: input.fromFanId,
    fromDisplayName: input.fromDisplayName,
    toPerformerId: input.toPerformerId,
    toDisplayName: input.toDisplayName,
    amountCents: Math.max(1, Math.floor(input.amountCents)),
    message: input.message?.slice(0, 140),
    status: "pending",
    sentAtMs: Date.now(),
  };

  tips.unshift(tip);

  // Route through revenue ledger
  const split = calculateRevenueSplit({
    sourceType: "live-tip",
    grossCents: tip.amountCents,
  });

  const ledgerEntry = recordRevenueLedgerEntry({
    revenueSource: "live-tip",
    customerId: input.fromFanId,
    sellerId: input.toPerformerId,
    sellerType: "artist",
    productId: `tip:${input.roomId}`,
    grossCents: split.grossCents,
    subtotalCents: split.artistCents,
    platformFeeCents: split.platformCents,
    taxCents: 0,
    totalCents: split.grossCents,
    split,
    orderId: tipId,
  });

  createPayoutFromLedgerEntry({
    ledgerEntry,
    recipientId: input.toPerformerId,
    recipientType: "artist",
  });

  tip.ledgerEntryId = ledgerEntry.ledgerEntryId;
  tip.status = "confirmed";
  tip.confirmedAtMs = Date.now();

  // Update performer totals
  const key = `${input.roomId}:${input.toPerformerId}`;
  const existing = performerTotals.get(key) ?? {
    performerId: input.toPerformerId,
    roomId: input.roomId,
    totalCents: 0,
    tipCount: 0,
  };
  existing.totalCents += tip.amountCents;
  existing.tipCount++;
  existing.lastTipAtMs = Date.now();
  performerTotals.set(key, existing);

  return tip;
}

export function refundLiveTip(tipId: string): void {
  const tip = tips.find((t) => t.tipId === tipId);
  if (tip && tip.status === "confirmed") {
    tip.status = "refunded";
  }
}

// --- Read API ---

export function getPerformerTipTotal(roomId: string, performerId: string): PerformerTipTotal {
  return (
    performerTotals.get(`${roomId}:${performerId}`) ?? {
      performerId,
      roomId,
      totalCents: 0,
      tipCount: 0,
    }
  );
}

export function getRoomTipTotal(roomId: string): number {
  return tips
    .filter((t) => t.roomId === roomId && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amountCents, 0);
}

export function listTipsByRoom(roomId: string, limit = 50): LiveTip[] {
  return tips
    .filter((t) => t.roomId === roomId && t.status !== "refunded")
    .slice(0, Math.max(1, limit));
}

export function listTipsByPerformer(
  performerId: string,
  limit = 50,
): LiveTip[] {
  return tips
    .filter((t) => t.toPerformerId === performerId && t.status === "confirmed")
    .slice(0, Math.max(1, limit));
}

export function getTopTippers(roomId: string, limit = 10): Array<{ fanId: string; displayName: string; totalCents: number }> {
  const fanMap = new Map<string, { displayName: string; totalCents: number }>();
  for (const tip of tips.filter((t) => t.roomId === roomId && t.status === "confirmed")) {
    const existing = fanMap.get(tip.fromFanId);
    if (existing) {
      existing.totalCents += tip.amountCents;
    } else {
      fanMap.set(tip.fromFanId, { displayName: tip.fromDisplayName, totalCents: tip.amountCents });
    }
  }
  return [...fanMap.entries()]
    .sort((a, b) => b[1].totalCents - a[1].totalCents)
    .slice(0, Math.max(1, limit))
    .map(([fanId, data]) => ({ fanId, ...data }));
}
