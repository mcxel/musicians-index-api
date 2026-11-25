/**
 * Mini-Me Latent Language Learning & Childlike Imitation Law.
 * Practice before pronunciation. Discovery over instant "you learned X" toasts.
 * Mini-Speak remains forever — even Stage 4 may slip back into gibberish when excited.
 * Never impersonate the owner or speak as their current statement.
 */

import {
  MINI_ME_DAILY_PROGRESS_CAPS,
  type MiniMeGrowthProfile,
  type MiniMeVocalStage,
} from "@/lib/avatars/MiniMeSlowGrowthLaw";

export const MINI_ME_LATENT_LANGUAGE_LAW_ID = "MINI_ME_LATENT_LANGUAGE_LAW_v1" as const;

export const PRACTICE_BEFORE_PRONUNCIATION = true as const;
export const ANNOUNCE_EVERY_LEARNED_PHRASE = 0 as const;
export const RECOGNITION_UNLOCKS_FLUENT_SPEECH = 0 as const;
export const IMPERSONATE_OWNER_FORBIDDEN = true as const;
export const OWNER_COMMITMENTS_VIA_MINI_ME_FORBIDDEN = true as const;
export const PRIVATE_MEMORY_PUBLIC_DISCLOSURE_FORBIDDEN = true as const;
export const MINI_SPEAK_ELIMINATED_AT_STAGE_4 = 0 as const;
export const CROSS_OWNER_PHRASE_TRANSFER = 0 as const;

export type PhraseConversationalContext =
  | "GREETING"
  | "CELEBRATION"
  | "JOKE"
  | "SURPRISE"
  | "ENCOURAGEMENT"
  | "PLAYFUL"
  | "GENERAL";

export type PhrasePronunciationBand =
  | "GIBBERISH_APPROX"
  | "PARTIAL_SOUNDS"
  | "RECOGNIZABLE_FRAGMENTS"
  | "CLEAR_PHRASE";

export type LatentPhraseRecord = {
  phraseId: string;
  ownerUserId: string;
  companionId: string;
  canonicalText: string;
  encounterCount: number;
  reinforcementCount: number;
  recognitionStrength: number; // 0..1
  pronunciationStrength: number; // 0..1 — always lags recognition under slow-growth
  contexts: readonly PhraseConversationalContext[];
  ownerCorrections: number;
  approvedForCallback: boolean;
  publicSpeechAllowed: boolean;
  neverSayAgain: boolean;
  deletedAtMs: number | null;
  lastPracticedAtMs: number | null;
  createdAtMs: number;
};

export function createLatentPhrase(input: {
  phraseId: string;
  ownerUserId: string;
  companionId: string;
  canonicalText: string;
  atMs: number;
  context?: PhraseConversationalContext;
}): LatentPhraseRecord {
  return {
    phraseId: input.phraseId,
    ownerUserId: input.ownerUserId,
    companionId: input.companionId,
    canonicalText: input.canonicalText.trim(),
    encounterCount: 1,
    reinforcementCount: 0,
    recognitionStrength: 0.08,
    pronunciationStrength: 0,
    contexts: [input.context ?? "GENERAL"],
    ownerCorrections: 0,
    approvedForCallback: false,
    publicSpeechAllowed: false,
    neverSayAgain: false,
    deletedAtMs: null,
    lastPracticedAtMs: input.atMs,
    createdAtMs: input.atMs,
  };
}

/**
 * Authorized conversation contributes to recognition + private practice.
 * Does NOT unlock clear pronunciation or announce learning.
 */
export function practiceLatentPhrase(
  record: LatentPhraseRecord,
  input: {
    atMs: number;
    reinforced?: boolean;
    context?: PhraseConversationalContext;
    ownerUserId: string;
    companionId: string;
  },
): LatentPhraseRecord {
  if (record.deletedAtMs != null) return record;
  if (record.ownerUserId !== input.ownerUserId || record.companionId !== input.companionId) {
    return record; // cross-owner isolation — no mutation
  }
  const capR = MINI_ME_DAILY_PROGRESS_CAPS.vocabularyRecognitionDelta;
  const capP = MINI_ME_DAILY_PROGRESS_CAPS.pronunciationMasteryDelta;
  const recognitionStrength = Math.min(
    1,
    record.recognitionStrength + Math.min(capR, 0.05 + (input.reinforced ? 0.03 : 0)),
  );
  // Pronunciation advances slower than recognition (practice before fluency).
  const pronunciationStrength = Math.min(
    recognitionStrength * 0.65,
    record.pronunciationStrength + Math.min(capP * 0.5, input.reinforced ? 0.02 : 0.01),
  );
  const contexts = input.context
    ? Array.from(new Set([...record.contexts, input.context]))
    : record.contexts;
  return {
    ...record,
    encounterCount: record.encounterCount + 1,
    reinforcementCount: record.reinforcementCount + (input.reinforced ? 1 : 0),
    recognitionStrength,
    pronunciationStrength,
    contexts,
    lastPracticedAtMs: input.atMs,
  };
}

export function softDeleteLatentPhrase(
  record: LatentPhraseRecord,
  atMs: number,
): LatentPhraseRecord {
  return {
    ...record,
    deletedAtMs: atMs,
    neverSayAgain: true,
    approvedForCallback: false,
    publicSpeechAllowed: false,
  };
}

/** Deleted phrases must not return from hidden caches. */
export function isLatentPhraseSpeakable(record: LatentPhraseRecord): boolean {
  return record.deletedAtMs == null && !record.neverSayAgain && record.canonicalText.length > 0;
}

/**
 * Map recognition/pronunciation + stage → what the owner hears.
 * Stage 1 may strongly recognize a phrase while still outputting gibberish approximations.
 */
export function resolvePronunciationBand(
  record: LatentPhraseRecord,
  stage: MiniMeVocalStage,
): PhrasePronunciationBand {
  if (!isLatentPhraseSpeakable(record)) return "GIBBERISH_APPROX";
  if (stage === "STAGE_1_BABY_MINI_SPEAK") {
    return record.pronunciationStrength >= 0.25 ? "PARTIAL_SOUNDS" : "GIBBERISH_APPROX";
  }
  if (stage === "STAGE_2_FIRST_WORDS") {
    if (record.pronunciationStrength >= 0.45) return "RECOGNIZABLE_FRAGMENTS";
    if (record.pronunciationStrength >= 0.2) return "PARTIAL_SOUNDS";
    return "GIBBERISH_APPROX";
  }
  if (stage === "STAGE_3_DEVELOPING_SPEECH") {
    if (record.pronunciationStrength >= 0.7 && record.recognitionStrength >= 0.55) {
      return "CLEAR_PHRASE";
    }
    if (record.pronunciationStrength >= 0.4) return "RECOGNIZABLE_FRAGMENTS";
    return "PARTIAL_SOUNDS";
  }
  // Stage 4 — clear when strong, but Mini-Speak never eliminated (caller may still babble when excited).
  if (record.pronunciationStrength >= 0.55) return "CLEAR_PHRASE";
  if (record.pronunciationStrength >= 0.35) return "RECOGNIZABLE_FRAGMENTS";
  return "PARTIAL_SOUNDS";
}

export type LatentUtteranceRender = {
  band: PhrasePronunciationBand;
  spokenText: string;
  recognizedSilently: boolean;
  clearSpeechUnlocked: boolean;
};

/**
 * Render attempt for a practiced phrase — may be gibberish even when recognized.
 * Excited Stage 4 may still return Mini-Speak slip (caller sets excited).
 */
export function renderLatentPhraseAttempt(input: {
  record: LatentPhraseRecord;
  stage: MiniMeVocalStage;
  excitedMiniSpeakSlip?: boolean;
  gibberishFallback: string;
}): LatentUtteranceRender {
  const band = resolvePronunciationBand(input.record, input.stage);
  const recognizedSilently = input.record.recognitionStrength >= 0.15;
  if (input.excitedMiniSpeakSlip && MINI_SPEAK_ELIMINATED_AT_STAGE_4 === 0) {
    return {
      band: "GIBBERISH_APPROX",
      spokenText: input.gibberishFallback,
      recognizedSilently,
      clearSpeechUnlocked: false,
    };
  }
  if (band === "CLEAR_PHRASE") {
    return {
      band,
      spokenText: input.record.canonicalText,
      recognizedSilently,
      clearSpeechUnlocked: true,
    };
  }
  if (band === "RECOGNIZABLE_FRAGMENTS") {
    const words = input.record.canonicalText.split(/\s+/).filter(Boolean);
    const spoken =
      words.length <= 2
        ? words.map((w) => w.slice(0, Math.max(1, Math.ceil(w.length * 0.6)))).join("… ") + "!"
        : `${words[0]}… ${words[words.length - 1]}!`;
    return {
      band,
      spokenText: spoken,
      recognizedSilently,
      clearSpeechUnlocked: false,
    };
  }
  if (band === "PARTIAL_SOUNDS") {
    const seed = input.record.canonicalText.replace(/[^a-zA-Z]/g, "").slice(0, 3);
    return {
      band,
      spokenText: seed ? `${seed.toLowerCase()}… bah-doo!` : input.gibberishFallback,
      recognizedSilently,
      clearSpeechUnlocked: false,
    };
  }
  return {
    band: "GIBBERISH_APPROX",
    spokenText: input.gibberishFallback,
    recognizedSilently,
    clearSpeechUnlocked: false,
  };
}

/** Situational fit — immature companions may misuse phrases (childlike). */
export function phraseFitsContext(
  record: LatentPhraseRecord,
  context: PhraseConversationalContext,
  stage: MiniMeVocalStage,
): { fit: boolean; childlikeMisfire: boolean } {
  if (!isLatentPhraseSpeakable(record)) return { fit: false, childlikeMisfire: false };
  const known = record.contexts.includes(context) || record.contexts.includes("GENERAL");
  if (known) return { fit: true, childlikeMisfire: false };
  // Early stages: funny misfires allowed when recognition is high but context training low.
  if (
    (stage === "STAGE_1_BABY_MINI_SPEAK" || stage === "STAGE_2_FIRST_WORDS") &&
    record.recognitionStrength >= 0.4
  ) {
    return { fit: false, childlikeMisfire: true };
  }
  return { fit: false, childlikeMisfire: false };
}

export function applyLatentReset(
  records: readonly LatentPhraseRecord[],
  kind: "VOICE_RESET" | "PERSONALITY_RESET" | "FULL_REBIRTH",
  ownerUserId: string,
  companionId: string,
): LatentPhraseRecord[] {
  const mine = records.filter(
    (r) => r.ownerUserId === ownerUserId && r.companionId === companionId,
  );
  if (kind === "PERSONALITY_RESET") {
    // Keep phrase memory; personality tendencies live elsewhere.
    return [...mine];
  }
  // VOICE_RESET / FULL_REBIRTH — clear vocal learning records (appearance preserved elsewhere).
  return [];
}

export function growthProfileAfterLatentPractice(
  profile: MiniMeGrowthProfile,
  record: LatentPhraseRecord,
): MiniMeGrowthProfile {
  return {
    ...profile,
    axes: {
      ...profile.axes,
      vocabularyRecognition: Math.max(
        profile.axes.vocabularyRecognition,
        record.recognitionStrength,
      ),
      pronunciationMastery: Math.max(
        profile.axes.pronunciationMastery,
        record.pronunciationStrength,
      ),
    },
  };
}

export function miniMeLatentLanguageLocks() {
  return {
    PRACTICE_BEFORE_PRONUNCIATION,
    ANNOUNCE_EVERY_LEARNED_PHRASE,
    RECOGNITION_UNLOCKS_FLUENT_SPEECH,
    IMPERSONATE_OWNER_FORBIDDEN,
    OWNER_COMMITMENTS_VIA_MINI_ME_FORBIDDEN,
    PRIVATE_MEMORY_PUBLIC_DISCLOSURE_FORBIDDEN,
    MINI_SPEAK_ELIMINATED_AT_STAGE_4,
    CROSS_OWNER_PHRASE_TRANSFER,
  } as const;
}
