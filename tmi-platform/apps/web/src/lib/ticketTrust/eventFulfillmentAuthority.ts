/**
 * Event Fulfillment Authority → SETTLEMENT_ELIGIBILITY.
 * Multi-signal. QR scan % alone is NEVER sufficient.
 */

import { appendFinancialAudit } from "./financialAuditLedger";
import {
  getObligation,
  transitionObligation,
  type TicketSettlementObligation,
} from "./ticketSettlementObligationAuthority";

export type EventLifecycleStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED"
  | "RESCHEDULED";

export type EventFulfillmentState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "FULFILLED"
  | "PARTIALLY_FULFILLED"
  | "UNFULFILLED"
  | "CANCELLED"
  | "POSTPONED"
  | "DISPUTED";

export interface FulfillmentSignals {
  eventStatus: EventLifecycleStatus;
  scheduledEndAtMs: number | null;
  nowMs?: number;
  checkInCount: number;
  ticketsIssued: number;
  performerCheckedIn: boolean | null;
  bookingStatus: "NONE" | "CONFIRMED" | "NO_SHOW" | "CANCELLED" | "FULFILLED";
  openRefundCount: number;
  openDisputeCount: number;
  materialChangeUnresolved: boolean;
  authorizedCompletionEvidence: boolean;
}

export interface FulfillmentDecision {
  fulfillmentState: EventFulfillmentState;
  settlementEligible: boolean;
  reasons: string[];
}

export function evaluateEventFulfillment(signals: FulfillmentSignals): FulfillmentDecision {
  const reasons: string[] = [];
  const now = signals.nowMs ?? Date.now();

  if (signals.eventStatus === "CANCELLED") {
    return { fulfillmentState: "CANCELLED", settlementEligible: false, reasons: ["event_cancelled"] };
  }
  if (signals.eventStatus === "POSTPONED") {
    return { fulfillmentState: "POSTPONED", settlementEligible: false, reasons: ["event_postponed"] };
  }
  if (signals.openDisputeCount > 0) {
    return { fulfillmentState: "DISPUTED", settlementEligible: false, reasons: ["open_dispute"] };
  }
  if (signals.openRefundCount > 0) {
    reasons.push("open_refunds");
  }
  if (signals.materialChangeUnresolved) {
    return {
      fulfillmentState: "UNFULFILLED",
      settlementEligible: false,
      reasons: ["material_change_unresolved"],
    };
  }
  if (signals.bookingStatus === "NO_SHOW" || signals.bookingStatus === "CANCELLED") {
    return {
      fulfillmentState: "UNFULFILLED",
      settlementEligible: false,
      reasons: [`booking_${signals.bookingStatus.toLowerCase()}`],
    };
  }

  const timePassed =
    signals.scheduledEndAtMs != null && now >= signals.scheduledEndAtMs;
  if (!timePassed && signals.eventStatus !== "COMPLETED") {
    return {
      fulfillmentState: signals.eventStatus === "ACTIVE" ? "IN_PROGRESS" : "NOT_STARTED",
      settlementEligible: false,
      reasons: ["event_timeline_not_complete"],
    };
  }

  // Time passed alone is NOT enough.
  reasons.push("timeline_elapsed_or_completed_status");

  const hasAttendanceEvidence = signals.checkInCount > 0;
  const hasAuthorizedCompletion = signals.authorizedCompletionEvidence === true;
  const bookingOk =
    signals.bookingStatus === "NONE" ||
    signals.bookingStatus === "CONFIRMED" ||
    signals.bookingStatus === "FULFILLED";

  if (!bookingOk) {
    return { fulfillmentState: "UNFULFILLED", settlementEligible: false, reasons: ["booking_not_ok"] };
  }

  // Multi-signal: need (authorized completion) OR (completed status + some evidence)
  // Explicitly reject scan-percentage-only rules.
  if (hasAuthorizedCompletion) {
    reasons.push("authorized_completion_evidence");
    return { fulfillmentState: "FULFILLED", settlementEligible: signals.openRefundCount === 0, reasons };
  }

  if (signals.eventStatus === "COMPLETED" && (hasAttendanceEvidence || signals.performerCheckedIn === true)) {
    reasons.push("completed_status_plus_checkin_or_performer_arrival");
    return {
      fulfillmentState: hasAttendanceEvidence ? "FULFILLED" : "PARTIALLY_FULFILLED",
      settlementEligible: signals.openRefundCount === 0 && signals.eventStatus === "COMPLETED",
      reasons,
    };
  }

  if (timePassed && !hasAuthorizedCompletion && !hasAttendanceEvidence && signals.eventStatus !== "COMPLETED") {
    return {
      fulfillmentState: "UNFULFILLED",
      settlementEligible: false,
      reasons: ["time_passed_without_fulfillment_evidence"],
    };
  }

  return {
    fulfillmentState: "IN_PROGRESS",
    settlementEligible: false,
    reasons: reasons.length ? reasons : ["insufficient_fulfillment_signals"],
  };
}

/** Apply fulfillment evaluation onto a settlement obligation. */
export function applyFulfillmentToSettlement(input: {
  settlementId: string;
  signals: FulfillmentSignals;
  actor?: string;
}): { decision: FulfillmentDecision; obligation: TicketSettlementObligation } {
  const decision = evaluateEventFulfillment(input.signals);
  const ob = getObligation(input.settlementId);
  if (!ob) throw new Error("settlement_not_found");

  appendFinancialAudit({
    actor: input.actor ?? "eventFulfillmentAuthority",
    action: "FULFILLMENT",
    previousState: ob.state,
    newState: decision.fulfillmentState,
    orderId: ob.orderId,
    eventId: ob.eventId,
    settlementId: ob.settlementId,
    reason: decision.reasons.join("|"),
    metadata: { settlementEligible: decision.settlementEligible },
  });

  if (decision.fulfillmentState === "CANCELLED") {
    return {
      decision,
      obligation: transitionObligation({
        settlementId: input.settlementId,
        to: "CANCELLED",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: decision.reasons.join("|"),
      }),
    };
  }
  if (decision.fulfillmentState === "DISPUTED") {
    return {
      decision,
      obligation: transitionObligation({
        settlementId: input.settlementId,
        to: "DISPUTED",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: decision.reasons.join("|"),
      }),
    };
  }
  if (decision.settlementEligible) {
    // Move through EVENT_PENDING / FULFILLMENT_PENDING as needed
    if (ob.state === "PAID_PROTECTED") {
      transitionObligation({
        settlementId: input.settlementId,
        to: "EVENT_PENDING",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: "enter_event_pending",
      });
    }
    const mid = getObligation(input.settlementId)!;
    if (mid.state === "EVENT_PENDING") {
      transitionObligation({
        settlementId: input.settlementId,
        to: "FULFILLMENT_PENDING",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: "enter_fulfillment_pending",
      });
    }
    return {
      decision,
      obligation: transitionObligation({
        settlementId: input.settlementId,
        to: "SETTLEMENT_ELIGIBLE",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: decision.reasons.join("|"),
      }),
    };
  }

  if (ob.state === "PAID_PROTECTED" && decision.fulfillmentState === "IN_PROGRESS") {
    return {
      decision,
      obligation: transitionObligation({
        settlementId: input.settlementId,
        to: "EVENT_PENDING",
        actor: input.actor ?? "eventFulfillmentAuthority",
        reason: decision.reasons.join("|"),
      }),
    };
  }

  return { decision, obligation: getObligation(input.settlementId)! };
}
