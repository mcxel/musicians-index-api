/**
 * CypherRuntimeEngine — in-memory cypher session state (Phase 4.3).
 * Pure functions; no UI. Experience modules configure via CypherRuntimeContext.
 *
 * Session loop (Marcel 2026-08-19):
 *   LIVE → (queue+stage empty) → ENDING → RECRUITING → (join) → LIVE
 * Same roomId forever — discovery tile stays; honest recruiting status, no fake fill.
 */

import {
  buildBeatQueue,
  getCurrentBeat,
  skipBeat,
  type BeatQueue,
} from "@/engines/performance/BeatQueueEngine";

export interface CypherQueueEntry {
  id: string;
  displayName: string;
  genre?: string;
  status: "waiting" | "active" | "done";
}

/** Room stays open; phase drives ending motion + LOBBIES honesty. */
export type CypherSessionPhase = "LIVE" | "ENDING" | "RECRUITING";

export type CypherEndKind =
  | "SESSION_WRAP"
  | "ROTATION_COMPLETE"
  | "GROUP_JAM_CLOSE"
  | "MEMORY_MOMENT"
  | "STATS_VOTE_END"
  | "NO_MORE_PARTICIPANTS"
  | "CHAMPION"; // CYPHER_KING only

export interface CypherRuntimeState {
  roomId: string;
  sessionGenre: string;
  queue: CypherQueueEntry[];
  activeEntryId: string | null;
  beatQueue: BeatQueue | null;
  micActive: boolean;
  micRequested: boolean;
  elapsedSeconds: number;
  /** Each performer's slot duration in seconds (countdown counts down from this). */
  roundDurationSeconds: number;
  isRoundRunning: boolean;
  /** LIVE → ENDING → RECRUITING → LIVE (same roomId). */
  sessionPhase: CypherSessionPhase;
  /** Monotonic session counter — increments on each restart after empty. */
  sessionNumber: number;
  /** Why ENDING fired — drives non-winner motion variants. */
  endKind: CypherEndKind | null;
  /** Honest discovery label while recruiting. */
  recruitingLabel: string;
}

export function createInitialCypherState(
  roomId: string,
  sessionGenre = "Hip-Hop",
  roundDurationSeconds = 90,
): CypherRuntimeState {
  return {
    roomId,
    sessionGenre,
    queue: [],
    activeEntryId: null,
    beatQueue: buildBeatQueue(sessionGenre, roomId),
    micActive: false,
    micRequested: false,
    elapsedSeconds: 0,
    roundDurationSeconds,
    isRoundRunning: false,
    sessionPhase: "RECRUITING",
    sessionNumber: 1,
    endKind: null,
    recruitingLabel: "Looking for performers",
  };
}

/** Honest empty: no waiting/active performers and nobody on stage. */
export function hasActiveCypherParticipants(state: CypherRuntimeState): boolean {
  if (state.activeEntryId) return true;
  return state.queue.some((e) => e.status === "waiting" || e.status === "active");
}

export function isCypherParticipationEmpty(state: CypherRuntimeState): boolean {
  return !hasActiveCypherParticipants(state);
}

export function requestMicSlot(state: CypherRuntimeState, displayName: string): CypherRuntimeState {
  if (state.queue.some((e) => e.displayName === displayName && e.status !== "done")) {
    return state;
  }
  const entry: CypherQueueEntry = {
    id: `slot-${Date.now()}`,
    displayName,
    status: "waiting",
  };
  const nextQueue = [...state.queue.filter((e) => e.status !== "done"), entry];
  // Joining from RECRUITING starts the next session without a new room record
  if (state.sessionPhase === "RECRUITING" || state.sessionPhase === "ENDING") {
    return {
      ...state,
      queue: nextQueue,
      micRequested: true,
      sessionPhase: "LIVE",
      endKind: null,
      isRoundRunning: false,
      activeEntryId: null,
    };
  }
  return { ...state, queue: nextQueue, micRequested: true, sessionPhase: "LIVE" };
}

export function activateNextInQueue(state: CypherRuntimeState): CypherRuntimeState {
  if (state.sessionPhase === "ENDING") return state;
  const next = state.queue.find((e) => e.status === "waiting");
  if (!next) return state;
  return {
    ...state,
    sessionPhase: "LIVE",
    endKind: null,
    activeEntryId: next.id,
    queue: state.queue.map((e) => (e.id === next.id ? { ...e, status: "active" } : e)),
    isRoundRunning: true,
    elapsedSeconds: 0,
  };
}

export function completeActivePerformer(state: CypherRuntimeState): CypherRuntimeState {
  if (!state.activeEntryId) return state;
  const after: CypherRuntimeState = {
    ...state,
    activeEntryId: null,
    isRoundRunning: false,
    queue: state.queue.map((e) =>
      e.id === state.activeEntryId ? { ...e, status: "done" as const } : e,
    ),
  };
  // Auto-advance to next waiting performer when available
  const waiting = after.queue.find((e) => e.status === "waiting");
  if (waiting) {
    return activateNextInQueue(after);
  }
  // No more participants → session end (caller plays ending motion, then restartRecruiting)
  if (isCypherParticipationEmpty(after) && after.sessionPhase === "LIVE") {
    return beginCypherSessionEnd(after, "NO_MORE_PARTICIPANTS");
  }
  return after;
}

/**
 * Enter ENDING phase with a non-champion end kind (unless caller passes CHAMPION for Cypher King).
 */
export function beginCypherSessionEnd(
  state: CypherRuntimeState,
  endKind: CypherEndKind = "SESSION_WRAP",
): CypherRuntimeState {
  if (state.sessionPhase === "ENDING") return state;
  return {
    ...state,
    sessionPhase: "ENDING",
    endKind,
    isRoundRunning: false,
    activeEntryId: null,
    micActive: false,
  };
}

/**
 * After ending motion: RESET (clear match) then SHUFFLE (reseed beat/queue presentation)
 * then RECRUITING. Same roomId — discovery tile stays.
 * Do not shuffle while a performer is still on stage.
 */
export function restartCypherRecruiting(state: CypherRuntimeState): CypherRuntimeState {
  // RESET first — never shuffle live match state
  const reset: CypherRuntimeState = {
    ...state,
    sessionPhase: "ENDING",
    endKind: null,
    queue: [],
    activeEntryId: null,
    isRoundRunning: false,
    elapsedSeconds: 0,
    micActive: false,
    micRequested: false,
  };
  // SHUFFLE — reseed beat presentation pool only after reset
  const shuffledBeats = buildBeatQueue(state.sessionGenre, `${state.roomId}-s${state.sessionNumber + 1}`);
  // RECRUITING
  return {
    ...reset,
    sessionPhase: "RECRUITING",
    sessionNumber: state.sessionNumber + 1,
    beatQueue: shuffledBeats,
    recruitingLabel: "Looking for performers",
  };
}

/** Discovery / mosaic honesty — never claim LIVE crowd when recruiting empty. */
export function getCypherDiscoveryStatus(state: CypherRuntimeState): {
  liveLabel: string;
  isLiveCrowd: boolean;
  recruiting: boolean;
} {
  if (state.sessionPhase === "RECRUITING") {
    return {
      liveLabel: state.recruitingLabel,
      isLiveCrowd: false,
      recruiting: true,
    };
  }
  if (state.sessionPhase === "ENDING") {
    return {
      liveLabel: "Session wrapping",
      isLiveCrowd: false,
      recruiting: false,
    };
  }
  return {
    liveLabel: hasActiveCypherParticipants(state) ? "LIVE" : "Looking for performers",
    isLiveCrowd: hasActiveCypherParticipants(state),
    recruiting: !hasActiveCypherParticipants(state),
  };
}

export function toggleMic(state: CypherRuntimeState): CypherRuntimeState {
  return { ...state, micActive: !state.micActive };
}

export function tickElapsed(state: CypherRuntimeState): CypherRuntimeState {
  if (!state.isRoundRunning) return state;
  return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
}

export function skipCurrentBeat(state: CypherRuntimeState): CypherRuntimeState {
  if (!state.beatQueue) return state;
  return { ...state, beatQueue: skipBeat(state.beatQueue) };
}

export function getActiveBeat(state: CypherRuntimeState) {
  if (!state.beatQueue) return null;
  return getCurrentBeat(state.beatQueue);
}

export function getActivePerformer(state: CypherRuntimeState): CypherQueueEntry | null {
  if (!state.activeEntryId) return null;
  return state.queue.find((e) => e.id === state.activeEntryId) ?? null;
}
