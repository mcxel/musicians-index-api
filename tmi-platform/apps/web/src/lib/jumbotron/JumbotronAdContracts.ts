/**
 * JumbotronAdContracts.ts — Four-sided Jumbotron advertising + Show Director + Spotlight
 *
 * Hard laws (encoded as types + enums — engines enforce):
 * 1. Four faces = one Jumbotron runtime, four independent Display Targets (N/E/S/W).
 * 2. Physical Advertising Truth — same room → same physical surface state; no fabricated impressions.
 * 3. Shared physical surfaces = shared room truth; personalized ads stay in personal UI inventory.
 * 4. Ad Safety — never override emergency, critical live, required cues, moderation, a11y.
 * 5. Priority P0…P6 as VenueAdPriority.
 * 6. Campaign modes + composition modes per face.
 * 7. In-world textures default to direct/artist/house creatives — NOT AdSense/WebGL Google ads.
 * 8. Fallback never blank.
 * 9. People Spotlight = real participants + consent; minors protected.
 */

import type { DisplayTargetClass } from "../monitors/DisplayTargetDirector";
import type { JumbotronFaceOrientation } from "./JumbotronContracts";

// ── Priority (Ad Surface Law — P0 emergency is highest) ─────────────────────

export enum VenueAdPriority {
  P0_EMERGENCY = 0,
  P1_CRITICAL_LIVE = 1,
  P2_RESULT_TIMER_SCORE = 2,
  P3_CONTRACTED_SPONSOR = 3,
  P4_DIRECT_AD = 4,
  P5_HOUSE = 5,
  P6_AMBIENT = 6,
}

/** Cardinal faces of a four-sided center-hung jumbotron. */
export type JumbotronCardinalFace = "NORTH" | "EAST" | "SOUTH" | "WEST";

export type CampaignMode =
  | "SINGLE_FACE"
  | "TWO_FACE"
  | "FOUR_FACE_TAKEOVER"
  | "ROTATING_FACE"
  | "SYNCHRONIZED_TAKEOVER";

export type FaceCompositionMode =
  | "FULL"
  | "PIP"
  | "SPLIT"
  | "TRIPLE"
  | "QUAD"
  | "LOWER_THIRD"
  | "SCORE_STRIP";

export type JumbotronContentKind =
  | "PROGRAM"
  | "AD"
  | "MERCH"
  | "FAN_CAM"
  | "PROMO"
  | "SPOTLIGHT"
  | "SCORE"
  | "TIMER"
  | "EMERGENCY"
  | "AMBIENT_ART";

/** In-world 3D texture creative sources — AdSense is NEVER the default path. */
export type InWorldCreativeSourceKind =
  | "DIRECT_SPONSOR"
  | "ARTIST_SPONSOR"
  | "HOUSE_AD"
  | "EVENT_PROMO"
  | "MERCH"
  | "AMBIENT_ART"
  /** Explicit opt-in only; never selected by default texture resolver. */
  | "ADSENSE_WEB_OVERLAY_OPT_IN";

export type SpotlightConsentMode = "OFF" | "AVATAR_ONLY" | "LIVE_VIDEO";

export type SpotlightCandidateKind =
  | "SINGLE"
  | "DUO"
  | "GROUP"
  | "SECTION"
  | "FRIEND"
  | "DANCE"
  | "REACTION"
  | "PERFORMER";

export type ImpressionViewerRole =
  | "AUDIENCE_IMPRESSION"
  | "PERFORMER_IMPRESSION"
  | "HOST_IMPRESSION";

export type PresentationTemplateId =
  | "NEON_POP"
  | "COMIC_BURST"
  | "ARENA_FIRE"
  | "VICE_GLASS"
  | "GOLD_TICKER"
  | "CYPHER_CIRCLE"
  | "DISCO_PULSE"
  | "LOWER_THIRD_CLEAN";

export type SellablePackageId =
  | "FAN_CAM_PRESENTED_BY"
  | "WINNER_SPOTLIGHT"
  | "ROUND_TIMER_FRAME"
  | "SCOREBOARD_RIBBON"
  | "INTERMISSION_TAKEOVER"
  | "TWO_FACE_SPLIT_SPONSOR"
  | "FOUR_FACE_EVENT_TAKEOVER"
  | "LOWER_THIRD_HOUSE"
  | "MERCH_DROP_BURST"
  | "GROUP_FRIEND_SPOTLIGHT";

export type VenueAdSurfaceKind =
  | "JUMBOTRON_FACE"
  | "STAGE_LED"
  | "RIBBON"
  | "SCOREBOARD"
  | "CONCOURSE"
  | "LOBBY";

export type AudioPolicy =
  | "SILENT"
  | "DUCK_UNDER_PROGRAM"
  | "FULL_MIX"
  | "MUTE_ON_CRITICAL";

export type AdSafetyHoldReason =
  | "EMERGENCY"
  | "CRITICAL_LIVE"
  | "REQUIRED_CUE"
  | "MODERATION"
  | "ACCESSIBILITY"
  | "NONE";

// ── Face target ─────────────────────────────────────────────────────────────

export interface JumbotronFaceTargetState {
  faceId: string;
  orientation: JumbotronCardinalFace;
  worldTransform: {
    position: [number, number, number];
    rotationEuler: [number, number, number];
    scale: [number, number, number];
  };
  resolution: { widthPx: number; heightPx: number };
  displayTargetId: DisplayTargetClass;
  currentSource: JumbotronContentKind | null;
  campaignId: string | null;
  creativeId: string | null;
  compositionMode: FaceCompositionMode;
  visibilityZone: string;
  audioPolicy: AudioPolicy;
  priorityState: VenueAdPriority;
  safetyHold: AdSafetyHoldReason;
  lastAssignedAtMs: number | null;
}

// ── Surface inventory ───────────────────────────────────────────────────────

export interface VenueAdSurfaceRecord {
  inventoryId: string; // e.g. venue:{id}:jumbotron:north
  venueId: string;
  roomId: string;
  surfaceKind: VenueAdSurfaceKind;
  faceOrientation?: JumbotronCardinalFace | JumbotronFaceOrientation;
  displayTargetId: DisplayTargetClass;
  sellable: boolean;
  packageIds: SellablePackageId[];
  currentCreativeId: string | null;
  currentCampaignId: string | null;
  sharedRoomTruthKey: string; // roomId + inventoryId — identical for all viewers
}

// ── Creatives / campaigns ───────────────────────────────────────────────────

export interface VenueAdCreative {
  creativeId: string;
  campaignId: string;
  sourceKind: InWorldCreativeSourceKind;
  advertiserName: string;
  textureAssetUrl: string;
  clickThroughUrl?: string;
  durationMs: number;
  priority: VenueAdPriority;
  allowedFaces: JumbotronCardinalFace[] | "ALL";
  campaignMode: CampaignMode;
  compositionHint: FaceCompositionMode;
  packageId?: SellablePackageId;
  frequencyCapPerHour: number;
  isBlank: false;
}

export interface VenueAdCampaign {
  campaignId: string;
  name: string;
  mode: CampaignMode;
  priority: VenueAdPriority;
  creatives: VenueAdCreative[];
  contractedFaceSet?: JumbotronCardinalFace[];
  sponsorContractId?: string;
  artistSponsorId?: string;
}

// ── Fallback chain (never blank) ────────────────────────────────────────────

export const IN_WORLD_TEXTURE_FALLBACK_CHAIN: readonly InWorldCreativeSourceKind[] = [
  "DIRECT_SPONSOR",
  "ARTIST_SPONSOR",
  "EVENT_PROMO",
  "MERCH",
  "HOUSE_AD",
  "AMBIENT_ART",
] as const;

// ── Impression / viewability ────────────────────────────────────────────────

export interface ViewabilityFrustumSample {
  faceId: string;
  viewerId: string;
  isFacingCamera: boolean;
  screenAreaPercent: number; // 0–100 of viewport
  continuousVisibleMs: number;
  isOffscreen: boolean;
  isBackfaceCulled: boolean;
  isBackgroundTab: boolean;
  isBotViewer: boolean;
  isQaHarness: boolean;
}

export interface ImpressionLedgerEntry {
  impressionId: string;
  assignmentId: string;
  roomId: string;
  inventoryId: string;
  creativeId: string;
  campaignId: string;
  viewerRole: ImpressionViewerRole;
  assignedAtMs: number;
  /** assigned ≠ viewed — only set when viewability gates pass */
  viewedAtMs: number | null;
  viewabilityPassed: boolean;
  rejectReason?:
    | "ASSIGN_ONLY"
    | "BACKFACE"
    | "OFFSCREEN"
    | "BACKGROUND_TAB"
    | "BOT"
    | "QA_HARNESS"
    | "INSUFFICIENT_DURATION"
    | "INSUFFICIENT_AREA";
  frustum?: ViewabilityFrustumSample;
}

export const VIEWABILITY_THRESHOLDS = {
  minScreenAreaPercent: 50,
  minContinuousVisibleMs: 1000,
} as const;

// ── Sellable packages ───────────────────────────────────────────────────────

export interface SellableAdPackage {
  packageId: SellablePackageId;
  displayName: string;
  description: string;
  defaultPriority: VenueAdPriority;
  defaultMode: CampaignMode;
  defaultComposition: FaceCompositionMode;
  requiresConsentForPeople: boolean;
}

export const SELLABLE_AD_PACKAGES: Record<SellablePackageId, SellableAdPackage> = {
  FAN_CAM_PRESENTED_BY: {
    packageId: "FAN_CAM_PRESENTED_BY",
    displayName: "Fan Cam Presented By",
    description: "Sponsored fan-cam burst with presenter logo plate",
    defaultPriority: VenueAdPriority.P3_CONTRACTED_SPONSOR,
    defaultMode: "SINGLE_FACE",
    defaultComposition: "PIP",
    requiresConsentForPeople: true,
  },
  WINNER_SPOTLIGHT: {
    packageId: "WINNER_SPOTLIGHT",
    displayName: "Winner Spotlight",
    description: "Contracted frame around authoritative winner reveal only",
    defaultPriority: VenueAdPriority.P2_RESULT_TIMER_SCORE,
    defaultMode: "FOUR_FACE_TAKEOVER",
    defaultComposition: "FULL",
    requiresConsentForPeople: true,
  },
  ROUND_TIMER_FRAME: {
    packageId: "ROUND_TIMER_FRAME",
    displayName: "Round Timer Frame",
    description: "Sponsor chrome around required round timer cue",
    defaultPriority: VenueAdPriority.P2_RESULT_TIMER_SCORE,
    defaultMode: "SINGLE_FACE",
    defaultComposition: "LOWER_THIRD",
    requiresConsentForPeople: false,
  },
  SCOREBOARD_RIBBON: {
    packageId: "SCOREBOARD_RIBBON",
    displayName: "Scoreboard Ribbon",
    description: "Ribbon under live score strip",
    defaultPriority: VenueAdPriority.P3_CONTRACTED_SPONSOR,
    defaultMode: "TWO_FACE",
    defaultComposition: "SCORE_STRIP",
    requiresConsentForPeople: false,
  },
  INTERMISSION_TAKEOVER: {
    packageId: "INTERMISSION_TAKEOVER",
    displayName: "Intermission Takeover",
    description: "Full four-face commercial window during break only",
    defaultPriority: VenueAdPriority.P4_DIRECT_AD,
    defaultMode: "SYNCHRONIZED_TAKEOVER",
    defaultComposition: "FULL",
    requiresConsentForPeople: false,
  },
  TWO_FACE_SPLIT_SPONSOR: {
    packageId: "TWO_FACE_SPLIT_SPONSOR",
    displayName: "Two-Face Split Sponsor",
    description: "Opposite faces carry paired creatives",
    defaultPriority: VenueAdPriority.P3_CONTRACTED_SPONSOR,
    defaultMode: "TWO_FACE",
    defaultComposition: "FULL",
    requiresConsentForPeople: false,
  },
  FOUR_FACE_EVENT_TAKEOVER: {
    packageId: "FOUR_FACE_EVENT_TAKEOVER",
    displayName: "Four-Face Event Takeover",
    description: "Synchronized event promo across all faces",
    defaultPriority: VenueAdPriority.P5_HOUSE,
    defaultMode: "FOUR_FACE_TAKEOVER",
    defaultComposition: "FULL",
    requiresConsentForPeople: false,
  },
  LOWER_THIRD_HOUSE: {
    packageId: "LOWER_THIRD_HOUSE",
    displayName: "Lower-Third House",
    description: "House promo as lower third while program continues",
    defaultPriority: VenueAdPriority.P5_HOUSE,
    defaultMode: "SINGLE_FACE",
    defaultComposition: "LOWER_THIRD",
    requiresConsentForPeople: false,
  },
  MERCH_DROP_BURST: {
    packageId: "MERCH_DROP_BURST",
    displayName: "Merch Drop Burst",
    description: "Artist merch creative burst",
    defaultPriority: VenueAdPriority.P4_DIRECT_AD,
    defaultMode: "ROTATING_FACE",
    defaultComposition: "PIP",
    requiresConsentForPeople: false,
  },
  GROUP_FRIEND_SPOTLIGHT: {
    packageId: "GROUP_FRIEND_SPOTLIGHT",
    displayName: "Group Friend Spotlight",
    description: "Consented friend-group jumbotron moment",
    defaultPriority: VenueAdPriority.P3_CONTRACTED_SPONSOR,
    defaultMode: "SINGLE_FACE",
    defaultComposition: "QUAD",
    requiresConsentForPeople: true,
  },
};

// ── Presentation templates (style only — never invent winners) ──────────────

export interface PresentationTemplateStub {
  templateId: PresentationTemplateId;
  label: string;
  palette: { primary: string; secondary: string; accent: string; background: string };
  motionProfile: string;
  /** Style may vary; outcome truth is never authored here. */
  inventsOutcomes: false;
}

export const PRESENTATION_TEMPLATE_LIBRARY: Record<
  PresentationTemplateId,
  PresentationTemplateStub
> = {
  NEON_POP: {
    templateId: "NEON_POP",
    label: "Neon Pop",
    palette: {
      primary: "#00FFFF",
      secondary: "#FF2DAA",
      accent: "#FFD700",
      background: "#050510",
    },
    motionProfile: "pulse-pop",
    inventsOutcomes: false,
  },
  COMIC_BURST: {
    templateId: "COMIC_BURST",
    label: "Comic Burst",
    palette: {
      primary: "#FFD700",
      secondary: "#FF2DAA",
      accent: "#FFFFFF",
      background: "#0a0614",
    },
    motionProfile: "burst-stamps",
    inventsOutcomes: false,
  },
  ARENA_FIRE: {
    templateId: "ARENA_FIRE",
    label: "Arena Fire",
    palette: {
      primary: "#FF4500",
      secondary: "#FFD700",
      accent: "#00FFFF",
      background: "#050510",
    },
    motionProfile: "ember-sweep",
    inventsOutcomes: false,
  },
  VICE_GLASS: {
    templateId: "VICE_GLASS",
    label: "Vice Glass",
    palette: {
      primary: "#FF2DAA",
      secondary: "#AA2DFF",
      accent: "#00FFFF",
      background: "#06070d",
    },
    motionProfile: "glass-reflect",
    inventsOutcomes: false,
  },
  GOLD_TICKER: {
    templateId: "GOLD_TICKER",
    label: "Gold Ticker",
    palette: {
      primary: "#FFD700",
      secondary: "#FFFFFF",
      accent: "#00FFFF",
      background: "#050510",
    },
    motionProfile: "ticker-scroll",
    inventsOutcomes: false,
  },
  CYPHER_CIRCLE: {
    templateId: "CYPHER_CIRCLE",
    label: "Cypher Circle",
    palette: {
      primary: "#00FFFF",
      secondary: "#AA2DFF",
      accent: "#FFD700",
      background: "#050510",
    },
    motionProfile: "circle-rotate",
    inventsOutcomes: false,
  },
  DISCO_PULSE: {
    templateId: "DISCO_PULSE",
    label: "Disco Pulse",
    palette: {
      primary: "#FF2DAA",
      secondary: "#00FFFF",
      accent: "#FFD700",
      background: "#0a0614",
    },
    motionProfile: "beat-pulse",
    inventsOutcomes: false,
  },
  LOWER_THIRD_CLEAN: {
    templateId: "LOWER_THIRD_CLEAN",
    label: "Lower Third Clean",
    palette: {
      primary: "#FFFFFF",
      secondary: "#00FFFF",
      accent: "#FFD700",
      background: "#050510",
    },
    motionProfile: "slide-up",
    inventsOutcomes: false,
  },
};

// ── Optimization stub (aggregate engagement weights only) ───────────────────

export interface AdOptimizationWeightsStub {
  engagementWeight: number;
  freshnessWeight: number;
  contractObligationWeight: number;
  /** Hard constraints — optimizer may never violate these. */
  hardConstraints: {
    respectSafetyPriority: true;
    respectFrequencyCaps: true;
    neverFabricateImpressions: true;
    neverUseAdSenseAsDefaultInWorldTexture: true;
  };
}

export const DEFAULT_AD_OPTIMIZATION_WEIGHTS: AdOptimizationWeightsStub = {
  engagementWeight: 0.35,
  freshnessWeight: 0.25,
  contractObligationWeight: 0.4,
  hardConstraints: {
    respectSafetyPriority: true,
    respectFrequencyCaps: true,
    neverFabricateImpressions: true,
    neverUseAdSenseAsDefaultInWorldTexture: true,
  },
};

// ── Observatory Ad Surface Control Room ─────────────────────────────────────

export type ObservatoryFaceCommand = "TAKE" | "HOLD" | "NEXT";

export interface ObservatoryFacePreview {
  face: JumbotronCardinalFace;
  inventoryId: string;
  creativeId: string | null;
  campaignId: string | null;
  priorityState: VenueAdPriority;
  compositionMode: FaceCompositionMode;
  safetyHold: AdSafetyHoldReason;
}

export interface ObservatoryAdSurfaceControlRoomState {
  roomId: string;
  venueId: string;
  faces: ObservatoryFacePreview[];
  lastCommand?: {
    face: JumbotronCardinalFace;
    command: ObservatoryFaceCommand;
    atMs: number;
    operatorId: string;
  };
}

// ── Spotlight candidate ─────────────────────────────────────────────────────

export interface SpotlightParticipant {
  userId: string;
  displayName: string;
  seatId?: string;
  isMinor: boolean;
  consent: SpotlightConsentMode;
  friendGroupIds: string[];
  isRealParticipant: true;
  isPerformer?: boolean;
}

export interface SpotlightSelectionRequest {
  kind: SpotlightCandidateKind;
  roomId: string;
  requestedUserIds?: string[];
  friendGroupId?: string;
  sectionId?: string;
  allowRandomFromEligiblePool: boolean;
  preferFriendGroups: boolean;
}

export interface SpotlightSelectionResult {
  accepted: boolean;
  reason: string;
  participants: SpotlightParticipant[];
  renderMode: SpotlightConsentMode | "REJECTED";
}
