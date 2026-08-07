/**
 * GauntletRunRuntime — one competition run inside a persistent Gauntlet room.
 * RoundReducer: 32 → 16 → 8 → 4 → 2 → 1. One life. Performance Clock.
 * Run end ≠ room end — room transitions to WHO'S ENTERING NEXT.
 */

import {
  eliminateToSpectator,
  promoteToActive,
  setGauntletCurrentRun,
  type GauntletParticipant,
} from "@/lib/gauntlet/GauntletRoomRuntime";

export type GauntletRunPhase =
  | "GATHERING"
  | "COUNTDOWN"
  | "ROUND_ACTIVE"
  | "ELIMINATION"
  | "SURVIVOR_REVEAL"
  | "CHAMPION_CEREMONY"
  | "WHOS_ENTERING_NEXT"
  | "RUN_COMPLETE";

export type GauntletRoundSize = 32 | 16 | 8 | 4 | 2 | 1;

export type GauntletRunState = {
  runId: string;
  roomId: string;
  phase: GauntletRunPhase;
  roundSize: GauntletRoundSize;
  aliveIds: string[];
  performanceClockSeconds: number;
  performanceClockEndsAt: number;
  championId: string | null;
  createdAt: number;
  updatedAt: number;
};

const ROUND_SEQUENCE: GauntletRoundSize[] = [32, 16, 8, 4, 2, 1];
const DEFAULT_PERF_CLOCK = 45;

const runs = new Map<string, GauntletRunState>();

export function createGauntletRun(
  roomId: string,
  waiting: GauntletParticipant[],
): GauntletRunState {
  const runId = `grun-${roomId}-${Date.now()}`;
  const starters = waiting
    .filter((p) => p.role === "WAITING_COMPETITOR" && !p.eliminated)
    .slice(0, 32);
  for (const p of starters) promoteToActive(roomId, p.userId);

  const startSize = nextBracketSize(starters.length);
  const run: GauntletRunState = {
    runId,
    roomId,
    phase: starters.length >= 2 ? "COUNTDOWN" : "GATHERING",
    roundSize: startSize,
    aliveIds: starters.map((p) => p.userId),
    performanceClockSeconds: DEFAULT_PERF_CLOCK,
    performanceClockEndsAt: 0,
    championId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  runs.set(runId, run);
  setGauntletCurrentRun(roomId, runId);
  return run;
}

function nextBracketSize(n: number): GauntletRoundSize {
  for (const size of ROUND_SEQUENCE) {
    if (n >= size) return size;
  }
  return 1;
}

export function getGauntletRun(runId: string): GauntletRunState | null {
  return runs.get(runId) ?? null;
}

export function startPerformanceClock(
  runId: string,
  seconds = DEFAULT_PERF_CLOCK,
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  run.phase = "ROUND_ACTIVE";
  run.performanceClockSeconds = seconds;
  run.performanceClockEndsAt = Date.now() + seconds * 1000;
  run.updatedAt = Date.now();
  return run;
}

export function getPerformanceClockRemaining(runId: string): number {
  const run = runs.get(runId);
  if (!run || !run.performanceClockEndsAt) return 0;
  return Math.max(0, Math.ceil((run.performanceClockEndsAt - Date.now()) / 1000));
}

/** Eliminate losers; survivors advance. Eliminated stay in venue as spectators. */
export function reduceRound(
  runId: string,
  eliminatedIds: string[],
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  run.phase = "ELIMINATION";
  for (const id of eliminatedIds) {
    eliminateToSpectator(run.roomId, id);
  }
  run.aliveIds = run.aliveIds.filter((id) => !eliminatedIds.includes(id));
  run.updatedAt = Date.now();

  if (run.aliveIds.length <= 1) {
    run.phase = "CHAMPION_CEREMONY";
    run.roundSize = 1;
    run.championId = run.aliveIds[0] ?? null;
    return run;
  }

  const next = ROUND_SEQUENCE.find((s) => s < run.roundSize && s >= run.aliveIds.length);
  run.roundSize = (next ?? 2) as GauntletRoundSize;
  run.phase = "SURVIVOR_REVEAL";
  return run;
}

export function advanceAfterSurvivorReveal(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  if (run.aliveIds.length <= 1) {
    run.phase = "CHAMPION_CEREMONY";
    run.championId = run.aliveIds[0] ?? null;
  } else {
    run.phase = "ROUND_ACTIVE";
    run.performanceClockEndsAt = Date.now() + run.performanceClockSeconds * 1000;
  }
  run.updatedAt = Date.now();
  return run;
}

/** Ceremony → WHO'S ENTERING NEXT — room stays open for continuous runs. */
export function completeRunCeremony(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  run.phase = "WHOS_ENTERING_NEXT";
  run.updatedAt = Date.now();
  setGauntletCurrentRun(run.roomId, null);
  return run;
}

export function markRunComplete(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  run.phase = "RUN_COMPLETE";
  run.updatedAt = Date.now();
  return run;
}

export function extendPerformanceClock(runId: string, extraSeconds: number): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  run.performanceClockEndsAt = Math.max(Date.now(), run.performanceClockEndsAt) + extraSeconds * 1000;
  run.updatedAt = Date.now();
  return run;
}

export function listRunsForRoom(roomId: string): GauntletRunState[] {
  return [...runs.values()].filter((r) => r.roomId === roomId);
}
