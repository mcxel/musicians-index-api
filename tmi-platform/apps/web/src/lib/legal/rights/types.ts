/**
 * Copyright & Creator Recording Protection — types under Legal Command.
 * Rule: TMI must know the rights state of media before deciding where that
 * media may play, be recorded, be clipped, be rebroadcast, or be monetized.
 *
 * "No Copyright Intended" is never a protection signal.
 */

export type RightsTrafficLight = "GREEN" | "YELLOW" | "RED";

export type ContentIdStatus =
  | "UNKNOWN"
  | "CLEARED"
  | "MATCHED"
  | "CLAIMED"
  | "DISPUTED"
  | "TAKEDOWN";

export type LicenseSource =
  | "UNKNOWN"
  | "TMI_OWNED"
  | "UPLOADER_DECLARED"
  | "BEAT_MARKETPLACE"
  | "COMPETITION_VAULT"
  | "SPONSOR_PACK"
  | "EXTERNAL_LICENSE"
  | "PUBLIC_DOMAIN_CLAIM";

export type MediaSurface =
  | "LIVE"
  | "PLAYLIST"
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "SNIP"
  | "YOPHO"
  | "MAGAZINE"
  | "MEMORY_WALL"
  | "VENUE"
  | "MEDIA_LOCKER";

export type FreestyleRightsPhase =
  | "PRE_ROUND"
  | "COUNTDOWN"
  | "FREESTYLE_ACTIVE"
  | "POST_ROUND";

export type MediaRightsRecord = {
  assetId: string;
  ownerId: string;
  copyrightOwner: string;
  masterOwner: string;
  compositionOwner: string;
  uploader: string;
  licenseSource: LicenseSource;
  licenseDocumentId: string | null;
  territories: string[];
  platformPlaybackAllowed: boolean;
  livestreamAllowed: boolean;
  recordingAllowed: boolean;
  externalRebroadcastAllowed: boolean;
  monetizedVideoAllowed: boolean;
  clipCreationAllowed: boolean;
  derivativeUseAllowed: boolean;
  attributionRequired: boolean;
  contentIdStatus: ContentIdStatus;
  licenseStart: string | null;
  licenseExpiration: string | null;
  disputeEvidenceId: string | null;
  /** Surfaces this asset may appear on when rights permit. */
  allowedSurfaces: MediaSurface[];
  /** Evidence present — required for GREEN. */
  hasRightsEvidence: boolean;
  title?: string;
  registeredAt: string;
};

export type RecordingContext = {
  userRecordingOrBroadcasting: boolean;
  freestyleActive: boolean;
  backgroundMusicAssetId: string | null;
  surface: MediaSurface;
  roomId?: string;
};

export type MixDecision = {
  light: RightsTrafficLight;
  label: string;
  /** Experience mix (headphones / in-room) may keep normal playback. */
  experienceMixAction: "KEEP" | "SAFE_SUBSTITUTE" | "SILENCE" | "REMOVE";
  /** Creator recording / external broadcast mix — separate from experience mix. */
  recordingMixAction: "KEEP" | "SAFE_SUBSTITUTE" | "SILENCE" | "REMOVE";
  creatorSafeModeActive: boolean;
  attributionRequired: boolean;
  reasons: string[];
  assetId: string | null;
  /** Never emit "No Copyright Intended". */
  forbiddenCopyUsed: false;
};

export type FreestylePhasePlan = {
  phase: FreestyleRightsPhase;
  soundtrackPolicy: string;
  preferredLicenseSources: LicenseSource[];
  recordingSafeRequired: boolean;
};

export type RightsEvidenceRecord = {
  evidenceId: string;
  assetId: string;
  originalUploadRef: string;
  contentHash: string;
  uploader: string;
  ownershipDeclaration: string;
  contractOrLicenseRef: string | null;
  timestamps: { uploadedAt: string; declaredAt: string };
  isrc: string | null;
  authorizedUses: string[];
  createdAt: string;
};

export type ClaimDisputePackage = {
  packageId: string;
  assetId: string;
  claimSummary: string;
  evidenceIds: string[];
  createdAt: string;
  status: "DRAFT" | "SUBMITTED" | "CLOSED";
  humanReviewRequired: true;
};

export type CopyrightComplaintRecord = {
  complaintId: string;
  caseId: string;
  claimantName: string;
  claimantEmail: string;
  workDescription: string;
  infringingUrlOrRoom: string;
  goodFaithStatement: boolean;
  perjuryStatement: boolean;
  status:
    | "RECEIVED"
    | "CLAIMANT_VERIFICATION"
    | "PRESERVATION"
    | "REMOVAL_OR_RESTRICTION"
    | "COUNTER_NOTICE_WINDOW"
    | "CLOSED";
  createdAt: string;
  notes: string;
};

/** Fast claim types for CLAIM MY WORK — never instant ownership transfer. */
export type QuickClaimType =
  | "CREATED"
  | "OWN_MASTER"
  | "COMPOSED"
  | "PRODUCED_BEAT"
  | "REPRESENT_RIGHTS_HOLDER"
  | "HAVE_LICENSE"
  | "UNAUTHORIZED_UPLOAD";

export type QuickClaimOutcome = "VERIFIED" | "REVIEW" | "DISPUTED";

export type QuickClaimRecord = {
  claimId: string;
  assetId: string;
  assetKind: "SONG" | "VIDEO" | "BEAT" | "MEDIA";
  claimantUserId: string;
  claimType: QuickClaimType;
  statement: string;
  outcome: QuickClaimOutcome;
  /** Hard rule: claim never instantly transfers ownership. */
  ownershipTransferred: false;
  /** Hard rule: claim never instantly deletes content. */
  contentDeleted: false;
  evidenceId: string | null;
  fingerprintId: string | null;
  conflictDetected: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string[];
};

export type RightsFingerprintRecord = {
  fingerprintId: string;
  assetId: string;
  /** Non-secret perceptual/content fingerprint hash. */
  fingerprintHash: string;
  source: "UPLOAD" | "CLAIM" | "SEED" | "MATCH";
  matchedAssetIds: string[];
  createdAt: string;
};

/**
 * ProtectedPlaybackGate classification for public rebroadcast of user-supplied A/V.
 * "I own it" alone never clears UFC/NBC/TV/commercial third-party content.
 */
export type ProtectedPlaybackClass =
  | "CLEARED"
  | "TMI_OWNED"
  | "CREATOR_VERIFIED"
  | "LICENSE_VERIFIED"
  | "CLAIM_PENDING"
  | "DISPUTED"
  | "UNKNOWN"
  | "RESTRICTED"
  | "TAKEDOWN";

export type ProtectedPlaybackDecision = {
  assetId: string;
  classification: ProtectedPlaybackClass;
  publicRebroadcastAllowed: boolean;
  monetizeAllowed: boolean;
  recordedDistributionAllowed: boolean;
  reasons: string[];
  requiresHumanReview: boolean;
};

export type DisputeCaseStatus =
  | "OPEN"
  | "EVIDENCE_GATHERING"
  | "HUMAN_REVIEW"
  | "RESOLVED_UPHOLD"
  | "RESOLVED_REJECT"
  | "CLOSED";

export type DisputeCaseRecord = {
  disputeId: string;
  assetId: string;
  claimId: string | null;
  complaintId: string | null;
  status: DisputeCaseStatus;
  summary: string;
  createdAt: string;
  updatedAt: string;
  humanReviewRequired: true;
};

export type TakedownCaseStatus =
  | "INTAKE"
  | "PRESERVATION"
  | "NOTICE_SENT"
  | "CONTENT_RESTRICTED"
  | "COUNTER_WINDOW"
  | "FINALIZED"
  | "RESTORED";

export type TakedownCaseRecord = {
  takedownId: string;
  assetId: string;
  complaintId: string | null;
  status: TakedownCaseStatus;
  createdAt: string;
  updatedAt: string;
  /** Restriction ≠ silent delete without process. */
  contentHardDeleted: false;
  notes: string;
};

export type CounterNoticeRecord = {
  counterId: string;
  takedownId: string;
  assetId: string;
  filerUserId: string;
  statement: string;
  status: "FILED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  humanReviewRequired: true;
};

export type RepeatInfringerStrike = {
  userId: string;
  strikeCount: number;
  lastStrikeAt: string;
  notes: string[];
  policyAction: "WARN" | "RESTRICT" | "SUSPEND_CANDIDATE" | "NONE";
};
