import type { ExperienceCategory, ExperienceDefinition } from "@/core/eos/types";
import {
  EXPERIENCE_REGISTRY as EOS_EXPERIENCE_REGISTRY,
  getAllExperiences as getAllEosExperiences,
  getExperienceById,
} from "@/registries/eos/ExperienceRegistry";

export type ExperienceModuleId =
  | "BATTLE"
  | "CHALLENGE"
  | "CYPHER"
  | "VIDEO_WINDOW_LOUNGE"
  | "FULL_BODY_DANCE_VENUE"
  | "FAN_LOBBY"
  | "MONDAY_NIGHT_STAGE"
  | "DEAL_OR_FEUD"
  | "EXPLORE_GRID";

export interface ExperienceModuleDefinition {
  moduleId: ExperienceModuleId;
  experienceId: string | null;
  title: string;
  category: ExperienceCategory | "DISCOVERY";
  venueType: ExperienceDefinition["venueId"] | null;
  avatarMode: ExperienceDefinition["avatarMode"] | "none";
  cameraPackId: string | null;
  widgetIds: readonly string[];
  entryRoute: string;
  isImmersive: boolean;
}

const EXPERIENCE_MODULE_ALIASES: Record<Exclude<ExperienceModuleId, "EXPLORE_GRID">, string> = {
  BATTLE: "battle",
  CHALLENGE: "challenge",
  CYPHER: "cypher",
  VIDEO_WINDOW_LOUNGE: "lounge",
  FULL_BODY_DANCE_VENUE: "world-dance-party",
  FAN_LOBBY: "fan-lobby",
  MONDAY_NIGHT_STAGE: "monday-night-stage",
  DEAL_OR_FEUD: "deal-or-feud",
};

function toExperienceModuleDefinition(
  moduleId: Exclude<ExperienceModuleId, "EXPLORE_GRID">,
): ExperienceModuleDefinition {
  const experienceId = EXPERIENCE_MODULE_ALIASES[moduleId];
  const definition = getExperienceById(experienceId);
  if (!definition) {
    throw new Error(`Missing EOS experience definition for module ${moduleId}`);
  }

  return {
    moduleId,
    experienceId: definition.id,
    title: definition.title,
    category: definition.category,
    venueType: definition.venueId,
    avatarMode: definition.avatarMode,
    cameraPackId: definition.cameraPackId,
    widgetIds: definition.widgetIds,
    entryRoute: definition.entryRoute,
    isImmersive: definition.networkMode === "WebRTC",
  };
}

export const EXPERIENCE_REGISTRY: Record<ExperienceModuleId, ExperienceModuleDefinition> = {
  BATTLE: toExperienceModuleDefinition("BATTLE"),
  CHALLENGE: toExperienceModuleDefinition("CHALLENGE"),
  CYPHER: toExperienceModuleDefinition("CYPHER"),
  VIDEO_WINDOW_LOUNGE: toExperienceModuleDefinition("VIDEO_WINDOW_LOUNGE"),
  FULL_BODY_DANCE_VENUE: toExperienceModuleDefinition("FULL_BODY_DANCE_VENUE"),
  FAN_LOBBY: toExperienceModuleDefinition("FAN_LOBBY"),
  MONDAY_NIGHT_STAGE: toExperienceModuleDefinition("MONDAY_NIGHT_STAGE"),
  DEAL_OR_FEUD: toExperienceModuleDefinition("DEAL_OR_FEUD"),
  EXPLORE_GRID: {
    moduleId: "EXPLORE_GRID",
    experienceId: null,
    title: "Explore Grid",
    category: "DISCOVERY",
    venueType: null,
    avatarMode: "none",
    cameraPackId: null,
    widgetIds: [],
    entryRoute: "/explore",
    isImmersive: false,
  },
};

export function getExperienceDefinition(
  moduleId: ExperienceModuleId | undefined,
): ExperienceModuleDefinition | null {
  if (!moduleId) return null;
  return EXPERIENCE_REGISTRY[moduleId] ?? null;
}

export function getAllExperiences(): ExperienceModuleDefinition[] {
  return Object.values(EXPERIENCE_REGISTRY);
}

export { EOS_EXPERIENCE_REGISTRY, getAllEosExperiences };