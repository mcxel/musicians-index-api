/**
 * VenueToolsRegistry — canonical module catalog for VENUE TOOLS (Rule 8 registry-first).
 * Capabilities resolve from environment package — no hardcoded universal venue.
 */

import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";
import { STAGE_LIGHTING_PRESETS } from "@/lib/live/StageDirectorEngine";
import type { LightingPreset } from "@/lib/venue/LightingMoodRuntime";
import { getEnvironmentById } from "@/lib/venue/VenueEnvironmentRegistry";
import type { ExperienceModuleId } from "@/registries/experiences/ExperienceRegistry";

export type VenueToolsModuleId =
  | "MOOD"
  | "LIGHTING"
  | "SCENES"
  | "STAGE"
  | "ENVIRONMENT"
  | "AMBIENCE"
  | "MEDIA"
  | "CAMERAS"
  | "FX"
  | "DECOR"
  | "CURTAIN"
  | "CUES"
  | "ROOM_HEALTH";

export interface VenueToolsModuleDef {
  id: VenueToolsModuleId;
  label: string;
  icon: string;
  commandPrefix: string;
  /** Performer / lounge-host / fan visibility */
  roles: Array<"fan" | "performer" | "lounge-host">;
  engineRefs: string[];
  enabled: boolean;
}

export const VENUE_TOOLS_MODULES: VenueToolsModuleDef[] = [
  { id: "LIGHTING", label: "Lighting", icon: "💡", commandPrefix: "VENUE_LIGHTING", roles: ["performer", "lounge-host", "fan"], engineRefs: ["StageDirectorEngine", "LightingMoodRuntime"], enabled: true },
  { id: "MOOD", label: "Mood", icon: "🌈", commandPrefix: "VENUE_MOOD", roles: ["performer", "lounge-host", "fan"], engineRefs: ["LightingMoodRuntime"], enabled: true },
  { id: "FX", label: "FX", icon: "✨", commandPrefix: "VENUE_FX", roles: ["performer", "lounge-host"], engineRefs: ["StageDirectorEngine"], enabled: true },
  { id: "CAMERAS", label: "Cameras", icon: "🎬", commandPrefix: "VENUE_CAMERA", roles: ["performer", "lounge-host"], engineRefs: ["StageDirectorEngine", "VenueDynamicCameraEngine"], enabled: true },
  { id: "STAGE", label: "Stage", icon: "🎭", commandPrefix: "VENUE_STAGE", roles: ["performer"], engineRefs: ["StageLifecycleEngine", "StageEnergyEngine"], enabled: true },
  { id: "CURTAIN", label: "Curtain / Intermission", icon: "🎪", commandPrefix: "VENUE_CURTAIN", roles: ["performer"], engineRefs: ["VenueCurtainDirector", "CurtainRuntimeManager"], enabled: true },
  { id: "ENVIRONMENT", label: "Environment", icon: "🏟️", commandPrefix: "VENUE_ENVIRONMENT", roles: ["performer", "lounge-host", "fan"], engineRefs: ["VenueEnvironmentRegistry", "FanLobbySkinRegistry"], enabled: true },
  { id: "AMBIENCE", label: "Ambience", icon: "🌫️", commandPrefix: "VENUE_AMBIENCE", roles: ["performer", "lounge-host"], engineRefs: ["LightingMoodRuntime"], enabled: true },
  { id: "SCENES", label: "Scenes", icon: "📋", commandPrefix: "VENUE_SCENE", roles: ["performer", "lounge-host"], engineRefs: ["LightingMoodRuntime", "StageDirectorEngine"], enabled: true },
  { id: "MEDIA", label: "Media", icon: "📺", commandPrefix: "VENUE_MEDIA", roles: ["performer"], engineRefs: ["BroadcastDirectorEngine"], enabled: false },
  { id: "DECOR", label: "Decor", icon: "🎨", commandPrefix: "VENUE_DECOR", roles: ["fan", "lounge-host"], engineRefs: ["FanLobbySkinRegistry"], enabled: true },
  { id: "CUES", label: "Cues", icon: "⏱", commandPrefix: "VENUE_CUE", roles: ["performer"], engineRefs: ["VenueCurtainDirector"], enabled: true },
  { id: "ROOM_HEALTH", label: "Room Health", icon: "🩺", commandPrefix: "VENUE_HEALTH", roles: ["performer", "lounge-host"], engineRefs: ["VenueStateEngine"], enabled: true },
];

/** Scene definitions — synchronized lighting + mood cues (harvested from legacy mood map). */
export interface VenueSceneDefinition {
  id: string;
  label: string;
  lightingPresetId: string;
  moodPreset: LightingPreset;
  description: string;
}

export const VENUE_SCENE_DEFINITIONS: VenueSceneDefinition[] = [
  { id: "show-open", label: "Show Open", lightingPresetId: "purple-wash", moodPreset: "full-production", description: "Full production wash — main show" },
  { id: "warmup", label: "Warm Up", lightingPresetId: "blue-arena", moodPreset: "stage-blue", description: "Pre-show blue stage" },
  { id: "intermission-cue", label: "Intermission", lightingPresetId: "spotlight", moodPreset: "half-house", description: "Half house — synchronized with curtain close" },
  { id: "encore", label: "Encore", lightingPresetId: "concert-red", moodPreset: "encore-gold", description: "High-energy encore" },
  { id: "blackout-cue", label: "Blackout", lightingPresetId: "blackout", moodPreset: "blackout", description: "Full blackout cue" },
  { id: "party", label: "Party Mode", lightingPresetId: "audience-glow", moodPreset: "party-mode", description: "Audience glow / party" },
];

export function getVenueToolsModule(id: VenueToolsModuleId): VenueToolsModuleDef | undefined {
  return VENUE_TOOLS_MODULES.find((m) => m.id === id);
}

export function listModulesForRole(
  role: "fan" | "performer",
  isLoungeHost = false,
): VenueToolsModuleDef[] {
  return VENUE_TOOLS_MODULES.filter((m) => {
    if (!m.enabled) return false;
    if (isLoungeHost && m.roles.includes("lounge-host")) return true;
    if (role === "performer" && m.roles.includes("performer")) return true;
    if (role === "fan" && m.roles.includes("fan")) return true;
    return false;
  });
}

export function listStageLightingPresets() {
  return Object.values(STAGE_LIGHTING_PRESETS);
}

export function resolveEnvironmentForVenue(venueId: string) {
  return getEnvironmentById(venueId);
}

export function getSceneDefinition(sceneId: string): VenueSceneDefinition | undefined {
  return VENUE_SCENE_DEFINITIONS.find((s) => s.id === sceneId);
}

/** Shell policy — controls whether VENUE TOOLS toggle mounts and edit vs view-only. */
export type VenueToolsPolicy =
  | "NONE"
  | "VIEW_ONLY"
  | "LIMITED"
  | "HOST"
  | "VENUE_OPERATOR"
  | "ADMIN";

export interface VenueToolsPolicyContext {
  role: CommandCenterRole | "venue" | "admin";
  isLive?: boolean;
  isGoLiveContext?: boolean;
  isLoungeHost?: boolean;
}

const POLICY_RANK: Record<VenueToolsPolicy, number> = {
  NONE: 0,
  VIEW_ONLY: 1,
  LIMITED: 2,
  HOST: 3,
  VENUE_OPERATOR: 4,
  ADMIN: 5,
};

export function resolveVenueToolsPolicy(ctx: VenueToolsPolicyContext): VenueToolsPolicy {
  if (ctx.role === "admin") return "ADMIN";
  if (ctx.role === "venue") return "VENUE_OPERATOR";
  if (ctx.isLoungeHost) return "HOST";
  if (ctx.role === "performer") {
    if (ctx.isLive || ctx.isGoLiveContext) return "HOST";
    return "LIMITED";
  }
  // Rule 26 — fans only get venue tools when hosting a lounge (caught above via isLoungeHost).
  if (ctx.role === "fan") return "NONE";
  return "NONE";
}

export function isVenueToolsEnabled(policy: VenueToolsPolicy): boolean {
  return policy !== "NONE";
}

export function isVenueToolsReadOnly(policy: VenueToolsPolicy): boolean {
  return policy === "VIEW_ONLY";
}

export function venueToolsPolicyAtLeast(
  policy: VenueToolsPolicy,
  minimum: VenueToolsPolicy,
): boolean {
  return POLICY_RANK[policy] >= POLICY_RANK[minimum];
}

/** SET THE MOOD — top-level quick presets (maps to scene + lighting). */
export interface SetTheMoodPreset {
  id: string;
  label: string;
  icon: string;
  sceneId: string;
  moodPreset: LightingPreset;
  color: string;
}

export const SET_THE_MOOD_PRESETS: SetTheMoodPreset[] = [
  { id: "energetic", label: "ENERGETIC", icon: "⚡", sceneId: "encore", moodPreset: "strobe-red", color: "#ff4444" },
  { id: "chill", label: "CHILL", icon: "🌙", sceneId: "warmup", moodPreset: "lobby-warm", color: "#ffb347" },
  { id: "concert", label: "CONCERT", icon: "🎤", sceneId: "show-open", moodPreset: "full-production", color: "#ff00ff" },
  { id: "neutral", label: "NEUTRAL", icon: "◻", sceneId: "warmup", moodPreset: "half-house", color: "#888888" },
  { id: "party", label: "PARTY", icon: "🎉", sceneId: "party", moodPreset: "party-mode", color: "#00ffcc" },
  { id: "spotlight", label: "SPOTLIGHT", icon: "💡", sceneId: "show-open", moodPreset: "spotlight-white", color: "#ffffff" },
];

export function getSetTheMoodPreset(id: string): SetTheMoodPreset | undefined {
  return SET_THE_MOOD_PRESETS.find((p) => p.id === id);
}

/** Experience type → base venue-tools policy (before role/capability overlay). */
export type VenueCapableExperienceType =
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "LIVE"
  | "LOUNGE"
  | "WORLD_CONCERT"
  | "WORLD_DANCE_PARTY"
  | "GAME_SHOW"
  | "FAN_LOBBY"
  | "LISTENING_PARTY";

const EXPERIENCE_VENUE_TOOLS_BASE: Record<VenueCapableExperienceType, VenueToolsPolicy> = {
  BATTLE: "LIMITED",
  CYPHER: "LIMITED",
  CHALLENGE: "LIMITED",
  LIVE: "HOST",
  LOUNGE: "HOST",
  WORLD_CONCERT: "HOST",
  WORLD_DANCE_PARTY: "HOST",
  GAME_SHOW: "LIMITED",
  FAN_LOBBY: "VIEW_ONLY",
  LISTENING_PARTY: "VIEW_ONLY",
};

export interface VenueToolsCapabilityFlags {
  isLoungeHost?: boolean;
  isVenueOperator?: boolean;
  canMutateLighting?: boolean;
  canMutateCurtain?: boolean;
}

/** Server-side policy resolver — experience + role + capabilities. */
export function resolveVenueToolsPolicyForExperience(
  experienceType: VenueCapableExperienceType | string | undefined,
  role: CommandCenterRole | "venue" | "admin" | "fan" | "performer",
  capabilities: VenueToolsCapabilityFlags = {},
): VenueToolsPolicy {
  if (role === "admin") return "ADMIN";
  if (role === "venue" || capabilities.isVenueOperator) return "VENUE_OPERATOR";
  if (capabilities.isLoungeHost) return "HOST";

  const base =
    experienceType && experienceType in EXPERIENCE_VENUE_TOOLS_BASE
      ? EXPERIENCE_VENUE_TOOLS_BASE[experienceType as VenueCapableExperienceType]
      : undefined;

  if (role === "performer") {
    if (base === "HOST" || capabilities.canMutateCurtain) return "HOST";
    return base ?? "LIMITED";
  }
  if (role === "fan") {
    if (capabilities.isLoungeHost) return "HOST";
    return base === "VIEW_ONLY" ? "VIEW_ONLY" : "NONE";
  }
  return base ?? "NONE";
}

const EXPERIENCE_MODULE_TO_VENUE_TYPE: Partial<Record<ExperienceModuleId, VenueCapableExperienceType>> = {
  BATTLE: "BATTLE",
  CHALLENGE: "CHALLENGE",
  CYPHER: "CYPHER",
  VIDEO_WINDOW_LOUNGE: "LOUNGE",
  FULL_BODY_DANCE_VENUE: "WORLD_DANCE_PARTY",
  FAN_LOBBY: "FAN_LOBBY",
  MONDAY_NIGHT_STAGE: "LIVE",
  DEAL_OR_FEUD: "GAME_SHOW",
};

/** Wire ExperienceRegistry module id → venue tools policy. */
export function resolveVenueToolsPolicyFromExperienceModule(
  moduleId: ExperienceModuleId | undefined,
  role: CommandCenterRole | "venue" | "admin" | "fan" | "performer",
  capabilities: VenueToolsCapabilityFlags = {},
): VenueToolsPolicy {
  const experienceType = moduleId ? EXPERIENCE_MODULE_TO_VENUE_TYPE[moduleId] : undefined;
  return resolveVenueToolsPolicyForExperience(experienceType, role, capabilities);
}

/** Re-export for API routes — wraps context + experience. */
export function resolveVenueToolsPolicyWithExperience(
  ctx: VenueToolsPolicyContext & { experienceType?: VenueCapableExperienceType | string },
  capabilities: VenueToolsCapabilityFlags = {},
): VenueToolsPolicy {
  const fromExperience = resolveVenueToolsPolicyForExperience(
    ctx.experienceType,
    ctx.role,
    { ...capabilities, isLoungeHost: ctx.isLoungeHost ?? capabilities.isLoungeHost },
  );
  const fromContext = resolveVenueToolsPolicy(ctx);
  return POLICY_RANK[fromExperience] >= POLICY_RANK[fromContext] ? fromExperience : fromContext;
}
