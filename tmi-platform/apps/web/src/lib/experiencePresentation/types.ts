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

/** Cypher forbids all Battle VS corner compositions (incl. SPLIT clash framing). */
export const FORBIDDEN_CYPHER_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "SPLIT",
] as const;

/** Concert / World Concert forbid Battle VS corners + Cypher circle combat framing. */
export const FORBIDDEN_CONCERT_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
] as const;

/**
 * World / Mini Release forbid Battle VS corners + Cypher circle + game board.
 * Premiere/listening DNA — not combat, not objective challenge.
 */
export const FORBIDDEN_RELEASE_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
  "GAME_BOARD",
] as const;

/** Dance Party / WDP forbid Battle VS corners + Cypher circle + game/objective DNA. */
export const FORBIDDEN_DANCE_PARTY_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
  "OBJECTIVE_FOCUS",
  "GAME_BOARD",
] as const;

/**
 * Monday Night Stage forbids Battle VS corners + Cypher circle.
 * SPLIT remains allowed for host/featured / sponsor dual-panel — not corner VS.
 */
export const FORBIDDEN_MNS_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
] as const;

/**
 * Game Show forbids Battle VS corners + Cypher circle.
 * GAME_BOARD / SPLIT / HOST_CLOSE / PIP remain the signature — not corner VS.
 */
export const FORBIDDEN_GAME_SHOW_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
] as const;

/**
 * Fan Lobby / FanLive forbids Battle VS, Cypher circle, Game Show board, WDP floor.
 * Social hangout — HOST_CLOSE / PIP / SPLIT only.
 */
export const FORBIDDEN_FAN_LOBBY_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
  "GAME_BOARD",
  "OBJECTIVE_FOCUS",
  "FLOOR_WIDE",
] as const;

/**
 * Lounge forbids Battle VS, Cypher circle, Game Show board, WDP floor / avatar stadium.
 * Panel roam — HOST_CLOSE / PIP / SPLIT only. Never FAN_AVATARS presence.
 */
export const FORBIDDEN_LOUNGE_COMPOSITIONS: readonly BroadcastCompositionLayout[] = [
  "DUAL",
  "A_DOMINANT",
  "B_DOMINANT",
  "CIRCLE_FOCUS",
  "GAME_BOARD",
  "OBJECTIVE_FOCUS",
  "FLOOR_WIDE",
] as const;
