/**
 * Shared types for experience presentation packs.
 */

export type PresenceModel =
  | "FAN_AVATARS"
  | "WEBRTC_PANELS"
  | "STAGE_LIVE_PLUS_AVATAR_AUDIENCE"
  | "HIDDEN"
  | "GRID_TILES"
  | "MIXED_SOCIAL";

export type ExperiencePackId =
  | "Battle"
  | "Challenge"
  | "Cypher"
  | "Gauntlet"
  | "LiveCollaboration"
  | "Concert"
  | "WorldConcert"
  | "WorldRelease"
  | "DanceParty"
  | "Lounge"
  | "MondayNightStage"
  | "GameShow"
  | "FanLive"
  | "PerformerLive";

/** BroadcastCompositionDirector layout enum */
export type BroadcastCompositionLayout =
  | "DUAL"
  | "A_DOMINANT"
  | "B_DOMINANT"
  | "PIP"
  | "SPLIT"
  | "OBJECTIVE_FOCUS"
  | "HOST_CLOSE"
  | "GAME_BOARD"
  | "CIRCLE_FOCUS"
  | "STAGE_WIDE"
  | "FLOOR_WIDE";

export type PresentationPrimitiveKind =
  | "LiveVideoPanel"
  | "IdentityPanel"
  | "EnergyArc"
  | "AudioVisualizer"
  | "ReactionEmitter"
  | "TimerRing"
  | "ScoreCard"
  | "ResultCard"
  | "ChallengeContract"
  | "CypherCircle"
  | "MicHandoff"
  | "LowerThird"
  | "QueueRail"
  | "GameBoard"
  | "PrizeLedgerView";

export type CertLaneStatus = "DONE" | "PARTIAL" | "OPEN" | "N/A";

/**
 * experienceCert may only PASS with production (non-debug) evidence.
 * Green/debug surfaces are explicitly disqualifying.
 */
export interface ExperienceCertEvidence {
  surfaceKind: "production" | "green_debug" | "observatory" | "storybook" | "unknown";
  physicalObserved: boolean;
  notes?: string;
}

export interface RouteCapabilityContract {
  experienceKey: string;
  routes: string[];
  packId: ExperiencePackId;
  presenceModel: PresenceModel;
  requiresUniversalPlayer: boolean;
  requiresJumbotron: boolean;
  requiresQueue: boolean;
  requiresGameEngine: boolean;
  logicCert: CertLaneStatus;
  architectureCert: CertLaneStatus;
  experienceCert: CertLaneStatus;
  /** When true, experienceCert must stay OPEN regardless of green UI. */
  blockExperienceCertOnDebugSurface: true;
}

/** VS / corner compositions — Battle OK; Cypher FORBIDDEN */
export const VS_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "SPLIT",
] as const;

export const OBJECTIVE_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "OBJECTIVE_FOCUS",
  "HOST_CLOSE",
] as const;

export const FORBIDDEN_CYPHER_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
] as const;
