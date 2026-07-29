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
 *     └── AppealsEngine (scaffold contract)
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
} from "./TrustSafetyRuntime";
