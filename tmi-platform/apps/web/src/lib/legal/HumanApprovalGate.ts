/**
 * HumanApprovalGate — REQUIRED before any disclosure delivery.
 * Hard block: no auto-release of user records to government without human/counsel approval.
 */

import type { ApprovalDecision, DisclosureCaseStatus, LegalCaseRecord } from "./types";

export type GateCheckResult = {
  allowed: boolean;
  reason: string;
  requiresHumanApproval: true;
};

/** Delivery is allowed only when case is APPROVED and authority VERIFIED. */
export function checkDeliveryGate(caseRecord: LegalCaseRecord): GateCheckResult {
  if (caseRecord.approvalDecision !== "APPROVED") {
    return {
      allowed: false,
      reason:
        "Delivery blocked: Human/counsel approval has not been granted. " +
        "Automation prepares packages; humans approve disclosure.",
      requiresHumanApproval: true,
    };
  }
  if (caseRecord.authorityState !== "VERIFIED") {
    return {
      allowed: false,
      reason:
        "Delivery blocked: Authority state is not VERIFIED. " +
        "Badge/email alone never authorizes disclosure.",
      requiresHumanApproval: true,
    };
  }
  if (!caseRecord.packageId) {
    return {
      allowed: false,
      reason: "Delivery blocked: No disclosure package draft exists for this case.",
      requiresHumanApproval: true,
    };
  }
  if (caseRecord.status === "DELIVERED") {
    return {
      allowed: false,
      reason: "Delivery blocked: Case already marked delivered.",
      requiresHumanApproval: true,
    };
  }
  return {
    allowed: true,
    reason: "Human approval + verified authority + package present — delivery may proceed.",
    requiresHumanApproval: true,
  };
}

export function assertCanApprove(actor: string): GateCheckResult {
  const trimmed = actor.trim();
  if (!trimmed || trimmed.toLowerCase() === "system" || trimmed.toLowerCase() === "agent") {
    return {
      allowed: false,
      reason: "Approval blocked: LegalComplianceAgent and system actors cannot approve disclosure.",
      requiresHumanApproval: true,
    };
  }
  return {
    allowed: true,
    reason: "Actor may record a human/counsel approval decision.",
    requiresHumanApproval: true,
  };
}

export function statusAfterApproval(decision: ApprovalDecision): DisclosureCaseStatus {
  if (decision === "APPROVED") return "APPROVED";
  if (decision === "DENIED") return "DENIED";
  return "AWAITING_HUMAN_APPROVAL";
}
