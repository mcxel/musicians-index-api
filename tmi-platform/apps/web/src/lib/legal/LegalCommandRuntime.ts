/**
 * LegalCommandRuntime — vertical slice orchestrator for Legal Command Center.
 *
 * Flow: intake → case → authority states → policy scope → hold → minimize →
 * package draft → AWAITING_HUMAN_APPROVAL → (human approve) → deliver.
 *
 * Forbidden: auto-release without human/counsel approval.
 */

import {
  evaluateAuthoritySignals,
  canProceedPastAuthorityGate,
  type AuthoritySignal,
} from "./AuthorityVerificationEngine";
import { generateLegalCaseId } from "./caseId";
import { classifyLegalCase } from "./LegalComplianceAgent";
import { applyDataMinimization } from "./DataMinimizationFirewall";
import {
  buildDisclosurePackageDraft,
  getDisclosurePackage,
  markPackageApproval,
} from "./DisclosurePackageBuilder";
import { enqueueDisclosureNotification } from "./DisclosureNotificationEngine";
import { enterEmergencyDisclosureProtocol } from "./EmergencyDisclosureProtocol";
import {
  assertCanApprove,
  checkDeliveryGate,
  statusAfterApproval,
} from "./HumanApprovalGate";
import { scopeCategoriesByPolicy } from "./JurisdictionPolicyRegistry";
import {
  appendLegalAuditEvent,
  getLedgerEventCount,
  listLegalAuditEvents,
  reconstructCaseFromLedger,
  verifyLegalAuditChain,
} from "./LegalAuditLedger";
import { countActiveHolds, listActiveHolds, placeLegalHold } from "./LegalHoldEngine";
import { countOpenPrivacyRequests } from "./PrivacyRequestEngine";
import type {
  CollapsedLegalSummary,
  DisclosureCaseStatus,
  LegalCaseRecord,
  LegalDataCategory,
  LegalRequestKind,
} from "./types";

type CaseStore = { cases: Map<string, LegalCaseRecord> };

function store(): CaseStore {
  const g = globalThis as typeof globalThis & { __tmiLegalCaseStore?: CaseStore };
  if (!g.__tmiLegalCaseStore) g.__tmiLegalCaseStore = { cases: new Map() };
  return g.__tmiLegalCaseStore;
}

function touch(c: LegalCaseRecord): LegalCaseRecord {
  c.updatedAt = new Date().toISOString();
  return c;
}

function cloneCase(c: LegalCaseRecord): LegalCaseRecord {
  return {
    ...c,
    requestedCategories: [...c.requestedCategories],
    allowedCategories: [...c.allowedCategories],
    authorityNotes: [...c.authorityNotes],
    policyVersionIds: [...c.policyVersionIds],
    holdIds: [...c.holdIds],
    agentFlags: [...c.agentFlags],
  };
}

export type IntakeInput = {
  kind?: LegalRequestKind;
  requesterLabel: string;
  requesterEmail: string;
  jurisdictionCode: string;
  legalBasisSummary: string;
  requestedCategories: LegalDataCategory[];
  subjectAccountHint?: string;
  isSynthetic?: boolean;
  emergency?: boolean;
  /** Optional initial authority signals (badge/email alone never → VERIFIED). */
  authoritySignals?: Partial<AuthoritySignal>;
};

/**
 * Government / legal intake — creates case, scopes policy, places hold,
 * builds package draft, and STOPS at AWAITING_HUMAN_APPROVAL.
 */
export function createDisclosureCaseFromIntake(input: IntakeInput): LegalCaseRecord {
  const caseId = generateLegalCaseId();
  const now = new Date().toISOString();
  const kind: LegalRequestKind = input.emergency
    ? "EMERGENCY_DISCLOSURE"
    : input.isSynthetic
      ? "SYNTHETIC_CERTIFICATION"
      : input.kind ?? "GOVERNMENT_DISCLOSURE";

  const signals: AuthoritySignal = {
    hasBadgeClaim: Boolean(input.authoritySignals?.hasBadgeClaim),
    hasEmailClaim: Boolean(input.authoritySignals?.hasEmailClaim ?? true),
    identityDocumentReceived: Boolean(input.authoritySignals?.identityDocumentReceived),
    agencyRosterMatch: Boolean(input.authoritySignals?.agencyRosterMatch),
    counselReviewed: Boolean(input.authoritySignals?.counselReviewed),
    expired: Boolean(input.authoritySignals?.expired),
    rejected: Boolean(input.authoritySignals?.rejected),
  };
  const auth = evaluateAuthoritySignals(signals);

  const { policy, allowed } = scopeCategoriesByPolicy(
    input.jurisdictionCode,
    input.requestedCategories,
  );

  const record: LegalCaseRecord = {
    caseId,
    kind,
    status: "INTAKE",
    createdAt: now,
    updatedAt: now,
    requesterLabel: input.requesterLabel.trim() || "Unknown requester",
    requesterEmail: input.requesterEmail.trim().toLowerCase(),
    jurisdictionCode: input.jurisdictionCode.trim().toUpperCase() || "GLOBAL-DEFAULT",
    legalBasisSummary: input.legalBasisSummary.trim() || "Not specified",
    isSynthetic: Boolean(input.isSynthetic),
    subjectAccountHint: input.isSynthetic
      ? input.subjectAccountHint ?? "synthetic-account-001"
      : input.subjectAccountHint,
    requestedCategories: [...input.requestedCategories],
    allowedCategories: [...allowed],
    authorityState: auth.state,
    authorityNotes: [...auth.reasons],
    policyVersionIds: [`${policy.policyId}@${policy.version}`],
    holdIds: [],
    approvalDecision: "PENDING",
    agentFlags: [],
  };

  appendLegalAuditEvent({
    caseId,
    type: "CASE_CREATED",
    actor: "legal-intake",
    detail: `Case created (${kind}) for ${record.requesterLabel}`,
    meta: { jurisdiction: record.jurisdictionCode, synthetic: record.isSynthetic },
  });
  appendLegalAuditEvent({
    caseId,
    type: "INTAKE_RECEIVED",
    actor: "legal-intake",
    detail: `Intake received · basis: ${record.legalBasisSummary.slice(0, 160)}`,
  });
  appendLegalAuditEvent({
    caseId,
    type: "AUTHORITY_STATE_CHANGED",
    actor: "AuthorityVerificationEngine",
    detail: `State → ${auth.state}`,
    meta: { disclosureEligible: auth.disclosureEligible },
  });
  appendLegalAuditEvent({
    caseId,
    type: "POLICY_APPLIED",
    actor: "JurisdictionPolicyRegistry",
    detail: `Applied ${policy.policyId}@${policy.version} (counsel-reviewed placeholder)`,
    meta: { allowedCount: allowed.length },
  });

  record.status = "POLICY_SCOPED";

  const hold = placeLegalHold({
    caseId,
    categories: allowed.length > 0 ? allowed : ["ACCOUNT", "AUDIT"],
    reason: "Automatic hold on intake — preserve scoped categories pending review",
    placedBy: "LegalHoldEngine",
  });
  record.holdIds.push(hold.holdId);
  record.status = "HOLD_ACTIVE";
  appendLegalAuditEvent({
    caseId,
    type: "HOLD_PLACED",
    actor: "LegalHoldEngine",
    detail: `Hold ${hold.holdId} placed`,
    meta: { categories: hold.categories.join(",") },
  });

  const min = applyDataMinimization({
    requested: record.requestedCategories,
    policyAllowed: record.allowedCategories,
    holdCategories: hold.categories,
  });
  appendLegalAuditEvent({
    caseId,
    type: "MINIMIZATION_APPLIED",
    actor: "DataMinimizationFirewall",
    detail: `Included ${min.included.join(",") || "none"}; excluded ${min.excluded.join(",") || "none"}`,
  });
  appendLegalAuditEvent({
    caseId,
    type: "CATALOG_SCOPED",
    actor: "LegalDataCatalog",
    detail: "Catalog refs resolved for minimized categories (index only)",
  });

  const pkg = buildDisclosurePackageDraft({
    caseId,
    policyVersionIds: record.policyVersionIds,
    requestedCategories: record.requestedCategories,
    includedCategories: min.included,
    excludedCategories: min.excluded,
    minimizationNotes: min.notes,
  });
  record.packageId = pkg.packageId;
  record.status = "PACKAGE_DRAFT";
  appendLegalAuditEvent({
    caseId,
    type: "PACKAGE_DRAFTED",
    actor: "DisclosurePackageBuilder",
    detail: `Package ${pkg.packageId} drafted — approvalRequired=true`,
  });

  // Hard stop — awaiting human approval (even if authority somehow VERIFIED)
  record.status = "AWAITING_HUMAN_APPROVAL";
  record.approvalDecision = "PENDING";
  appendLegalAuditEvent({
    caseId,
    type: "APPROVAL_REQUESTED",
    actor: "HumanApprovalGate",
    detail: "Package draft blocked until human/counsel approval",
  });

  enqueueDisclosureNotification({
    caseId,
    channel: "AUDIT_ONLY",
    template: "approval_requested",
    recipientHint: "counsel-queue",
    body: `Case ${caseId} awaits human/counsel approval. No records released.`,
  });

  if (input.emergency) {
    const em = enterEmergencyDisclosureProtocol(record, "Emergency flag on intake");
    appendLegalAuditEvent({
      caseId,
      type: "EMERGENCY_PROTOCOL_ENTERED",
      actor: "EmergencyDisclosureProtocol",
      detail: em.message.slice(0, 240),
    });
  }

  const advisory = classifyLegalCase(record);
  record.agentFlags = [...advisory.flags];

  // If authority not verified, note AUTHORITY_CHECK was part of path
  if (!canProceedPastAuthorityGate(record.authorityState)) {
    record.status = "AWAITING_HUMAN_APPROVAL";
  }

  store().cases.set(caseId, record);
  return cloneCase(record);
}

export function getLegalCase(caseId: string): LegalCaseRecord | null {
  const hit = store().cases.get(caseId);
  return hit ? cloneCase(hit) : null;
}

export function listLegalCases(limit = 100): LegalCaseRecord[] {
  return Array.from(store().cases.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(cloneCase);
}

export function advanceAuthorityVerification(
  caseId: string,
  signals: AuthoritySignal,
  actor: string,
): LegalCaseRecord | { error: string } {
  const record = store().cases.get(caseId);
  if (!record) return { error: "Case not found" };
  const auth = evaluateAuthoritySignals(signals);
  record.authorityState = auth.state;
  record.authorityNotes = [...auth.reasons];
  record.status = "AUTHORITY_CHECK";
  touch(record);
  appendLegalAuditEvent({
    caseId,
    type: "AUTHORITY_STATE_CHANGED",
    actor,
    detail: `State → ${auth.state}`,
    meta: { disclosureEligible: auth.disclosureEligible },
  });
  // Never auto-approve or deliver on VERIFIED
  if (record.approvalDecision === "PENDING") {
    record.status = "AWAITING_HUMAN_APPROVAL";
  }
  return cloneCase(record);
}

export function approveDisclosureCase(input: {
  caseId: string;
  actor: string;
  decision: "APPROVED" | "DENIED";
  note?: string;
}): LegalCaseRecord | { error: string } {
  const gate = assertCanApprove(input.actor);
  if (!gate.allowed) return { error: gate.reason };

  const record = store().cases.get(input.caseId);
  if (!record) return { error: "Case not found" };

  record.approvalDecision = input.decision;
  record.approvedBy = input.actor.trim();
  record.approvedAt = new Date().toISOString();
  record.status = statusAfterApproval(input.decision);
  touch(record);

  if (record.packageId) {
    markPackageApproval(record.packageId, input.decision);
  }

  appendLegalAuditEvent({
    caseId: input.caseId,
    type: input.decision === "APPROVED" ? "APPROVAL_GRANTED" : "APPROVAL_DENIED",
    actor: input.actor,
    detail: input.note?.trim() || `Human decision: ${input.decision}`,
  });

  enqueueDisclosureNotification({
    caseId: input.caseId,
    channel: "AUDIT_ONLY",
    template: input.decision === "APPROVED" ? "approval_granted" : "approval_denied",
    recipientHint: record.requesterEmail,
    body: `Case ${input.caseId} decision: ${input.decision}`,
  });

  return cloneCase(record);
}

/**
 * Attempt delivery — blocked unless HumanApprovalGate + VERIFIED authority.
 */
export function deliverDisclosurePackage(input: {
  caseId: string;
  actor: string;
}): { ok: true; case: LegalCaseRecord } | { ok: false; error: string; case?: LegalCaseRecord } {
  const record = store().cases.get(input.caseId);
  if (!record) return { ok: false, error: "Case not found" };

  appendLegalAuditEvent({
    caseId: input.caseId,
    type: "DELIVERY_ATTEMPTED",
    actor: input.actor,
    detail: "Delivery attempted",
  });

  const gate = checkDeliveryGate(record);
  if (!gate.allowed) {
    record.deliveryBlockedReason = gate.reason;
    touch(record);
    appendLegalAuditEvent({
      caseId: input.caseId,
      type: "DELIVERY_BLOCKED",
      actor: "HumanApprovalGate",
      detail: gate.reason,
    });
    return { ok: false, error: gate.reason, case: cloneCase(record) };
  }

  // Synthetic or approved path — mark delivered (manifest delivery record only; no live DB dump)
  record.status = "DELIVERED";
  record.deliveredAt = new Date().toISOString();
  record.deliveryBlockedReason = undefined;
  touch(record);
  appendLegalAuditEvent({
    caseId: input.caseId,
    type: "DELIVERY_COMPLETED",
    actor: input.actor,
    detail: `Secure delivery recorded for package ${record.packageId} (scoped manifest; no unrestricted DB access)`,
  });

  return { ok: true, case: cloneCase(record) };
}

export function getCollapsedLegalSummary(): CollapsedLegalSummary {
  const cases = Array.from(store().cases.values());
  const openStatuses: DisclosureCaseStatus[] = [
    "INTAKE",
    "AUTHORITY_CHECK",
    "POLICY_SCOPED",
    "HOLD_ACTIVE",
    "PACKAGE_DRAFT",
    "AWAITING_HUMAN_APPROVAL",
    "APPROVED",
  ];
  return {
    openCases: cases.filter((c) => openStatuses.includes(c.status)).length,
    awaitingApproval: cases.filter((c) => c.status === "AWAITING_HUMAN_APPROVAL").length,
    holdsActive: countActiveHolds(),
    privacyOpen: countOpenPrivacyRequests(),
    ledgerEvents: getLedgerEventCount(),
    sensitiveDetailsExposed: false,
  };
}

/**
 * Synthetic certification path — end-to-end exercise on synthetic accounts only.
 * Reconstructs from audit ledger after the run.
 */
export function runSyntheticCertificationExercise(actor: string): {
  ok: boolean;
  caseId: string;
  steps: string[];
  blockedBeforeApproval: boolean;
  deliveredAfterApproval: boolean;
  ledgerReconstruction: ReturnType<typeof reconstructCaseFromLedger>;
  chain: ReturnType<typeof verifyLegalAuditChain>;
  error?: string;
} {
  const steps: string[] = [];

  const created = createDisclosureCaseFromIntake({
    kind: "SYNTHETIC_CERTIFICATION",
    requesterLabel: "Synthetic Cert Authority",
    requesterEmail: "synthetic-cert@tmi.local",
    jurisdictionCode: "US-FED",
    legalBasisSummary: "Synthetic certification exercise — not a real warrant",
    requestedCategories: ["ACCOUNT", "AUTH", "AUDIT", "COMMERCE"],
    subjectAccountHint: "synthetic-account-cert-001",
    isSynthetic: true,
    authoritySignals: {
      hasBadgeClaim: true,
      hasEmailClaim: true,
      identityDocumentReceived: false,
      agencyRosterMatch: false,
      counselReviewed: false,
    },
  });
  steps.push(`Created ${created.caseId} status=${created.status} authority=${created.authorityState}`);
  steps.push("Badge/email alone → not VERIFIED (expected)");

  // Attempt delivery before approval — must block
  const blocked = deliverDisclosurePackage({ caseId: created.caseId, actor: "system" });
  const blockedBeforeApproval = !blocked.ok;
  steps.push(
    blockedBeforeApproval
      ? `Pre-approval delivery blocked: ${"error" in blocked ? blocked.error : "blocked"}`
      : "FAIL: pre-approval delivery was not blocked",
  );

  // Advance authority to VERIFIED (human/counsel path simulation)
  const verified = advanceAuthorityVerification(
    created.caseId,
    {
      hasBadgeClaim: true,
      hasEmailClaim: true,
      identityDocumentReceived: true,
      agencyRosterMatch: true,
      counselReviewed: true,
      expired: false,
      rejected: false,
    },
    actor,
  );
  if ("error" in verified) {
    return {
      ok: false,
      caseId: created.caseId,
      steps,
      blockedBeforeApproval,
      deliveredAfterApproval: false,
      ledgerReconstruction: reconstructCaseFromLedger(created.caseId),
      chain: verifyLegalAuditChain(),
      error: verified.error,
    };
  }
  steps.push(`Authority advanced → ${verified.authorityState}`);

  // Still blocked without human approval
  const stillBlocked = deliverDisclosurePackage({ caseId: created.caseId, actor });
  steps.push(
    !stillBlocked.ok
      ? "Delivery still blocked until human approval (expected)"
      : "FAIL: delivery allowed without approval",
  );

  const approved = approveDisclosureCase({
    caseId: created.caseId,
    actor,
    decision: "APPROVED",
    note: "Synthetic certification — human approval recorded",
  });
  if ("error" in approved) {
    return {
      ok: false,
      caseId: created.caseId,
      steps,
      blockedBeforeApproval,
      deliveredAfterApproval: false,
      ledgerReconstruction: reconstructCaseFromLedger(created.caseId),
      chain: verifyLegalAuditChain(),
      error: approved.error,
    };
  }
  steps.push(`Human approved by ${actor}`);

  const delivered = deliverDisclosurePackage({ caseId: created.caseId, actor });
  const deliveredAfterApproval = delivered.ok;
  steps.push(
    deliveredAfterApproval
      ? "Delivery completed after human approval"
      : `Delivery failed after approval: ${"error" in delivered ? delivered.error : "unknown"}`,
  );

  appendLegalAuditEvent({
    caseId: created.caseId,
    type: "SYNTHETIC_EXERCISE",
    actor,
    detail: "Synthetic certification exercise completed",
  });

  const reconstruction = reconstructCaseFromLedger(created.caseId);
  appendLegalAuditEvent({
    caseId: created.caseId,
    type: "LEDGER_RECONSTRUCTED",
    actor,
    detail: `Reconstructed ${reconstruction.events.length} events; chainOk=${reconstruction.chainOk}`,
  });
  steps.push(`Ledger reconstruct: ${reconstruction.events.length} events`);

  const chain = verifyLegalAuditChain();
  steps.push(chain.message);

  const ok =
    blockedBeforeApproval &&
    !stillBlocked.ok &&
    deliveredAfterApproval &&
    chain.ok &&
    created.isSynthetic;

  return {
    ok,
    caseId: created.caseId,
    steps,
    blockedBeforeApproval,
    deliveredAfterApproval,
    ledgerReconstruction: reconstruction,
    chain,
  };
}

export function getCasePackage(caseId: string) {
  return getDisclosurePackage(
    store().cases.get(caseId)?.packageId ?? "",
  ) ?? null;
}

export function getLegalRuntimeSnapshot() {
  return {
    summary: getCollapsedLegalSummary(),
    cases: listLegalCases(50),
    activeHolds: listActiveHolds(),
    recentLedger: listLegalAuditEvents({ limit: 40 }),
    chain: verifyLegalAuditChain(),
  };
}

export function __resetLegalCases(): void {
  store().cases.clear();
}
