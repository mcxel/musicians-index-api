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
