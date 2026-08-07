/**
 * GauntletRunRuntime — sequenced main rounds + between-round side battles.
 *
 * Locked structure (Marcel):
 *   ROUND_ACTIVE (main field performs — audience watches)
 *   → AUDIENCE_ELIMINATION_VOTE (audience picks who is eliminated)
 *   → ELIMINATION_RESULT
 *   → SURVIVOR_REST + SIDE_BATTLE_WINDOW (eliminated compete visibly; survivors rest)
 *   → FIELD_CONTRACT / next main round
 *   → … → FINAL → CHAMPION → WHOS_ENTERING_NEXT
 *
 * Side battles are NEVER simultaneous with ROUND_ACTIVE main performances.
 * Main + side stages are both visible (HUD / jumbotron / PiP).
 * Run end ≠ room end.
 */

import {
  eliminateToSpectatorWithSideBattle,
  promoteToActive,
  setGauntletCurrentRun,
  type GauntletParticipant,
} from "@/lib/gauntlet/GauntletRoomRuntime";
import {
  closeSideBattleWindow,
  enqueueSideBattleEligible,
  openSideBattleWindow,
} from "@/lib/gauntlet/GauntletSideBattleEngine";
import {
  closeEliminationVoteWindow,
  getVoteWindowRemainingSeconds,
  openEliminationVoteWindow,
  resolveEliminatedCompetitor,
} from "@/lib/gauntlet/GauntletAudienceEliminationVote";

export type GauntletRunPhase =
  | "REGISTRATION"
  | "ROUND_ACTIVE"
  | "AUDIENCE_ELIMINATION_VOTE"
  | "ELIMINATION_RESULT"
  | "SURVIVOR_REST"
  | "SIDE_BATTLE_WINDOW"
  | "FIELD_CONTRACT"
  | "FINAL"
  | "CHAMPION"
  | "WHOS_ENTERING_NEXT"
  | "RUN_COMPLETE";

export type GauntletRoundSize = 32 | 16 | 8 | 4 | 2 | 1;

export type GauntletRunState = {
  runId: string;
  roomId: string;
  phase: GauntletRunPhase;
  roundNumber: number;
  roundSize: GauntletRoundSize;
  aliveIds: string[];
  lastEliminatedIds: string[];
  performanceClockSeconds: number;
  performanceClockEndsAt: number;
  voteWindowEndsAt: number;
  restWindowEndsAt: number;
  sideWindowEndsAt: number;
  championId: string | null;
  /** Main stage is always the primary field when ROUND_ACTIVE / FINAL. */
  mainStageFocus: boolean;
  /** Side stage visible (PiP/jumbotron) — only LIVE during SIDE_BATTLE_WINDOW. */
  sideStageVisible: boolean;
  survivorsResting: boolean;
  createdAt: number;
  updatedAt: number;
};

const ROUND_SEQUENCE: GauntletRoundSize[] = [32, 16, 8, 4, 2, 1];
const DEFAULT_PERF_CLOCK = 45;
const DEFAULT_VOTE_SECONDS = 25;
const DEFAULT_SIDE_WINDOW_SECONDS = 40;

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

  const startSize = nextBracketSize(Math.max(starters.length, 2));
  const run: GauntletRunState = {
    runId,
    roomId,
    phase: "REGISTRATION",
    roundNumber: 0,
    roundSize: startSize,
    aliveIds: starters.map((p) => p.userId),
    lastEliminatedIds: [],
    performanceClockSeconds: DEFAULT_PERF_CLOCK,
    performanceClockEndsAt: 0,
    voteWindowEndsAt: 0,
    restWindowEndsAt: 0,
    sideWindowEndsAt: 0,
    championId: null,
    mainStageFocus: true,
    sideStageVisible: true, // cards visible even when queued
    survivorsResting: false,
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

function contractTarget(alive: number): GauntletRoundSize {
  if (alive <= 1) return 1;
  if (alive === 2) return 2;
  return nextBracketSize(Math.max(1, Math.floor(alive / 2)));
}

export function getGauntletRun(runId: string): GauntletRunState | null {
  return runs.get(runId) ?? null;
}

/** REGISTRATION / FIELD_CONTRACT → ROUND_ACTIVE or FINAL. */
export function beginRound(
  runId: string,
  seconds = DEFAULT_PERF_CLOCK,
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  if (run.aliveIds.length <= 1) {
    run.phase = "CHAMPION";
    run.championId = run.aliveIds[0] ?? null;
    run.roundSize = 1;
    run.mainStageFocus = true;
    run.survivorsResting = false;
    run.updatedAt = Date.now();
    return run;
  }
  run.roundNumber += 1;
  run.performanceClockSeconds = seconds;
  run.performanceClockEndsAt = Date.now() + seconds * 1000;
  run.voteWindowEndsAt = 0;
  run.restWindowEndsAt = 0;
  run.sideWindowEndsAt = 0;
  run.lastEliminatedIds = [];
  run.mainStageFocus = true;
  run.survivorsResting = false;
  run.sideStageVisible = true;
  run.phase = run.aliveIds.length === 2 ? "FINAL" : "ROUND_ACTIVE";
  run.roundSize = nextBracketSize(run.aliveIds.length);
  run.updatedAt = Date.now();
  return run;
}

export function startPerformanceClock(
  runId: string,
  seconds = DEFAULT_PERF_CLOCK,
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  if (run.phase === "REGISTRATION" || run.phase === "FIELD_CONTRACT") {
    return beginRound(runId, seconds);
  }
  if (run.phase === "ROUND_ACTIVE" || run.phase === "FINAL") {
    run.performanceClockSeconds = seconds;
    run.performanceClockEndsAt = Date.now() + seconds * 1000;
    run.updatedAt = Date.now();
    return run;
  }
  return beginRound(runId, seconds);
}

export function getPerformanceClockRemaining(runId: string): number {
  const run = runs.get(runId);
  if (!run) return 0;
  if (run.phase === "AUDIENCE_ELIMINATION_VOTE") {
    return getVoteWindowRemainingSeconds(runId);
  }
  if (run.phase === "SURVIVOR_REST" || run.phase === "SIDE_BATTLE_WINDOW") {
    const end = Math.max(run.restWindowEndsAt, run.sideWindowEndsAt);
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
  }
  if (!run.performanceClockEndsAt) return 0;
  return Math.max(0, Math.ceil((run.performanceClockEndsAt - Date.now()) / 1000));
}

/** ROUND_ACTIVE | FINAL → AUDIENCE_ELIMINATION_VOTE */
export function openAudienceEliminationVote(
  runId: string,
  voteSeconds = DEFAULT_VOTE_SECONDS,
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  if (run.phase !== "ROUND_ACTIVE" && run.phase !== "FINAL") return run;

  openEliminationVoteWindow({
    runId,
    roomId: run.roomId,
    durationSeconds: voteSeconds,
    eligibleCompetitorIds: [...run.aliveIds],
  });

  run.phase = "AUDIENCE_ELIMINATION_VOTE";
  run.performanceClockEndsAt = 0;
  run.voteWindowEndsAt = Date.now() + voteSeconds * 1000;
  run.mainStageFocus = true;
  run.survivorsResting = false;
  run.updatedAt = Date.now();
  return run;
}

/**
 * AUDIENCE_ELIMINATION_VOTE → ELIMINATION_RESULT.
 * Uses real audience (and optional judge) tallies — never invents a loser if no votes.
 */
export function resolveEliminationResult(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;

  closeEliminationVoteWindow(runId);
  const result = resolveEliminatedCompetitor(runId);

  run.phase = "ELIMINATION_RESULT";
  run.voteWindowEndsAt = 0;

  if (result.eliminatedId && run.aliveIds.includes(result.eliminatedId)) {
    run.lastEliminatedIds = [result.eliminatedId];
    eliminateToSpectatorWithSideBattle(run.roomId, result.eliminatedId);
    // Queue for side battle — does NOT start until SIDE_BATTLE_WINDOW.
    enqueueSideBattleEligible(run.roomId, run.runId, result.eliminatedId);
    run.aliveIds = run.aliveIds.filter((id) => id !== result.eliminatedId);
  } else {
    // Honest empty: no votes → no elimination this cycle.
    run.lastEliminatedIds = [];
  }

  run.updatedAt = Date.now();
  return run;
}

/**
 * ELIMINATION_RESULT → SURVIVOR_REST + SIDE_BATTLE_WINDOW (same segment).
 * Survivors rest; eliminated compete visibly in the side window.
 */
export function openSurvivorRestAndSideBattles(
  runId: string,
  windowSeconds = DEFAULT_SIDE_WINDOW_SECONDS,
): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;

  const ends = Date.now() + windowSeconds * 1000;
  run.survivorsResting = true;
  run.mainStageFocus = false; // rest — side window is the active segment
  run.sideStageVisible = true;
  run.restWindowEndsAt = ends;
  run.sideWindowEndsAt = ends;
  run.phase = "SIDE_BATTLE_WINDOW";

  if (run.lastEliminatedIds.length > 0) {
    openSideBattleWindow({
      roomId: run.roomId,
      runId: run.runId,
      durationSeconds: windowSeconds,
    });
  }

  run.updatedAt = Date.now();
  return run;
}

/** Alias phase label for HUD — same segment as SIDE_BATTLE_WINDOW. */
export function enterSurvivorRest(runId: string): GauntletRunState | null {
  const run = openSurvivorRestAndSideBattles(runId);
  if (!run) return null;
  // Keep phase SIDE_BATTLE_WINDOW as canonical; survivorsResting flag marks rest.
  return run;
}

/** SIDE_BATTLE_WINDOW → FIELD_CONTRACT (or CHAMPION). */
export function contractField(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;

  closeSideBattleWindow(runId);
  run.survivorsResting = false;
  run.mainStageFocus = true;
  run.restWindowEndsAt = 0;
  run.sideWindowEndsAt = 0;

  if (run.aliveIds.length <= 1) {
    run.phase = "CHAMPION";
    run.roundSize = 1;
    run.championId = run.aliveIds[0] ?? null;
    run.updatedAt = Date.now();
    return run;
  }

  run.phase = "FIELD_CONTRACT";
  run.roundSize = contractTarget(run.aliveIds.length);
  run.updatedAt = Date.now();
  return run;
}

export function continueAfterContract(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  if (run.phase === "CHAMPION") return run;
  return beginRound(runId);
}

/** Legacy helpers kept for older callers. */
export function reduceRound(runId: string, eliminatedIds: string[]): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  for (const id of eliminatedIds) {
    if (!run.aliveIds.includes(id)) continue;
    eliminateToSpectatorWithSideBattle(run.roomId, id);
    enqueueSideBattleEligible(run.roomId, run.runId, id);
  }
  run.lastEliminatedIds = [...eliminatedIds];
  run.aliveIds = run.aliveIds.filter((id) => !eliminatedIds.includes(id));
  run.phase = "ELIMINATION_RESULT";
  run.updatedAt = Date.now();
  return openSurvivorRestAndSideBattles(runId);
}

export function advanceAfterSurvivorReveal(runId: string): GauntletRunState | null {
  return continueAfterContract(runId);
}

export function completeRunCeremony(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;
  closeSideBattleWindow(runId);
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
  if (run.phase === "AUDIENCE_ELIMINATION_VOTE") {
    run.voteWindowEndsAt = Math.max(Date.now(), run.voteWindowEndsAt) + extraSeconds * 1000;
  } else if (run.phase === "SIDE_BATTLE_WINDOW" || run.phase === "SURVIVOR_REST") {
    run.restWindowEndsAt = Math.max(Date.now(), run.restWindowEndsAt) + extraSeconds * 1000;
    run.sideWindowEndsAt = Math.max(Date.now(), run.sideWindowEndsAt) + extraSeconds * 1000;
  } else {
    run.performanceClockEndsAt =
      Math.max(Date.now(), run.performanceClockEndsAt) + extraSeconds * 1000;
  }
  run.updatedAt = Date.now();
  return run;
}

/**
 * Operator / Observatory advance through the locked sequence.
 * Does not fabricate elimination votes — if no votes, ELIMINATION_RESULT has empty cut.
 */
export function advanceGauntletPhase(runId: string): GauntletRunState | null {
  const run = runs.get(runId);
  if (!run) return null;

  switch (run.phase) {
    case "REGISTRATION":
      return beginRound(runId);
    case "ROUND_ACTIVE":
    case "FINAL":
      return openAudienceEliminationVote(runId);
    case "AUDIENCE_ELIMINATION_VOTE":
      return resolveEliminationResult(runId);
    case "ELIMINATION_RESULT":
      return openSurvivorRestAndSideBattles(runId);
    case "SURVIVOR_REST":
    case "SIDE_BATTLE_WINDOW":
      return contractField(runId);
    case "FIELD_CONTRACT":
      return continueAfterContract(runId);
    case "CHAMPION":
      return completeRunCeremony(runId);
    case "WHOS_ENTERING_NEXT":
      return markRunComplete(runId);
    case "RUN_COMPLETE":
    default:
      return run;
  }
}

export function listRunsForRoom(roomId: string): GauntletRunState[] {
  return [...runs.values()].filter((r) => r.roomId === roomId);
}

export const GAUNTLET_ROUND_PHASE_ORDER: GauntletRunPhase[] = [
  "REGISTRATION",
  "ROUND_ACTIVE",
  "AUDIENCE_ELIMINATION_VOTE",
  "ELIMINATION_RESULT",
  "SURVIVOR_REST",
  "SIDE_BATTLE_WINDOW",
  "FIELD_CONTRACT",
  "FINAL",
  "CHAMPION",
  "WHOS_ENTERING_NEXT",
];
