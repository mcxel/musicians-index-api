/**
 * CypherRuntimeEngine — in-memory cypher session state (Phase 4.3).
 * Pure functions; no UI. Experience modules configure via CypherRuntimeContext.
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

export interface CypherRuntimeState {
  roomId: string;
  sessionGenre: string;
  queue: CypherQueueEntry[];
  activeEntryId: string | null;
  beatQueue: BeatQueue | null;
  micActive: boolean;
  micRequested: boolean;
  elapsedSeconds: number;
  isRoundRunning: boolean;
}

export function createInitialCypherState(roomId: string, sessionGenre = "Hip-Hop"): CypherRuntimeState {
  return {
    roomId,
    sessionGenre,
    queue: [],
    activeEntryId: null,
    beatQueue: buildBeatQueue(sessionGenre, roomId),
    micActive: false,
    micRequested: false,
    elapsedSeconds: 0,
    isRoundRunning: false,
  };
}

export function requestMicSlot(state: CypherRuntimeState, displayName: string): CypherRuntimeState {
  if (state.queue.some((e) => e.displayName === displayName)) return state;
  const entry: CypherQueueEntry = {
    id: `slot-${Date.now()}`,
    displayName,
    status: "waiting",
  };
  return { ...state, queue: [...state.queue, entry], micRequested: true };
}

export function activateNextInQueue(state: CypherRuntimeState): CypherRuntimeState {
  const next = state.queue.find((e) => e.status === "waiting");
  if (!next) return state;
  return {
    ...state,
    activeEntryId: next.id,
    queue: state.queue.map((e) =>
      e.id === next.id ? { ...e, status: "active" } : e
    ),
    isRoundRunning: true,
    elapsedSeconds: 0,
  };
}

export function completeActivePerformer(state: CypherRuntimeState): CypherRuntimeState {
  if (!state.activeEntryId) return state;
  return {
    ...state,
    activeEntryId: null,
    isRoundRunning: false,
    queue: state.queue.map((e) =>
      e.id === state.activeEntryId ? { ...e, status: "done" } : e
    ),
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
