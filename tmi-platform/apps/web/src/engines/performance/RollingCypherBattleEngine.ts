// Rolling Cypher/Battle Engine — Platform-owned bot-controlled session authority
// Controls: session lifecycle, phase timers, rotation schedule, slot management, auto-roll
// SSR-safe — pure timestamp math, no browser APIs

import type { InstrumentClass, PerformanceMode } from "./BeatRoutingEngine";

// ── Session phases ────────────────────────────────────────────────────────────

export type SessionPhase =
  | "join_window"      // OPEN — users join, bots fill empty slots
  | "beat_selection"   // Bot DJ loads beat queue, players can vote skip
  | "performance"      // Beat locked, performing
  | "judge_window"     // 30s judge review
  | "vote_window"      // 60s fan voting
  | "winner_window"    // 15s winner announcement
  | "reset_window";    // 15s cooldown before next session auto-launches

export type SessionType = "cypher" | "battle";

// ── Phase durations (ms) ──────────────────────────────────────────────────────

export const PHASE_DURATIONS_MS = {
  join_window_short:       2 * 60 * 1000,
  join_window_mid:         3 * 60 * 1000,   // default
  join_window_long:        5 * 60 * 1000,
  beat_selection:         30 * 1000,
  performance_short:      60 * 1000,
  performance_mid:       120 * 1000,        // default
  performance_long:      180 * 1000,
  judge_window:           30 * 1000,
  vote_window:            60 * 1000,
  winner_window:          15 * 1000,
  reset_window:           15 * 1000,
} as const;

// ── Session schemas ───────────────────────────────────────────────────────────

export type CypherSession = {
  id: string;
  type: "cypher";
  genre: string;
  instrumentClass: InstrumentClass;
  performanceMode: PerformanceMode;
  phase: SessionPhase;
  joinDeadline: number;      // unix ms
  startTime: number;         // unix ms — after join + beat selection
  rotationIndex: number;
  beatQueueId: string;
  modeType: string;          // "Vocal Cypher" | "Producer Cypher" | etc.
  hostBotId: string;
  slots: number;
  filledSlots: number;
  isLive: boolean;
};

export type BattleSession = {
  id: string;
  type: "battle";
  genre: string;
  instrumentClass: InstrumentClass;
  performanceMode: PerformanceMode;
  phase: SessionPhase;
  joinDeadline: number;
  beatVoteWindow: number;    // unix ms — when beat vote closes
  lockedBeatId: string | null;
  judgeWindow: number;       // unix ms — when judge window closes
  winnerWindow: number;      // unix ms — when winner window closes
  nextBattleTime: number;    // unix ms — when next battle starts
  artist1Name: string;
  artist2Name: string;
  isLive: boolean;
};

export type RollingSession = CypherSession | BattleSession;

// ── Rotation schedule ─────────────────────────────────────────────────────────

export type RotationSlot = {
  label: string;
  type: SessionType;
  genre: string;
  instrumentClass: InstrumentClass;
  modeType: string;
  performanceMode: PerformanceMode;
  joinWindowMs: number;
  performanceDurationMs: number;
  slots: number;
};

export const ROTATION_SCHEDULE: RotationSlot[] = [
  {
    label: "R&B Vocal Battle",
    type: "battle", genre: "R&B", instrumentClass: "vocalist", modeType: "Singer Battle",
    performanceMode: "beat-backed",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_mid,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_mid,
    slots: 2,
  },
  {
    label: "Producer Beat Battle",
    type: "battle", genre: "Trap", instrumentClass: "producer", modeType: "Producer Battle",
    performanceMode: "instrument-beat",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_mid,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_mid,
    slots: 2,
  },
  {
    label: "Rock Guitar Battle",
    type: "battle", genre: "Rock", instrumentClass: "guitarist", modeType: "Guitar Battle",
    performanceMode: "instrument-only",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_short,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_mid,
    slots: 2,
  },
  {
    label: "Country Singer Battle",
    type: "battle", genre: "Country", instrumentClass: "vocalist", modeType: "Singer Battle",
    performanceMode: "beat-backed",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_mid,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_mid,
    slots: 2,
  },
  {
    label: "Open Cypher",
    type: "cypher", genre: "Open", instrumentClass: "vocalist", modeType: "Open Cypher",
    performanceMode: "beat-backed",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_long,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_long,
    slots: 6,
  },
  {
    label: "Piano Duel",
    type: "battle", genre: "Classical", instrumentClass: "pianist", modeType: "Piano Battle",
    performanceMode: "instrument-only",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_short,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_mid,
    slots: 2,
  },
  {
    label: "Band Clash",
    type: "cypher", genre: "All Genres", instrumentClass: "band", modeType: "Band Cypher",
    performanceMode: "full-band",
    joinWindowMs: PHASE_DURATIONS_MS.join_window_long,
    performanceDurationMs: PHASE_DURATIONS_MS.performance_long,
    slots: 8,
  },
];

// ── Slot duration helpers ─────────────────────────────────────────────────────

export function getSlotLifecycleDurationMs(slot: RotationSlot): number {
  return (
    slot.joinWindowMs +
    PHASE_DURATIONS_MS.beat_selection +
    slot.performanceDurationMs +
    PHASE_DURATIONS_MS.judge_window +
    PHASE_DURATIONS_MS.vote_window +
    PHASE_DURATIONS_MS.winner_window +
    PHASE_DURATIONS_MS.reset_window
  );
}

export function getCycleDurationMs(): number {
  return ROTATION_SCHEDULE.reduce((sum, slot) => sum + getSlotLifecycleDurationMs(slot), 0);
}

// ── Phase resolution — pure timestamp math ────────────────────────────────────

export type PhaseState = {
  phase: SessionPhase;
  msRemaining: number;
  msElapsed: number;
  rotationIndex: number;
  slot: RotationSlot;
};

export function resolvePhaseState(nowMs: number, epochMs: number): PhaseState {
  const cycleMs = getCycleDurationMs();
  const posInCycle = ((nowMs - epochMs) % cycleMs + cycleMs) % cycleMs;

  let accumulated = 0;
  for (let i = 0; i < ROTATION_SCHEDULE.length; i++) {
    const slot = ROTATION_SCHEDULE[i]!;
    const slotDuration = getSlotLifecycleDurationMs(slot);

    if (posInCycle < accumulated + slotDuration) {
      const posInSlot = posInCycle - accumulated;

      const phases: { phase: SessionPhase; duration: number }[] = [
        { phase: "join_window",    duration: slot.joinWindowMs },
        { phase: "beat_selection", duration: PHASE_DURATIONS_MS.beat_selection },
        { phase: "performance",    duration: slot.performanceDurationMs },
        { phase: "judge_window",   duration: PHASE_DURATIONS_MS.judge_window },
        { phase: "vote_window",    duration: PHASE_DURATIONS_MS.vote_window },
        { phase: "winner_window",  duration: PHASE_DURATIONS_MS.winner_window },
        { phase: "reset_window",   duration: PHASE_DURATIONS_MS.reset_window },
      ];

      let phaseAcc = 0;
      for (const p of phases) {
        if (posInSlot < phaseAcc + p.duration) {
          const msElapsed = posInSlot - phaseAcc;
          return { phase: p.phase, msRemaining: p.duration - msElapsed, msElapsed, rotationIndex: i, slot };
        }
        phaseAcc += p.duration;
      }
    }
    accumulated += slotDuration;
  }

  return {
    phase: "join_window",
    msRemaining: ROTATION_SCHEDULE[0]!.joinWindowMs,
    msElapsed: 0,
    rotationIndex: 0,
    slot: ROTATION_SCHEDULE[0]!,
  };
}

// ── Session factory ───────────────────────────────────────────────────────────

let _counter = 0;

export function buildCypherSession(slot: RotationSlot, rotationIndex: number, nowMs: number): CypherSession {
  const id = `cypher-${rotationIndex}-${++_counter}`;
  const filledSlots = Math.max(2, Math.floor(slot.slots * 0.6)); // bots pre-fill 60%
  return {
    id,
    type: "cypher",
    genre: slot.genre,
    instrumentClass: slot.instrumentClass,
    performanceMode: slot.performanceMode,
    phase: "join_window",
    joinDeadline: nowMs + slot.joinWindowMs,
    startTime: nowMs + slot.joinWindowMs + PHASE_DURATIONS_MS.beat_selection,
    rotationIndex,
    beatQueueId: `bq-${slot.genre.toLowerCase().replace(/\s+/g, "-")}-${id}`,
    modeType: slot.modeType,
    hostBotId: `bot-dj-${(rotationIndex % 8) + 1}`,
    slots: slot.slots,
    filledSlots,
    isLive: false,
  };
}

export function buildBattleSession(
  slot: RotationSlot,
  rotationIndex: number,
  nowMs: number,
  artist1: string,
  artist2: string,
): BattleSession {
  const id = `battle-${rotationIndex}-${++_counter}`;
  const joinDeadline   = nowMs + slot.joinWindowMs;
  const beatVoteWindow = joinDeadline + PHASE_DURATIONS_MS.beat_selection;
  const performanceEnd = beatVoteWindow + slot.performanceDurationMs;
  const judgeWindow    = performanceEnd + PHASE_DURATIONS_MS.judge_window;
  const winnerWindow   = judgeWindow + PHASE_DURATIONS_MS.vote_window + PHASE_DURATIONS_MS.winner_window;
  const nextBattleTime = winnerWindow + PHASE_DURATIONS_MS.reset_window;

  return {
    id,
    type: "battle",
    genre: slot.genre,
    instrumentClass: slot.instrumentClass,
    performanceMode: slot.performanceMode,
    phase: "join_window",
    joinDeadline,
    beatVoteWindow,
    lockedBeatId: null,
    judgeWindow,
    winnerWindow,
    nextBattleTime,
    artist1Name: artist1,
    artist2Name: artist2,
    isLive: false,
  };
}

// ── Slot management ───────────────────────────────────────────────────────────

export function getBotFillCount(filledSlots: number, maxSlots: number): number {
  return Math.max(0, maxSlots - filledSlots);
}

export function shouldAutoStart(session: CypherSession, nowMs: number): boolean {
  return nowMs >= session.joinDeadline && session.filledSlots >= 2;
}

// ── Phase display helpers ─────────────────────────────────────────────────────

export function getPhaseLabel(phase: SessionPhase): string {
  const labels: Record<SessionPhase, string> = {
    join_window:    "JOIN WINDOW OPEN",
    beat_selection: "SELECTING BEAT",
    performance:    "LIVE NOW",
    judge_window:   "JUDGES REVIEWING",
    vote_window:    "FAN VOTE",
    winner_window:  "WINNER",
    reset_window:   "NEXT SESSION LOADING",
  };
  return labels[phase];
}

export function formatMsRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getNextRotationSlot(currentIndex: number): RotationSlot {
  return ROTATION_SCHEDULE[(currentIndex + 1) % ROTATION_SCHEDULE.length]!;
}
