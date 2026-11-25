/**
 * MiniMeCompanionRuntimeService — Canonical Backend Authority for Mini-Me Companion
 * Persistent Memory, Dedicated Companion Microphone Sessions, Latent Language Learning,
 * 21-Day Playful Forgetfulness, Lifelong Learning, Sporadic Idle Personality,
 * Spontaneous Callback Privacy & Atomic Reset/Rebirth.
 *
 * Consolidates all durable Mini-Me companion operations behind one owner-isolated
 * service supporting both SQL/Prisma QueueDb transactions (pg_advisory_xact_lock)
 * and a deterministic transactional store adapter for offline/ephemeral testing.
 */

import { randomUUID } from "crypto";
import type { QueueDb, QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import {
  CALENDAR_ALONE_ADVANCES_STAGE,
  HARD_DEVELOPMENT_CEILING,
  INSTANT_FLUENT_SPEECH_FORBIDDEN,
  LEARNING_STOPS_AFTER_STAGE_4,
  MINI_ME_STAGE_MIN_ACTIVE_DAYS,
  MINI_ME_VOCAL_STAGES,
  PAID_TIER_ACCELERATES_GROWTH,
  acquirePhraseOpportunity,
  applyGrowthReset,
  applyMeaningfulInteractionDay,
  catchphraseRenditionForStage,
  createNewbornGrowthProfile,
  defaultGrowthAxes,
  resolveStageEligibility,
  type MiniMeGrowthAxes,
  type MiniMeGrowthProfile,
  type MiniMeVocalStage,
} from "@/lib/avatars/MiniMeSlowGrowthLaw";
import {
  COMPANION_MIC_ACTIVATES_BROADCAST_MIC,
  COMPANION_MIC_AUTO_PUBLISHES_WEBRTC,
  COMPANION_MIC_AUTO_ROOM_CHAT,
  COMPANION_MIC_CONTINUOUS_BG_RECORD,
  COMPANION_MIC_JOINS_VENUE_AUDIO,
  FIRST_HELLO_PROMPT,
  RAW_MIC_RECORDINGS_STORED_BY_DEFAULT,
  STAGE1_HELLO_MINI_SPEAK_VARIANTS,
  assertCompanionMicIsolation,
  beginCompanionListening,
  classifyCompanionUtteranceIntent,
  createCompanionMicSession,
  markFirstHelloCompleted,
  selectImmediateCompanionReply,
  stopCompanionListening,
  type CompanionMicSession,
  type CompanionMicSurface,
  type CompanionUtteranceIntent,
  type CompanionVoiceReply,
} from "@/lib/avatars/MiniMeDedicatedMicLaw";
import {
  ANNOUNCE_EVERY_LEARNED_PHRASE,
  CROSS_OWNER_PHRASE_TRANSFER,
  MINI_SPEAK_ELIMINATED_AT_STAGE_4,
  PRACTICE_BEFORE_PRONUNCIATION,
  RECOGNITION_UNLOCKS_FLUENT_SPEECH,
  createLatentPhrase,
  growthProfileAfterLatentPractice,
  isLatentPhraseSpeakable,
  practiceLatentPhrase,
  renderLatentPhraseAttempt,
  softDeleteLatentPhrase,
  type LatentPhraseRecord,
  type LatentUtteranceRender,
  type PhraseConversationalContext,
} from "@/lib/avatars/MiniMeLatentLanguageLaw";
import {
  ABSENCE_ERASES_OWNERSHIP_OR_PURCHASES,
  ABSENCE_REGRESSES_TO_INFANCY,
  FORGETFULNESS_PERMANENTLY_DELETES_MEMORY,
  ONE_GLOBAL_INTELLIGENCE_METER,
  PAID_RECOVERY_SHORTCUT,
  PASSIVE_LOGIN_COUNTS_AS_PLAY,
  RUST_NOTICEABLE_IDLE_DAYS,
  RUST_ONSET_IDLE_DAYS,
  RUST_STRONG_IDLE_DAYS,
  acquireLifelongSkill,
  applyPlayfulRust,
  buildOwnerReturnWelcome,
  buildRustySpeechEvent,
  calendarDayKey,
  canAcquireNewLifelongSkill,
  createSkillFromPhrase,
  idleDaysSince,
  isQualifyingMiniMePlay,
  lifelongLearningRate,
  practiceSkill,
  rustSeverityForIdleDays,
  type MiniMeSkillKind,
  type MiniMeSkillProficiency,
  type NonQualifyingPresence,
  type OwnerReturnWelcomeEvent,
  type QualifyingMiniMeInteraction,
  type RelearnCelebrationEvent,
  type RustSeverity,
  type RustySpeechEvent,
} from "@/lib/avatars/MiniMeForgetfulnessAndLifelongLaw";
import {
  AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT,
  FIXED_FIVE_SECOND_IDLE_LOOP_FORBIDDEN,
  IDLE_TRIGGERS_PUBLIC_MIC_BROADCAST,
  createNewbornPersonality,
  decideIdleBehavior,
  personalitiesLikelyDistinct,
  reinforceFromInteractionStyle,
  type IdleBehaviorKind,
  type IdleSchedulerDecision,
  type MiniMePersonalityTraits,
} from "@/lib/avatars/MiniMeIdlePersonalityLaw";
import {
  CROSS_OWNER_MEMORY_LEAK_FORBIDDEN,
  DEFAULT_MINI_ME_SPEECH_SETTINGS,
  LEARNING_IMPLIES_PUBLIC_BROADCAST,
  decideSpontaneousCallback,
  surfaceAllowsCallback,
  type MiniMeCatchphraseRecord,
  type MiniMeOwnerSpeechSettings,
  type MiniMeSpeechSurface,
  type SpontaneousCallbackDecision,
} from "@/lib/avatars/MiniMeSpontaneousCallbackPolicy";
import {
  resolveMiniMeResetScope,
  type MiniMeResetKind,
} from "@/lib/avatars/MiniMeCreationContracts";
import {
  DUPLICATE_SPEECH_ENGINE_CREATED,
  NEVER_IMPERSONATE_REAL_VOICE,
  STT_NEVER_AUTO_SENDS,
  TTS_OPT_IN_ONLY,
  type SttAvailability,
} from "@/lib/venue-hud/SpeechTextAdapter";

export const MINI_ME_COMPANION_RUNTIME_SERVICE_ID =
  "MINI_ME_COMPANION_RUNTIME_SERVICE_v1" as const;

export const MINI_ME_MIGRATION_ID =
  "20261120120000_minime_companion_memory_and_skills" as const;

export type InteractionStyleSignal = "PLAYFUL" | "GENTLE" | "DANCE" | "TEACH" | "QUIET";

export type ExtendedMiniMeSpeechSettings = MiniMeOwnerSpeechSettings & {
  learningEnabled: boolean;
};

export const DEFAULT_EXTENDED_MINI_ME_SPEECH_SETTINGS: ExtendedMiniMeSpeechSettings = {
  ...DEFAULT_MINI_ME_SPEECH_SETTINGS,
  learningEnabled: true,
};

export type StoredLatentPhraseRecord = LatentPhraseRecord & {
  favorited: boolean;
  lastSpokenAtMs: number | null;
};

export type VisemeFrame30Fps = {
  frame: number;
  timeMs: number;
  arkitWeights: {
    jawOpen: number;
    mouthFunnel: number;
    mouthPucker: number;
    mouthSmileLeft: number;
    mouthSmileRight: number;
    cheekPuff: number;
    cheekSquintLeft: number;
    cheekSquintRight: number;
    browInnerUp: number;
  };
};

export type ManufacturedVocalCueBinding = {
  soundId: string;
  filename: string;
  artifactRepoPath: string;
  stage: "GIBBERISH" | "FIRST_WORDS" | "DEVELOPING_SPEECH" | "PERSONALIZED_SPEECH";
  category: string;
  phoneticTranscript: string;
  durationSec: number;
  sampleRateHz: 24000;
  pairedClip: string;
  cooldownMs: number;
  defaultVolume: number;
  visemeFrames: readonly VisemeFrame30Fps[];
};

const ARTIFACT_AUDIO_PREFIX =
  "packages/assets/generated/manufacturing/artifacts/JOB-MINIME-VOICE-REBIRTH-001/audio";

function buildDeterministicVisemeCurve(
  durationSec: number,
  browInnerUp = 0.25,
  smile = 0.45,
): VisemeFrame30Fps[] {
  const frameCount = Math.max(12, Math.round(durationSec * 30));
  const frames: VisemeFrame30Fps[] = [];
  for (let i = 0; i < frameCount; i++) {
    const timeMs = Math.round((i * 1000) / 30);
    const phase = (i / Math.max(1, frameCount - 1)) * Math.PI * 3;
    const wave = Math.max(0, Math.sin(phase));
    const jawOpen = Number(Math.min(0.68, 0.08 + wave * 0.57).toFixed(3));
    const mouthFunnel = Number(Math.min(0.38, Math.max(0, Math.sin(phase + 0.6) * 0.22)).toFixed(3));
    const mouthPucker = Number(Math.min(0.42, Math.max(0, Math.cos(phase) * 0.34)).toFixed(3));
    const cheekPuff = Number((mouthPucker * 0.45).toFixed(3));
    frames.push({
      frame: i + 1,
      timeMs,
      arkitWeights: {
        jawOpen,
        mouthFunnel,
        mouthPucker,
        mouthSmileLeft: smile,
        mouthSmileRight: smile,
        cheekPuff,
        cheekSquintLeft: 0.248,
        cheekSquintRight: 0.248,
        browInnerUp,
      },
    });
  }
  return frames;
}

/**
 * Canonical binding to JOB-MINIME-VOICE-REBIRTH-001 original non-infringing 24kHz WAV
 * cues and 30fps ARKIT_52 viseme synchronization curves.
 */
export const MANUFACTURED_VOCAL_CUES: Record<string, ManufacturedVocalCueBinding> = {
  vox_stage1_bibble_bop_01: {
    soundId: "vox_stage1_bibble_bop_01",
    filename: "vox_stage1_bibble_bop_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage1_bibble_bop_01.wav`,
    stage: "GIBBERISH",
    category: "MINI_SPEAK_SYLLABLE",
    phoneticTranscript: "Bibble-bop!",
    durationSec: 0.72,
    sampleRateHz: 24000,
    pairedClip: "Voice_MiniSpeak_Babble",
    cooldownMs: 1500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.72, 0.25, 0.45),
  },
  vox_stage1_bree_ba_doo_01: {
    soundId: "vox_stage1_bree_ba_doo_01",
    filename: "vox_stage1_bree_ba_doo_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage1_bree_ba_doo_01.wav`,
    stage: "GIBBERISH",
    category: "MINI_SPEAK_BABBLE",
    phoneticTranscript: "Bree-ba-doo!",
    durationSec: 0.85,
    sampleRateHz: 24000,
    pairedClip: "Voice_MiniSpeak_Babble",
    cooldownMs: 1500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.85, 0.25, 0.45),
  },
  vox_stage1_nya_woo_curious_01: {
    soundId: "vox_stage1_nya_woo_curious_01",
    filename: "vox_stage1_nya_woo_curious_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage1_nya_woo_curious_01.wav`,
    stage: "GIBBERISH",
    category: "CURIOUS_SOUND",
    phoneticTranscript: "Nya-woo?",
    durationSec: 0.68,
    sampleRateHz: 24000,
    pairedClip: "MicListen_HeadTilt",
    cooldownMs: 1500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.68, 0.65, 0.45),
  },
  vox_stage1_heh_heh_giggle_01: {
    soundId: "vox_stage1_heh_heh_giggle_01",
    filename: "vox_stage1_heh_heh_giggle_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage1_heh_heh_giggle_01.wav`,
    stage: "GIBBERISH",
    category: "GIGGLE_LAUGH",
    phoneticTranscript: "Heh-heh! Hee-hee!",
    durationSec: 0.75,
    sampleRateHz: 24000,
    pairedClip: "CheekTap_Giggle",
    cooldownMs: 2500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.75, 0.3, 0.65),
  },
  vox_stage1_mmm_bada_boom_01: {
    soundId: "vox_stage1_mmm_bada_boom_01",
    filename: "vox_stage1_mmm_bada_boom_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage1_mmm_bada_boom_01.wav`,
    stage: "GIBBERISH",
    category: "MUSICAL_BABBLING",
    phoneticTranscript: "Mmm-bada-boom!",
    durationSec: 0.9,
    sampleRateHz: 24000,
    pairedClip: "MicReact_HypeNod",
    cooldownMs: 1800,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.9, 0.35, 0.5),
  },
  vox_stage2_first_word_chime_01: {
    soundId: "vox_stage2_first_word_chime_01",
    filename: "vox_stage2_first_word_chime_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage2_first_word_chime_01.wav`,
    stage: "FIRST_WORDS",
    category: "NEW_WORD_RECOGNITION",
    phoneticTranscript: "Bibble! [Learned Word Unlocked]",
    durationSec: 0.8,
    sampleRateHz: 24000,
    pairedClip: "Voice_Word_Recognition_Spark",
    cooldownMs: 2000,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.8, 0.4, 0.55),
  },
  vox_stage2_blended_lets_go_01: {
    soundId: "vox_stage2_blended_lets_go_01",
    filename: "vox_stage2_blended_lets_go_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage2_blended_lets_go_01.wav`,
    stage: "FIRST_WORDS",
    category: "HAPPY_GREETING",
    phoneticTranscript: "Bree-ba... Let's go!",
    durationSec: 0.88,
    sampleRateHz: 24000,
    pairedClip: "HandSlap_Proud",
    cooldownMs: 2000,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.88, 0.35, 0.55),
  },
  vox_stage3_thinking_hum_01: {
    soundId: "vox_stage3_thinking_hum_01",
    filename: "vox_stage3_thinking_hum_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage3_thinking_hum_01.wav`,
    stage: "DEVELOPING_SPEECH",
    category: "THINKING_SOUND",
    phoneticTranscript: "Hmm-mmm-bop...",
    durationSec: 0.95,
    sampleRateHz: 24000,
    pairedClip: "MicState_Thinking",
    cooldownMs: 1500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.95, 0.55, 0.35),
  },
  vox_stage4_learning_celebration_01: {
    soundId: "vox_stage4_learning_celebration_01",
    filename: "vox_stage4_learning_celebration_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage4_learning_celebration_01.wav`,
    stage: "PERSONALIZED_SPEECH",
    category: "CELEBRATION_SOUND",
    phoneticTranscript: "Yaaay! Everything good!",
    durationSec: 1.05,
    sampleRateHz: 24000,
    pairedClip: "Voice_Learning_Celebration",
    cooldownMs: 2500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(1.05, 0.45, 0.65),
  },
  vox_stage4_callback_spark_01: {
    soundId: "vox_stage4_callback_spark_01",
    filename: "vox_stage4_callback_spark_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_stage4_callback_spark_01.wav`,
    stage: "PERSONALIZED_SPEECH",
    category: "VOCAL_TRANSITION",
    phoneticTranscript: "Heh-heh! Remember that?",
    durationSec: 0.78,
    sampleRateHz: 24000,
    pairedClip: "SignatureLaugh",
    cooldownMs: 2500,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(0.78, 0.4, 0.6),
  },
  vox_rebirth_chime_stage1_restart_01: {
    soundId: "vox_rebirth_chime_stage1_restart_01",
    filename: "vox_rebirth_chime_stage1_restart_01.wav",
    artifactRepoPath: `${ARTIFACT_AUDIO_PREFIX}/vox_rebirth_chime_stage1_restart_01.wav`,
    stage: "GIBBERISH",
    category: "REBIRTH_RESTART",
    phoneticTranscript: "[Crystal Rebirth Wash] Bibble-bop!",
    durationSec: 1.2,
    sampleRateHz: 24000,
    pairedClip: "Rebirth_FreshAwakening",
    cooldownMs: 3000,
    defaultVolume: 0.22,
    visemeFrames: buildDeterministicVisemeCurve(1.2, 0.5, 0.5),
  },
};

export function utcCalendarDayKey(atMs: number): string {
  return calendarDayKey(atMs);
}

export function resolveVocalCueAndVisemesForReply(input: {
  stage: MiniMeVocalStage;
  intent: CompanionUtteranceIntent;
  firstHelloMilestone?: boolean;
  variantIndex?: number;
}): ManufacturedVocalCueBinding {
  const idx = Math.abs(input.variantIndex ?? 0);
  if (input.stage === "STAGE_1_BABY_MINI_SPEAK" || input.firstHelloMilestone) {
    if (input.intent === "AFFIRMATION") {
      return MANUFACTURED_VOCAL_CUES.vox_stage1_heh_heh_giggle_01;
    }
    if (input.intent === "PLAY") {
      return MANUFACTURED_VOCAL_CUES.vox_stage1_mmm_bada_boom_01;
    }
    const stage1Cues = [
      MANUFACTURED_VOCAL_CUES.vox_stage1_bibble_bop_01,
      MANUFACTURED_VOCAL_CUES.vox_stage1_bree_ba_doo_01,
      MANUFACTURED_VOCAL_CUES.vox_stage1_nya_woo_curious_01,
    ];
    return stage1Cues[idx % stage1Cues.length];
  }
  if (input.stage === "STAGE_2_FIRST_WORDS") {
    return idx % 2 === 0
      ? MANUFACTURED_VOCAL_CUES.vox_stage2_first_word_chime_01
      : MANUFACTURED_VOCAL_CUES.vox_stage2_blended_lets_go_01;
  }
  if (input.stage === "STAGE_3_DEVELOPING_SPEECH") {
    return MANUFACTURED_VOCAL_CUES.vox_stage3_thinking_hum_01;
  }
  return idx % 2 === 0
    ? MANUFACTURED_VOCAL_CUES.vox_stage4_learning_celebration_01
    : MANUFACTURED_VOCAL_CUES.vox_stage4_callback_spark_01;
}

export type CompanionInteractionLogEntry = {
  id: string;
  ownerUserId: string;
  companionId: string;
  interactionKind: QualifyingMiniMeInteraction;
  surface: string;
  intent: string | null;
  calendarDayKey: string;
  grewDay: boolean;
  rawAudioStored: false;
  occurredAtMs: number;
};

export type DurableMiniMeCompanionRecord = {
  ownerUserId: string;
  companionId: string;
  archetypeId: string;
  growth: MiniMeGrowthProfile;
  lastCalendarPracticeDayKey: string | null;
  firstHelloCompleted: boolean;
  personalityTraits: MiniMePersonalityTraits;
  speechSettings: ExtendedMiniMeSpeechSettings;
  favoriteMovements: string[];
  phrases: Record<string, StoredLatentPhraseRecord>;
  skills: Record<string, MiniMeSkillProficiency>;
  lastIdleKind: IdleBehaviorKind | null;
  lastIdleDecisionAtMs: number | null;
  sessionCallbackCount: number;
  lastAnyCallbackAtMs: number | null;
  yearIndex: number;
  revision: number;
  interactionLog: CompanionInteractionLogEntry[];
  updatedAtMs: number;
};

export type MiniMeServiceError =
  | "CROSS_OWNER_FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "LEARNING_DISABLED"
  | "ISOLATION_VIOLATION"
  | "PHRASE_DELETED"
  | "STALE_REVISION";

export type MiniMeServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: MiniMeServiceError; detail?: string };

const ok = <T>(value: T): MiniMeServiceResult<T> => ({ ok: true, value });
const fail = <T = never>(
  error: MiniMeServiceError,
  detail?: string,
): MiniMeServiceResult<T> => ({ ok: false, error, detail });

export interface MiniMeCompanionBackingStore {
  withCompanionTransaction<T>(
    ownerUserId: string,
    companionId: string,
    fn: (
      current: DurableMiniMeCompanionRecord | null,
      save: (next: DurableMiniMeCompanionRecord) => Promise<void>,
    ) => Promise<T>,
  ): Promise<T>;
  readCompanion(
    ownerUserId: string,
    companionId: string,
  ): Promise<DurableMiniMeCompanionRecord | null>;
}

function cloneRecord(rec: DurableMiniMeCompanionRecord): DurableMiniMeCompanionRecord {
  return JSON.parse(JSON.stringify(rec)) as DurableMiniMeCompanionRecord;
}

export function createDefaultDurableCompanionRecord(input: {
  ownerUserId: string;
  companionId: string;
  archetypeId?: string;
  nowMs?: number;
}): DurableMiniMeCompanionRecord {
  const nowMs = input.nowMs ?? Date.now();
  return {
    ownerUserId: input.ownerUserId,
    companionId: input.companionId,
    archetypeId: input.archetypeId ?? "M2_AVERAGE",
    growth: createNewbornGrowthProfile({
      ownerUserId: input.ownerUserId,
      companionId: input.companionId,
    }),
    lastCalendarPracticeDayKey: null,
    firstHelloCompleted: false,
    personalityTraits: createNewbornPersonality(),
    speechSettings: { ...DEFAULT_EXTENDED_MINI_ME_SPEECH_SETTINGS },
    favoriteMovements: [],
    phrases: {},
    skills: {},
    lastIdleKind: null,
    lastIdleDecisionAtMs: null,
    sessionCallbackCount: 0,
    lastAnyCallbackAtMs: null,
    yearIndex: 0,
    revision: 1,
    interactionLog: [],
    updatedAtMs: nowMs,
  };
}

/**
 * Transactional backing store with per-(ownerUserId, companionId) mutex lock.
 */
export function createInMemoryMiniMeCompanionStore(
  sharedBackingMap?: Map<string, string>,
): MiniMeCompanionBackingStore & { dumpRawSnapshot: () => Map<string, string> } {
  const storage = sharedBackingMap ?? new Map<string, string>();
  const locks = new Map<string, Promise<unknown>>();

  const makeKey = (ownerUserId: string, companionId: string) =>
    `minime:${ownerUserId}:${companionId}`;

  return {
    dumpRawSnapshot: () => new Map(storage),
    async readCompanion(ownerUserId, companionId) {
      const raw = storage.get(makeKey(ownerUserId, companionId));
      if (!raw) return null;
      return JSON.parse(raw) as DurableMiniMeCompanionRecord;
    },
    async withCompanionTransaction(ownerUserId, companionId, fn) {
      const key = makeKey(ownerUserId, companionId);
      const prev = locks.get(key) ?? Promise.resolve();
      let release!: () => void;
      const gate = new Promise<void>((res) => {
        release = res;
      });
      locks.set(key, prev.then(() => gate));
      await prev;
      try {
        const raw = storage.get(key);
        const current = raw ? (JSON.parse(raw) as DurableMiniMeCompanionRecord) : null;
        return await fn(current ? cloneRecord(current) : null, async (next) => {
          if (next.ownerUserId !== ownerUserId || next.companionId !== companionId) {
            throw new Error("CROSS_OWNER_WRITE_BLOCKED");
          }
          storage.set(key, JSON.stringify(next));
        });
      } finally {
        release();
      }
    },
  };
}

/**
 * Production SQL / Prisma QueueDb store adapter using pg_advisory_xact_lock.
 */
export function createSqlMiniMeCompanionStore(db: QueueDb): MiniMeCompanionBackingStore {
  const parseJson = <T>(val: unknown, fallback: T): T => {
    if (val == null) return fallback;
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return fallback;
      }
    }
    return val as T;
  };

  async function loadFromSql(
    q: QueueSql,
    ownerUserId: string,
    companionId: string,
  ): Promise<DurableMiniMeCompanionRecord | null> {
    const rows = await q.query<Record<string, unknown>>(
      `SELECT * FROM minime_companions WHERE owner_user_id = $1 AND companion_id = $2 LIMIT 1`,
      [ownerUserId, companionId],
    );
    if (!rows[0]) return null;
    const r = rows[0];
    const phraseRows = await q.query<Record<string, unknown>>(
      `SELECT * FROM minime_latent_phrases WHERE owner_user_id = $1 AND companion_id = $2`,
      [ownerUserId, companionId],
    );
    const skillRows = await q.query<Record<string, unknown>>(
      `SELECT * FROM minime_skill_proficiencies WHERE owner_user_id = $1 AND companion_id = $2`,
      [ownerUserId, companionId],
    );
    const logRows = await q.query<Record<string, unknown>>(
      `SELECT * FROM minime_interaction_log WHERE owner_user_id = $1 AND companion_id = $2 ORDER BY occurred_at_ms DESC LIMIT 50`,
      [ownerUserId, companionId],
    );

    const phrases: Record<string, StoredLatentPhraseRecord> = {};
    for (const pr of phraseRows) {
      const pid = String(pr.phrase_id);
      phrases[pid] = {
        phraseId: pid,
        ownerUserId: String(pr.owner_user_id),
        companionId: String(pr.companion_id),
        canonicalText: String(pr.canonical_text),
        encounterCount: Number(pr.encounter_count ?? 1),
        reinforcementCount: Number(pr.practice_count ?? 0),
        recognitionStrength: Number(pr.recognition_strength ?? 0.08),
        pronunciationStrength: Number(pr.pronunciation_strength ?? 0.02),
        contexts: parseJson<PhraseConversationalContext[]>(pr.contexts, ["GENERAL"]),
        ownerCorrections: 0,
        approvedForCallback: Boolean(pr.approved_for_callback),
        favorited: Boolean(pr.favorited),
        publicSpeechAllowed: Boolean(pr.public_speech_allowed),
        neverSayAgain: Boolean(pr.never_say_again),
        lastPracticedAtMs:
          pr.last_practiced_at_ms != null ? Number(pr.last_practiced_at_ms) : null,
        lastSpokenAtMs:
          pr.last_spoken_at_ms != null ? Number(pr.last_spoken_at_ms) : null,
        createdAtMs: Number(pr.created_at_ms ?? 0),
        deletedAtMs: pr.deleted_at_ms != null ? Number(pr.deleted_at_ms) : null,
      };
    }

    const skills: Record<string, MiniMeSkillProficiency> = {};
    for (const sr of skillRows) {
      if (sr.deleted_at_ms != null) continue;
      const sid = String(sr.skill_id);
      skills[sid] = {
        skillId: sid,
        ownerUserId: String(sr.owner_user_id),
        companionId: String(sr.companion_id),
        kind: String(sr.kind) as MiniMeSkillKind,
        phraseId: sr.phrase_id != null ? String(sr.phrase_id) : null,
        label: String(sr.label),
        firstLearnedAtMs: Number(sr.created_at_ms ?? 0),
        lastMeaningfulPracticeAtMs: Number(sr.last_meaningful_practice_at_ms ?? 0),
        practiceCount: Number(sr.practice_days ?? 1),
        peakRecognition: Number(sr.peak_recognition ?? 0.1),
        peakPerformance: Number(sr.peak_performance ?? 0.05),
        recallConfidence: Number(sr.recall_confidence ?? 0.1),
        performanceProficiency: Number(sr.performance_proficiency ?? 0.05),
        recoveryBoost: Number(sr.recovery_boost ?? 1.0),
        lastCalendarPracticeDayKey:
          sr.last_calendar_practice_day_key != null
            ? String(sr.last_calendar_practice_day_key)
            : null,
      };
    }

    const axes = parseJson<MiniMeGrowthAxes>(r.growth_axes, defaultGrowthAxes());
    const pendingPhraseIds = parseJson<string[]>(r.pending_phrase_ids, []);

    return {
      ownerUserId,
      companionId,
      archetypeId: String(r.archetype_id ?? "M2_AVERAGE"),
      growth: {
        ownerUserId,
        companionId,
        stage: String(r.stage ?? "STAGE_1_BABY_MINI_SPEAK") as MiniMeVocalStage,
        activeInteractionDays: Number(r.active_interaction_days ?? 0),
        lastMeaningfulInteractionAtMs:
          r.last_meaningful_interaction_at_ms != null
            ? Number(r.last_meaningful_interaction_at_ms)
            : null,
        axes,
        pendingPhraseIds,
        masteredPhraseIds: [],
      },
      lastCalendarPracticeDayKey:
        r.last_calendar_practice_day_key != null
          ? String(r.last_calendar_practice_day_key)
          : null,
      firstHelloCompleted: Boolean(r.first_hello_completed),
      personalityTraits: parseJson<MiniMePersonalityTraits>(
        r.personality_traits,
        createNewbornPersonality(),
      ),
      speechSettings: {
        ...DEFAULT_EXTENDED_MINI_ME_SPEECH_SETTINGS,
        ...parseJson<Partial<ExtendedMiniMeSpeechSettings>>(r.speech_settings, {}),
      },
      favoriteMovements: parseJson<string[]>(r.favorite_movements, []),
      phrases,
      skills,
      lastIdleKind:
        r.last_idle_kind != null ? (String(r.last_idle_kind) as IdleBehaviorKind) : null,
      lastIdleDecisionAtMs:
        r.last_idle_decision_at_ms != null ? Number(r.last_idle_decision_at_ms) : null,
      sessionCallbackCount: Number(r.session_callback_count ?? 0),
      lastAnyCallbackAtMs:
        r.last_any_callback_at_ms != null ? Number(r.last_any_callback_at_ms) : null,
      yearIndex: Number(r.year_index ?? 0),
      revision: Number(r.revision ?? 1),
      interactionLog: logRows.map((lr) => ({
        id: String(lr.id),
        ownerUserId: String(lr.owner_user_id),
        companionId: String(lr.companion_id),
        interactionKind: String(lr.interaction_kind) as QualifyingMiniMeInteraction,
        surface: String(lr.surface),
        intent: lr.intent != null ? String(lr.intent) : null,
        calendarDayKey: String(lr.calendar_day_key),
        grewDay: Boolean(lr.grew_day),
        rawAudioStored: false,
        occurredAtMs: Number(lr.occurred_at_ms ?? 0),
      })),
      updatedAtMs: Date.now(),
    };
  }

  async function saveToSql(
    q: QueueSql,
    rec: DurableMiniMeCompanionRecord,
  ): Promise<void> {
    await q.query(
      `INSERT INTO minime_companions (
        id, owner_user_id, companion_id, archetype_id, stage, active_interaction_days,
        last_calendar_practice_day_key, last_meaningful_interaction_at_ms, first_hello_completed,
        growth_axes, personality_traits, speech_settings, favorite_movements, pending_phrase_ids,
        last_idle_kind, last_idle_decision_at_ms, session_callback_count, last_any_callback_at_ms,
        year_index, revision, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb,
        $15, $16, $17, $18,
        $19, $20, NOW()
      )
      ON CONFLICT (owner_user_id, companion_id) DO UPDATE SET
        archetype_id = EXCLUDED.archetype_id,
        stage = EXCLUDED.stage,
        active_interaction_days = EXCLUDED.active_interaction_days,
        last_calendar_practice_day_key = EXCLUDED.last_calendar_practice_day_key,
        last_meaningful_interaction_at_ms = EXCLUDED.last_meaningful_interaction_at_ms,
        first_hello_completed = EXCLUDED.first_hello_completed,
        growth_axes = EXCLUDED.growth_axes,
        personality_traits = EXCLUDED.personality_traits,
        speech_settings = EXCLUDED.speech_settings,
        favorite_movements = EXCLUDED.favorite_movements,
        pending_phrase_ids = EXCLUDED.pending_phrase_ids,
        last_idle_kind = EXCLUDED.last_idle_kind,
        last_idle_decision_at_ms = EXCLUDED.last_idle_decision_at_ms,
        session_callback_count = EXCLUDED.session_callback_count,
        last_any_callback_at_ms = EXCLUDED.last_any_callback_at_ms,
        year_index = EXCLUDED.year_index,
        revision = EXCLUDED.revision,
        updated_at = NOW()`,
      [
        `${rec.ownerUserId}:${rec.companionId}`,
        rec.ownerUserId,
        rec.companionId,
        rec.archetypeId,
        rec.growth.stage,
        rec.growth.activeInteractionDays,
        rec.lastCalendarPracticeDayKey,
        rec.growth.lastMeaningfulInteractionAtMs,
        rec.firstHelloCompleted,
        JSON.stringify(rec.growth.axes),
        JSON.stringify(rec.personalityTraits),
        JSON.stringify(rec.speechSettings),
        JSON.stringify(rec.favoriteMovements),
        JSON.stringify(rec.growth.pendingPhraseIds),
        rec.lastIdleKind,
        rec.lastIdleDecisionAtMs,
        rec.sessionCallbackCount,
        rec.lastAnyCallbackAtMs,
        rec.yearIndex,
        rec.revision,
      ],
    );

    for (const p of Object.values(rec.phrases)) {
      await q.query(
        `INSERT INTO minime_latent_phrases (
          id, owner_user_id, companion_id, phrase_id, canonical_text,
          encounter_count, practice_count, recognition_strength, pronunciation_strength,
          contexts, approved_for_callback, favorited, public_speech_allowed, never_say_again,
          last_heard_at_ms, last_practiced_at_ms, last_spoken_at_ms, created_at_ms, deleted_at_ms
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10::jsonb, $11, $12, $13, $14,
          $15, $16, $17, $18, $19
        )
        ON CONFLICT (owner_user_id, companion_id, phrase_id) DO UPDATE SET
          canonical_text = EXCLUDED.canonical_text,
          encounter_count = EXCLUDED.encounter_count,
          practice_count = EXCLUDED.practice_count,
          recognition_strength = EXCLUDED.recognition_strength,
          pronunciation_strength = EXCLUDED.pronunciation_strength,
          contexts = EXCLUDED.contexts,
          approved_for_callback = EXCLUDED.approved_for_callback,
          favorited = EXCLUDED.favorited,
          public_speech_allowed = EXCLUDED.public_speech_allowed,
          never_say_again = EXCLUDED.never_say_again,
          last_heard_at_ms = EXCLUDED.last_heard_at_ms,
          last_practiced_at_ms = EXCLUDED.last_practiced_at_ms,
          last_spoken_at_ms = EXCLUDED.last_spoken_at_ms,
          deleted_at_ms = EXCLUDED.deleted_at_ms`,
        [
          `${rec.ownerUserId}:${rec.companionId}:${p.phraseId}`,
          rec.ownerUserId,
          rec.companionId,
          p.phraseId,
          p.canonicalText,
          p.encounterCount,
          p.reinforcementCount,
          p.recognitionStrength,
          p.pronunciationStrength,
          JSON.stringify(p.contexts),
          p.approvedForCallback,
          p.favorited,
          p.publicSpeechAllowed,
          p.neverSayAgain,
          p.lastPracticedAtMs ?? p.createdAtMs,
          p.lastPracticedAtMs,
          p.lastSpokenAtMs,
          p.createdAtMs,
          p.deletedAtMs,
        ],
      );
    }

    await q.query(
      `DELETE FROM minime_skill_proficiencies WHERE owner_user_id = $1 AND companion_id = $2`,
      [rec.ownerUserId, rec.companionId],
    );
    for (const s of Object.values(rec.skills)) {
      await q.query(
        `INSERT INTO minime_skill_proficiencies (
          id, owner_user_id, companion_id, skill_id, kind, phrase_id, label,
          peak_recognition, peak_performance, recall_confidence, performance_proficiency,
          practice_days, last_calendar_practice_day_key, last_meaningful_practice_at_ms,
          recovery_boost, created_at_ms
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16
        )`,
        [
          `${rec.ownerUserId}:${rec.companionId}:${s.skillId}`,
          rec.ownerUserId,
          rec.companionId,
          s.skillId,
          s.kind,
          s.phraseId,
          s.label,
          s.peakRecognition,
          s.peakPerformance,
          s.recallConfidence,
          s.performanceProficiency,
          s.practiceCount,
          s.lastCalendarPracticeDayKey,
          s.lastMeaningfulPracticeAtMs,
          s.recoveryBoost,
          s.firstLearnedAtMs,
        ],
      );
    }
  }

  return {
    async readCompanion(ownerUserId, companionId) {
      return loadFromSql(db.read, ownerUserId, companionId);
    },
    async withCompanionTransaction(ownerUserId, companionId, fn) {
      const lockKey = `tmi-minime-companion:${ownerUserId}:${companionId}`;
      return db.withRoomLock(lockKey, async (q) => {
        const current = await loadFromSql(q, ownerUserId, companionId);
        return fn(current, async (next) => {
          await saveToSql(q, next);
        });
      });
    },
  };
}

export type ForgetfulnessEvaluationSnapshot = {
  ownerUserId: string;
  companionId: string;
  stage: MiniMeVocalStage;
  companionIdleDays: number;
  companionRustSeverity: RustSeverity;
  ownerReturnWelcome: OwnerReturnWelcomeEvent | null;
  skillsById: Record<
    string,
    {
      skill: MiniMeSkillProficiency;
      effectiveSkill: MiniMeSkillProficiency;
      idleDays: number;
      severity: RustSeverity;
      rustySpeechPreview: RustySpeechEvent | null;
    }
  >;
  peaksPreserved: true;
  regressedToInfancy: false;
  purchasesAndOwnershipIntact: true;
};

export type ActiveVoiceSessionRecord = {
  sessionId: string;
  session: CompanionMicSession;
  micPermission: "granted" | "denied" | "unavailable" | "prompt";
  sttAvailability: SttAvailability;
  fallbackMode: "NONE" | "TYPED_OR_GESTURE_ONLY";
  tmiMicOnArmed: false;
  performerGoLiveArmed: false;
  rawAudioStored: false;
  createdAtMs: number;
  updatedAtMs: number;
};

export type CompanionVoiceUtteranceOutcome = {
  sessionId: string;
  session: CompanionMicSession;
  intent: CompanionUtteranceIntent;
  reply: CompanionVoiceReply;
  vocalCue: ManufacturedVocalCueBinding;
  latentAttempt: LatentUtteranceRender | null;
  firstHelloMilestoneCompleted: boolean;
  grewInteractionDay: boolean;
  activeInteractionDays: number;
  stage: MiniMeVocalStage;
  ownerReturnWelcome: OwnerReturnWelcomeEvent | null;
  isolationCheck: { ok: boolean; reason: string };
  broadcastMicArmed: false;
  webrtcPublishArmed: false;
  roomChatPublishArmed: false;
  rawAudioStored: false;
};

export type SpontaneousCallbackExecutionOutcome = {
  decision: SpontaneousCallbackDecision;
  ownerPrivateAudioOnly: boolean;
  publicVenueBroadcastAllowed: boolean;
  vocalCue: ManufacturedVocalCueBinding | null;
  sessionCallbackCount: number;
  lastAnyCallbackAtMs: number | null;
};

export type CompanionResetExecutionOutcome = {
  kind: MiniMeResetKind;
  scope: ReturnType<typeof resolveMiniMeResetScope>;
  companion: DurableMiniMeCompanionRecord;
  rebirthVocalCue: ManufacturedVocalCueBinding | null;
  deletedPhraseCacheCleared: true;
  appearanceUntouched: true;
  savedLooksUntouched: true;
  purchasesUntouched: true;
  learningPreferencePreserved: boolean;
};

function applyDeduplicatedInteractionDay(
  rec: DurableMiniMeCompanionRecord,
  atMs: number,
  axisNudges: Partial<MiniMeGrowthAxes>,
): { grewDay: boolean; dayKey: string } {
  const dayKey = utcCalendarDayKey(atMs);
  const isNewDay = rec.lastCalendarPracticeDayKey !== dayKey;

  if (isNewDay) {
    rec.growth = applyMeaningfulInteractionDay(rec.growth, atMs, axisNudges);
    rec.lastCalendarPracticeDayKey = dayKey;
    return { grewDay: true, dayKey };
  }

  // Same UTC calendar day: do NOT increment activeInteractionDays; apply micro axis nudge capped at 15%
  const microScale = 0.15;
  const clamp01 = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
  const nextAxes: MiniMeGrowthAxes = {
    vocabularyRecognition: clamp01(
      rec.growth.axes.vocabularyRecognition + (axisNudges.vocabularyRecognition ?? 0) * microScale,
    ),
    pronunciationMastery: clamp01(
      rec.growth.axes.pronunciationMastery + (axisNudges.pronunciationMastery ?? 0) * microScale,
    ),
    personalityConfidence: clamp01(
      rec.growth.axes.personalityConfidence + (axisNudges.personalityConfidence ?? 0) * microScale,
    ),
    socialConfidence: clamp01(
      rec.growth.axes.socialConfidence + (axisNudges.socialConfidence ?? 0) * microScale,
    ),
    gestureConfidence: clamp01(
      rec.growth.axes.gestureConfidence + (axisNudges.gestureConfidence ?? 0) * microScale,
    ),
  };
  const nextGrowth: MiniMeGrowthProfile = {
    ...rec.growth,
    lastMeaningfulInteractionAtMs: Math.max(rec.growth.lastMeaningfulInteractionAtMs ?? 0, atMs),
    axes: nextAxes,
  };
  nextGrowth.stage = resolveStageEligibility(nextGrowth);
  rec.growth = nextGrowth;
  return { grewDay: false, dayKey };
}

export class MiniMeCompanionRuntimeService {
  private readonly store: MiniMeCompanionBackingStore;
  private readonly voiceSessions = new Map<string, ActiveVoiceSessionRecord>();
  private readonly purgedPhraseIds = new Set<string>();

  constructor(store?: MiniMeCompanionBackingStore) {
    this.store = store ?? createInMemoryMiniMeCompanionStore();
  }

  getBackingStore(): MiniMeCompanionBackingStore {
    return this.store;
  }

  async getOrCreateCompanion(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    archetypeId?: string;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<DurableMiniMeCompanionRecord>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner companion read blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId.trim();
    if (!ownerUserId || !companionId) {
      return fail("INVALID_INPUT", "ownerUserId and companionId required");
    }

    const record = await this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        if (current) {
          const checkedStage = resolveStageEligibility(current.growth);
          if (checkedStage !== current.growth.stage) {
            current.growth.stage = checkedStage;
          }
          return current;
        }
        const created = createDefaultDurableCompanionRecord({
          ownerUserId,
          companionId,
          archetypeId: input.archetypeId,
          nowMs: input.nowMs,
        });
        await save(created);
        return created;
      },
    );

    return ok(record);
  }

  async evaluateCompanionForgetfulness(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    nowMs: number;
  }): Promise<MiniMeServiceResult<ForgetfulnessEvaluationSnapshot>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner forgetfulness read blocked");
    }
    const base = await this.getOrCreateCompanion({
      authenticatedOwnerUserId: input.authenticatedOwnerUserId,
      companionId: input.companionId,
      nowMs: input.nowMs,
    });
    if (!base.ok) return base;
    const rec = base.value;

    const companionIdleDays = idleDaysSince(
      rec.growth.lastMeaningfulInteractionAtMs,
      input.nowMs,
    );
    const companionRustSeverity = rustSeverityForIdleDays(companionIdleDays);
    const ownerReturnWelcome = buildOwnerReturnWelcome(companionIdleDays);

    const skillsById: ForgetfulnessEvaluationSnapshot["skillsById"] = {};
    for (const [skillId, skill] of Object.entries(rec.skills)) {
      if (skill.ownerUserId !== rec.ownerUserId) continue;
      const sIdleDays = idleDaysSince(skill.lastMeaningfulPracticeAtMs, input.nowMs);
      const severity = rustSeverityForIdleDays(sIdleDays);
      const effectiveSkill = applyPlayfulRust(skill, input.nowMs);
      const linkedPhrase: LatentPhraseRecord =
        (skill.phraseId ? rec.phrases[skill.phraseId] : undefined) ??
        createLatentPhrase({
          phraseId: skill.phraseId ?? skill.skillId,
          ownerUserId: rec.ownerUserId,
          companionId: rec.companionId,
          canonicalText: skill.label,
          atMs: skill.firstLearnedAtMs,
        });
      const rustySpeechPreview = buildRustySpeechEvent({
        skill,
        phrase: linkedPhrase,
        stage: rec.growth.stage,
        nowMs: input.nowMs,
        gibberishFallback: "Bibble-bop... nya-woo?",
      });
      skillsById[skillId] = {
        skill,
        effectiveSkill,
        idleDays: sIdleDays,
        severity,
        rustySpeechPreview,
      };
    }

    return ok({
      ownerUserId: rec.ownerUserId,
      companionId: rec.companionId,
      stage: rec.growth.stage,
      companionIdleDays,
      companionRustSeverity,
      ownerReturnWelcome,
      skillsById,
      peaksPreserved: true,
      regressedToInfancy: false,
      purchasesAndOwnershipIntact: true,
    });
  }

  async recordPresenceEvent(input: {
    authenticatedOwnerUserId: string;
    companionId: string;
    eventKind: QualifyingMiniMeInteraction | NonQualifyingPresence | string;
    surface?: string;
    nowMs?: number;
  }): Promise<
    MiniMeServiceResult<{
      qualifying: boolean;
      timerReset: boolean;
      grewDay: boolean;
      activeInteractionDays: number;
      lastMeaningfulInteractionAtMs: number | null;
    }>
  > {
    const nowMs = input.nowMs ?? Date.now();
    const qualifying = isQualifyingMiniMePlay(
      input.eventKind as QualifyingMiniMeInteraction | NonQualifyingPresence,
    );
    if (!qualifying) {
      const current = await this.getOrCreateCompanion({
        authenticatedOwnerUserId: input.authenticatedOwnerUserId,
        companionId: input.companionId,
        nowMs,
      });
      if (!current.ok) return current;
      return ok({
        qualifying: false,
        timerReset: false,
        grewDay: false,
        activeInteractionDays: current.value.growth.activeInteractionDays,
        lastMeaningfulInteractionAtMs: current.value.growth.lastMeaningfulInteractionAtMs,
      });
    }

    const res = await this.recordQualifyingInteraction({
      authenticatedOwnerUserId: input.authenticatedOwnerUserId,
      companionId: input.companionId,
      interactionKind: input.eventKind as QualifyingMiniMeInteraction,
      surface: input.surface ?? "QUICK_PANEL",
      nowMs,
    });
    if (!res.ok) return res;
    return ok({
      qualifying: true,
      timerReset: true,
      grewDay: res.value.grewDay,
      activeInteractionDays: res.value.companion.growth.activeInteractionDays,
      lastMeaningfulInteractionAtMs:
        res.value.companion.growth.lastMeaningfulInteractionAtMs,
    });
  }

  async recordQualifyingInteraction(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    interactionKind: QualifyingMiniMeInteraction;
    surface?: string;
    axisNudges?: Partial<MiniMeGrowthAxes>;
    styleSignal?: InteractionStyleSignal;
    favoriteMovement?: string;
    nowMs?: number;
  }): Promise<
    MiniMeServiceResult<{
      companion: DurableMiniMeCompanionRecord;
      grewDay: boolean;
      calendarDayKey: string;
      ownerReturnWelcome: OwnerReturnWelcomeEvent | null;
    }>
  > {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner interaction blocked");
    }
    if (!isQualifyingMiniMePlay(input.interactionKind)) {
      return fail("INVALID_INPUT", "Non-qualifying event cannot be recorded as qualifying play");
    }
    const nowMs = input.nowMs ?? Date.now();
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;

    const outcome = await this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        const idleDaysBefore = idleDaysSince(
          rec.growth.lastMeaningfulInteractionAtMs,
          nowMs,
        );
        const ownerReturnWelcome = buildOwnerReturnWelcome(idleDaysBefore);

        const defaultNudges: Partial<MiniMeGrowthAxes> = input.axisNudges ?? {
          vocabularyRecognition: 0.06,
          pronunciationMastery: 0.04,
          personalityConfidence: 0.05,
          socialConfidence: 0.04,
          gestureConfidence: 0.04,
        };

        const { grewDay, dayKey } = applyDeduplicatedInteractionDay(rec, nowMs, defaultNudges);

        if (input.styleSignal) {
          rec.personalityTraits = reinforceFromInteractionStyle(
            rec.personalityTraits,
            input.styleSignal,
          );
        }
        if (input.favoriteMovement) {
          const mv = input.favoriteMovement.trim();
          if (mv && !rec.favoriteMovements.includes(mv)) {
            rec.favoriteMovements = [...rec.favoriteMovements.slice(-9), mv];
          }
        }

        rec.yearIndex = Math.max(
          rec.yearIndex,
          Math.floor(rec.growth.activeInteractionDays / 365),
        );

        rec.interactionLog = [
          {
            id: randomUUID(),
            ownerUserId,
            companionId,
            interactionKind: input.interactionKind,
            surface: input.surface ?? "QUICK_PANEL",
            intent: null,
            calendarDayKey: dayKey,
            grewDay,
            rawAudioStored: false as const,
            occurredAtMs: nowMs,
          },
          ...rec.interactionLog.slice(0, 49),
        ];

        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);
        return { companion: rec, grewDay, calendarDayKey: dayKey, ownerReturnWelcome };
      },
    );

    return ok(outcome);
  }

  async startCompanionVoiceSession(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    surface: CompanionMicSurface;
    micPermission?: "granted" | "denied" | "unavailable" | "prompt";
    sttAvailability?: SttAvailability;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<ActiveVoiceSessionRecord>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner voice session blocked");
    }
    const nowMs = input.nowMs ?? Date.now();
    const compRes = await this.getOrCreateCompanion({
      authenticatedOwnerUserId: input.authenticatedOwnerUserId,
      companionId: input.companionId,
      nowMs,
    });
    if (!compRes.ok) return compRes;
    const comp = compRes.value;

    const micPermission = input.micPermission ?? "granted";
    const sttAvail = input.sttAvailability ?? "available";

    let session = createCompanionMicSession({
      ownerUserId: comp.ownerUserId,
      companionId: comp.companionId,
      surface: input.surface,
      firstHelloCompleted: comp.firstHelloCompleted,
    });

    let fallbackMode: ActiveVoiceSessionRecord["fallbackMode"] = "NONE";
    if (micPermission === "denied") {
      session = { ...session, state: "ERROR_PERMISSION_DENIED" };
      fallbackMode = "TYPED_OR_GESTURE_ONLY";
    } else if (micPermission === "unavailable" || sttAvail === "unavailable") {
      session = { ...session, state: "IDLE" };
      fallbackMode = "TYPED_OR_GESTURE_ONLY";
    }

    const isolation = assertCompanionMicIsolation(session);
    if (!isolation.ok) {
      return fail("ISOLATION_VIOLATION", isolation.reason);
    }

    const sessionId = `minime-voice:${comp.ownerUserId}:${comp.companionId}:${randomUUID()}`;
    const record: ActiveVoiceSessionRecord = {
      sessionId,
      session,
      micPermission,
      sttAvailability: sttAvail,
      fallbackMode,
      tmiMicOnArmed: false,
      performerGoLiveArmed: false,
      rawAudioStored: false,
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
    };
    this.voiceSessions.set(sessionId, record);
    return ok(record);
  }

  async activateCompanionMicListening(input: {
    sessionId: string;
    authenticatedOwnerUserId: string;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<ActiveVoiceSessionRecord>> {
    const rec = this.voiceSessions.get(input.sessionId);
    if (!rec) return fail("NOT_FOUND", "Voice session not found");
    if (rec.session.ownerUserId !== input.authenticatedOwnerUserId) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner voice session access blocked");
    }
    const nowMs = input.nowMs ?? Date.now();
    if (rec.micPermission === "denied") {
      rec.session = { ...rec.session, state: "ERROR_PERMISSION_DENIED" };
      rec.fallbackMode = "TYPED_OR_GESTURE_ONLY";
      rec.updatedAtMs = nowMs;
      return ok({ ...rec });
    }
    if (rec.micPermission === "unavailable" || rec.sttAvailability === "unavailable") {
      rec.fallbackMode = "TYPED_OR_GESTURE_ONLY";
      rec.updatedAtMs = nowMs;
      return ok({ ...rec });
    }
    rec.session = beginCompanionListening(rec.session, nowMs);
    const isolation = assertCompanionMicIsolation(rec.session);
    if (!isolation.ok) {
      return fail("ISOLATION_VIOLATION", isolation.reason);
    }
    rec.updatedAtMs = nowMs;
    return ok({ ...rec });
  }

  async stopCompanionVoiceSession(input: {
    sessionId: string;
    authenticatedOwnerUserId: string;
    mute?: boolean;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<ActiveVoiceSessionRecord>> {
    const rec = this.voiceSessions.get(input.sessionId);
    if (!rec) return fail("NOT_FOUND", "Voice session not found");
    if (rec.session.ownerUserId !== input.authenticatedOwnerUserId) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner voice session stop blocked");
    }
    rec.session = input.mute
      ? { ...stopCompanionListening(rec.session), state: "MUTED" }
      : stopCompanionListening(rec.session);
    rec.updatedAtMs = input.nowMs ?? Date.now();
    return ok({ ...rec });
  }

  async processCompanionSpeechInput(input: {
    sessionId?: string;
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    surface?: CompanionMicSurface;
    transcript: string;
    variantIndex?: number;
    teachAsPhraseId?: string;
    context?: PhraseConversationalContext;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<CompanionVoiceUtteranceOutcome>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner speech submission blocked");
    }
    const nowMs = input.nowMs ?? Date.now();
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;

    let sessionRec = input.sessionId ? this.voiceSessions.get(input.sessionId) : undefined;
    if (sessionRec && sessionRec.session.ownerUserId !== ownerUserId) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner voice session blocked");
    }
    if (!sessionRec) {
      const started = await this.startCompanionVoiceSession({
        authenticatedOwnerUserId: ownerUserId,
        companionId,
        surface: input.surface ?? "AVATAR_CREATION_CENTER",
        nowMs,
      });
      if (!started.ok) return started;
      sessionRec = started.value;
    }

    if (
      sessionRec.session.state !== "ERROR_PERMISSION_DENIED" &&
      sessionRec.fallbackMode === "NONE"
    ) {
      sessionRec.session = beginCompanionListening(sessionRec.session, nowMs);
    }

    const isolation = assertCompanionMicIsolation(sessionRec.session);
    if (!isolation.ok) {
      return fail("ISOLATION_VIOLATION", isolation.reason);
    }

    const intent = classifyCompanionUtteranceIntent(input.transcript);

    const txResult = await this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        const idleDaysBefore = idleDaysSince(
          rec.growth.lastMeaningfulInteractionAtMs,
          nowMs,
        );
        const ownerReturnWelcome = buildOwnerReturnWelcome(idleDaysBefore);

        const wasFirstHelloDone = rec.firstHelloCompleted;
        const reply = selectImmediateCompanionReply({
          intent,
          stage: rec.growth.stage,
          firstHelloCompleted: wasFirstHelloDone,
          variantIndex: input.variantIndex ?? rec.interactionLog.length,
        });

        const firstHelloMilestoneCompleted =
          reply.firstHelloMilestone || (!wasFirstHelloDone && intent === "GREETING_HELLO");
        if (firstHelloMilestoneCompleted) {
          rec.firstHelloCompleted = true;
          sessionRec!.session = markFirstHelloCompleted(sessionRec!.session);
        }

        const { grewDay, dayKey } = applyDeduplicatedInteractionDay(rec, nowMs, {
          vocabularyRecognition: 0.06,
          pronunciationMastery: 0.03,
          personalityConfidence: 0.05,
          socialConfidence: 0.04,
          gestureConfidence: 0.03,
        });

        rec.personalityTraits = reinforceFromInteractionStyle(
          rec.personalityTraits,
          intent === "PLAY" ? "PLAYFUL" : "TEACH",
        );

        let latentAttempt: LatentUtteranceRender | null = null;
        const cleanText = input.transcript.trim();
        if (rec.speechSettings.learningEnabled && input.teachAsPhraseId && cleanText.length >= 2) {
          const phraseId = input.teachAsPhraseId;
          if (!this.purgedPhraseIds.has(`${ownerUserId}:${companionId}:${phraseId}`)) {
            const existing = rec.phrases[phraseId];
            const basePhrase =
              existing ??
              createLatentPhrase({
                phraseId,
                ownerUserId,
                companionId,
                canonicalText: cleanText,
                atMs: nowMs,
                context: input.context ?? "GENERAL",
              });
            const updatedCore = practiceLatentPhrase(basePhrase, {
              atMs: nowMs,
              reinforced: true,
              context: input.context ?? "GENERAL",
              ownerUserId,
              companionId,
            });
            const updatedPhrase: StoredLatentPhraseRecord = {
              ...updatedCore,
              favorited: existing?.favorited ?? false,
              lastSpokenAtMs: existing?.lastSpokenAtMs ?? null,
            };
            rec.phrases[phraseId] = updatedPhrase;
            rec.growth = acquirePhraseOpportunity(rec.growth, phraseId);
            rec.growth = growthProfileAfterLatentPractice(rec.growth, updatedPhrase);

            const skillId = `skill:phrase:${phraseId}`;
            const existingSkill = rec.skills[skillId];
            if (existingSkill) {
              const practiced = practiceSkill(existingSkill, {
                atMs: nowMs,
                ownerUserId,
                companionId,
                isRelearn: idleDaysBefore >= RUST_ONSET_IDLE_DAYS,
              });
              rec.skills[skillId] = practiced.skill;
            } else {
              rec.skills[skillId] = createSkillFromPhrase(updatedPhrase, nowMs);
            }

            latentAttempt = renderLatentPhraseAttempt({
              record: updatedPhrase,
              stage: rec.growth.stage,
              gibberishFallback: reply.text,
            });
          }
        }

        rec.interactionLog = [
          {
            id: randomUUID(),
            ownerUserId,
            companionId,
            interactionKind: "COMPANION_MIC_TALK",
            surface: sessionRec!.session.surface,
            intent,
            calendarDayKey: dayKey,
            grewDay,
            rawAudioStored: false as const,
            occurredAtMs: nowMs,
          },
          ...rec.interactionLog.slice(0, 49),
        ];

        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);

        const vocalCue = resolveVocalCueAndVisemesForReply({
          stage: rec.growth.stage,
          intent,
          firstHelloMilestone: firstHelloMilestoneCompleted,
          variantIndex: input.variantIndex ?? 0,
        });

        return {
          reply,
          vocalCue,
          latentAttempt,
          firstHelloMilestoneCompleted,
          grewInteractionDay: grewDay,
          activeInteractionDays: rec.growth.activeInteractionDays,
          stage: rec.growth.stage,
          ownerReturnWelcome,
        };
      },
    );

    sessionRec.session = {
      ...sessionRec.session,
      state: "RESPONDING",
      broadcastMicArmed: false,
      webrtcPublishArmed: false,
      roomChatPublishArmed: false,
    };
    sessionRec.updatedAtMs = nowMs;

    return ok({
      sessionId: sessionRec.sessionId,
      session: { ...sessionRec.session },
      intent,
      reply: txResult.reply,
      vocalCue: txResult.vocalCue,
      latentAttempt: txResult.latentAttempt,
      firstHelloMilestoneCompleted: txResult.firstHelloMilestoneCompleted,
      grewInteractionDay: txResult.grewInteractionDay,
      activeInteractionDays: txResult.activeInteractionDays,
      stage: txResult.stage,
      ownerReturnWelcome: txResult.ownerReturnWelcome,
      isolationCheck: assertCompanionMicIsolation(sessionRec.session),
      broadcastMicArmed: false,
      webrtcPublishArmed: false,
      roomChatPublishArmed: false,
      rawAudioStored: false,
    });
  }

  async teachOrPracticeCompanionPhrase(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    phraseId: string;
    canonicalText: string;
    context?: PhraseConversationalContext;
    reinforced?: boolean;
    approvedForCallback?: boolean;
    favorited?: boolean;
    publicSpeechAllowed?: boolean;
    nowMs?: number;
  }): Promise<
    MiniMeServiceResult<{
      phrase: StoredLatentPhraseRecord;
      skill: MiniMeSkillProficiency;
      attempt: LatentUtteranceRender;
      stage: MiniMeVocalStage;
      grewDay: boolean;
      relearnCelebration: RelearnCelebrationEvent | null;
    }>
  > {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner phrase teaching blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const phraseId = input.phraseId.trim();
    const canonicalText = input.canonicalText.trim();
    if (!phraseId || !canonicalText) {
      return fail("INVALID_INPUT", "phraseId and canonicalText required");
    }
    const nowMs = input.nowMs ?? Date.now();

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        if (rec.speechSettings.learningEnabled === false) {
          return fail("LEARNING_DISABLED", "Companion phrase learning is disabled by owner");
        }

        const existing = rec.phrases[phraseId];
        if (
          (existing && (existing.deletedAtMs !== null || existing.neverSayAgain)) ||
          this.purgedPhraseIds.has(`${ownerUserId}:${companionId}:${phraseId}`)
        ) {
          return fail("PHRASE_DELETED", "Deleted or blocked phrase cannot be practiced");
        }

        const basePhrase =
          existing ??
          createLatentPhrase({
            phraseId,
            ownerUserId,
            companionId,
            canonicalText,
            atMs: nowMs,
            context: input.context ?? "GENERAL",
          });

        const practicedCore = practiceLatentPhrase(basePhrase, {
          atMs: nowMs,
          reinforced: input.reinforced ?? true,
          context: input.context ?? "GENERAL",
          ownerUserId,
          companionId,
        });

        const phrase: StoredLatentPhraseRecord = {
          ...practicedCore,
          approvedForCallback:
            typeof input.approvedForCallback === "boolean"
              ? input.approvedForCallback
              : practicedCore.approvedForCallback,
          favorited:
            typeof input.favorited === "boolean"
              ? input.favorited
              : (existing?.favorited ?? false),
          publicSpeechAllowed:
            typeof input.publicSpeechAllowed === "boolean"
              ? input.publicSpeechAllowed
              : practicedCore.publicSpeechAllowed,
          lastSpokenAtMs: existing?.lastSpokenAtMs ?? null,
        };

        rec.phrases[phraseId] = phrase;
        rec.growth = acquirePhraseOpportunity(rec.growth, phraseId);

        const { grewDay } = applyDeduplicatedInteractionDay(rec, nowMs, {
          vocabularyRecognition: 0.08,
          pronunciationMastery: 0.04,
          personalityConfidence: 0.04,
        });
        rec.growth = growthProfileAfterLatentPractice(rec.growth, phrase);

        const skillId = `skill:phrase:${phraseId}`;
        const existingSkill = rec.skills[skillId];
        let skill: MiniMeSkillProficiency;
        let relearnCelebration: RelearnCelebrationEvent | null = null;
        if (existingSkill) {
          const idleDays = idleDaysSince(
            existingSkill.lastMeaningfulPracticeAtMs,
            nowMs,
          );
          const effectiveBeforePractice =
            idleDays >= RUST_ONSET_IDLE_DAYS
              ? applyPlayfulRust(existingSkill, nowMs)
              : existingSkill;
          const wasRecoveringFromRust =
            (idleDays >= RUST_ONSET_IDLE_DAYS || existingSkill.recoveryBoost > 1) &&
            effectiveBeforePractice.performanceProficiency <
              effectiveBeforePractice.peakPerformance * 0.9;
          const practiced = practiceSkill(effectiveBeforePractice, {
            atMs: nowMs,
            ownerUserId,
            companionId,
            isRelearn: idleDays >= RUST_ONSET_IDLE_DAYS || existingSkill.recoveryBoost > 1,
          });
          skill = {
            ...practiced.skill,
            peakRecognition: Math.max(practiced.skill.peakRecognition, phrase.recognitionStrength),
            recallConfidence: Math.max(practiced.skill.recallConfidence, phrase.recognitionStrength),
            peakPerformance: Math.max(practiced.skill.peakPerformance, phrase.pronunciationStrength),
            performanceProficiency: Math.max(
              practiced.skill.performanceProficiency,
              phrase.pronunciationStrength,
            ),
          };
          if (
            practiced.celebration ||
            (wasRecoveringFromRust &&
              skill.performanceProficiency >= skill.peakPerformance * 0.9)
          ) {
            relearnCelebration = {
              type: "RELEARN_CELEBRATION",
              skillId,
              spokenText: phrase.canonicalText,
              recovered: true,
            };
          }
        } else {
          skill = createSkillFromPhrase(phrase, nowMs);
        }
        rec.skills[skillId] = skill;

        const attempt = renderLatentPhraseAttempt({
          record: phrase,
          stage: rec.growth.stage,
          gibberishFallback: "Bibble-bop! Bree-ba-doo!",
        });

        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);

        return ok({
          phrase,
          skill,
          attempt,
          stage: rec.growth.stage,
          grewDay,
          relearnCelebration,
        });
      },
    );
  }

  async deleteCompanionPhrase(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    phraseId: string;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<{ phraseId: string; speakable: false }>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner phrase delete blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const phraseId = input.phraseId;
    const nowMs = input.nowMs ?? Date.now();

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        if (!current || !current.phrases[phraseId]) {
          return fail("NOT_FOUND", "Phrase not found");
        }
        const soft = softDeleteLatentPhrase(current.phrases[phraseId], nowMs);
        current.phrases[phraseId] = {
          ...soft,
          favorited: false,
          lastSpokenAtMs: current.phrases[phraseId].lastSpokenAtMs,
        };
        current.growth = {
          ...current.growth,
          pendingPhraseIds: current.growth.pendingPhraseIds.filter((id) => id !== phraseId),
        };
        delete current.skills[`skill:phrase:${phraseId}`];
        this.purgedPhraseIds.add(`${ownerUserId}:${companionId}:${phraseId}`);
        current.revision += 1;
        current.updatedAtMs = nowMs;
        await save(current);
        return ok({ phraseId, speakable: false as const });
      },
    );
  }

  async practiceOrAcquireCompanionSkill(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    skillId: string;
    kind: MiniMeSkillKind;
    label: string;
    phraseId?: string | null;
    yearIndex?: number;
    isRelearn?: boolean;
    nowMs?: number;
  }): Promise<
    MiniMeServiceResult<{
      skill: MiniMeSkillProficiency;
      grewSkillDay: boolean;
      grewCompanionDay: boolean;
      learningRate: number;
      relearnCelebration: RelearnCelebrationEvent | null;
      ownerReturnWelcome: OwnerReturnWelcomeEvent | null;
    }>
  > {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner skill practice blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const nowMs = input.nowMs ?? Date.now();

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        if (typeof input.yearIndex === "number" && input.yearIndex >= 0) {
          rec.yearIndex = Math.max(rec.yearIndex, Math.floor(input.yearIndex));
        }

        const companionIdleDays = idleDaysSince(
          rec.growth.lastMeaningfulInteractionAtMs,
          nowMs,
        );
        const ownerReturnWelcome = buildOwnerReturnWelcome(companionIdleDays);

        const existingSkill = rec.skills[input.skillId];
        let skill: MiniMeSkillProficiency;
        let grewSkillDay = false;
        let relearnCelebration: RelearnCelebrationEvent | null = null;

        if (!existingSkill) {
          const acquired = acquireLifelongSkill({
            ownerUserId,
            companionId,
            skillId: input.skillId,
            kind: input.kind,
            label: input.label,
            atMs: nowMs,
            yearIndex: rec.yearIndex,
            stage: rec.growth.stage,
            existingSkillCount: Object.keys(rec.skills).length,
          });
          if (!acquired.skill) {
            return fail("INVALID_INPUT", "Skill acquisition failed");
          }
          skill = {
            ...acquired.skill,
            phraseId: input.phraseId ?? acquired.skill.phraseId,
          };
          grewSkillDay = true;
        } else {
          const skillIdleDays = idleDaysSince(
            existingSkill.lastMeaningfulPracticeAtMs,
            nowMs,
          );
          const effectiveBeforePractice =
            skillIdleDays >= RUST_ONSET_IDLE_DAYS
              ? applyPlayfulRust(existingSkill, nowMs)
              : existingSkill;
          const isRelearn =
            Boolean(input.isRelearn) ||
            skillIdleDays >= RUST_ONSET_IDLE_DAYS ||
            effectiveBeforePractice.recoveryBoost > 1;
          const wasRecoveringFromRust =
            isRelearn &&
            effectiveBeforePractice.performanceProficiency <
              effectiveBeforePractice.peakPerformance * 0.9;
          const practiced = practiceSkill(effectiveBeforePractice, {
            atMs: nowMs,
            ownerUserId,
            companionId,
            isRelearn,
          });
          skill = practiced.skill;
          grewSkillDay = practiced.grew;
          if (
            practiced.celebration ||
            (wasRecoveringFromRust &&
              skill.performanceProficiency >= skill.peakPerformance * 0.9)
          ) {
            relearnCelebration = {
              type: "RELEARN_CELEBRATION",
              skillId: skill.skillId,
              spokenText: skill.label,
              recovered: true,
            };
          }
        }

        rec.skills[input.skillId] = skill;

        const { grewDay: grewCompanionDay } = applyDeduplicatedInteractionDay(rec, nowMs, {
          vocabularyRecognition: input.kind === "PHRASE" ? 0.07 : 0.02,
          pronunciationMastery: input.kind === "PHRASE" ? 0.04 : 0.01,
          personalityConfidence: 0.05,
          socialConfidence: 0.04,
          gestureConfidence: input.kind === "DANCE" || input.kind === "GESTURE" ? 0.06 : 0.03,
        });

        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);

        return ok({
          skill,
          grewSkillDay,
          grewCompanionDay,
          learningRate: lifelongLearningRate(rec.yearIndex),
          relearnCelebration,
          ownerReturnWelcome,
        });
      },
    );
  }

  async scheduleCompanionIdleAction(input: {
    authenticatedOwnerUserId: string;
    companionId: string;
    nowMs?: number;
    ownerInputActive: boolean;
    performanceOrBroadcastActive?: boolean;
    reducedMotion?: boolean;
    autonomousEnabled?: boolean;
    random01: number;
  }): Promise<MiniMeServiceResult<IdleSchedulerDecision>> {
    const nowMs = input.nowMs ?? Date.now();
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        const decision = decideIdleBehavior({
          traits: rec.personalityTraits,
          nowMs,
          lastKind: rec.lastIdleKind,
          lastDecisionAtMs: rec.lastIdleDecisionAtMs,
          ownerInputActive: input.ownerInputActive,
          performanceOrBroadcastActive: input.performanceOrBroadcastActive ?? false,
          reducedMotion: input.reducedMotion ?? false,
          quietMode: rec.speechSettings.muted,
          autonomousEnabled: input.autonomousEnabled ?? true,
          random01: input.random01,
        });

        if (decision.ok) {
          rec.lastIdleKind = decision.kind;
          rec.lastIdleDecisionAtMs = nowMs;
          rec.revision += 1;
          rec.updatedAtMs = nowMs;
          await save(rec);
        }

        return ok(decision);
      },
    );
  }

  async triggerSpontaneousCallback(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    surface: MiniMeSpeechSurface;
    nowMs?: number;
    idleMs: number;
    performanceActive?: boolean;
    random01: number;
  }): Promise<MiniMeServiceResult<SpontaneousCallbackExecutionOutcome>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner callback trigger blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const nowMs = input.nowMs ?? Date.now();

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        const catchphrasePool: MiniMeCatchphraseRecord[] = Object.values(rec.phrases)
          .filter(
            (p) =>
              p.ownerUserId === ownerUserId &&
              p.companionId === companionId &&
              isLatentPhraseSpeakable(p) &&
              !this.purgedPhraseIds.has(`${ownerUserId}:${companionId}:${p.phraseId}`),
          )
          .map((p) => ({
            phraseId: p.phraseId,
            ownerUserId: p.ownerUserId,
            companionId: p.companionId,
            text: p.canonicalText,
            approvedForCallback:
              p.approvedForCallback &&
              (input.surface !== "FAN_AVATAR_LOBBY" || p.publicSpeechAllowed),
            favorited: p.favorited,
            neverSayAgain: p.neverSayAgain,
            reinforcementCount: Math.max(1, p.reinforcementCount),
            lastSpokenAtMs: p.lastSpokenAtMs,
            createdAtMs: p.createdAtMs,
          }));

        const decision = decideSpontaneousCallback({
          surface: input.surface,
          settings: rec.speechSettings,
          growth: rec.growth,
          phrases: catchphrasePool,
          nowMs,
          idleMs: input.idleMs,
          sessionCallbackCount: rec.sessionCallbackCount,
          lastAnyCallbackAtMs: rec.lastAnyCallbackAtMs,
          performanceActive: input.performanceActive,
          random01: input.random01,
        });

        let vocalCue: ManufacturedVocalCueBinding | null = null;
        if (decision.ok) {
          rec.lastAnyCallbackAtMs = nowMs;
          rec.sessionCallbackCount += 1;
          const targetPhrase = rec.phrases[decision.phraseId];
          if (targetPhrase) {
            rec.phrases[decision.phraseId] = {
              ...targetPhrase,
              lastSpokenAtMs: nowMs,
            };
          }
          rec.revision += 1;
          rec.updatedAtMs = nowMs;
          await save(rec);

          vocalCue =
            rec.growth.stage === "STAGE_1_BABY_MINI_SPEAK"
              ? MANUFACTURED_VOCAL_CUES.vox_stage1_bibble_bop_01
              : rec.growth.stage === "STAGE_2_FIRST_WORDS"
                ? MANUFACTURED_VOCAL_CUES.vox_stage2_blended_lets_go_01
                : rec.growth.stage === "STAGE_3_DEVELOPING_SPEECH"
                  ? MANUFACTURED_VOCAL_CUES.vox_stage3_thinking_hum_01
                  : MANUFACTURED_VOCAL_CUES.vox_stage4_callback_spark_01;
        }

        const isPublicLobby = input.surface === "FAN_AVATAR_LOBBY";
        const ownerPrivateAudioOnly = !isPublicLobby;
        const publicVenueBroadcastAllowed =
          isPublicLobby && decision.ok && decision.spatialPublic;

        return ok({
          decision,
          ownerPrivateAudioOnly,
          publicVenueBroadcastAllowed,
          vocalCue,
          sessionCallbackCount: rec.sessionCallbackCount,
          lastAnyCallbackAtMs: rec.lastAnyCallbackAtMs,
        });
      },
    );
  }

  async updateCompanionSpeechSettings(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    patch: Partial<ExtendedMiniMeSpeechSettings>;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<ExtendedMiniMeSpeechSettings>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner settings update blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const nowMs = input.nowMs ?? Date.now();

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });
        rec.speechSettings = {
          ...rec.speechSettings,
          ...input.patch,
        };
        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);
        return ok({ ...rec.speechSettings });
      },
    );
  }

  async executeCompanionReset(input: {
    authenticatedOwnerUserId: string;
    requestedOwnerUserId?: string;
    companionId: string;
    kind: MiniMeResetKind;
    nowMs?: number;
  }): Promise<MiniMeServiceResult<CompanionResetExecutionOutcome>> {
    if (
      input.requestedOwnerUserId &&
      input.requestedOwnerUserId !== input.authenticatedOwnerUserId
    ) {
      return fail("CROSS_OWNER_FORBIDDEN", "Cross-owner reset blocked");
    }
    const ownerUserId = input.authenticatedOwnerUserId;
    const companionId = input.companionId;
    const nowMs = input.nowMs ?? Date.now();
    const scope = resolveMiniMeResetScope(input.kind);

    return this.store.withCompanionTransaction(
      ownerUserId,
      companionId,
      async (current, save) => {
        const rec =
          current ??
          createDefaultDurableCompanionRecord({
            ownerUserId,
            companionId,
            nowMs,
          });

        const preservedLearningEnabled = rec.speechSettings.learningEnabled;

        rec.growth = applyGrowthReset(rec.growth, input.kind);

        if (scope.clearVoiceLearning) {
          for (const pid of Object.keys(rec.phrases)) {
            this.purgedPhraseIds.add(`${ownerUserId}:${companionId}:${pid}`);
          }
          rec.phrases = {};
          for (const [sid, sk] of Object.entries(rec.skills)) {
            if (sk.kind === "PHRASE") {
              delete rec.skills[sid];
            }
          }
          rec.firstHelloCompleted = false;
          rec.lastCalendarPracticeDayKey = null;
          rec.sessionCallbackCount = 0;
          rec.lastAnyCallbackAtMs = null;
        }

        if (scope.clearPersonality) {
          rec.personalityTraits = createNewbornPersonality();
          rec.favoriteMovements = [];
          rec.lastIdleKind = null;
          rec.lastIdleDecisionAtMs = null;
          for (const [sid, sk] of Object.entries(rec.skills)) {
            if (sk.kind !== "PHRASE") {
              delete rec.skills[sid];
            }
          }
        }

        if (input.kind === "FULL_REBIRTH") {
          rec.skills = {};
          rec.yearIndex = 0;
        }

        rec.speechSettings = {
          ...rec.speechSettings,
          learningEnabled: preservedLearningEnabled,
        };
        rec.revision += 1;
        rec.updatedAtMs = nowMs;
        await save(rec);

        return ok({
          kind: input.kind,
          scope,
          companion: rec,
          rebirthVocalCue:
            input.kind === "FULL_REBIRTH" || input.kind === "VOICE_RESET"
              ? MANUFACTURED_VOCAL_CUES.vox_rebirth_chime_stage1_restart_01
              : null,
          deletedPhraseCacheCleared: true,
          appearanceUntouched: true,
          savedLooksUntouched: true,
          purchasesUntouched: true,
          learningPreferencePreserved:
            rec.speechSettings.learningEnabled === preservedLearningEnabled,
        });
      },
    );
  }
}

export const defaultMiniMeCompanionRuntimeService = new MiniMeCompanionRuntimeService();

export function miniMeBackendBoundaryLocks() {
  return {
    MINI_ME_COMPANION_RUNTIME_SERVICE_ID,
    MINI_ME_MIGRATION_ID,
    COMPANION_MIC_ACTIVATES_BROADCAST_MIC,
    COMPANION_MIC_AUTO_PUBLISHES_WEBRTC,
    COMPANION_MIC_AUTO_ROOM_CHAT,
    COMPANION_MIC_POSTS_TO_ROOM_CHAT: COMPANION_MIC_AUTO_ROOM_CHAT,
    COMPANION_MIC_JOINS_VENUE_AUDIO,
    COMPANION_MIC_CONTINUOUS_BG_RECORD,
    RAW_MIC_RECORDINGS_STORED_BY_DEFAULT,
    INSTANT_FLUENT_SPEECH_FORBIDDEN,
    CALENDAR_ALONE_ADVANCES_STAGE,
    PAID_TIER_ACCELERATES_GROWTH,
    PRACTICE_BEFORE_PRONUNCIATION,
    RECOGNITION_UNLOCKS_FLUENT_SPEECH,
    ANNOUNCE_EVERY_LEARNED_PHRASE,
    MINI_SPEAK_ELIMINATED_AT_STAGE_4,
    CROSS_OWNER_PHRASE_TRANSFER,
    RUST_ONSET_IDLE_DAYS,
    RUST_NOTICEABLE_IDLE_DAYS,
    RUST_STRONG_IDLE_DAYS,
    FORGETFULNESS_PERMANENTLY_DELETES_MEMORY,
    ABSENCE_REGRESSES_TO_INFANCY,
    ABSENCE_ERASES_OWNERSHIP_OR_PURCHASES,
    ONE_GLOBAL_INTELLIGENCE_METER,
    HARD_DEVELOPMENT_CEILING,
    LEARNING_STOPS_AFTER_STAGE_4,
    PAID_RECOVERY_SHORTCUT,
    PASSIVE_LOGIN_COUNTS_AS_PLAY,
    FIXED_FIVE_SECOND_IDLE_LOOP_FORBIDDEN,
    AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT,
    IDLE_TRIGGERS_PUBLIC_MIC_BROADCAST,
    LEARNING_IMPLIES_PUBLIC_BROADCAST,
    CROSS_OWNER_MEMORY_LEAK_FORBIDDEN,
    DUPLICATE_SPEECH_ENGINE_CREATED,
    STT_NEVER_AUTO_SENDS,
    TTS_OPT_IN_ONLY,
    NEVER_IMPERSONATE_REAL_VOICE,
    STAGES: MINI_ME_VOCAL_STAGES,
    STAGE_MIN_ACTIVE_DAYS: MINI_ME_STAGE_MIN_ACTIVE_DAYS,
    STAGE1_HELLO_MINI_SPEAK_VARIANTS,
    FIRST_HELLO_PROMPT,
  } as const;
}

export {
  personalitiesLikelyDistinct,
  surfaceAllowsCallback,
  catchphraseRenditionForStage,
  canAcquireNewLifelongSkill,
};
