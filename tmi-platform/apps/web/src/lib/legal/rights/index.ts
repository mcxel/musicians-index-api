/**
 * Copyright & Creator Recording Protection — under Legal Command.
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
  classifyRightsLight,
  canAutoApproveExternalRebroadcast,
  evaluateRecordingMix,
  evaluateFreestylePhase,
  getRightsComplianceSnapshot,
  getRightsIndicatorState,
} from "./RightsComplianceEngine";
