/**
 * Booking Convergence & Multi-Performer Bill Contracts
 *
 * Canonical shared type contracts across apps/api, apps/web, and package runtimes.
 * Enforces TMI doctrine:
 *  - Subscription Tier != Professional Booking Reach
 *  - Unknown Capacity != Authoritative Zero Capacity
 *  - No silent contractual defaults (Unspecified != Agreed Zero)
 *  - Accepted Engagement History != Verified Completed Career Evidence
 */

export type BillRole =
  | "UNSPECIFIED"
  | "HEADLINER"
  | "DIRECT_SUPPORT"
  | "FEATURED_SUPPORT"
  | "OPENER"
  | "LOCAL_SUPPORT"
  | "SHOWCASE"
  | "GUEST";

export type CompensationType =
  | "UNSPECIFIED"
  | "GUARANTEE"
  | "DOOR_SPLIT"
  | "GUARANTEE_PLUS_SPLIT"
  | "BONUS"
  | "CUSTOM_TERMS";

export type TravelResponsibility =
  | "UNSPECIFIED"
  | "PERFORMER_PAYS"
  | "VENUE_PROVIDES"
  | "PROMOTER_PROVIDES"
  | "SPLIT_AGREED"
  | "MUTUAL_WAIVER";

export type LodgingResponsibility =
  | "UNSPECIFIED"
  | "PERFORMER_PAYS"
  | "VENUE_PROVIDES"
  | "PROMOTER_PROVIDES"
  | "SPLIT_AGREED"
  | "MUTUAL_WAIVER";

export type HospitalityResponsibility =
  | "UNSPECIFIED"
  | "VENUE_PROVIDES"
  | "PERFORMER_PAYS"
  | "PROMOTER_PROVIDES"
  | "NONE_AGREED";

export type AssignmentFulfillmentStatus =
  | "PENDING"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED_UNVERIFIED"
  | "VERIFIED_COMPLETED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED_VENUE"
  | "CANCELLED_PERFORMER"
  | "DISPUTED";

export type InventoryLifecycleStatus =
  | "PENDING_CAPACITY"
  | "CAPACITY_CONFIGURED"
  | "ACTIVE_SELLABLE"
  | "PAUSED"
  | "CLOSED";

export type SubscriptionTierProvenance =
  | "VERIFIED"
  | "UNRESOLVED"
  | "EXEMPT";

export interface BookingEconomicSnapshotContract {
  id: string;
  bookingOfferId: string;
  performerUserId: string;
  venueUserId: string;
  venueProfileId: string;

  // Compensation Structure (Nullable / Unspecified by default — NO silent contractual defaults)
  compensationType: CompensationType;
  guaranteeCents?: number | null;
  splitPercentage?: number | null;
  revenueBasis?: string | null;
  thresholdCents?: number | null;
  bonusTerms?: Record<string, unknown> | null;
  currency?: string | null;

  // Subscription & Policy State at Acceptance (Truthful Provenance — NO fake tier inference)
  subscriptionTierAtAcceptance?: string | null;
  subscriptionTierProvenance: SubscriptionTierProvenance;
  commissionPolicyVersion?: string | null;
  commissionPercent?: number | null; // OWNER DECISION REQUIRED — remains null if unset
  commissionCents?: number | null;

  // Fulfillment & Recoupable Responsibilities (Nullable / Unspecified — NO silent deductions)
  authorizedRecoupables?: Record<string, unknown> | null;
  travelResponsibility: TravelResponsibility;
  lodgingResponsibility: LodgingResponsibility;
  hospitalityResponsibility: HospitalityResponsibility;

  // Estimated Gross / Net Pre-Acceptance Disclosure
  estimatedGrossCents?: number | null;
  estimatedVariableCents?: number | null;
  estimatedNetCents?: number | null;

  // Immutability & Audit
  acceptedAt: string;
  acceptedByUserId: string;
  termsHash?: string | null;
  createdAt: string;
}

export interface EventPerformerAssignmentContract {
  id: string;
  eventId: string;
  performerUserId: string;
  billRole: BillRole;
  performanceOrder: number;
  bookingOfferId?: string | null;
  economicSnapshotId?: string | null;
  fulfillmentStatus: AssignmentFulfillmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventBookingConvergenceContract {
  eventId: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  venueName?: string | null;
  venueUserId?: string | null;
  inventoryLifecycle: InventoryLifecycleStatus;
  assignments: EventPerformerAssignmentContract[];
  legacyArtistUserId?: string | null;
}

/**
 * Validates that an inventory lifecycle state is strictly safe for ticket sales.
 * Rule: PENDING_CAPACITY must NEVER be treated as sellable inventory (even with capacity 0).
 */
export function isInventorySellable(status: InventoryLifecycleStatus, capacity?: number | null): boolean {
  // Only ACTIVE_SELLABLE may authorize ticket sales.
  // CAPACITY_CONFIGURED means capacity is known, NOT that sales are authorized.
  if (status !== "ACTIVE_SELLABLE") {
    return false;
  }
  return typeof capacity === "number" && capacity > 0;
}

/**
 * Checks if a booking record constitutes verified career history vs. accepted engagement.
 * Rule: Acceptance alone does NOT create career progress; completedAt and verified fulfillment required.
 */
export function isCareerVerifiedBooking(history: {
  confirmedAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledAt?: string | Date | null;
  fulfillmentStatus?: AssignmentFulfillmentStatus | null;
}): boolean {
  if (!history.completedAt) return false;
  if (history.cancelledAt) return false;
  // P0-B3.1: VERIFIED_COMPLETED is strictly exclusive. Plain COMPLETED does not verify career standing.
  return history.fulfillmentStatus === "VERIFIED_COMPLETED";
}

export interface AcceptOfferOptions {
  eventId?: string;
  billRole?: BillRole;
}

export interface ConvergedAcceptanceResult {
  success: boolean;
  offerId: string;
  eventId: string;
  snapshotId: string;
  assignmentId: string;
  historyId: string;
  billRole: BillRole;
  inventoryLifecycle: InventoryLifecycleStatus;
  alreadyAccepted?: boolean;
}

export const CANONICAL_BILL_ROLES: BillRole[] = [
  "UNSPECIFIED",
  "HEADLINER",
  "DIRECT_SUPPORT",
  "FEATURED_SUPPORT",
  "OPENER",
  "LOCAL_SUPPORT",
  "SHOWCASE",
  "GUEST",
];

/**
 * Resolves the truthful BillRole for a performer assignment.
 * Enforces TMI Multi-Performer Law:
 * - Standalone solo bookings legitimately establish HEADLINER.
 * - Multi-act bills with an existing HEADLINER cannot default subsequent acts to HEADLINER.
 * - Explicit options or offer message cues are strictly respected.
 */
/**
 * Resolves the truthful BillRole for a performer assignment.
 * Enforces TMI P0-B2.1 Proven Billing Law:
 * - Performance order does NOT determine BillRole.
 * - Prior assignment count does NOT determine BillRole.
 * - Free-form message text is NOT contractual truth.
 * - Sole billed performer is NOT assumed HEADLINER without explicit authority.
 * - When role cannot be authoritatively proven, returns 'UNSPECIFIED'.
 */
export function resolveBillRole(params?: {
  explicitRole?: string | null;
}): BillRole {
  if (params?.explicitRole) {
    const normalized = params.explicitRole.toUpperCase().trim() as BillRole;
    if (CANONICAL_BILL_ROLES.includes(normalized)) {
      return normalized;
    }
  }
  return "UNSPECIFIED";
}

export type CompletionEvidenceType =
  | "VENUE_CONFIRMATION"
  | "PERFORMER_CONFIRMATION"
  | "STAGE_SESSION_TELEMETRY"
  | "TICKET_CHECKIN_EVIDENCE"
  | "PRODUCTION_RIDER_FULFILLED"
  | "ADMIN_RESOLUTION"
  | "PROOF_MEDIA_RECORD";

export interface EvidenceItem {
  type: CompletionEvidenceType;
  referenceId?: string | null;
  recordedAt: string | Date;
  submittedByUserId: string;
  notes?: string | null;
}

export interface PerformerCompletionEvidenceBundle {
  assignmentId: string;
  performerUserId: string;
  eventId: string;
  items: EvidenceItem[];
  performerStartedAt?: string | Date | null;
  performerEndedAt?: string | Date | null;
  venueConfirmedAt?: string | Date | null;
  performerConfirmedAt?: string | Date | null;
  attendanceCount?: number | null;
  ticketsScannedCount?: number | null;
  travelFulfilled?: boolean | null;
  lodgingFulfilled?: boolean | null;
  hospitalityFulfilled?: boolean | null;
}

export type ObligationTrackingStatus =
  | "REQUIRED"
  | "NOT_REQUIRED"
  | "UNSPECIFIED";

export type ObligationDeliveryState =
  | "PENDING"
  | "FULFILLED"
  | "WAIVED"
  | "UNFULFILLED"
  | "DISPUTED"
  | "UNSPECIFIED";

export interface ObligationTrackingItem {
  status: ObligationTrackingStatus;
  deliveryState: ObligationDeliveryState;
  notes?: string | null;
}

export interface ObligationTrackingBundle {
  travel: ObligationTrackingItem;
  lodging: ObligationTrackingItem;
  hospitality: ObligationTrackingItem;
  technicalRider: {
    status: "NOT_SUBMITTED" | "SUBMITTED" | "ADVANCED" | "FULFILLED" | "UNSPECIFIED";
    notes?: string | null;
  };
}

export interface SettlementReadinessSignal {
  readyForSettlement: boolean;
  status: "VERIFIED_FULFILLMENT_READY_FOR_SETTLEMENT" | "NOT_READY" | "BLOCKED";
  assignmentId: string;
  performerUserId: string;
  eventId: string;
  snapshotId?: string | null;
  verifiedAt?: string | Date | null;
  reasons: string[];
}

export interface EventAggregationResult {
  eventId: string;
  eventStatus: "IN_PROGRESS" | "COMPLETED_FULFILLED" | "PARTIALLY_FULFILLED" | "UNFULFILLED";
  totalAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  noShowAssignments: number;
  pendingAssignments: number;
}


export type SettlementCalculationStatus =
  | "CALCULATED"
  | "FINALIZED"
  | "BLOCKED_ENTRY_GATE"
  | "BLOCKED_COMMISSION_POLICY_UNRESOLVED"
  | "BLOCKED_INCOMPLETE_ECONOMIC_TERMS"
  | "BLOCKED_DISPUTES_OR_REFUNDS"
  | "MANUAL_REVIEW_REQUIRED";

export interface RecoupableItem {
  id: string;
  type: string;
  description: string;
  amountCents: number;
  contractuallyAuthorized: boolean;
  evidenceReference?: string | null;
  responsibleParty: "PERFORMER" | "VENUE" | "PROMOTER";
}

export interface SettlementAuditTrail {
  calculatedAt: string | Date;
  calculationVersion: string;
  calculationHash: string;
  rulesApplied: string[];
  reasons: string[];
}

export interface PerformerSettlementQuote {
  settlementId: string;
  eventId: string;
  assignmentId: string;
  performerUserId: string;
  venueUserId: string;
  snapshotId: string;
  currency: string;
  status: SettlementCalculationStatus;
  compensationType: string;
  guaranteeCents: number;
  backendShareCents: number;
  bonusCents: number;
  grossEarnedCents: number;
  authorizedRecoupablesCents: number;
  commissionPercent: number | null;
  commissionCents: number;
  refundsDisputesAdjustmentCents: number;
  netPayableToPerformerCents: number;
  venueTotalObligationCents: number;
  platformRetainedCents: number;
  recoupablesDetail: RecoupableItem[];
  auditTrail: SettlementAuditTrail;
  readyForPayout: boolean;
  payoutExecuted: false;
}

// ─── P0-B5 Stripe Connect Payout Rail Contracts ─────────────────────────────

export type ConnectedAccountReadinessState =
  | "NOT_CONNECTED"
  | "ONBOARDING_REQUIRED"
  | "REQUIREMENTS_PENDING"
  | "RESTRICTED"
  | "READY_FOR_PAYOUT"
  | "DISABLED";

export interface PerformerConnectedAccount {
  performerUserId: string;
  stripeAccountId: string;
  readinessState: ConnectedAccountReadinessState;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  currentlyDueRequirements: string[];
  kycStatus: "VERIFIED" | "PENDING" | "FAILED" | "UNSPECIFIED";
  verifiedAt?: string | Date | null;
}

export type PayoutLifecycleStatus =
  | "CALCULATED"
  | "REVIEWABLE"
  | "FINALIZED"
  | "PAYOUT_READY"
  | "HOLD_MANUAL_REVIEW"
  | "TRANSFER_SUBMITTED"
  | "TRANSFER_CONFIRMED"
  | "TRANSFER_FAILED"
  | "REVERSED"
  | "BLOCKED_KILL_SWITCH"
  | "BLOCKED_ENTRY_GATE"
  | "BLOCKED_DESTINATION_NOT_READY"
  | "BLOCKED_LIVE_MODE_FIREWALL"
  | "ZERO_SETTLEMENT_NO_TRANSFER_REQUIRED";

export interface PayoutAuditChain {
  bookingOfferId: string;
  snapshotId: string;
  eventId: string;
  assignmentId: string;
  fulfillmentStatus: string;
  settlementId: string;
  calculationHash: string;
  performerUserId: string;
  connectedAccountId: string;
  stripeTransferId?: string | null;
  webhookEventId?: string | null;
  confirmedAt?: string | Date | null;
}

export interface PayoutExecutionRecord {
  payoutExecutionId: string;
  settlementId: string;
  assignmentId: string;
  performerUserId: string;
  connectedAccountId: string;
  currency: string;
  amountCents: number;
  stripeTransferId?: string | null;
  idempotencyKey: string;
  executionStatus: PayoutLifecycleStatus;
  attemptCount: number;
  failureCode?: string | null;
  failureReason?: string | null;
  submittedAt?: string | Date | null;
  confirmedAt?: string | Date | null;
  failedAt?: string | Date | null;
  reversedAt?: string | Date | null;
  auditTrail: PayoutAuditChain;
}

