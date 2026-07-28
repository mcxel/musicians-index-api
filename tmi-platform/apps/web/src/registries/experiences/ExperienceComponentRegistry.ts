/**
 * Experience Component Registry — maps ExperienceRegistry IDs to runtime modules.
 * StageLoader resolves manifest, then mounts the component from here.
 */

import type { ComponentType } from "react";
import BattleExperience from "./BattleExperience";
import CypherExperience from "./CypherExperience";
import ChallengeExperience from "./ChallengeExperience";
import MondayNightStageExperience from "./MondayNightStageExperience";
import DealOrFeudExperience from "./DealOrFeudExperience";
import LoungeExperience from "./LoungeExperience";
import WorldDancePartyExperience from "./WorldDancePartyExperience";

export interface ExperienceModuleProps {
  roomId?: string;
  venueId?: string;
}

export const EXPERIENCE_COMPONENT_REGISTRY: Record<
  string,
  ComponentType<ExperienceModuleProps>
> = {
  battle: BattleExperience,
  cypher: CypherExperience,
  challenge: ChallengeExperience,
  "monday-night-stage": MondayNightStageExperience,
  "deal-or-feud": DealOrFeudExperience,
  lounge: LoungeExperience,
  "world-dance-party": WorldDancePartyExperience,
};

export function getExperienceComponent(
  experienceId: string
): ComponentType<ExperienceModuleProps> | undefined {
  return EXPERIENCE_COMPONENT_REGISTRY[experienceId];
}

export function isExperienceMounted(experienceId: string): boolean {
  return experienceId in EXPERIENCE_COMPONENT_REGISTRY;
}
