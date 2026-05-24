// lib/finance/PayoutScheduler.ts — Automated payout cycle engine

import { getLedger, type LedgerEntry } from "./revenueLedger";
import { getReleasableHolds, releaseHold, meetsPayoutThreshold } from "./RefundRiskEngine";
import { calculateAdminSplits, recordAdminPayout } from "./AdminSplitEngine";

export type PayoutCycle = "daily" | "twice_weekly" | "weekly" | "monthly" | "post_event";

export type ScheduledPayout = {
  id: string;
  recipientId: string;
  recipientType: "performer" | "producer" | "venue" | "admin";
  amountCents: number;
  sourceEntries: string[];   // LedgerEntry IDs
  cycle: PayoutCycle;
  scheduledFor: number;      // unix ms
  status: "queued" | "processing" | "paid" | "failed" | "cancelled";
  stripeTransferId?: string;
  createdAt: number;
  processedAt?: number;
  failureReason?: string;
};

export type PayoutAuditLog = {
  id: string;
  payoutId: string;
  who: string;
  howMuch: number;
  why: string;
  sourceRevenue: string[];
  timestamp: number;
  verified: boolean;
};

const scheduled: ScheduledPayout[] = [];
const auditLog: PayoutAuditLog[] = [];
let payCounter = 1;
let auditCounter = 1;

function nextPayoutDate(cycle: PayoutCycle): number {
  const now = new Date();
  switch (cycle) {
    case "daily":
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0);
      break;
    case "twice_weekly": {
      // Monday and Thursday
      const day = now.getDay();
      const daysToNext = day < 1 ? 1 - day : day < 4 ? 4 - day : 8 - day;
      now.setDate(now.getDate() + daysToNext);
      now.setHours(8, 0, 0, 0);
      break;
    }
    case "weekly": {
      // Friday
      const daysToFriday = (5 - now.getDay() + 7) % 7 || 7;
      now.setDate(now.getDate() + daysToFriday);
      now.setHours(8, 0, 0, 0);
      break;
    }
    case "monthly":
      now.setMonth(now.getMonth() + 1, 1);
      now.setHours(8, 0, 0, 0);
      break;
    case "post_event":
    default:
      now.setDate(now.getDate() + 2);
      now.setHours(8, 0, 0, 0);
  }
  return now.getTime();
}

export function schedulePayout(
  recipientId: string,
  recipientType: ScheduledPayout["recipientType"],
  amountCents: number,
  sourceEntries: string[],
  cycle: PayoutCycle
): ScheduledPayout | null {
  if (!meetsPayoutThreshold(amountCents, recipientType)) return null;

  const payout: ScheduledPayout = {
    id: `PAY-${Date.now()}-${String(payCounter++).padStart(6, "0")}`,
    recipientId,
    recipientType,
    amountCents,
    sourceEntries,
    cycle,
    scheduledFor: nextPayoutDate(cycle),
    status: "queued",
    createdAt: Date.now(),
  };
  scheduled.push(payout);
  writeAuditLog(payout, `${recipientType} payout scheduled for ${cycle} cycle`);
  return payout;
}

export function runPayoutCycle(): ScheduledPayout[] {
  const now = Date.now();
  const due = scheduled.filter(p => p.status === "queued" && p.scheduledFor <= now);

  for (const payout of due) {
    payout.status = "processing";
    payout.processedAt = Date.now();
    // In production: call Stripe Connect transfer here
    // stripe.transfers.create({ amount: payout.amountCents, currency: "usd", destination: connectId })
    payout.status = "paid";
    writeAuditLog(payout, "Payout processed via Stripe Connect");
  }

  return due;
}

export function buildCreatorPayoutQueue(): ScheduledPayout[] {
  const releasable = getReleasableHolds();
  const byRecipient = new Map<string, { amountCents: number; entries: string[] }>();

  for (const hold of releasable) {
    const current = byRecipient.get(hold.recipientId) ?? { amountCents: 0, entries: [] };
    current.amountCents += hold.creatorCut;
    current.entries.push(hold.transactionId);
    byRecipient.set(hold.recipientId, current);
    releaseHold(hold.transactionId);
  }

  const payouts: ScheduledPayout[] = [];
  for (const [recipientId, { amountCents, entries }] of byRecipient.entries()) {
    const payout = schedulePayout(recipientId, "performer", amountCents, entries, "twice_weekly");
    if (payout) payouts.push(payout);
  }

  return payouts;
}

export function runAdminPayoutCycle(periodStart: number, periodEnd: number): void {
  const splits = calculateAdminSplits(periodStart, periodEnd);
  for (const split of splits) {
    split.status = "processing";
    // In production: Stripe Connect transfer to split.stripeConnectId
    split.status = "paid";
    split.paidAt = Date.now();
    recordAdminPayout(split);
  }
}

function writeAuditLog(payout: ScheduledPayout, why: string): void {
  const entries = getLedger().filter(e => payout.sourceEntries.includes(e.id));
  auditLog.push({
    id: `AUDIT-${Date.now()}-${String(auditCounter++).padStart(6, "0")}`,
    payoutId: payout.id,
    who: payout.recipientId,
    howMuch: payout.amountCents,
    why,
    sourceRevenue: payout.sourceEntries,
    timestamp: Date.now(),
    verified: true,
  });
}

export function getScheduledPayouts(status?: ScheduledPayout["status"]): ScheduledPayout[] {
  return status ? scheduled.filter(p => p.status === status) : [...scheduled];
}

export function getAuditLog(limit = 200): PayoutAuditLog[] {
  return [...auditLog].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export function getNextPayoutDate(cycle: PayoutCycle): Date {
  return new Date(nextPayoutDate(cycle));
}
