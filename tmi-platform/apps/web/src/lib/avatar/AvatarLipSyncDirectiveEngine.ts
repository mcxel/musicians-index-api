import { contentInterestEngine } from '@/lib/learning/ContentInterestEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

/**
 * AvatarLipSyncDirectiveEngine
 * Controls phoneme sequencing and mouth animation for avatar lip sync.
 * Date-seeded for consistent daily behavior. Integrates with AvatarDailyMotionEngine.
 */

export type PhonemeGroup =
  | "bilabial"    // m, b, p — lips together
  | "labiodental" // f, v — teeth/lip
  | "dental"      // th — teeth/tongue
  | "alveolar"    // t, d, n, s, z
  | "velar"       // k, g
  | "vowel-open"  // a, ah
  | "vowel-mid"   // e, eh
  | "vowel-close" // ee, i
  | "vowel-round" // o, oo, u
  | "rest";       // silence

export type LipSyncMode =
  | "singing"
  | "rapping"
  | "talking"
  | "hype-call"
  | "whisper"
  | "mouthing";

export interface LipSyncFrame {
  phoneme: PhonemeGroup;
  mouthOpenPct: number;
  lipRoundPct: number;
  teethVisiblePct: number;
  durationMs: number;
}

export interface LipSyncDirective {
  mode: LipSyncMode;
  bpm: number;
  syllablesPerBeat: number;
  defaultFrame: LipSyncFrame;
  phonemeSequence: PhonemeGroup[];
  frameDurationMs: number;
  intensity: "low" | "medium" | "high";
  enabled: boolean;
}

export interface DailyLipSyncBoard {
  date: string;
  activeMode: LipSyncMode;
  bpm: number;
  intensity: LipSyncDirective["intensity"];
  enabled: boolean;
}

const PHONEME_FRAMES: Record<PhonemeGroup, LipSyncFrame> = {
  "bilabial":     { phoneme: "bilabial",    mouthOpenPct: 0,   lipRoundPct: 0,   teethVisiblePct: 0,   durationMs: 80  },
  "labiodental":  { phoneme: "labiodental", mouthOpenPct: 10,  lipRoundPct: 0,   teethVisiblePct: 60,  durationMs: 90  },
  "dental":       { phoneme: "dental",      mouthOpenPct: 20,  lipRoundPct: 0,   teethVisiblePct: 80,  durationMs: 80  },
  "alveolar":     { phoneme: "alveolar",    mouthOpenPct: 30,  lipRoundPct: 0,   teethVisiblePct: 40,  durationMs: 70  },
  "velar":        { phoneme: "velar",       mouthOpenPct: 40,  lipRoundPct: 0,   teethVisiblePct: 20,  durationMs: 70  },
  "vowel-open":   { phoneme: "vowel-open",  mouthOpenPct: 90,  lipRoundPct: 0,   teethVisiblePct: 30,  durationMs: 120 },
  "vowel-mid":    { phoneme: "vowel-mid",   mouthOpenPct: 60,  lipRoundPct: 0,   teethVisiblePct: 20,  durationMs: 100 },
  "vowel-close":  { phoneme: "vowel-close", mouthOpenPct: 30,  lipRoundPct: 0,   teethVisiblePct: 10,  durationMs: 90  },
  "vowel-round":  { phoneme: "vowel-round", mouthOpenPct: 50,  lipRoundPct: 80,  teethVisiblePct: 10,  durationMs: 110 },
  "rest":         { phoneme: "rest",        mouthOpenPct: 0,   lipRoundPct: 0,   teethVisiblePct: 0,   durationMs: 200 },
};

const MODE_CONFIGS: Record<LipSyncMode, Omit<LipSyncDirective, "enabled">> = {
  "singing": {
    mode: "singing",
    bpm: 90,
    syllablesPerBeat: 2,
    defaultFrame: PHONEME_FRAMES["vowel-open"],
    phonemeSequence: ["vowel-open", "alveolar", "vowel-mid", "vowel-round", "rest", "vowel-close", "bilabial"],
    frameDurationMs: 120,
    intensity: "high",
  },
  "rapping": {
    mode: "rapping",
    bpm: 140,
    syllablesPerBeat: 4,
    defaultFrame: PHONEME_FRAMES["alveolar"],
    phonemeSequence: ["alveolar", "vowel-open", "bilabial", "velar", "alveolar", "vowel-mid", "rest"],
    frameDurationMs: 70,
    intensity: "high",
  },
  "talking": {
    mode: "talking",
    bpm: 80,
    syllablesPerBeat: 2,
    defaultFrame: PHONEME_FRAMES["vowel-mid"],
    phonemeSequence: ["vowel-mid", "alveolar", "vowel-open", "bilabial", "rest"],
    frameDurationMs: 100,
    intensity: "medium",
  },
  "hype-call": {
    mode: "hype-call",
    bpm: 120,
    syllablesPerBeat: 3,
    defaultFrame: PHONEME_FRAMES["vowel-open"],
    phonemeSequence: ["vowel-open", "velar", "vowel-round", "alveolar", "vowel-open"],
    frameDurationMs: 85,
    intensity: "high",
  },
  "whisper": {
    mode: "whisper",
    bpm: 60,
    syllablesPerBeat: 1,
    defaultFrame: PHONEME_FRAMES["vowel-close"],
    phonemeSequence: ["vowel-close", "alveolar", "rest", "vowel-mid", "labiodental"],
    frameDurationMs: 150,
    intensity: "low",
  },
  "mouthing": {
    mode: "mouthing",
    bpm: 70,
    syllablesPerBeat: 2,
    defaultFrame: PHONEME_FRAMES["bilabial"],
    phonemeSequence: ["bilabial", "vowel-open", "alveolar", "vowel-mid", "rest"],
    frameDurationMs: 110,
    intensity: "low",
  },
};

const MODE_POOL: LipSyncMode[] = ["singing", "rapping", "talking", "hype-call", "whisper", "mouthing"];

function dayHash(): number {
  const today = new Date().toISOString().split("T")[0];
  return today.split("-").reduce((h, n) => (h * 31 + parseInt(n)) >>> 0, 0);
}

export function getDailyLipSyncBoard(): DailyLipSyncBoard {
  const h = dayHash();
  const intensities: LipSyncDirective["intensity"][] = ["low", "medium", "high"];
  const bpmOptions = [80, 90, 100, 110, 120, 130, 140];

  return {
    date: new Date().toISOString().split("T")[0],
    activeMode: MODE_POOL[h % MODE_POOL.length],
    bpm: bpmOptions[h % bpmOptions.length],
    intensity: intensities[h % intensities.length],
    enabled: true,
  };
}

export function getLipSyncDirective(mode: LipSyncMode): LipSyncDirective {
  return { ...MODE_CONFIGS[mode], enabled: true };
}

export function getActiveLipSyncDirective(): LipSyncDirective {
  const board = getDailyLipSyncBoard();
  const base = getLipSyncDirective(board.activeMode);
  const topContent = contentInterestEngine.getTopContent(1)[0];
  const bpmBoost = topContent ? Math.round(topContent.score / 20) : 0;

  const bpmMutation = applySafeLearningMutation({
    engine: 'AvatarLipSyncDirectiveEngine',
    targetId: board.activeMode,
    metric: 'lip-sync-bpm',
    beforeValue: base.bpm,
    requestedValue: base.bpm + bpmBoost,
    minValue: 55,
    maxValue: 180,
    confidence: topContent ? 0.69 : 0.45,
    reason: 'lip sync pacing adapts from current content engagement intensity',
  });

  return {
    ...base,
    bpm: bpmMutation.appliedValue,
  };
}

export function getPhonemeFrame(phoneme: PhonemeGroup): LipSyncFrame {
  return PHONEME_FRAMES[phoneme];
}

export function buildLipSyncSequence(mode: LipSyncMode, barCount: number): LipSyncFrame[] {
  const config = MODE_CONFIGS[mode];
  const frames: LipSyncFrame[] = [];
  for (let i = 0; i < barCount; i++) {
    for (const phoneme of config.phonemeSequence) {
      frames.push({ ...PHONEME_FRAMES[phoneme], durationMs: config.frameDurationMs });
    }
  }
  return frames;
}

export function getLipSyncForAvatarContext(
  context: "stage" | "battle" | "room" | "idle"
): LipSyncDirective {
  const contextMap: Record<string, LipSyncMode> = {
    stage:  "singing",
    battle: "rapping",
    room:   "talking",
    idle:   "mouthing",
  };
  return getLipSyncDirective(contextMap[context] as LipSyncMode);
}
