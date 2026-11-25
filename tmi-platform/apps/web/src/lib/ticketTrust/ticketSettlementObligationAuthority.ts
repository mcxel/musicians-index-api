/**
 * TicketSettlementObligationAuthority — payment success ≠ earned money.
 * In-process store; Prisma TicketSettlementObligation = MIGRATION_REQUIRED.
 */

import {
  type TicketSettlementState,
  assertSettlementTransition,
  settlementStateAfterSuccessfulPayment,
  blocksPayout,
} from "./settlementStates";
import { appendFinancialAudit } from "./financialAuditLedger";

export interface TicketSettlementObligation {
  settlementId: string;
  orderId: string;
  eventId: string | null;
  bookingId: string | null;
  paymentId: string | null;
  stripeSessionId: string | null;
  grossCents: number;
  currency: string;
  state: TicketSettlementState;
  organizerUserId: string | null;
  venueId: string | null;
  promoterId: string | null;
  createdAt: string;
  updatedAt: string;
}

const byId = new Map<string, TicketSettlementObligation>();
const byOrder = new Map<string, string>();
let seq = 0;

export function createProtectedObligation(input: {
  orderId: string;
  eventId?: string | null;
  bookingId?: string | null;
  paymentId?: string | null;
  stripeSessionId?: string | null;
  grossCents: number;
  currency?: string;
  organizerUserId?: string | null;
  venueId?: string | null;
  promoterId?: string | null;
  actor?: string;
}): TicketSettlementObligation {
  const existing = byOrder.get(input.orderId);
  if (existing) {
    const ob = byId.get(existing)!;
    return ob;
  }
  const settlementId = `set_${Date.now()}_${++seq}`;
  const now = new Date().toISOString();
  const state = settlementStateAfterSuccessfulPayment();
  const ob: TicketSettlementObligation = {
    settlementId,
    orderId: input.orderId,
    eventId: input.eventId ?? null,
    bookingId: input.bookingId ?? null,
    paymentId: input.paymentId ?? null,
    stripeSessionId: input.stripeSessionId ?? null,
    grossCents: input.grossCents,
    currency: input.currency ?? "usd",
    state,
    organizerUserId: input.organizerUserId ?? null,
    venueId: input.venueId ?? null,
    promoterId: input.promoterId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  byId.set(settlementId, ob);
  byOrder.set(input.orderId, settlementId);
  appendFinancialAudit({
    actor: input.actor ?? "ticketTrust.createProtectedObligation",
    action: "PAYMENT_CONFIRMED",
    previousState: "PAYMENT_PENDING",
    newState: state,
    amountCents: input.grossCents,
    currency: ob.currency,
    orderId: input.orderId,
    eventId: input.eventId,
    paymentId: input.paymentId,
    stripeRef: input.stripeSessionId,
    settlementId,
    reason: "platform_checkout_success_creates_protected_obligation_not_settled",
  });
  return ob;
}

export function getObligationByOrderId(orderId: string): TicketSettlementObligation | null {
  const id = byOrder.get(orderId);
  return id ? byId.get(id) ?? null : null;
}

export function getObligation(settlementId: string): TicketSettlementObligation | null {
  return byId.get(settlementId) ?? null;
}

export function transitionObligation(input: {
  settlementId: string;
  to: TicketSettlementState;
  actor: string;
  reason: string;
}): TicketSettlementObligation {
  const ob = byId.get(input.settlementId);
  if (!ob) throw new Error("settlement_not_found");
  assertSettlementTransition(ob.state, input.to);
  const prev = ob.state;
  ob.state = input.to;
  ob.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: input.actor,
    action: "SETTLEMENT_STATE",
    previousState: prev,
    newState: input.to,
    amountCents: ob.grossCents,
    orderId: ob.orderId,
    eventId: ob.eventId,
    settlementId: ob.settlementId,
    paymentId: ob.paymentId,
    reason: input.reason,
  });
  return ob;
}

export function canReleaseConnectTransfer(settlementId: string): {
  ok: boolean;
  reason: string;
  obligation: TicketSettlementObligation | null;
} {
  const ob = byId.get(settlementId) ?? null;
  if (!ob) return { ok: false, reason: "settlement_not_found", obligation: null };
  if (ob.state !== "SETTLEMENT_ELIGIBLE") {
    return { ok: false, reason: `not_eligible:${ob.state}`, obligation: ob };
  }
  if (blocksPayout(ob.state)) {
    return { ok: false, reason: `blocks_payout:${ob.state}`, obligation: ob };
  }
  return { ok: true, reason: "eligible", obligation: ob };
}

export function __resetSettlementObligationsForTests(): void {
  byId.clear();
  byOrder.clear();
  seq = 0;
}

export function __exportObligationsForPersist(): TicketSettlementObligation[] {
  return [...byId.values()];
}

export function __importObligationsForPersist(rows: TicketSettlementObligation[]): void {
  byId.clear();
  byOrder.clear();
  for (const ob of rows) {
    byId.set(ob.settlementId, { ...ob });
    byOrder.set(ob.orderId, ob.settlementId);
  }
  seq = rows.length;
}
