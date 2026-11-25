/**
 * TmiRealityGameWorldConvergence — FINAL Reality × Game World assembly contract.
 * Extends: UniversalMonitorViewport / PlayableExperience / BroadcastGraphics /
 * JumbotronFaceTargetRegistry / FaceScanIdentityEngine / AvatarCreationCenter.
 * NOT a second Avatar, World, Live, Media, or Jumbotron engine.
 *
 * Product: REAL HUMAN + DIGITAL SELF + REAL VIDEO + LIVING WORLD + UNIVERSAL PLAYER.
 * Bobblehead proportions + near-photoreal materials — NOT cartoon metaverse.
 * Reference videos inspire only — never ingested / never shipped.
 */

/** Stage performer presentation modes — same live session, different composition. */
export type StagePerformerPresentationMode =
  | "STAGE_VIDEO_PANEL"
  | "STAGE_CHROMA_PERFORMER"
  | "STAGE_WORLD_AVATAR"
  | "STAGE_MIXED_REALITY"
  | "STAGE_PROGRAM_COMPOSITION";

export type ChromaQualityState =
  | "CHROMA_READY"
  | "SEGMENTATION_READY"
  | "SEGMENTATION_DEGRADED"
  | "STANDARD_VIDEO_FALLBACK";

export type StagePerformerPlacement = {
  stageGroundAnchorId: string;
  performerFootlineY: number;
  performerScale: number;
  safeCrop: { top: number; bottom: number; left: number; right: number };
  bodyBounds: { width: number; height: number };
  stageDepth: number;
};

/** Prefer chroma only when edges/hair/hands/instruments pass QA; else fall back. */
export function resolveStagePresentationMode(input: {
  chromaEnabled: boolean;
  chromaQuality: ChromaQualityState;
  performerRequiresRealVideo: boolean;
}): StagePerformerPresentationMode {
  if (!input.performerRequiresRealVideo) return "STAGE_WORLD_AVATAR";
  if (
    input.chromaEnabled &&
    (input.chromaQuality === "CHROMA_READY" || input.chromaQuality === "SEGMENTATION_READY")
  ) {
    return "STAGE_CHROMA_PERFORMER";
  }
  if (input.chromaEnabled && input.chromaQuality === "SEGMENTATION_DEGRADED") {
    return "STAGE_VIDEO_PANEL";
  }
  return "STAGE_VIDEO_PANEL";
}

export function shouldFallbackChromaToVideoPanel(quality: ChromaQualityState): boolean {
  return quality === "SEGMENTATION_DEGRADED" || quality === "STANDARD_VIDEO_FALLBACK";
}

/** Jumbotron geometry families — geometry + binding, not a second program. */
export type JumbotronGeometryFamily =
  | "FOUR_FACE_CENTER_HUNG"
  | "MULTI_FACE"
  | "ARENA_RIBBON"
  | "CURVED_DISPLAY"
  | "STAGE_WIDE"
  | "SIDE_WINGS"
  | "VERTICAL_TOWERS"
  | "FLOATING_ARRAY"
  | "VENUE_MODULAR";

/** ONE PROGRAM → many surfaces. Never mint duplicate live transport. */
export const ONE_PROGRAM_MANY_SURFACES = true as const;

export type ProgramSurfaceKind =
  | "MONITOR_A"
  | "MONITOR_B"
  | "STAGE"
  | "JUMBOTRON_FACE"
  | "WORLD_MEDIA"
  | "HOME_PREVIEW"
  | "LOBBY_PREVIEW"
  | "EXACT_ROOM";

/** Game-show / experience responsiveness — surpass slow reference pacing. */
export const PRESENTATION_TIMING_MS = {
  microResponse: { min: 150, max: 300 },
  panelTransition: { min: 300, max: 600 },
  majorCutsceneReservedFor: [
    "INTRO",
    "MAJOR_ROUND",
    "MILESTONE",
    "FINAL",
    "WINNER",
    "OUTRO",
  ] as const,
} as const;

export type ResponsivenessMetric =
  | "INPUT_TO_LOCAL_FEEDBACK"
  | "INPUT_TO_SERVER_ACK"
  | "EVENT_TO_SCENE"
  | "EVENT_TO_PANEL"
  | "EVENT_TO_CAMERA"
  | "QUESTION_TO_READY"
  | "RESULT_TO_REVEAL"
  | "MEDIA_START"
  | "WORLD_FRAME_TIME"
  | "CAMERA_TO_SEGMENTATION"
  | "PROGRAM_TO_STAGE"
  | "PROGRAM_TO_JUMBOTRON"
  | "STAGE_JUMBOTRON_DELTA";

/**
 * Preload presentation resources only — never preload/display winners,
 * correct answers, or results before canonical authority.
 */
export type PresentationPreloadPolicy = {
  mayPreloadNextLayout: boolean;
  mayPreloadNextCamera: boolean;
  mayPreloadNextAudioCue: boolean;
  mayPreloadNextWorldAssets: boolean;
  mayPredictCanonicalTruth: false;
};

export const SAFE_PRESENTATION_PRELOAD: PresentationPreloadPolicy = {
  mayPreloadNextLayout: true,
  mayPreloadNextCamera: true,
  mayPreloadNextAudioCue: true,
  mayPreloadNextWorldAssets: true,
  mayPredictCanonicalTruth: false,
};

/** Digital-self fidelity law — one identity, distance LOD. */
export type AvatarPresentationDistance = "HERO" | "NEAR" | "MID" | "DISTANT" | "SAFE_DEVICE";

export const DIGITAL_SELF_LAW = {
  oneCanonicalIdentity: true,
  bobbleheadProportions: true,
  nearPhotorealMaterials: true,
  notCartoonMetaverse: true,
  identityNotMonetized: true,
  faceScanOptInRequired: true,
  userApprovalRequiredBeforeEquip: true,
  sameIdentityEverywhere: true,
} as const;

export const FACE_SCAN_PIPELINE_STEPS = [
  "CAMERA_PERMISSION_CONSENT",
  "GUIDED_FACE_CAPTURE",
  "QUALITY_CHECK",
  "LIVENESS_SAFETY_CHECK",
  "LANDMARK_FIT",
  "HEAD_SHAPE_FIT",
  "FACIAL_PROPORTION_FIT",
  "APPEARANCE_TEXTURE_FIT",
  "CANONICAL_AVATAR_HEAD",
  "EXISTING_CERTIFIED_RIG",
  "PREVIEW",
  "USER_APPROVAL",
  "SAVE",
  "EQUIP",
] as const;

export type DualMonitorEventComposition = {
  monitorA: "REAL_PROGRAM" | "WORLD" | "CREATION_CENTER" | "GAME_BOARD" | "OTHER";
  monitorB: "AUDIENCE_WORLD" | "USER_THIRD_PERSON" | "HOST" | "FRIENDS" | "CREATION_CENTER" | "OTHER";
};

/** Signature TMI duality: reality on A, digital self in world on B. */
export const SIGNATURE_DUAL_MONITOR: DualMonitorEventComposition = {
  monitorA: "REAL_PROGRAM",
  monitorB: "AUDIENCE_WORLD",
};

export type SeatSightlineCertPoint =
  | "FRONT_LEFT"
  | "FRONT_CENTER"
  | "FRONT_RIGHT"
  | "MIDDLE_LEFT"
  | "MIDDLE_CENTER"
  | "MIDDLE_RIGHT"
  | "BACK"
  | "UPPER"
  | "VIP";

export const SEAT_SIGHTLINE_MUST_SEE = ["STAGE", "PERFORMER", "JUMBOTRON"] as const;

/** Under load: degrade decoration before experience (aligns with viewport protect list). */
export const CONVERGENCE_DEGRADE_FIRST = [
  "PARTICLES",
  "REFLECTIONS",
  "SECONDARY_SHADOWS",
  "DECORATIVE_LIGHTING",
  "DISTANT_SCENERY",
  "DISTANT_AVATAR_LOD",
  "DISTANT_BOTS",
  "NONESSENTIAL_VISUALIZATION",
  "OFFSCREEN_PREVIEWS",
] as const;

export const CONVERGENCE_PROTECT = [
  "LIVE_TRANSPORT",
  "INPUT",
  "ACTIVE_USER_AVATAR",
  "ACTIVE_PERFORMER",
  "AUDIO",
  "COLLISION",
  "GAME_STATE",
  "CURRENT_INTERACTION",
  "SEAT_STATE",
] as const;

export const TmiRealityGameWorldConvergence = {
  resolveStagePresentationMode,
  shouldFallbackChromaToVideoPanel,
  PRESENTATION_TIMING_MS,
  SAFE_PRESENTATION_PRELOAD,
  DIGITAL_SELF_LAW,
  FACE_SCAN_PIPELINE_STEPS,
  SIGNATURE_DUAL_MONITOR,
  SEAT_SIGHTLINE_MUST_SEE,
  ONE_PROGRAM_MANY_SURFACES,
  CONVERGENCE_DEGRADE_FIRST,
  CONVERGENCE_PROTECT,
} as const;
