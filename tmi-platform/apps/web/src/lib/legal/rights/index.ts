/**
 * Copyright & Creator Recording Protection — under Legal Command.
 *
 * RightsComplianceEngine
 * ├── MediaRightsRegistry
 * ├── QuickClaim
 * ├── RightsFingerprintRegistry
 * ├── ProtectedPlaybackGate
 * ├── DisputeCenter
 * ├── TakedownWorkflow
 * ├── CounterNoticeWorkflow
 * ├── RightsEvidenceVault
 * └── RepeatInfringerPolicy
 * (+ CreatorSafeMode / FreestyleRightsController / Attribution / Notices)
 */

export * from "./types";
export {
  ensureMediaRightsSeeded,
  registerMediaRights,
  getMediaRights,
  listMediaRights,
  countMediaRightsByLight,
} from "./MediaRightsRegistry";
export {
  detectRecordingContext,
  shouldApplyCreatorRecordingSplit,
} from "./RecordingContextDetector";
export {
  CREATOR_SAFE_AMBIENCE_ID,
  resolveCreatorSafeSubstitute,
  buildMixDecision,
} from "./CreatorSafeMode";
export {
  getFreestylePhasePlan,
  listFreestylePhasePlans,
  resolveFreestylePhaseAsset,
  mapBattlePhaseToFreestyle,
} from "./FreestyleRightsController";
export { buildAttribution } from "./AttributionEngine";
export {
  listCopyrightNotices,
  rejectForbiddenLicenseClaim,
} from "./CopyrightNoticeEngine";
export {
  ensureRightsEvidenceSeeded,
  putRightsEvidence,
  getRightsEvidence,
  listRightsEvidenceForAsset,
  listRightsEvidence,
} from "./RightsEvidenceVault";
export {
  buildClaimDisputePackage,
  listClaimDisputePackages,
} from "./ClaimDisputePackageBuilder";
export {
  submitCopyrightComplaint,
  advanceCopyrightComplaint,
  listCopyrightComplaints,
  countOpenCopyrightComplaints,
} from "./CopyrightComplaintEngine";
export {
  generateQuickClaimId,
  isQuickClaimType,
  listQuickClaimTypes,
  submitQuickClaim,
  getQuickClaim,
  listQuickClaims,
  countQuickClaimsByOutcome,
} from "./QuickClaim";
export {
  computeRightsFingerprintHash,
  registerFingerprint,
  lookupFingerprints,
  listFingerprints,
} from "./RightsFingerprintRegistry";
export {
  classifyProtectedPlayback,
  assertPublicRebroadcastAllowed,
} from "./ProtectedPlaybackGate";
export {
  openDisputeFromClaim,
  openDisputeFromComplaint,
  advanceDispute,
  listDisputes,
  countOpenDisputes,
} from "./DisputeCenter";
export {
  getTakedownPolicyStub,
  startTakedown,
  advanceTakedown,
  listTakedowns,
  countActiveTakedowns,
} from "./TakedownWorkflow";
export {
  getCounterNoticePolicyStub,
  fileCounterNotice,
  listCounterNotices,
} from "./CounterNoticeWorkflow";
export {
  recordInfringerStrike,
  getInfringerStrike,
  listInfringerStrikes,
  getRepeatInfringerPolicyStub,
} from "./RepeatInfringerPolicy";
export {
  classifyRightsLight,
  canAutoApproveExternalRebroadcast,
  evaluateRecordingMix,
  evaluateFreestylePhase,
  getRightsComplianceSnapshot,
  getRightsIndicatorState,
} from "./RightsComplianceEngine";
