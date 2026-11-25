/**
 * BookingCancellationPolicy authority — policy-driven, no invented fee %.
 * PRODUCT_POLICY_REQUIRED when production amounts are unset.
 */

import { appendFinancialAudit } from "./financialAuditLedger";

export type CancellationParty = "PERFORMER" | "PROMOTER" | "VENUE" | "MUTUAL" | "SYSTEM";

export type CancellationWindow =
  | "FLEXIBLE"
  | "EARLY"
  | "STANDARD"
  | "LATE"
  | "DAY_OF"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "NO_SHOW";

export type BookingCancellationPolicyConfig = {
  policyId: string;
  policyVersion: string;
  /** Fee basis points or cents — null means PRODUCT_POLICY_REQUIRED */
  feeByWindow: Partial<Record<CancellationWindow, number | null>>;
  feeUnit: "BPS" | "CENTS" | "UNSET";
  allowRescheduleFirst: boolean;
};

export type BookingCancellationEvaluation = {
  bookingId: string;
  cancellingParty: CancellationParty;
  window: CancellationWindow;
  policyId: string;
  policyVersion: string;
  feeApplicable: boolean;
  feeAmount: number | null;
  feeUnit: "BPS" | "CENTS" | "UNSET";
  refundEligibility: "FULL" | "PARTIAL" | "NONE" | "REVIEW";
  settlementConsequence: "HOLD" | "RECALC" | "NONE" | "ADMIN_REVIEW";
  productPolicyRequired: boolean;
  reason: string;
  evaluatedAt: string;
};

const DEFAULT_POLICY: BookingCancellationPolicyConfig = {
  policyId: "tmi-booking-cancel-v0",
  policyVersion: "0.0.0-unset",
  feeUnit: "UNSET",
  feeByWindow: {
    FLEXIBLE: null,
    EARLY: null,
    STANDARD: null,
    LATE: null,
    DAY_OF: null,
    IN_TRANSIT: null,
    ARRIVED: null,
    NO_SHOW: null,
  },
  allowRescheduleFirst: true,
};

let activePolicy: BookingCancellationPolicyConfig = { ...DEFAULT_POLICY };
const evaluations: BookingCancellationEvaluation[] = [];

export function getBookingCancellationPolicy(): BookingCancellationPolicyConfig {
  return { ...activePolicy, feeByWindow: { ...activePolicy.feeByWindow } };
}

/** Test/fixture only — never invent production economics via this without explicit policy. */
export function setBookingCancellationPolicyForTests(
  policy: BookingCancellationPolicyConfig,
): void {
  activePolicy = {
    ...policy,
    feeByWindow: { ...policy.feeByWindow },
  };
}

export function resetBookingCancellationPolicyToUnset(): void {
  activePolicy = {
    ...DEFAULT_POLICY,
    feeByWindow: { ...DEFAULT_POLICY.feeByWindow },
  };
}

export function resolveCancellationWindow(input: {
  cancelledAtMs: number;
  eventStartAtMs: number;
  performerTravelStarted?: boolean;
  performerArrived?: boolean;
  noShowVerified?: boolean;
}): CancellationWindow {
  if (input.noShowVerified) return "NO_SHOW";
  if (input.performerArrived) return "ARRIVED";
  if (input.performerTravelStarted) return "IN_TRANSIT";
  const hours = (input.eventStartAtMs - input.cancelledAtMs) / (1000 * 60 * 60);
  if (hours < 0) return "DAY_OF";
  if (hours < 24) return "DAY_OF";
  if (hours < 72) return "LATE";
  if (hours < 168) return "STANDARD";
  if (hours < 720) return "EARLY";
  return "FLEXIBLE";
}

export function evaluateBookingCancellation(input: {
  bookingId: string;
  cancellingParty: CancellationParty;
  cancelledAtMs: number;
  eventStartAtMs: number;
  performerTravelStarted?: boolean;
  performerArrived?: boolean;
  noShowVerified?: boolean;
  reason: string;
  actor?: string;
}): BookingCancellationEvaluation {
  const window = resolveCancellationWindow(input);
  const feeRaw = activePolicy.feeByWindow[window];
  const productPolicyRequired =
    activePolicy.feeUnit === "UNSET" || feeRaw === null || feeRaw === undefined;

  const evalRow: BookingCancellationEvaluation = {
    bookingId: input.bookingId,
    cancellingParty: input.cancellingParty,
    window,
    policyId: activePolicy.policyId,
    policyVersion: activePolicy.policyVersion,
    feeApplicable: !productPolicyRequired && typeof feeRaw === "number" && feeRaw > 0,
    feeAmount: productPolicyRequired ? null : (feeRaw as number),
    feeUnit: activePolicy.feeUnit,
    refundEligibility: productPolicyRequired
      ? "REVIEW"
      : input.cancellingParty === "MUTUAL"
        ? "FULL"
        : "PARTIAL",
    settlementConsequence: productPolicyRequired ? "ADMIN_REVIEW" : "RECALC",
    productPolicyRequired,
    reason: input.reason,
    evaluatedAt: new Date().toISOString(),
  };

  evaluations.push(evalRow);
  appendFinancialAudit({
    actor: input.actor ?? "bookingCancellationPolicyAuthority",
    action: "SETTLEMENT_STATE",
    bookingId: input.bookingId,
    reason: `cancel_eval:${window}:${input.cancellingParty}`,
    metadata: { evaluation: evalRow },
    newState: productPolicyRequired ? "PRODUCT_POLICY_REQUIRED" : "CANCEL_EVALUATED",
  });
  return evalRow;
}

export function listCancellationEvaluations(): BookingCancellationEvaluation[] {
  return [...evaluations];
}

export function __resetCancellationPolicyForTests(): void {
  evaluations.length = 0;
  resetBookingCancellationPolicyToUnset();
}
