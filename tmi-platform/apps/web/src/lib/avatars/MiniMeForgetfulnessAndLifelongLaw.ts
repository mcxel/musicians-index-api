/**
 * Mini-Me Playful Forgetfulness + Lifelong Learning Law.
 * Rusty = decline in active recall / performance confidence — NOT permanent deletion.
 * Relearning recovers faster than first-time learning.
 * No hard final ceiling — growth slows but never permanently stops.
 * Mini-Speak remains forever (excited / confused / rusty).
 *
 * AG Phase 2 addendum contract — Cursor owns pure rules + event shapes for HUD.
 * PHYSICAL_VERIFIED=NO. Simulated time in tests ≠ physical years.
 */

import type { LatentPhraseRecord } from "@/lib/avatars/MiniMeLatentLanguageLaw";
import {
  renderLatentPhraseAttempt,
  type PhrasePronunciationBand,
} from "@/lib/avatars/MiniMeLatentLanguageLaw";
import type { MiniMeVocalStage } from "@/lib/avatars/MiniMeSlowGrowthLaw";

export const MINI_ME_FORGETFULNESS_LIFELONG_LAW_ID =
  "MINI_ME_FORGETFULNESS_LIFELONG_LAW_v1" as const;

/** Rusty ≠ wipe. Underlying memory / peak history preserved. */
export const FORGETFULNESS_PERMANENTLY_DELETES_MEMORY = 0 as const;
export const ABSENCE_REGRESSES_TO_INFANCY = 0 as const;
export const ABSENCE_ERASES_OWNERSHIP_OR_PURCHASES = 0 as const;
export const ONE_GLOBAL_INTELLIGENCE_METER = 0 as const;
export const HARD_DEVELOPMENT_CEILING = 0 as const;
export const LEARNING_STOPS_AFTER_STAGE_4 = 0 as const;
export const SAME_DAY_DUPLICATE_GROWTH_ALLOWED = 0 as const;
/** Companion feature — never a monetized “unstick” shortcut. */
export const PAID_RECOVERY_SHORTCUT = 0 as const;
/** Login / passive view / background heartbeat ≠ training. */
export const PASSIVE_LOGIN_COUNTS_AS_PLAY = 0 as const;

export type MiniMeSkillKind = "PHRASE" | "GESTURE" | "DANCE" | "MANNERISM" | "SITUATIONAL_HUMOR";

/**
 * Qualifying owner play/training that resets the inactivity clock.
 * Ordinary login, passive viewing, and background processes do NOT qualify.
 */
export type QualifyingMiniMeInteraction =
  | "COMPANION_MIC_TALK"
  | "TEACH_PHRASE"
  | "REINFORCE_PHRASE"
  | "PLAY_EMOTE_WITH_COMPANION"
  | "DANCE_WITH_COMPANION"
  | "IDLE_TOUCH_PLAY"
  | "CATCHPHRASE_TRAINING";

export type NonQualifyingPresence =
  | "LOGIN"
  | "PASSIVE_VIEW"
  | "BACKGROUND_HEARTBEAT"
  | "PROFILE_BROWSE"
  | "NOTIFICATION_OPEN";

export function isQualifyingMiniMePlay(kind: QualifyingMiniMeInteraction | NonQualifyingPresence): boolean {
  if (PASSIVE_LOGIN_COUNTS_AS_PLAY !== 0) return true;
  return (
    kind === "COMPANION_MIC_TALK" ||
    kind === "TEACH_PHRASE" ||
    kind === "REINFORCE_PHRASE" ||
    kind === "PLAY_EMOTE_WITH_COMPANION" ||
    kind === "DANCE_WITH_COMPANION" ||
    kind === "IDLE_TOUCH_PLAY" ||
    kind === "CATCHPHRASE_TRAINING"
  );
}

export type MiniMeSkillProficiency = {
  skillId: string;
  kind: MiniMeSkillKind;
  ownerUserId: string;
  companionId: string;
  /** Bound to latent phrase when kind=PHRASE */
  phraseId: string | null;
  label: string;
  firstLearnedAtMs: number;
  lastMeaningfulPracticeAtMs: number;
  practiceCount: number;
  /** Peak recognition ever achieved — never decayed by rust. */
  peakRecognition: number;
  /** Peak pronunciation / performance — never decayed by rust. */
  peakPerformance: number;
  /** Active recall confidence 0..1 — decays with inactivity. */
  recallConfidence: number;
  /** Active performance proficiency 0..1 — decays with inactivity. */
  performanceProficiency: number;
  /** Recovery multiplier >1 when relearning after rust (bounded). */
  recoveryBoost: number;
  lastCalendarPracticeDayKey: string | null;
};

export type RustSeverity = "SHARP" | "SLIGHTLY_RUSTY" | "FUNNY_FORGETFUL" | "NEEDS_REMINDER";

export type RustySpeechEvent = {
  type: "RUSTY_SPEECH";
  skillId: string;
  severity: RustSeverity;
  spokenText: string;
  band: PhrasePronunciationBand;
  gestureHint: "CONFUSED_SCRATCH" | "HESITATE" | "GIGGLE" | "NONE";
};

export type RelearnCelebrationEvent = {
  type: "RELEARN_CELEBRATION";
  skillId: string;
  spokenText: string;
  recovered: boolean;
};

export type LifelongDiscoveryEvent = {
  type: "LIFELONG_SKILL_DISCOVERY";
  skillId: string;
  kind: MiniMeSkillKind;
  yearIndex: number;
};

const MS_DAY = 86_400_000;

/**
 * Official inactivity schedule (owner vote: 21 days first funny, 30 noticeable).
 * Days 1–20: SHARP · Day 21: mild mistakes · Days 22–29: gradual ·
 * Day 30: noticeable · Day 45+: stronger rust (memories preserved).
 * Onset is internally configurable; production default = 21.
 */
export const RUST_ONSET_IDLE_DAYS_DEFAULT = 21 as const;
export const RUST_ONSET_IDLE_DAYS = RUST_ONSET_IDLE_DAYS_DEFAULT;
/** Day 30 — more noticeable confusion / rusty phrases. */
export const RUST_NOTICEABLE_IDLE_DAYS = 30 as const;
/** Day 45+ — stronger forgetfulness; underlying memory intact. */
export const RUST_STRONG_IDLE_DAYS = 45 as const;
/** @deprecated alias — use RUST_NOTICEABLE_IDLE_DAYS */
export const RUST_FUNNY_IDLE_DAYS = RUST_NOTICEABLE_IDLE_DAYS;
/** @deprecated alias — use RUST_STRONG_IDLE_DAYS */
export const RUST_NEEDS_REMINDER_IDLE_DAYS = RUST_STRONG_IDLE_DAYS;

let rustOnsetOverride: number | null = null;

/** Internal config only — default 21. Never expose as a paid unstick. */
export function setRustOnsetIdleDaysForTests(days: number | null): void {
  rustOnsetOverride = days;
}

export function getRustOnsetIdleDays(): number {
  return rustOnsetOverride ?? RUST_ONSET_IDLE_DAYS_DEFAULT;
}

/**
 * Days idle → rust severity.
 * Uses absolute day bands so day 30/45 stay meaningful even if onset override changes.
 */
export function rustSeverityForIdleDays(idleDays: number): RustSeverity {
  const onset = getRustOnsetIdleDays();
  if (idleDays < onset) return "SHARP";
  if (idleDays < RUST_NOTICEABLE_IDLE_DAYS) return "SLIGHTLY_RUSTY"; // 21–29 default
  if (idleDays < RUST_STRONG_IDLE_DAYS) return "FUNNY_FORGETFUL"; // 30–44
  return "NEEDS_REMINDER"; // 45+
}

export type OwnerReturnWelcomeEvent = {
  type: "OWNER_RETURN_WELCOME";
  idleDays: number;
  wasRusty: boolean;
  line: string;
  gestureHint: "EXCITED_BOUNCE" | "GIGGLE" | "WAVE";
};

/** Playful welcome when owner returns after rust onset — never punitive. */
export function buildOwnerReturnWelcome(idleDays: number): OwnerReturnWelcomeEvent | null {
  if (idleDays < getRustOnsetIdleDays()) return null;
  const wasRusty = true;
  const line =
    idleDays >= RUST_STRONG_IDLE_DAYS
      ? "HEY! You back! I... I... yabba-dabba... forgot what I was saying!"
      : idleDays >= RUST_NOTICEABLE_IDLE_DAYS
        ? "You back! Mee-mee... practice again?"
        : "Hey! You back! Bah-doo... almost forgot!";
  return {
    type: "OWNER_RETURN_WELCOME",
    idleDays,
    wasRusty,
    line,
    gestureHint: "EXCITED_BOUNCE",
  };
}

export function idleDaysSince(
  lastPracticeAtMs: number | null,
  nowMs: number,
): number {
  if (lastPracticeAtMs == null) return 0;
  return Math.max(0, Math.floor((nowMs - lastPracticeAtMs) / MS_DAY));
}

export function calendarDayKey(atMs: number): string {
  const d = new Date(atMs);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

export function createSkillFromPhrase(
  phrase: LatentPhraseRecord,
  atMs: number,
): MiniMeSkillProficiency {
  return {
    skillId: `skill:phrase:${phrase.phraseId}`,
    kind: "PHRASE",
    ownerUserId: phrase.ownerUserId,
    companionId: phrase.companionId,
    phraseId: phrase.phraseId,
    label: phrase.canonicalText,
    firstLearnedAtMs: phrase.createdAtMs,
    lastMeaningfulPracticeAtMs: phrase.lastPracticedAtMs ?? atMs,
    practiceCount: Math.max(1, phrase.reinforcementCount + phrase.encounterCount),
    peakRecognition: phrase.recognitionStrength,
    peakPerformance: phrase.pronunciationStrength,
    recallConfidence: phrase.recognitionStrength,
    performanceProficiency: phrase.pronunciationStrength,
    recoveryBoost: 1,
    lastCalendarPracticeDayKey: calendarDayKey(atMs),
  };
}

/**
 * Apply playful rust from inactivity — peaks preserved; recall/performance decline.
 * Does NOT delete skill, regress companion to infancy, or touch ownership.
 */
export function applyPlayfulRust(
  skill: MiniMeSkillProficiency,
  nowMs: number,
): MiniMeSkillProficiency {
  const idle = idleDaysSince(skill.lastMeaningfulPracticeAtMs, nowMs);
  const severity = rustSeverityForIdleDays(idle);
  if (severity === "SHARP") return skill;

  // Bounded decay rates — never wipe below a soft floor of peak * floorFrac
  const floorFrac =
    severity === "SLIGHTLY_RUSTY" ? 0.75 : severity === "FUNNY_FORGETFUL" ? 0.45 : 0.25;
  const decay =
    severity === "SLIGHTLY_RUSTY" ? 0.08 : severity === "FUNNY_FORGETFUL" ? 0.22 : 0.35;

  const floorR = skill.peakRecognition * floorFrac;
  const floorP = skill.peakPerformance * floorFrac;
  return {
    ...skill,
    recallConfidence: Math.max(floorR, skill.recallConfidence * (1 - decay)),
    performanceProficiency: Math.max(floorP, skill.performanceProficiency * (1 - decay)),
    // Recovery gets easier once rusty (relearn faster than first learn)
    recoveryBoost: Math.min(2.5, skill.recoveryBoost + (severity === "NEEDS_REMINDER" ? 0.35 : 0.15)),
  };
}

/**
 * Practice / relearn — same-day duplicate growth blocked.
 * Previously rusty skills recover faster via recoveryBoost.
 */
export function practiceSkill(
  skill: MiniMeSkillProficiency,
  input: {
    atMs: number;
    ownerUserId: string;
    companionId: string;
    /** First-time learning uses 1.0; relearn uses skill.recoveryBoost */
    isRelearn?: boolean;
  },
): { skill: MiniMeSkillProficiency; grew: boolean; celebration: boolean } {
  if (skill.ownerUserId !== input.ownerUserId || skill.companionId !== input.companionId) {
    return { skill, grew: false, celebration: false };
  }
  const day = calendarDayKey(input.atMs);
  if (
    SAME_DAY_DUPLICATE_GROWTH_ALLOWED === 0 &&
    skill.lastCalendarPracticeDayKey === day
  ) {
    return {
      skill: {
        ...skill,
        lastMeaningfulPracticeAtMs: input.atMs,
      },
      grew: false,
      celebration: false,
    };
  }

  const wasRusty = skill.performanceProficiency < skill.peakPerformance * 0.85;
  const boost = input.isRelearn || wasRusty ? Math.max(1.25, skill.recoveryBoost) : 1;
  const stepR = Math.min(0.12, 0.04 * boost);
  const stepP = Math.min(0.1, 0.03 * boost);

  const recallConfidence = Math.min(1, skill.recallConfidence + stepR);
  const performanceProficiency = Math.min(
    recallConfidence * 0.9,
    Math.min(1, skill.performanceProficiency + stepP),
  );
  const peakRecognition = Math.max(skill.peakRecognition, recallConfidence);
  const peakPerformance = Math.max(skill.peakPerformance, performanceProficiency);

  const celebration =
    wasRusty && performanceProficiency >= skill.peakPerformance * 0.9;

  return {
    skill: {
      ...skill,
      lastMeaningfulPracticeAtMs: input.atMs,
      practiceCount: skill.practiceCount + 1,
      recallConfidence,
      performanceProficiency,
      peakRecognition,
      peakPerformance,
      recoveryBoost: celebration ? Math.max(1, skill.recoveryBoost * 0.9) : skill.recoveryBoost,
      lastCalendarPracticeDayKey: day,
    },
    grew: true,
    celebration,
  };
}

/** Effective pronunciation band after rust — may drop to Mini-Speak without deleting memory. */
export function rustyPronunciationBand(
  skill: MiniMeSkillProficiency,
  stage: MiniMeVocalStage,
): PhrasePronunciationBand {
  const p = skill.performanceProficiency;
  if (stage === "STAGE_1_BABY_MINI_SPEAK") {
    return p >= 0.25 ? "PARTIAL_SOUNDS" : "GIBBERISH_APPROX";
  }
  if (p >= 0.7) return "CLEAR_PHRASE";
  if (p >= 0.45) return "RECOGNIZABLE_FRAGMENTS";
  if (p >= 0.2) return "PARTIAL_SOUNDS";
  return "GIBBERISH_APPROX";
}

export function buildRustySpeechEvent(input: {
  skill: MiniMeSkillProficiency;
  phrase: LatentPhraseRecord;
  stage: MiniMeVocalStage;
  nowMs: number;
  gibberishFallback: string;
}): RustySpeechEvent {
  const rusted = applyPlayfulRust(input.skill, input.nowMs);
  const idle = idleDaysSince(rusted.lastMeaningfulPracticeAtMs, input.nowMs);
  const severity = rustSeverityForIdleDays(idle);
  // Temporarily override pronunciation for render via a synthetic record
  const synthetic: LatentPhraseRecord = {
    ...input.phrase,
    recognitionStrength: rusted.recallConfidence,
    pronunciationStrength: rusted.performanceProficiency,
  };
  const rendered = renderLatentPhraseAttempt({
    record: synthetic,
    stage: input.stage,
    gibberishFallback: input.gibberishFallback,
    excitedMiniSpeakSlip: severity === "FUNNY_FORGETFUL" || severity === "NEEDS_REMINDER",
  });
  const gestureHint =
    severity === "SHARP"
      ? "NONE"
      : severity === "SLIGHTLY_RUSTY"
        ? "HESITATE"
        : severity === "FUNNY_FORGETFUL"
          ? "GIGGLE"
          : "CONFUSED_SCRATCH";
  return {
    type: "RUSTY_SPEECH",
    skillId: rusted.skillId,
    severity,
    spokenText: rendered.spokenText,
    band: rustyPronunciationBand(rusted, input.stage),
    gestureHint,
  };
}

/**
 * Lifelong learning rate — slows with maturity years but never hits zero.
 * yearIndex 0 = first year of companion life.
 */
export function lifelongLearningRate(yearIndex: number): number {
  if (HARD_DEVELOPMENT_CEILING !== 0 || LEARNING_STOPS_AFTER_STAGE_4 !== 0) return 0;
  const y = Math.max(0, yearIndex);
  // Year 0–1: 1.0 → year 2: 0.55 → year 5+: asymptote ~0.22
  return Math.max(0.18, 1 / (1 + y * 0.55));
}

export function canAcquireNewLifelongSkill(input: {
  stage: MiniMeVocalStage;
  yearIndex: number;
  existingSkillCount: number;
  softCapSkills?: number;
}): { ok: boolean; rate: number; reason: string } {
  if (HARD_DEVELOPMENT_CEILING !== 0) {
    return { ok: false, rate: 0, reason: "HARD_CEILING_FORBIDDEN_STATE" };
  }
  const rate = lifelongLearningRate(input.yearIndex);
  const softCap = input.softCapSkills ?? 500;
  if (input.existingSkillCount >= softCap) {
    // Soft storage bound — can still refine existing skills; new IDs need pruning policy (AG).
    return { ok: false, rate, reason: "SOFT_STORAGE_CAP" };
  }
  // Stage 4+ still learns; stage 1 can acquire opportunities but not fluent skills.
  return { ok: true, rate, reason: "LIFELONG_OPEN" };
}

export function acquireLifelongSkill(input: {
  ownerUserId: string;
  companionId: string;
  skillId: string;
  kind: MiniMeSkillKind;
  label: string;
  atMs: number;
  yearIndex: number;
  stage: MiniMeVocalStage;
  existingSkillCount: number;
}): { skill: MiniMeSkillProficiency | null; event: LifelongDiscoveryEvent | null; reason: string } {
  const gate = canAcquireNewLifelongSkill({
    stage: input.stage,
    yearIndex: input.yearIndex,
    existingSkillCount: input.existingSkillCount,
  });
  if (!gate.ok) return { skill: null, event: null, reason: gate.reason };
  const rate = gate.rate;
  const skill: MiniMeSkillProficiency = {
    skillId: input.skillId,
    kind: input.kind,
    ownerUserId: input.ownerUserId,
    companionId: input.companionId,
    phraseId: input.kind === "PHRASE" ? input.skillId.replace(/^skill:phrase:/, "") : null,
    label: input.label,
    firstLearnedAtMs: input.atMs,
    lastMeaningfulPracticeAtMs: input.atMs,
    practiceCount: 1,
    peakRecognition: 0.05 * rate,
    peakPerformance: 0,
    recallConfidence: 0.05 * rate,
    performanceProficiency: 0,
    recoveryBoost: 1,
    lastCalendarPracticeDayKey: calendarDayKey(input.atMs),
  };
  return {
    skill,
    event: {
      type: "LIFELONG_SKILL_DISCOVERY",
      skillId: skill.skillId,
      kind: skill.kind,
      yearIndex: input.yearIndex,
    },
    reason: "ACQUIRED",
  };
}

/** Skills decay independently — dancing practiced, phrase idle → phrase rusts only. */
export function applyRustToSkillMap(
  skills: readonly MiniMeSkillProficiency[],
  nowMs: number,
): MiniMeSkillProficiency[] {
  return skills.map((s) => applyPlayfulRust(s, nowMs));
}

export function miniMeForgetfulnessLifelongLocks() {
  return {
    FORGETFULNESS_PERMANENTLY_DELETES_MEMORY,
    ABSENCE_REGRESSES_TO_INFANCY,
    ABSENCE_ERASES_OWNERSHIP_OR_PURCHASES,
    ONE_GLOBAL_INTELLIGENCE_METER,
    HARD_DEVELOPMENT_CEILING,
    LEARNING_STOPS_AFTER_STAGE_4,
    SAME_DAY_DUPLICATE_GROWTH_ALLOWED,
    PAID_RECOVERY_SHORTCUT,
    PASSIVE_LOGIN_COUNTS_AS_PLAY,
    RUST_ONSET_IDLE_DAYS,
    RUST_NOTICEABLE_IDLE_DAYS,
    RUST_STRONG_IDLE_DAYS,
  } as const;
}
