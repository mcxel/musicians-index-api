/**
 * Dispute persistence + settlement hold. No fake Chargeback Shield.
 * Webhook handlers should call ingestStripeDispute — live Stripe mutation forbidden in Phase 2 tests.
 */

import { appendFinancialAudit } from "./financialAuditLedger";
import { markCommissionDisputed } from "./commissionRecognition";
import {
  getObligationByOrderId,
  transitionObligation,
} from "./ticketSettlementObligationAuthority";

export type DisputeStatus = "CREATED" | "UPDATED" | "WON" | "LOST" | "CLOSED";

export interface TicketDisputeRecord {
  disputeId: string;
  stripeDisputeId: string;
  orderId: string;
  paymentId: string | null;
  eventId: string | null;
  ticketIds: string[];
  amountCents: number;
  status: DisputeStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

const byStripeId = new Map<string, TicketDisputeRecord>();
let seq = 0;

export function ingestStripeDispute(input: {
  stripeDisputeId: string;
  orderId: string;
  paymentId?: string | null;
  eventId?: string | null;
  ticketIds?: string[];
  amountCents: number;
  status?: DisputeStatus;
  reason?: string | null;
  actor?: string;
}): TicketDisputeRecord {
  const existing = byStripeId.get(input.stripeDisputeId);
  if (existing) {
    existing.status = input.status ?? "UPDATED";
    existing.updatedAt = new Date().toISOString();
    existing.reason = input.reason ?? existing.reason;
    return existing;
  }
  const rec: TicketDisputeRecord = {
    disputeId: `disp_${Date.now()}_${++seq}`,
    stripeDisputeId: input.stripeDisputeId,
    orderId: input.orderId,
    paymentId: input.paymentId ?? null,
    eventId: input.eventId ?? null,
    ticketIds: input.ticketIds ?? [],
    amountCents: input.amountCents,
    status: input.status ?? "CREATED",
    reason: input.reason ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  byStripeId.set(input.stripeDisputeId, rec);

  markCommissionDisputed(input.orderId, input.actor);
  const ob = getObligationByOrderId(input.orderId);
  if (ob && ob.state !== "DISPUTED" && ob.state !== "CHARGEBACK" && ob.state !== "REFUNDED") {
    try {
      transitionObligation({
        settlementId: ob.settlementId,
        to: "DISPUTED",
        actor: input.actor ?? "ticketDisputeAuthority",
        reason: `stripe_dispute:${input.stripeDisputeId}`,
      });
      transitionObligation({
        settlementId: ob.settlementId,
        to: "PAYOUT_HELD",
        actor: input.actor ?? "ticketDisputeAuthority",
        reason: "open_dispute_holds_payout",
      });
    } catch {
      /* illegal transition — leave as-is */
    }
  }

  appendFinancialAudit({
    actor: input.actor ?? "ticketDisputeAuthority",
    action: "DISPUTE",
    orderId: input.orderId,
    eventId: input.eventId,
    paymentId: input.paymentId,
    amountCents: input.amountCents,
    stripeRef: input.stripeDisputeId,
    newState: rec.status,
    settlementId: ob?.settlementId,
    reason: input.reason,
  });

  return rec;
}

export function getDispute(stripeDisputeId: string): TicketDisputeRecord | null {
  return byStripeId.get(stripeDisputeId) ?? null;
}

export function buildDisputeEvidencePackage(stripeDisputeId: string): {
  ok: boolean;
  evidence: Record<string, unknown>;
} {
  const d = byStripeId.get(stripeDisputeId);
  if (!d) return { ok: false, evidence: {} };
  // Truthful available records only — no invented attendance.
  return {
    ok: true,
    evidence: {
      stripeDisputeId: d.stripeDisputeId,
      orderId: d.orderId,
      paymentId: d.paymentId,
      eventId: d.eventId,
      ticketIds: d.ticketIds,
      amountCents: d.amountCents,
      note: "Submit only processor-relevant truthful records; scan evidence if available separately.",
    },
  };
}

export function __resetDisputesForTests(): void {
  byStripeId.clear();
  seq = 0;
}
