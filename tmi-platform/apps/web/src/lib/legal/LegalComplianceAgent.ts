/**
 * LegalComplianceAgent — advise / classify / prepare only.
 * NEVER approve disclosure. NEVER deliver records.
 * Hard-blocked methods throw / return denied.
 */

import { appendLegalAuditEvent } from "./LegalAuditLedger";
import type { LegalCaseRecord, LegalDataCategory } from "./types";

export type AgentAdvisory = {
  caseId: string;
  classification: string;
  flags: string[];
  preparationNotes: string[];
  /** Always false — agent cannot approve. */
  canApprove: false;
  canDisclose: false;
};

export function classifyLegalCase(caseRecord: LegalCaseRecord): AgentAdvisory {
  const flags: string[] = [];
  if (caseRecord.authorityState !== "VERIFIED") {
    flags.push("AUTHORITY_NOT_VERIFIED");
  }
  if (caseRecord.approvalDecision !== "APPROVED") {
    flags.push("HUMAN_APPROVAL_PENDING");
  }
  if (caseRecord.requestedCategories.includes("AUTH")) {
    flags.push("AUTH_CATEGORY_REQUESTED_SENSITIVE");
  }
  if (caseRecord.isSynthetic) {
    flags.push("SYNTHETIC_CERTIFICATION_CASE");
  }
  if (caseRecord.kind === "EMERGENCY_DISCLOSURE") {
    flags.push("EMERGENCY_PRIORITY_REVIEW");
  }

  const advisory: AgentAdvisory = {
    caseId: caseRecord.caseId,
    classification: caseRecord.kind,
    flags,
    preparationNotes: [
      "Agent prepared classification flags only.",
      "Counsel/human must verify authority and approve any disclosure package.",
      "This output is not legal advice.",
    ],
    canApprove: false,
    canDisclose: false,
  };

  appendLegalAuditEvent({
    caseId: caseRecord.caseId,
    type: "AGENT_ADVISORY",
    actor: "LegalComplianceAgent",
    detail: `Classified ${caseRecord.kind}; flags=${flags.join(",") || "none"}`,
    meta: { canApprove: false, canDisclose: false },
  });

  return advisory;
}

export function suggestCategoryScope(
  requested: LegalDataCategory[],
): { suggested: LegalDataCategory[]; note: string } {
  // Agent may suggest narrowing; never expanding past request
  const suggested = requested.filter((c) => c !== "AUTH");
  return {
    suggested,
    note: "Suggested least-privilege prep excluding AUTH secrets. Not an approval.",
  };
}

/** Hard block — agent cannot approve. */
export function approveDisclosure(): never {
  throw new Error(
    "LegalComplianceAgent hard block: approveDisclosure is forbidden. Humans/counsel approve only.",
  );
}

/** Hard block — agent cannot disclose/deliver. */
export function discloseRecords(): never {
  throw new Error(
    "LegalComplianceAgent hard block: discloseRecords is forbidden. Delivery requires HumanApprovalGate.",
  );
}

/** Soft API for mistaken callers — always denied. */
export function attemptApproveDisclosure(_caseId: string, _actor: string): {
  ok: false;
  error: string;
} {
  appendLegalAuditEvent({
    caseId: _caseId,
    type: "DELIVERY_BLOCKED",
    actor: "LegalComplianceAgent",
    detail: "Blocked agent approve attempt",
    meta: { requestedActor: _actor },
  });
  return {
    ok: false,
    error: "LegalComplianceAgent cannot approve disclosure.",
  };
}
