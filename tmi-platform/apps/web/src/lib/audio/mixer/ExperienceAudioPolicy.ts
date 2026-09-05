/**
 * ExperienceAudioPolicy — maps Experience Registry / HUD experience types
 * to audio mix profiles. Config + policy only; does not own AudioContext.
 */

import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export type ExperienceAudioProfileId =
  | "REHEARSAL"
  | "LIVE_SHOW"
  | "BATTLE"
  | "BATTLE_OF_BANDS"
  | "CYPHER"
  | "LOUNGE"
  | "INTERVIEW"
  | "CHALLENGE"
  | "GAME_SHOW"
  | "RADIO"
  | "DEFAULT";

export interface ExperienceAudioPolicyProfile {
  profileId: ExperienceAudioProfileId;
  /** Suggested PERSONAL preset when opening mixer */
  defaultPreset: MixerPresetId;
  /** Competitors may not change opponents' PROGRAM gains */
  competitiveFairness: boolean;
  /** Crowd channel default (0–1) — never invents audience size */
  crowdDefaultGain: number;
  /** Music/backing default when source exists */
  musicDefaultGain: number;
  /** Ambience default when source exists */
  ambienceDefaultGain: number;
  /** Honest: whether program mix is expected for this experience */
  programMixExpected: boolean;
  notes: string;
}

export type MixerPresetId =
  | "BALANCED"
  | "VOCALS_FORWARD"
  | "MUSIC_FORWARD"
  | "CROWD_UP"
  | "CROWD_LOW"
  | "FOCUS"
  | "REHEARSAL"
  | "RESET";

const PROFILES: Record<ExperienceAudioProfileId, ExperienceAudioPolicyProfile> = {
  REHEARSAL: {
    profileId: "REHEARSAL",
    defaultPreset: "REHEARSAL",
    competitiveFairness: false,
    crowdDefaultGain: 0.15,
    musicDefaultGain: 0.55,
    ambienceDefaultGain: 0.35,
    programMixExpected: true,
    notes: "Practice room — vocals + talkback priority",
  },
  LIVE_SHOW: {
    profileId: "LIVE_SHOW",
    defaultPreset: "BALANCED",
    competitiveFairness: false,
    crowdDefaultGain: 0.45,
    musicDefaultGain: 0.7,
    ambienceDefaultGain: 0.4,
    programMixExpected: true,
    notes: "Live performance — balanced stage + crowd",
  },
  BATTLE: {
    profileId: "BATTLE",
    defaultPreset: "VOCALS_FORWARD",
    competitiveFairness: true,
    crowdDefaultGain: 0.35,
    musicDefaultGain: 0.5,
    ambienceDefaultGain: 0.25,
    programMixExpected: true,
    notes: "Competitive — technical capture disparity only; no talent flattening",
  },
  BATTLE_OF_BANDS: {
    profileId: "BATTLE_OF_BANDS",
    defaultPreset: "MUSIC_FORWARD",
    competitiveFairness: true,
    crowdDefaultGain: 0.4,
    musicDefaultGain: 0.75,
    ambienceDefaultGain: 0.3,
    programMixExpected: true,
    notes: "Band battle — music forward; opponents cannot mute each other on PROGRAM",
  },
  CYPHER: {
    profileId: "CYPHER",
    defaultPreset: "VOCALS_FORWARD",
    competitiveFairness: true,
    crowdDefaultGain: 0.3,
    musicDefaultGain: 0.55,
    ambienceDefaultGain: 0.25,
    programMixExpected: true,
    notes: "Cypher circle — active performer vocals forward",
  },
  LOUNGE: {
    profileId: "LOUNGE",
    defaultPreset: "BALANCED",
    competitiveFairness: false,
    crowdDefaultGain: 0.2,
    musicDefaultGain: 0.45,
    ambienceDefaultGain: 0.5,
    programMixExpected: false,
    notes: "Social lounge — PERSONAL mix primary",
  },
  INTERVIEW: {
    profileId: "INTERVIEW",
    defaultPreset: "VOCALS_FORWARD",
    competitiveFairness: false,
    crowdDefaultGain: 0.1,
    musicDefaultGain: 0.2,
    ambienceDefaultGain: 0.15,
    programMixExpected: true,
    notes: "Interview — speech clarity",
  },
  CHALLENGE: {
    profileId: "CHALLENGE",
    defaultPreset: "FOCUS",
    competitiveFairness: true,
    crowdDefaultGain: 0.25,
    musicDefaultGain: 0.45,
    ambienceDefaultGain: 0.2,
    programMixExpected: true,
    notes: "Challenge — focus on current performer",
  },
  GAME_SHOW: {
    profileId: "GAME_SHOW",
    defaultPreset: "BALANCED",
    competitiveFairness: false,
    crowdDefaultGain: 0.4,
    musicDefaultGain: 0.4,
    ambienceDefaultGain: 0.3,
    programMixExpected: true,
    notes: "Game show — host + contestants balanced",
  },
  RADIO: {
    profileId: "RADIO",
    defaultPreset: "MUSIC_FORWARD",
    competitiveFairness: false,
    crowdDefaultGain: 0.1,
    musicDefaultGain: 0.85,
    ambienceDefaultGain: 0.2,
    programMixExpected: true,
    notes: "Stream & Win / radio — music primary",
  },
  DEFAULT: {
    profileId: "DEFAULT",
    defaultPreset: "BALANCED",
    competitiveFairness: false,
    crowdDefaultGain: 0.3,
    musicDefaultGain: 0.5,
    ambienceDefaultGain: 0.35,
    programMixExpected: false,
    notes: "Fallback profile",
  },
};

export function resolveExperienceAudioProfile(
  experienceType: ExperienceType | string | undefined,
  opts?: { battleOfBands?: boolean; rehearsal?: boolean },
): ExperienceAudioPolicyProfile {
  if (opts?.rehearsal) return PROFILES.REHEARSAL;
  if (opts?.battleOfBands) return PROFILES.BATTLE_OF_BANDS;

  switch (experienceType) {
    case "BATTLE":
      return PROFILES.BATTLE;
    case "CYPHER":
      return PROFILES.CYPHER;
    case "CHALLENGE":
      return PROFILES.CHALLENGE;
    case "WORLD_CONCERT":
    case "WORLD_RELEASE":
    case "LIVE":
      return PROFILES.LIVE_SHOW;
    case "LOUNGE":
    case "LISTENING_PARTY":
      return PROFILES.LOUNGE;
    case "GAME_SHOW":
      return PROFILES.GAME_SHOW;
    case "STREAM_AND_WIN_RADIO":
      return PROFILES.RADIO;
    default:
      return PROFILES.DEFAULT;
  }
}

export function getExperienceAudioPolicy(profileId: ExperienceAudioProfileId): ExperienceAudioPolicyProfile {
  return PROFILES[profileId] ?? PROFILES.DEFAULT;
}

export function listExperienceAudioProfiles(): ExperienceAudioPolicyProfile[] {
  return Object.values(PROFILES);
}
