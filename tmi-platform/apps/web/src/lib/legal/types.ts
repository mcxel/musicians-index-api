/**
 * TMI Global Legal, Privacy & Records Command — shared types.
 * Disclosure rule: Automation prepares. Authority verifies. Policy scopes.
 * Humans approve. The system securely delivers. The ledger proves what happened.
 *
 * This is Defensible Compliance & Accountability tooling — not legal advice.
 */

export type AuthorityVerificationState =
  | "UNVERIFIED"
  | "IDENTITY_VERIFIED"
  | "DOCUMENTS_PENDING"
  | "LEGAL_REVIEW_REQUIRED"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export type DisclosureCaseStatus =
  | "INTAKE"
  | "AUTHORITY_CHECK"
  | "POLICY_SCOPED"
  | "HOLD_ACTIVE"
  | "PACKAGE_DRAFT"
  | "AWAITING_HUMAN_APPROVAL"
  | "APPROVED"
  | "DELIVERED"
  | "DENIED"
  | "CLOSED";

export type LegalDataCategory =
  | "ACCOUNT"
  | "AUTH"
  | "LIVE"
  | "COMM"
  | "MEDIA"
  | "COMPETITION"
  | "COMMERCE"
  | "AUDIT";

export type LegalRequestKind =
  | "GOVERNMENT_DISCLOSURE"
  | "PRIVACY_RIGHTS"
  | "EMERGENCY_DISCLOSURE"
  | "INTERNAL_HOLD"
  | "SYNTHETIC_CERTIFICATION";

export type LegalAuditEventType =
  | "CASE_CREATED"
  | "INTAKE_RECEIVED"
  | "AUTHORITY_STATE_CHANGED"
  | "POLICY_APPLIED"
  | "HOLD_PLACED"
  | "HOLD_RELEASED"
  | "CATALOG_SCOPED"
  | "MINIMIZATION_APPLIED"
  | "PACKAGE_DRAFTED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_DENIED"
  | "DELIVERY_ATTEMPTED"
  | "DELIVERY_BLOCKED"
  | "DELIVERY_COMPLETED"
  | "PRIVACY_REQUEST_RECEIVED"
  | "EMERGENCY_PROTOCOL_ENTERED"
  | "AGENT_ADVISORY"
  | "SYNTHETIC_EXERCISE"
  | "LEDGER_RECONSTRUCTED"
  | "COPYRIGHT_COMPLAINT_RECEIVED"
  | "COPYRIGHT_COMPLAINT_ADVANCED"
  | "RIGHTS_DECISION"
  | "CLAIM_DISPUTE_DRAFTED"
  | "QUICK_CLAIM_FILED"
  | "DISPUTE_OPENED"
  | "TAKEDOWN_ADVANCED"
  | "COUNTER_NOTICE_FILED"
  | "REPEAT_INFRINGER_STRIKE";

export type ApprovalDecision = "PENDING" | "APPROVED" | "DENIED";

export type CorporateRecordKind =
  | "FORMATION_ARTICLES"
  | "OPERATING_AGREEMENT"
  | "POLICY_DOCUMENT"
  | "COUNSEL_MEMO"
  | "INSURANCE_CERTIFICATE"
  | "TAX_REGISTRATION"
  | "VENDOR_AGREEMENT"
  | "OTHER";

export type LegalCaseRecord = {
  caseId: string;
  kind: LegalRequestKind;
  status: DisclosureCaseStatus;
  createdAt: string;
  updatedAt: string;
  /** Requesting authority / agency label (intake metadata only). */
  requesterLabel: string;
  requesterEmail: string;
  jurisdictionCode: string;
  legalBasisSummary: string;
  /** Synthetic flag — never real user PII for certification exercises. */
  isSynthetic: boolean;
  subjectAccountHint?: string;
  requestedCategories: LegalDataCategory[];
  allowedCategories: LegalDataCategory[];
  authorityState: AuthorityVerificationState;
  authorityNotes: string[];
  policyVersionIds: string[];
  holdIds: string[];
  packageId?: string;
  approvalDecision: ApprovalDecision;
  approvedBy?: string;
  approvedAt?: string;
  deliveredAt?: string;
  deliveryBlockedReason?: string;
  agentFlags: string[];
};

export type LegalHoldRecord = {
  holdId: string;
  caseId: string;
  categories: LegalDataCategory[];
  reason: string;
  placedAt: string;
  placedBy: string;
  releasedAt?: string;
  active: boolean;
};

export type DisclosurePackageManifest = {
  packageId: string;
  caseId: string;
  createdAt: string;
  policyVersionIds: string[];
  requestedCategories: LegalDataCategory[];
  includedCategories: LegalDataCategory[];
  excludedCategories: LegalDataCategory[];
  minimizationNotes: string[];
  /** Catalog references only — never raw secrets or unrestricted dumps. */
  catalogRefs: Array<{
    category: LegalDataCategory;
    sourceLabel: string;
    prismaModels: string[];
    filePaths: string[];
    accessMode: "METADATA_INDEX" | "SCOPED_EXPORT" | "BLOCKED";
  }>;
  approvalRequired: true;
  approvalDecision: ApprovalDecision;
  humanGateMessage: string;
};

export type LegalAuditEvent = {
  eventId: string;
  caseId: string | null;
  type: LegalAuditEventType;
  actor: string;
  at: string;
  detail: string;
  previousHash: string;
  eventHash: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type PrivacyRequestRecord = {
  requestId: string;
  caseId: string;
  createdAt: string;
  requesterEmail: string;
  requestType: "ACCESS" | "DELETE" | "CORRECT" | "EXPORT" | "OPT_OUT";
  status: "RECEIVED" | "IN_REVIEW" | "FULFILLED" | "DENIED" | "CLOSED";
  notes: string;
};

export type CorporateRecordMeta = {
  recordId: string;
  kind: CorporateRecordKind;
  title: string;
  description: string;
  version: string;
  storedAt: string;
  /** Path or label inside encrypted, logically isolated Legal Vault — never secret values. */
  vaultLocator: string;
  containsSecrets: false;
  counselReviewed: boolean;
  tags: string[];
};

export type JurisdictionPolicy = {
  policyId: string;
  version: string;
  jurisdictionCode: string;
  title: string;
  /** Counsel-reviewed placeholder — AI must not invent law. */
  summary: string;
  counselReviewedPlaceholder: true;
  effectiveAt: string;
  allowedCategoriesDefault: LegalDataCategory[];
  requiresCounselReview: boolean;
  emergencyOverrideAllowed: boolean;
};

export type CollapsedLegalSummary = {
  openCases: number;
  awaitingApproval: number;
  holdsActive: number;
  privacyOpen: number;
  ledgerEvents: number;
  /** Copyright complaints open — collapsed count only. */
  copyrightOpen: number;
  /** Never expose case titles/subjects on Observatory. */
  sensitiveDetailsExposed: false;
};
