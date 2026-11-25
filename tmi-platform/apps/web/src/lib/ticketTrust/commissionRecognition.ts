/**
 * Commission recognition — COLLECTED != EARNED.
 */

import { appendFinancialAudit } from "./financialAuditLedger";

export type CommissionRecognitionState =
  | "PENDING"
  | "AT_RISK"
  | "SETTLEMENT_ELIGIBLE"
  | "EARNED"
  | "REFUNDED"
  | "REVERSED"
  | "DISPUTED";

export interface CommissionRecord {
  orderId: string;
  amountCents: number;
  state: CommissionRecognitionState;
  updatedAt: string;
}

const byOrder = new Map<string, CommissionRecord>();

export function recordCommissionCollected(input: {
  orderId: string;
  amountCents: number;
  actor?: string;
}): CommissionRecord {
  const rec: CommissionRecord = {
    orderId: input.orderId,
    amountCents: input.amountCents,
    state: "PENDING",
    updatedAt: new Date().toISOString(),
  };
  byOrder.set(input.orderId, rec);
  appendFinancialAudit({
    actor: input.actor ?? "commissionRecognition",
    action: "COMMISSION",
    orderId: input.orderId,
    amountCents: input.amountCents,
    newState: "PENDING",
    reason: "collected_not_earned",
  });
  return rec;
}

export function markCommissionSettlementEligible(orderId: string, actor?: string): CommissionRecord | null {
  const rec = byOrder.get(orderId);
  if (!rec) return null;
  if (rec.state === "REFUNDED" || rec.state === "REVERSED" || rec.state === "DISPUTED") return rec;
  rec.state = "SETTLEMENT_ELIGIBLE";
  rec.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: actor ?? "commissionRecognition",
    action: "COMMISSION",
    orderId,
    amountCents: rec.amountCents,
    newState: "SETTLEMENT_ELIGIBLE",
  });
  return rec;
}

export function markCommissionEarned(orderId: string, actor?: string): CommissionRecord | null {
  const rec = byOrder.get(orderId);
  if (!rec) return null;
  if (rec.state !== "SETTLEMENT_ELIGIBLE") {
    throw new Error(`commission_not_eligible:${rec.state}`);
  }
  rec.state = "EARNED";
  rec.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: actor ?? "commissionRecognition",
    action: "COMMISSION",
    orderId,
    amountCents: rec.amountCents,
    newState: "EARNED",
    reason: "post_fulfillment_settlement",
  });
  return rec;
}

export function markCommissionRefunded(
  orderId: string,
  actor?: string,
): CommissionRecognitionState | null {
  const rec = byOrder.get(orderId);
  if (!rec) return null;
  rec.state = "REFUNDED";
  rec.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: actor ?? "commissionRecognition",
    action: "COMMISSION",
    orderId,
    amountCents: rec.amountCents,
    newState: "REFUNDED",
    reason: "commission_reversed_on_refund",
  });
  return rec.state;
}

export function markCommissionDisputed(orderId: string, actor?: string): CommissionRecord | null {
  const rec = byOrder.get(orderId);
  if (!rec) return null;
  rec.state = "DISPUTED";
  rec.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: actor ?? "commissionRecognition",
    action: "COMMISSION",
    orderId,
    amountCents: rec.amountCents,
    newState: "DISPUTED",
  });
  return rec;
}

export function getCommission(orderId: string): CommissionRecord | null {
  return byOrder.get(orderId) ?? null;
}

export function __resetCommissionForTests(): void {
  byOrder.clear();
}
