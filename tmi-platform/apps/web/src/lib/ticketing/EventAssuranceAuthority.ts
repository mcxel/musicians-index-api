/**
 * EventAssuranceAuthority — TMI Event Assurance (buyer + seller protection).
 *
 * Product concept: TMI Event Assurance — not a competitor brand copy.
 * Does NOT invent commission %. Cancellation reverses from TicketPurchaseEconomicSnapshot.
 * Does NOT promise "automatic instant refunds" or "guaranteed" language.
 * STRIPE_MUTATIONS = NO — refund orchestration prepares eligibility; execution stays dryRun.
 *
 * Reuses: ShowsReleasePublishStatus CANCELED, ticketRefundAuthority (dryRun),
 * settlementStates, commissionRecognition, EventRsvpAuthority (RSVP only).
 */

import type { TicketPurchaseEconomicSnapshot } from "@/lib/economy/TicketPurchaseEconomicSnapshot";
import { commissionReversalFromSnapshot } from "@/lib/economy/TicketPurchaseEconomicSnapshot";

export const TMI_EVENT_ASSURANCE_POLICY_ID = "tmi-event-assurance-v1" as const;

/** Consumer-facing name — architecture stays if marketing renames later. */
export const TMI_EVENT_ASSURANCE_DISPLAY_NAME = "TMI Event Assurance" as const;

/**
 * Canonical event lifecycle for Assurance — map onto existing authorities where present.
 * ShowsReleasePublishStatus today: DRAFT | PUBLISHED | CANCELED
 * ShowsReleasePhase today: DRAFT | CLOSED | PRESHOW | LIVE | POSTSHOW
 */
export type EventAssuranceLifecycleStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ON_SALE"
  | "PRE_SHOW"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "POSTPONED"
  | "INTERRUPTED"
  | "TERMINATED";

export type EventCancellationReasonClass =
  | "PERFORMER_UNAVAILABLE"
  | "VENUE_ISSUE"
  | "TECHNICAL_ISSUE"
  | "PLATFORM_INFRASTRUCTURE_FAILURE"
  | "WEATHER_SAFETY"
  | "ORGANIZER_DECISION"
  | "OTHER";

export type EventAssuranceRefundStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PROCESSING"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED"
  | "MANUAL_REVIEW";

export type TicketAssuranceDisplayState =
  | "ACTIVE"
  | "USED"
  | "CANCELLED_EVENT"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "RESCHEDULED"
  | "POSTPONED"
  | "TRANSFERRED";

export type AssuranceCapabilityClass =
  | "ALREADY_WIRED"
  | "PARTIAL"
  | "MISSING"
  | "WIRE_NOW"
  | "WAITING_FOR_STRIPE_SAFE_PASS"
  | "WAITING_FOR_ISOLATED_DB"
  | "OWNER_VALUE_REQUIRED"
  | "FUTURE_SUPERCHARGE"
  | "FUTURE_LEGAL_PARTNER_REVIEW"
  | "CURSOR_OWNED";

export type AssuranceCapabilityHit = {
  id: string;
  authority: string;
  fileHint: string;
  classification: AssuranceCapabilityClass;
  note: string;
};

/** Physical discovery snapshot — expand as wiring progresses. */
export const EVENT_ASSURANCE_CAPABILITY_LEDGER: readonly AssuranceCapabilityHit[] = [
  {
    id: "shows-release-canceled-status",
    authority: "ShowsReleasePublishStatus",
    fileHint: "lib/events/ScheduledEventRegistry.ts",
    classification: "PARTIAL",
    note: "Has DRAFT|PUBLISHED|CANCELED — missing ON_SALE/RESCHEDULED/POSTPONED as first-class publish status.",
  },
  {
    id: "shows-release-phase",
    authority: "ShowsReleasePhase",
    fileHint: "lib/events/ScheduledEventRegistry.ts",
    classification: "PARTIAL",
    note: "DRAFT|CLOSED|PRESHOW|LIVE|POSTSHOW — no CANCELLED/INTERRUPTED phase.",
  },
  {
    id: "ticket-refund-authority",
    authority: "authorizeAndApplyTicketRefund",
    fileHint: "lib/ticketTrust/ticketRefundAuthority.ts",
    classification: "WAITING_FOR_STRIPE_SAFE_PASS",
    note: "CANCELLATION kind + dryRun exist. Live Stripe refund gated. Reuse — do not invent parallel refund engine.",
  },
  {
    id: "settlement-states",
    authority: "TicketSettlementState",
    fileHint: "lib/ticketTrust/settlementStates.ts",
    classification: "ALREADY_WIRED",
    note: "CANCELLED → REFUND_PENDING → REFUNDED present. Payout safety via blocksPayout().",
  },
  {
    id: "commission-recognition",
    authority: "markCommissionRefunded",
    fileHint: "lib/ticketTrust/commissionRecognition.ts",
    classification: "PARTIAL",
    note: "Reverses commission state by orderId; amount stored at collect time. Bind to economic snapshot explicitly.",
  },
  {
    id: "booking-cancellation-policy",
    authority: "bookingCancellationPolicyAuthority",
    fileHint: "lib/ticketTrust/bookingCancellationPolicyAuthority.ts",
    classification: "PARTIAL",
    note: "Booking-domain cancellation — not World Concert / venue ticket Event Assurance.",
  },
  {
    id: "event-rsvp-cancel",
    authority: "EventRsvpAuthority",
    fileHint: "lib/events/EventRsvpAuthority.ts",
    classification: "PARTIAL",
    note: "Free RSVP CANCELLED only — not paid ticket protection.",
  },
  {
    id: "economic-snapshot",
    authority: "TicketPurchaseEconomicSnapshot",
    fileHint: "lib/economy/TicketPurchaseEconomicSnapshot.ts",
    classification: "WIRE_NOW",
    note: "Purchase-time frozen rate. Required for WC tier + venue 13% reversal correctness.",
  },
  {
    id: "mini-concert-commission",
    authority: "MINI_CONCERT ticket cut",
    fileHint: "ShowsReleasePublisher / DigitalTicketOfferEngine",
    classification: "OWNER_VALUE_REQUIRED",
    note: "No proven Mini Concert commission policy in source. Do not assign 18% or 13%.",
  },
  {
    id: "fan-ticket-wallet",
    authority: "/fan/tickets + /api/tickets/mine",
    fileHint: "app/fan/tickets/page.tsx",
    classification: "PARTIAL",
    note: "Lists tickets ACTIVE/REDEEMED only — no CANCELLED/REFUND_PENDING/RESCHEDULED chips yet.",
  },
  {
    id: "physical-scan",
    authority: "TicketScanLedger / scanner routes",
    fileHint: "lib/tickets/ticketCore.ts · /tickets/scanner",
    classification: "PARTIAL",
    note: "Scan ledger types exist; cancelled-event admit block must bind to Assurance status.",
  },
  {
    id: "seat-map",
    authority: "TicketSeatBinding / seatMapId",
    fileHint: "ticketCore · DigitalTicketOffer.seatMapId",
    classification: "PARTIAL",
    note: "Section/row/seat fields exist. No fabricated seat-view photos.",
  },
  {
    id: "job-loss-protection",
    authority: "n/a",
    fileHint: "n/a",
    classification: "FUTURE_LEGAL_PARTNER_REVIEW",
    note: "Not launch Event Assurance. Insurance/regulatory partner required before any marketing claim.",
  },
  {
    id: "lowest-price-guarantee",
    authority: "n/a",
    fileHint: "n/a",
    classification: "OWNER_VALUE_REQUIRED",
    note: "No enforceable TMI price-guarantee policy — do not market.",
  },
  {
    id: "3d-seat-preview",
    authority: "Venue geometry / UniversalVenueRenderer",
    fileHint: "venue runtime",
    classification: "FUTURE_SUPERCHARGE",
    note: "Do not block launch. Label simulation vs photograph if ever shipped.",
  },
  {
    id: "material-change-refund",
    authority: "headliner/venue/format change refund",
    fileHint: "n/a",
    classification: "OWNER_VALUE_REQUIRED",
    note: "No invented legal refund obligation for material changes until Owner policy.",
  },
  {
    id: "buyer-voluntary-cancel",
    authority: "buyer-initiated ticket cancel",
    fileHint: "n/a",
    classification: "OWNER_VALUE_REQUIRED",
    note: "Distinct from event cancellation protection. Do not auto-promise.",
  },
  {
    id: "season-pass-stack",
    authority: "Season Pass / loyalty ticket discount funding",
    fileHint: "n/a",
    classification: "OWNER_VALUE_REQUIRED",
    note: "Must identify discount funding source (TMI vs seller) before stacking.",
  },
] as const;

export type EventCancellationRecord = {
  cancellationId: string;
  eventId: string;
  eventFamily: TicketPurchaseEconomicSnapshot["eventFamily"] | "UNKNOWN";
  previousStatus: EventAssuranceLifecycleStatus;
  status: "CANCELLED";
  reasonClass: EventCancellationReasonClass;
  reasonPublicSummary: string;
  reasonInternalNote: string | null;
  cancelledAtIso: string;
  cancelledBySellerId: string;
  confirmationTokenUsed: string;
  ticketsSoldAtCancel: number;
  gmvCentsAtCancel: number;
  estimatedRefundExposureCents: number;
  newSalesDisabled: true;
  notificationsQueued: number;
  refundOrchestration: "PREPARED_DRY_RUN_ONLY";
  stripeMutations: "NONE";
};

export type CancellationConfirmationPreview = {
  eventId: string;
  ticketsSold: number;
  affectedBuyers: number;
  ticketGmvCents: number;
  estimatedRefundExposureCents: number;
  consequences: string[];
  requiresExplicitConfirm: true;
  singleTapForbidden: true;
};

const cancellations = new Map<string, EventCancellationRecord>();
const eventSalesLocks = new Map<string, true>();
const ticketAssuranceState = new Map<string, TicketAssuranceDisplayState>();
const refundStatusByTicket = new Map<string, EventAssuranceRefundStatus>();
const snapshotsByTicket = new Map<string, TicketPurchaseEconomicSnapshot>();

let cancelSeq = 0;

export function registerTicketEconomicSnapshot(
  ticketId: string,
  snapshot: TicketPurchaseEconomicSnapshot,
): void {
  snapshotsByTicket.set(ticketId, snapshot);
  if (!ticketAssuranceState.has(ticketId)) {
    ticketAssuranceState.set(ticketId, "ACTIVE");
  }
}

export function getTicketEconomicSnapshot(ticketId: string): TicketPurchaseEconomicSnapshot | undefined {
  return snapshotsByTicket.get(ticketId);
}

export function isEventSalesDisabled(eventId: string): boolean {
  return eventSalesLocks.has(eventId);
}

export function getEventCancellation(eventId: string): EventCancellationRecord | undefined {
  return cancellations.get(eventId);
}

export function getTicketAssuranceDisplayState(ticketId: string): TicketAssuranceDisplayState {
  return ticketAssuranceState.get(ticketId) ?? "ACTIVE";
}

export function getTicketRefundStatus(ticketId: string): EventAssuranceRefundStatus {
  return refundStatusByTicket.get(ticketId) ?? "NOT_REQUIRED";
}

/** Seller UI preview — never cancels. */
export function previewEventCancellation(input: {
  eventId: string;
  ticketsSold: number;
  affectedBuyers: number;
  ticketGmvCents: number;
  estimatedRefundExposureCents?: number;
}): CancellationConfirmationPreview {
  const exposure = input.estimatedRefundExposureCents ?? input.ticketGmvCents;
  return {
    eventId: input.eventId,
    ticketsSold: input.ticketsSold,
    affectedBuyers: input.affectedBuyers,
    ticketGmvCents: input.ticketGmvCents,
    estimatedRefundExposureCents: exposure,
    consequences: [
      "Event status → CANCELLED (record preserved — not deleted)",
      "New ticket sales stop immediately",
      "Discovery must show CANCELLED — no Buy Ticket CTA",
      "Ticket holders notified via supported channels",
      "Refund/remedy eligibility prepared (Stripe execution gated)",
      "Entitlements move to CANCELLED_EVENT / REFUND_PENDING",
    ],
    requiresExplicitConfirm: true,
    singleTapForbidden: true,
  };
}

/**
 * Authoritative cancel after explicit confirmation.
 * Does not delete event. Does not call Stripe. Prepares refund eligibility from snapshots.
 */
export function confirmEventCancellation(input: {
  eventId: string;
  eventFamily: EventCancellationRecord["eventFamily"];
  previousStatus: EventAssuranceLifecycleStatus;
  reasonClass: EventCancellationReasonClass;
  reasonPublicSummary: string;
  reasonInternalNote?: string | null;
  cancelledBySellerId: string;
  /** Must be non-empty deliberate confirm string (e.g. "CANCEL"). */
  confirmationToken: string;
  expectedConfirmationToken?: string;
  ticketsSoldAtCancel: number;
  gmvCentsAtCancel: number;
  affectedTicketIds: string[];
  estimatedRefundExposureCents?: number;
}): EventCancellationRecord {
  if (cancellations.has(input.eventId)) {
    return cancellations.get(input.eventId)!;
  }
  const expected = input.expectedConfirmationToken ?? "CANCEL";
  if (!input.confirmationToken || input.confirmationToken !== expected) {
    throw new Error("CANCELLATION_CONFIRMATION_REQUIRED");
  }
  if (input.previousStatus === "COMPLETED") {
    throw new Error("CANNOT_CANCEL_COMPLETED_EVENT");
  }

  let estimatedExposure = input.estimatedRefundExposureCents ?? 0;
  if (estimatedExposure === 0) {
    for (const tid of input.affectedTicketIds) {
      const snap = snapshotsByTicket.get(tid);
      if (snap) estimatedExposure += snap.buyerTotalCents;
    }
  }

  const record: EventCancellationRecord = {
    cancellationId: `eac_${Date.now()}_${++cancelSeq}`,
    eventId: input.eventId,
    eventFamily: input.eventFamily,
    previousStatus: input.previousStatus,
    status: "CANCELLED",
    reasonClass: input.reasonClass,
    reasonPublicSummary: input.reasonPublicSummary.trim() || "Event cancelled",
    reasonInternalNote: input.reasonInternalNote ?? null,
    cancelledAtIso: new Date().toISOString(),
    cancelledBySellerId: input.cancelledBySellerId,
    confirmationTokenUsed: input.confirmationToken,
    ticketsSoldAtCancel: input.ticketsSoldAtCancel,
    gmvCentsAtCancel: input.gmvCentsAtCancel,
    estimatedRefundExposureCents: estimatedExposure,
    newSalesDisabled: true,
    notificationsQueued: input.affectedTicketIds.length,
    refundOrchestration: "PREPARED_DRY_RUN_ONLY",
    stripeMutations: "NONE",
  };

  cancellations.set(input.eventId, record);
  eventSalesLocks.set(input.eventId, true);

  for (const tid of input.affectedTicketIds) {
    ticketAssuranceState.set(tid, "CANCELLED_EVENT");
    refundStatusByTicket.set(tid, "PENDING");
  }

  return record;
}

/** Admission must fail closed for cancelled events. */
export function assertAdmissionAllowedForEvent(eventId: string): void {
  if (eventSalesLocks.has(eventId) || cancellations.has(eventId)) {
    throw new Error("ADMISSION_BLOCKED_EVENT_CANCELLED");
  }
}

/** Purchase path must refuse new sales after cancel. */
export function assertNewTicketSaleAllowed(eventId: string): void {
  if (isEventSalesDisabled(eventId)) {
    throw new Error("SALES_DISABLED_EVENT_CANCELLED");
  }
}

export type PreparedCancellationRefund = {
  ticketId: string;
  refundStatus: EventAssuranceRefundStatus;
  platformShareToReverseCents: number;
  sellerSideToReverseCents: number;
  platformRateBpsFrozen: number;
  platformPolicyId: string;
  stripeExecution: "BLOCKED_STRIPE_MUTATIONS_NO";
};

/** Prepare refund math from frozen snapshots — no Stripe call. */
export function prepareCancellationRefundsFromSnapshots(
  ticketIds: string[],
): PreparedCancellationRefund[] {
  const out: PreparedCancellationRefund[] = [];
  for (const ticketId of ticketIds) {
    const snap = snapshotsByTicket.get(ticketId);
    if (!snap) {
      refundStatusByTicket.set(ticketId, "MANUAL_REVIEW");
      ticketAssuranceState.set(ticketId, "REFUND_PENDING");
      out.push({
        ticketId,
        refundStatus: "MANUAL_REVIEW",
        platformShareToReverseCents: 0,
        sellerSideToReverseCents: 0,
        platformRateBpsFrozen: 0,
        platformPolicyId: "MISSING_SNAPSHOT",
        stripeExecution: "BLOCKED_STRIPE_MUTATIONS_NO",
      });
      continue;
    }
    const rev = commissionReversalFromSnapshot(snap);
    refundStatusByTicket.set(ticketId, "PENDING");
    ticketAssuranceState.set(ticketId, "REFUND_PENDING");
    out.push({
      ticketId,
      refundStatus: "PENDING",
      platformShareToReverseCents: rev.platformShareToReverseCents,
      sellerSideToReverseCents: rev.sellerSideToReverseCents,
      platformRateBpsFrozen: rev.platformRateBpsFrozen,
      platformPolicyId: rev.platformPolicyId,
      stripeExecution: "BLOCKED_STRIPE_MUTATIONS_NO",
    });
  }
  return out;
}

/** Idempotent — second prepare does not invent a second full reversal amount. */
export function sumPreparedPlatformReversals(rows: PreparedCancellationRefund[]): number {
  const seen = new Set<string>();
  let sum = 0;
  for (const r of rows) {
    if (seen.has(r.ticketId)) continue;
    seen.add(r.ticketId);
    sum += r.platformShareToReverseCents;
  }
  return sum;
}

export function mapShowsReleasePublishToAssurance(
  publishStatus: "DRAFT" | "PUBLISHED" | "CANCELED",
  phase?: "DRAFT" | "CLOSED" | "PRESHOW" | "LIVE" | "POSTSHOW",
): EventAssuranceLifecycleStatus {
  if (publishStatus === "CANCELED") return "CANCELLED";
  if (publishStatus === "DRAFT") return "DRAFT";
  if (phase === "PRESHOW") return "PRE_SHOW";
  if (phase === "LIVE") return "LIVE";
  if (phase === "POSTSHOW") return "COMPLETED";
  if (phase === "CLOSED") return "COMPLETED";
  return "SCHEDULED";
}

/** Plain-language coverage — honest about Stripe gate. No fake guarantees. */
export function getEventAssurancePublicCopy(): {
  badge: typeof TMI_EVENT_ASSURANCE_DISPLAY_NAME;
  policyId: typeof TMI_EVENT_ASSURANCE_POLICY_ID;
  covered: string[];
  notCovered: string[];
  refundHonesty: string;
} {
  return {
    badge: TMI_EVENT_ASSURANCE_DISPLAY_NAME,
    policyId: TMI_EVENT_ASSURANCE_POLICY_ID,
    covered: [
      "Official event cancellation by authorized seller",
      "Clear ticket status update (CANCELLED_EVENT / REFUND_PENDING)",
      "Buyer notification when channels are available",
      "Refund/remedy eligibility evaluated from purchase economics",
    ],
    notCovered: [
      "Fan personally missing a delivered show",
      "Unsupported 'job loss' insurance claims",
      "Buyer voluntary cancel unless separate policy exists",
      "Material changes without Owner policy",
    ],
    refundHonesty:
      "Refund execution runs only through the canonical payment authority when authorized. Eligibility and status updates may appear before funds move.",
  };
}

export function listAssuranceByClassification(c: AssuranceCapabilityClass): AssuranceCapabilityHit[] {
  return EVENT_ASSURANCE_CAPABILITY_LEDGER.filter((h) => h.classification === c);
}

/** Test / isolation reset — not for production paths. */
export function __resetEventAssuranceForTests(): void {
  cancellations.clear();
  eventSalesLocks.clear();
  ticketAssuranceState.clear();
  refundStatusByTicket.clear();
  snapshotsByTicket.clear();
  cancelSeq = 0;
}
