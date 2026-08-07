/**
 * TMI Global Legal, Privacy & Records Command — public exports.
 * Complements TrustSafetyRuntime / EvidenceVault; does not replace them.
 */

export * from "./types";
export { generateLegalCaseId } from "./caseId";
export {
  appendLegalAuditEvent,
  listLegalAuditEvents,
  verifyLegalAuditChain,
  reconstructCaseFromLedger,
  getLedgerEventCount,
} from "./LegalAuditLedger";
export {
  evaluateAuthoritySignals,
  canProceedPastAuthorityGate,
  authorityStateLabel,
  isAuthorityVerificationState,
  type AuthoritySignal,
} from "./AuthorityVerificationEngine";
export {
  listJurisdictionPolicies,
  getJurisdictionPolicy,
  scopeCategoriesByPolicy,
  knownLegalDataCategories,
} from "./JurisdictionPolicyRegistry";
export {
  listLegalDataCatalog,
  getCatalogEntry,
  resolveCatalogRefs,
} from "./LegalDataCatalog";
export {
  placeLegalHold,
  releaseLegalHold,
  listHoldsForCase,
  listActiveHolds,
  countActiveHolds,
} from "./LegalHoldEngine";
export { applyDataMinimization } from "./DataMinimizationFirewall";
export {
  buildDisclosurePackageDraft,
  getDisclosurePackage,
  getPackageForCase,
} from "./DisclosurePackageBuilder";
export {
  checkDeliveryGate,
  assertCanApprove,
  statusAfterApproval,
} from "./HumanApprovalGate";
export {
  enqueueDisclosureNotification,
  listNotificationsForCase,
} from "./DisclosureNotificationEngine";
export {
  submitPrivacyRequest,
  listPrivacyRequests,
  countOpenPrivacyRequests,
} from "./PrivacyRequestEngine";
export { enterEmergencyDisclosureProtocol } from "./EmergencyDisclosureProtocol";
export {
  classifyLegalCase,
  suggestCategoryScope,
  attemptApproveDisclosure,
  approveDisclosure,
  discloseRecords,
} from "./LegalComplianceAgent";
export {
  listCorporateRecords,
  registerCorporateRecordMeta,
  documentRegistryTypes,
} from "./CorporateRecordsVault";
export {
  createDisclosureCaseFromIntake,
  getLegalCase,
  listLegalCases,
  advanceAuthorityVerification,
  approveDisclosureCase,
  deliverDisclosurePackage,
  getCollapsedLegalSummary,
  runSyntheticCertificationExercise,
  getCasePackage,
  getLegalRuntimeSnapshot,
  type IntakeInput,
} from "./LegalCommandRuntime";

/** Existing compliance guard — keep available under legal namespace. */
export {
  evaluateCompliance,
  logComplianceAction,
  getComplianceAuditLog,
  type ComplianceAction,
  type ComplianceResult,
} from "./complianceGuard";
