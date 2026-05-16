/**
 * RefundEngine
 * Refund requests, approval, ledger reversal, and payout rollback.
 */

import { markRevenueLedgerEntryRefunded, markRevenueLedgerEntryReversed } from "./RevenueLedgerEngine";
import { rollbackPayout } from "./PayoutEngine";

export type RefundStatus = "requested" | "approved" | "rejected" | "processed";

export type RefundRequest = {
  refundId: string;
  ledgerEntryId: string;
  reason: string;
  amountCents: number;
  status: RefundStatus;
  payoutId?: string;
  requestedAtMs: number;
  processedAtMs?: number;
};

const refunds: RefundRequest[] = [];
let refundCounter = 0;

export function requestRefund(input: {
  ledgerEntryId: string;
  reason: string;
  amountCents: number;
  payoutId?: string;
}): RefundRequest {
  const existing = refunds.find((refund) =>
    refund.ledgerEntryId === input.ledgerEntryId
      && refund.amountCents === input.amountCents
      && refund.payoutId === input.payoutId
      && refund.status !== "rejected"
  );

  if (existing) {
    return existing;
  }

  const refund: RefundRequest = {
    refundId: `refund-${++refundCounter}`,
    ledgerEntryId: input.ledgerEntryId,
    reason: input.reason,
    amountCents: input.amountCents,
    payoutId: input.payoutId,
    status: "requested",
    requestedAtMs: Date.now(),
  };

  refunds.unshift(refund);
  return refund;
}

export function approveRefund(refundId: string): RefundRequest {
  const refund = refunds.find((item) => item.refundId === refundId);
  if (!refund) throw new Error(`Refund ${refundId} not found`);
  if (refund.status === "approved" || refund.status === "processed") return refund;
  refund.status = "approved";
  markRevenueLedgerEntryRefunded(refund.ledgerEntryId);
  return refund;
}

export function processRefund(refundId: string): RefundRequest {
  const refund = refunds.find((item) => item.refundId === refundId);
  if (!refund) throw new Error(`Refund ${refundId} not found`);
  if (refund.status === "processed") return refund;
  if (refund.status !== "approved") throw new Error("Refund must be approved first");

  markRevenueLedgerEntryReversed(refund.ledgerEntryId);
  if (refund.payoutId) rollbackPayout(refund.payoutId);

  refund.status = "processed";
  refund.processedAtMs = Date.now();
  return refund;
}

export function rejectRefund(refundId: string): RefundRequest {
  const refund = refunds.find((item) => item.refundId === refundId);
  if (!refund) throw new Error(`Refund ${refundId} not found`);
  refund.status = "rejected";
  return refund;
}

export function listRefundRequests(): RefundRequest[] {
  return [...refunds];
}
