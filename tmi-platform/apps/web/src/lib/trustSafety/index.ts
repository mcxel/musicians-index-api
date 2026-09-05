/**
 * TrustSafetyRuntime — platform-wide Trust & Safety engine.
 *
 * Architecture (LOCKED):
 *   TrustSafetyRuntime (always on)
 *     ├── ScamSignalEngine (scaffold)
 *     ├── ImpersonationDetectionEngine (scaffold)
 *     ├── PaymentRiskEngine (scaffold)
 *     ├── LinkSafetyEngine (scaffold)
 *     ├── ContentClaimEngine (scaffold)
 *     ├── AccountRelationshipGraph (scaffold)
 *     ├── EvidenceVault (real preserve on report)
 *     ├── EnforcementEngine (Level 0–4 types; Level 1 reporter friction)
 *     ├── AppealsEngine (scaffold contract)
 *     └── DatingExperiencePolicy (21+ dating gate; not YouthSocialGuard 1:1)
 *
 * ScamDefenseCenter (Observatory Intelligence Deck) is the first CLIENT —
 * not where detection lives. Quick Report Panel + Host Safety are consumers.
 *
 * FTC impersonation / scam threat context informs reason taxonomy; this is not legal advice.
 */

export * from "./types";
export * from "./EvidenceVault";
export * from "./EnforcementEngine";
export * from "./TrustScore";
export * from "./scaffoldEngines";
export * from "./YouthSocialGuard";
export * from "./FamilyRelationshipPolicy";
export * from "./DatingExperiencePolicy";
export {
  submitTrustSafetyReport,
  listOpenTrustSafetyCases,
  getTrustSafetyCaseByCaseId,
  getTrustSafetyCaseEvidence,
  applyCaseAction,
  getQueueSummary,
  generateCaseId,
  isValidReportReason,
  toCaseView,
  evaluateDatingExperienceForUserId,
  assertDatingExperienceForUserId,
} from "./TrustSafetyRuntime";
