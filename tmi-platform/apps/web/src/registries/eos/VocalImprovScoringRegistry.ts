/**
 * Vocal Improv scoring profiles — data only (Phase 4.7).
 * Experiences reference profile ids via featureFlags (e.g. scoring:jazz_scat_v1).
 * No pitch/rhythm ML runtime here — Rule 20.
 */

export type VocalImprovMode = "JAZZ_SCAT" | "GIBBERISH";

export interface VocalImprovCriterion {
  id: string;
  label: string;
  /** 0–1 weight within the profile; sum ≈ 1 */
  weight: number;
  description: string;
}

export interface VocalImprovScoringProfile {
  id: string;
  mode: VocalImprovMode;
  displayName: string;
  /** Human-readable sub-category tag (not on ExperienceDefinition — use featureFlags) */
  subCategory: "VOCAL_IMPROV";
  criteria: VocalImprovCriterion[];
}

export const VOCAL_IMPROV_SCORING_REGISTRY: Record<string, VocalImprovScoringProfile> = {
  jazz_scat_v1: {
    id: "jazz_scat_v1",
    mode: "JAZZ_SCAT",
    displayName: "Jazz Scat Battle",
    subCategory: "VOCAL_IMPROV",
    criteria: [
      {
        id: "pitch_contour",
        label: "Pitch Contour",
        weight: 0.25,
        description: "Melodic shape and intentional pitch movement within the scat line",
      },
      {
        id: "rhythm_lock",
        label: "Rhythm Lock",
        weight: 0.25,
        description: "Time feel against the beat — swing, syncopation, pocket",
      },
      {
        id: "vocabulary",
        label: "Scat Vocabulary",
        weight: 0.2,
        description: "Variety and clarity of syllable vocabulary (doo / bah / skiddly, etc.)",
      },
      {
        id: "improvisation",
        label: "Improvisation",
        weight: 0.2,
        description: "Inventiveness and call-and-response inventiveness under pressure",
      },
      {
        id: "crowd_response",
        label: "Crowd Response",
        weight: 0.1,
        description: "Live audience reaction and vote share",
      },
    ],
  },

  gibberish_v1: {
    id: "gibberish_v1",
    mode: "GIBBERISH",
    displayName: "Gibberish Battle",
    subCategory: "VOCAL_IMPROV",
    criteria: [
      {
        id: "energy",
        label: "Energy",
        weight: 0.25,
        description: "Commitment, volume dynamics, and sustained intensity",
      },
      {
        id: "rhythm",
        label: "Rhythm",
        weight: 0.25,
        description: "Rhythmic inventiveness without requiring lexical meaning",
      },
      {
        id: "comedy_timing",
        label: "Comedy Timing",
        weight: 0.2,
        description: "Timing of absurd delivery, punch beats, and pauses",
      },
      {
        id: "originality",
        label: "Originality",
        weight: 0.2,
        description: "Unique sound palette and character — not copying the opponent",
      },
      {
        id: "crowd_response",
        label: "Crowd Response",
        weight: 0.1,
        description: "Live audience reaction and vote share",
      },
    ],
  },
};

export function getVocalImprovScoringProfile(
  id: string
): VocalImprovScoringProfile | undefined {
  return VOCAL_IMPROV_SCORING_REGISTRY[id];
}

export function getVocalImprovScoringByMode(
  mode: VocalImprovMode
): VocalImprovScoringProfile | undefined {
  return Object.values(VOCAL_IMPROV_SCORING_REGISTRY).find((p) => p.mode === mode);
}

/** featureFlag helper: scoring:jazz_scat_v1 → jazz_scat_v1 */
export function scoringProfileIdFromFeatureFlag(flag: string): string | undefined {
  if (!flag.startsWith("scoring:")) return undefined;
  return flag.slice("scoring:".length);
}
