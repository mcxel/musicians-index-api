/**
 * Universal Playable Experience Contract — Battles/Cyphers/Games/WDP/Lounges as player compositions.
 * Overlays/underlays/visualizations are presentation layers — they do NOT own game/live truth.
 */

export type TmiExperienceType =
  | "BATTLE"
  | "CHALLENGE"
  | "CYPHER"
  | "GAUNTLET"
  | "DIRTY_DOZENS"
  | "DANCE_OFF"
  | "JOKE_OFF"
  | "GAME_SHOW"
  | "WORLD_DANCE_PARTY"
  | "MONDAY_NIGHT_STAGE"
  | "LIVE_SHOW"
  | "FAN_LOBBY"
  | "PERFORMER_LOBBY"
  | "LOUNGE"
  | "LISTENING_PARTY"
  | "WORLD_CONCERT"
  | "WORLD_RELEASE"
  | "OTHER";

export type ExperienceCompositionLayer =
  | "WORLD_ENVIRONMENT"
  | "UNDERLAY"
  | "PRIMARY_MEDIA"
  | "SECONDARY_MEDIA"
  | "EXPERIENCE_STATE"
  | "VISUALIZATION"
  | "OVERLAY"
  | "INTERACTION_HUD"
  | "ACCESSIBILITY_SYSTEM";

export const EXPERIENCE_COMPOSITION_STACK: ExperienceCompositionLayer[] = [
  "WORLD_ENVIRONMENT",
  "UNDERLAY",
  "PRIMARY_MEDIA",
  "SECONDARY_MEDIA",
  "EXPERIENCE_STATE",
  "VISUALIZATION",
  "OVERLAY",
  "INTERACTION_HUD",
  "ACCESSIBILITY_SYSTEM",
];

export type ExperienceViewportSource = {
  experienceType: TmiExperienceType;
  experienceId: string;
  sessionId: string;
  roomId: string;
  programSourceId?: string;
  worldId?: string;
  competitive: boolean;
  allowsWinnerGraphics: boolean;
  audienceViewAvailable: boolean;
  queueAvailable: boolean;
};

/** Cyphers are collaborative by default — no VS/winner unless explicit variant. */
export function experienceAllowsWinnerGraphics(type: TmiExperienceType, variantCompetitive = false): boolean {
  if (type === "CYPHER") return variantCompetitive;
  if (type === "LOUNGE" || type === "FAN_LOBBY" || type === "WORLD_DANCE_PARTY" || type === "LISTENING_PARTY") {
    return false;
  }
  return type === "BATTLE" || type === "CHALLENGE" || type === "GAUNTLET" || type === "DIRTY_DOZENS" || type === "DANCE_OFF" || type === "JOKE_OFF" || type === "GAME_SHOW";
}

export function buildExperienceViewportSource(input: {
  experienceType: TmiExperienceType;
  experienceId: string;
  sessionId: string;
  roomId: string;
  programSourceId?: string;
  worldId?: string;
  variantCompetitive?: boolean;
}): ExperienceViewportSource {
  const competitive = experienceAllowsWinnerGraphics(input.experienceType, input.variantCompetitive);
  return {
    experienceType: input.experienceType,
    experienceId: input.experienceId,
    sessionId: input.sessionId,
    roomId: input.roomId,
    programSourceId: input.programSourceId,
    worldId: input.worldId,
    competitive,
    allowsWinnerGraphics: competitive,
    audienceViewAvailable: true,
    queueAvailable: input.experienceType !== "LOUNGE" && input.experienceType !== "FAN_LOBBY",
  };
}

/** Overlay/visualization may display state; they never create scores/votes/winners. */
export const PRESENTATION_DOES_NOT_OWN_STATE = true as const;

/**
 * Total World Visibility — game-grade scene coherence (not GTA art/trade dress).
 * WORLD / PROGRAM first; HUD/panels get out of the way. BOT != HUMAN always.
 */
export const WORLD_FIRST_COMPOSITION_HIERARCHY = [
  "WORLD_OR_PROGRAM",
  "PARTICIPANTS",
  "IMPORTANT_EVENT_STATE",
  "INTERACTION",
  "HUD",
  "SECONDARY_INFORMATION",
] as const;

export type EffectIntensity = "LOW" | "STANDARD" | "HIGH";

export type WorldVisibilitySafeAreas = {
  overlayMustNotCover: ReadonlyArray<
    "FACES" | "CRITICAL_GAME_STATE" | "ACTIVE_PARTICIPANT" | "IMPORTANT_MEDIA" | "NAV_CONTROLS" | "CAPTIONS"
  >;
  underlayMustPreserveForegroundContrast: boolean;
  visualizationMustClearAfterCelebration: boolean;
  hudDefaultAutoHide: boolean;
  keepHudOnAvailable: boolean;
};

export const DEFAULT_WORLD_VISIBILITY_SAFE_AREAS: WorldVisibilitySafeAreas = {
  overlayMustNotCover: [
    "FACES",
    "CRITICAL_GAME_STATE",
    "ACTIVE_PARTICIPANT",
    "IMPORTANT_MEDIA",
    "NAV_CONTROLS",
    "CAPTIONS",
  ],
  underlayMustPreserveForegroundContrast: true,
  visualizationMustClearAfterCelebration: true,
  hudDefaultAutoHide: true,
  keepHudOnAvailable: true,
};

/** BOT may animate the world; never inflate human metrics. */
export const BOT_NE_HUMAN = true as const;

export type WorldEntityKind = "HUMAN" | "BOT" | "NPC" | "PROP" | "MEDIA_SURFACE" | "SCENERY";

export type PlayerReadinessState =
  | "RESOLVING"
  | "LOADING_WORLD"
  | "CONNECTING_LIVE_VIDEO"
  | "LOADING_AVATAR"
  | "PREPARING_SEATS"
  | "READY"
  | "LIVE"
  | "INTERACTIVE"
  | "RECONNECTING"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "ENDED";

/**
 * Experience performance priority under pressure — game/live before decoration.
 */
export const EXPERIENCE_PERFORMANCE_PRIORITY = [
  "GAME_OR_LIVE_STATE",
  "PRIMARY_PROGRAM",
  "ACTIVE_PARTICIPANTS",
  "INPUT",
  "AUDIO",
  "HUD",
  "AUDIENCE",
  "OPTIONAL_EFFECTS",
  "DECORATIVE_EFFECTS",
] as const;
