/**
 * Performer LIVE MIX — crowd routing for Battles / Cyphers / Song Challenges.
 * Reuses ChannelMixerDirector PERSONAL bus. Boo SFX never enter performer monitors.
 * Positive applause/cheer may sit under the beat with ducking; victory cheer after
 * authoritative win confirmation only.
 */

import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export const PERFORMER_LIVE_MIX_CROWD_POLICY_ID =
  "PERFORMER_LIVE_MIX_CROWD_v1" as const;

export const NEW_AUDIO_ENGINE = false as const;
export const BOO_AUDIBLE_IN_PERFORMER_MONITOR = 0 as const;
export const BOT_INFLATES_CHEER_THRESHOLDS = 0 as const;
export const VICTORY_CHEER_BEFORE_OFFICIAL_RESULT = 0 as const;

export type CrowdMixExperience =
  | "BATTLE"
  | "CYPHER"
  | "SONG_CHALLENGE"
  | "OTHER";

export function classifyCrowdMixExperience(
  experienceType: ExperienceType | string | null | undefined,
): CrowdMixExperience {
  const k = String(experienceType ?? "").toUpperCase();
  if (k.includes("BATTLE") || k.includes("VS")) return "BATTLE";
  if (k.includes("CYPHER")) return "CYPHER";
  if (k.includes("SONG") && k.includes("CHALLENGE")) return "SONG_CHALLENGE";
  if (k.includes("CHALLENGE")) return "SONG_CHALLENGE";
  return "OTHER";
}

export function mustSuppressNegativeCrowdInPerformerMix(
  experience: CrowdMixExperience,
): boolean {
  return experience === "BATTLE" || experience === "CYPHER" || experience === "SONG_CHALLENGE";
}

export type PerformerMixPreset = "FOCUS" | "BALANCED" | "CROWD";

export type PerformerCrowdMixPlan = {
  suppressBooInPersonalMonitor: boolean;
  allowPositiveCrowdInPersonalMonitor: boolean;
  duckCrowdUnderBeat: true;
  maxCrowdGain: number;
  suggestedPreset: PerformerMixPreset;
  victoryCheerRequiresOfficialConfirm: true;
  reason: string;
};

export function resolvePerformerCrowdMixPlan(input: {
  experienceType: ExperienceType | string | null | undefined;
  positiveCrowdEnabled: boolean;
  preset?: PerformerMixPreset;
}): PerformerCrowdMixPlan {
  const experience = classifyCrowdMixExperience(input.experienceType);
  const suppress = mustSuppressNegativeCrowdInPerformerMix(experience);
  const preset = input.preset ?? "BALANCED";
  const maxCrowdGain =
    preset === "FOCUS" ? 0.15 : preset === "CROWD" ? 0.55 : 0.35;
  return {
    suppressBooInPersonalMonitor: suppress,
    allowPositiveCrowdInPersonalMonitor: input.positiveCrowdEnabled,
    duckCrowdUnderBeat: true,
    maxCrowdGain,
    suggestedPreset: preset,
    victoryCheerRequiresOfficialConfirm: true,
    reason: suppress
      ? "Battle/Cypher/Song Challenge — boos analytics-only; positive crowd via LIVE MIX"
      : "Non-competitive — crowd routing follows performer personal mix prefs",
  };
}

const NEGATIVE_CROWD_FAMILIES = new Set([
  "BOO",
  "GROAN",
  "DISAPPOINTMENT",
]);

/**
 * Audio-route gate for performer PERSONAL monitor.
 * Boos/groans never enter PERSONAL when suppressBooInPersonalMonitor is set.
 * Positive crowd still allowed when plan.allowPositiveCrowdInPersonalMonitor.
 */
export function mayPlayCrowdReactionInPerformerPersonal(
  reactionFamily: string,
  plan: PerformerCrowdMixPlan,
): boolean {
  const family = String(reactionFamily ?? "").toUpperCase();
  if (NEGATIVE_CROWD_FAMILIES.has(family)) {
    return !plan.suppressBooInPersonalMonitor && Number(BOO_AUDIBLE_IN_PERFORMER_MONITOR) === 1;
  }
  if (!plan.allowPositiveCrowdInPersonalMonitor) return false;
  return true;
}
