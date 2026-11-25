/**
 * Mini-Me Slow-Growth Development Law — Furby-style pacing.
 * Phrase acquisition ≠ vocal mastery. Calendar alone never advances stage.
 * Paid tiers never accelerate progression. Mini-Speak remains permanent.
 *
 * PHYSICAL_VERIFIED=NO until real-device long-term certification.
 * Simulated time in tests ≠ physical certification.
 */

export const MINI_ME_SLOW_GROWTH_LAW_ID = "MINI_ME_SLOW_GROWTH_LAW_v1" as const;

export const INSTANT_FLUENT_SPEECH_FORBIDDEN = true as const;
export const CALENDAR_ALONE_ADVANCES_STAGE = 0 as const;
export const PAID_TIER_ACCELERATES_GROWTH = 0 as const;
export const PASSIVE_MIC_SURVEILLANCE_FORBIDDEN = true as const;
export const MINI_SPEAK_PERMANENT_PERSONALITY = true as const;
export const NEW_MINI_ME_VOICE_ENGINE = false as const;
/** Stage 4 is a maturity band — not a finished character. See MiniMeForgetfulnessAndLifelongLaw. */
export const HARD_DEVELOPMENT_CEILING = 0 as const;
export const LEARNING_STOPS_AFTER_STAGE_4 = 0 as const;

/** Manufacturing vocal stages (JOB-MINIME-VOICE-REBIRTH-001). */
export const MINI_ME_VOCAL_STAGES = [
  "STAGE_1_BABY_MINI_SPEAK",
  "STAGE_2_FIRST_WORDS",
  "STAGE_3_DEVELOPING_SPEECH",
  "STAGE_4_EVOLVED_COMPANION",
] as const;

export type MiniMeVocalStage = (typeof MINI_ME_VOCAL_STAGES)[number];

/** Suggested pacing targets (interaction-gated, not calendar-only). */
export const MINI_ME_STAGE_MIN_ACTIVE_DAYS: Record<MiniMeVocalStage, number> = {
  STAGE_1_BABY_MINI_SPEAK: 0,
  STAGE_2_FIRST_WORDS: 28, // ~weeks 1–4 before First Words eligibility
  STAGE_3_DEVELOPING_SPEECH: 60, // ~months 2–3
  STAGE_4_EVOLVED_COMPANION: 180, // ~month 6+
};

/** Daily progression caps — recognition vs pronunciation tracked separately. */
export const MINI_ME_DAILY_PROGRESS_CAPS = {
  vocabularyRecognitionDelta: 0.08,
  pronunciationMasteryDelta: 0.04,
  personalityConfidenceDelta: 0.05,
  socialConfidenceDelta: 0.05,
} as const;

export type MiniMeGrowthAxes = {
  vocabularyRecognition: number; // 0..1 — can recognize before saying correctly
  pronunciationMastery: number; // 0..1 — fluency of learned phrases
  personalityConfidence: number;
  socialConfidence: number;
  gestureConfidence: number;
};

export type MiniMeGrowthProfile = {
  ownerUserId: string;
  companionId: string;
  stage: MiniMeVocalStage;
  axes: MiniMeGrowthAxes;
  activeInteractionDays: number;
  lastMeaningfulInteractionAtMs: number | null;
  /** Learning a phrase stores opportunity — not instant fluent speech. */
  pendingPhraseIds: readonly string[];
  masteredPhraseIds: readonly string[];
};

export function defaultGrowthAxes(): MiniMeGrowthAxes {
  return {
    vocabularyRecognition: 0,
    pronunciationMastery: 0,
    personalityConfidence: 0.1,
    socialConfidence: 0.05,
    gestureConfidence: 0.1,
  };
}

export function createNewbornGrowthProfile(input: {
  ownerUserId: string;
  companionId: string;
}): MiniMeGrowthProfile {
  return {
    ownerUserId: input.ownerUserId,
    companionId: input.companionId,
    stage: "STAGE_1_BABY_MINI_SPEAK",
    axes: defaultGrowthAxes(),
    activeInteractionDays: 0,
    lastMeaningfulInteractionAtMs: null,
    pendingPhraseIds: [],
    masteredPhraseIds: [],
  };
}

/**
 * Phrase acquisition stores a learning opportunity only.
 * Does NOT unlock fluent speech or advance vocal stage.
 */
export function acquirePhraseOpportunity(
  profile: MiniMeGrowthProfile,
  phraseId: string,
): MiniMeGrowthProfile {
  if (profile.pendingPhraseIds.includes(phraseId) || profile.masteredPhraseIds.includes(phraseId)) {
    return profile;
  }
  return {
    ...profile,
    pendingPhraseIds: [...profile.pendingPhraseIds, phraseId],
    axes: {
      ...profile.axes,
      vocabularyRecognition: Math.min(
        1,
        profile.axes.vocabularyRecognition + MINI_ME_DAILY_PROGRESS_CAPS.vocabularyRecognitionDelta * 0.25,
      ),
    },
  };
}

/**
 * Apply one meaningful interaction day of progress (capped).
 * Calendar idle never calls this — only authorized teaching / play / reinforcement.
 */
export function applyMeaningfulInteractionDay(
  profile: MiniMeGrowthProfile,
  atMs: number,
  deltas: Partial<MiniMeGrowthAxes> = {},
): MiniMeGrowthProfile {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const cap = MINI_ME_DAILY_PROGRESS_CAPS;
  const nextAxes: MiniMeGrowthAxes = {
    vocabularyRecognition: clamp01(
      profile.axes.vocabularyRecognition +
        Math.min(cap.vocabularyRecognitionDelta, deltas.vocabularyRecognition ?? 0),
    ),
    pronunciationMastery: clamp01(
      profile.axes.pronunciationMastery +
        Math.min(cap.pronunciationMasteryDelta, deltas.pronunciationMastery ?? 0),
    ),
    personalityConfidence: clamp01(
      profile.axes.personalityConfidence +
        Math.min(cap.personalityConfidenceDelta, deltas.personalityConfidence ?? 0),
    ),
    socialConfidence: clamp01(
      profile.axes.socialConfidence +
        Math.min(cap.socialConfidenceDelta, deltas.socialConfidence ?? 0),
    ),
    gestureConfidence: clamp01(
      profile.axes.gestureConfidence + Math.min(0.05, deltas.gestureConfidence ?? 0),
    ),
  };
  const activeDays = profile.activeInteractionDays + 1;
  const stage = resolveStageEligibility({
    ...profile,
    axes: nextAxes,
    activeInteractionDays: activeDays,
  });
  return {
    ...profile,
    axes: nextAxes,
    activeInteractionDays: activeDays,
    lastMeaningfulInteractionAtMs: atMs,
    stage,
  };
}

/** Stage advance requires both min active days AND axis thresholds. */
export function resolveStageEligibility(profile: MiniMeGrowthProfile): MiniMeVocalStage {
  const days = profile.activeInteractionDays;
  const { vocabularyRecognition: vocab, pronunciationMastery: pron } = profile.axes;
  if (
    days >= MINI_ME_STAGE_MIN_ACTIVE_DAYS.STAGE_4_EVOLVED_COMPANION &&
    vocab >= 0.7 &&
    pron >= 0.55
  ) {
    return "STAGE_4_EVOLVED_COMPANION";
  }
  if (
    days >= MINI_ME_STAGE_MIN_ACTIVE_DAYS.STAGE_3_DEVELOPING_SPEECH &&
    vocab >= 0.45 &&
    pron >= 0.3
  ) {
    return "STAGE_3_DEVELOPING_SPEECH";
  }
  if (
    days >= MINI_ME_STAGE_MIN_ACTIVE_DAYS.STAGE_2_FIRST_WORDS &&
    vocab >= 0.2
  ) {
    return "STAGE_2_FIRST_WORDS";
  }
  return "STAGE_1_BABY_MINI_SPEAK";
}

/**
 * How a spontaneous callback may sound at the current stage.
 * Recognition can precede fluent pronunciation.
 */
export function catchphraseRenditionForStage(
  stage: MiniMeVocalStage,
): "BABBLE_OR_PARTIAL" | "SHORT_RECOGNIZABLE" | "CLEARER_PHRASE" | "NATURAL_EXPRESSIVE" {
  if (stage === "STAGE_1_BABY_MINI_SPEAK") return "BABBLE_OR_PARTIAL";
  if (stage === "STAGE_2_FIRST_WORDS") return "SHORT_RECOGNIZABLE";
  if (stage === "STAGE_3_DEVELOPING_SPEECH") return "CLEARER_PHRASE";
  return "NATURAL_EXPRESSIVE";
}

export function applyGrowthReset(
  profile: MiniMeGrowthProfile,
  kind: "VOICE_RESET" | "PERSONALITY_RESET" | "FULL_REBIRTH",
): MiniMeGrowthProfile {
  if (kind === "VOICE_RESET") {
    return {
      ...profile,
      stage: "STAGE_1_BABY_MINI_SPEAK",
      axes: {
        ...profile.axes,
        vocabularyRecognition: 0,
        pronunciationMastery: 0,
      },
      pendingPhraseIds: [],
      masteredPhraseIds: [],
    };
  }
  if (kind === "PERSONALITY_RESET") {
    return {
      ...profile,
      axes: {
        ...profile.axes,
        personalityConfidence: 0.1,
        socialConfidence: 0.05,
        gestureConfidence: 0.1,
      },
    };
  }
  return createNewbornGrowthProfile({
    ownerUserId: profile.ownerUserId,
    companionId: profile.companionId,
  });
}

export function miniMeSlowGrowthLocks() {
  return {
    INSTANT_FLUENT_SPEECH_FORBIDDEN,
    CALENDAR_ALONE_ADVANCES_STAGE,
    PAID_TIER_ACCELERATES_GROWTH,
    PASSIVE_MIC_SURVEILLANCE_FORBIDDEN,
    MINI_SPEAK_PERMANENT_PERSONALITY,
    NEW_MINI_ME_VOICE_ENGINE,
    HARD_DEVELOPMENT_CEILING,
    LEARNING_STOPS_AFTER_STAGE_4,
    STAGES: MINI_ME_VOCAL_STAGES.length,
  } as const;
}
