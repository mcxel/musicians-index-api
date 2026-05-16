/**
 * EncoreTriggerEngine
 * Manages the encore decision, trigger, and performance arc.
 * Reads audience vote results and triggers the encore experience if deserved.
 */

import { getExitVerdicts, castVote as exitCastVote } from "@/lib/curtain/PerformanceExitSequence";
import { triggerEncore, openEncoreVote, voteEncore } from "@/lib/hub/LiveExperienceCoordinator";
import { performCurtainOpen } from "@/lib/curtain/CurtainPhysicsEngine";
import { worldStateEngine } from "@/lib/hub/WorldStateEngine";

export type EncoreStatus =
  | "not_available"
  | "vote_open"
  | "vote_closed"
  | "triggered"
  | "in_progress"
  | "declined"
  | "complete";

export interface EncoreState {
  roomId: string;
  status: EncoreStatus;
  voteYay: number;
  voteNay: number;
  votesRequired: number;
  voteWindowMs: number;
  voteStartedAt: number | null;
  encoreStartedAt: number | null;
  encoreDurationMs: number;
  spontaneous: boolean;    // triggered by crowd surge, not vote
}

const encoreStates = new Map<string, EncoreState>();
type EncoreListener = (state: EncoreState) => void;
const encoreListeners = new Map<string, Set<EncoreListener>>();

function defaultEncore(roomId: string): EncoreState {
  return {
    roomId, status: "not_available", voteYay: 0, voteNay: 0,
    votesRequired: 20, voteWindowMs: 45_000, voteStartedAt: null,
    encoreStartedAt: null, encoreDurationMs: 10 * 60_000, spontaneous: false,
  };
}

function update(roomId: string, patch: Partial<EncoreState>): EncoreState {
  const current = encoreStates.get(roomId) ?? defaultEncore(roomId);
  const updated = { ...current, ...patch };
  encoreStates.set(roomId, updated);
  encoreListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function openEncoreVoteWindow(roomId: string, config?: { votesRequired?: number; voteWindowMs?: number }): EncoreState {
  const state = update(roomId, {
    status: "vote_open",
    voteYay: 0,
    voteNay: 0,
    voteStartedAt: Date.now(),
    votesRequired: config?.votesRequired ?? 20,
    voteWindowMs: config?.voteWindowMs ?? 45_000,
  });

  openEncoreVote(roomId);

  // Auto-close after window
  setTimeout(() => {
    const current = encoreStates.get(roomId);
    if (current?.status === "vote_open") closeEncoreVote(roomId);
  }, state.voteWindowMs);

  return state;
}

export function castEncoreVote(roomId: string, vote: "yay" | "nay"): EncoreState {
  const current = encoreStates.get(roomId) ?? defaultEncore(roomId);
  if (current.status !== "vote_open") return current;

  voteEncore(roomId, vote);
  exitCastVote(roomId, vote);

  const patch = vote === "yay" ? { voteYay: current.voteYay + 1 } : { voteNay: current.voteNay + 1 };
  const updated = update(roomId, patch);

  // Auto-trigger if threshold met
  if (updated.voteYay >= updated.votesRequired) {
    return activateEncore(roomId, false);
  }

  return updated;
}

export function closeEncoreVote(roomId: string): EncoreState {
  const verdicts = getExitVerdicts(roomId);
  const current = encoreStates.get(roomId) ?? defaultEncore(roomId);
  const encoreWon = verdicts.encoreDeserved || current.voteYay > current.voteNay;

  if (encoreWon) return activateEncore(roomId, false);
  return update(roomId, { status: "declined" });
}

export function activateEncore(roomId: string, spontaneous: boolean): EncoreState {
  const state = update(roomId, { status: "triggered", encoreStartedAt: Date.now(), spontaneous });
  worldStateEngine.emit({ type: "encore_triggered", roomId, payload: { spontaneous } });
  triggerEncore(roomId);

  // Auto-open curtain for encore
  void performCurtainOpen(roomId);

  const encoreDuration = encoreStates.get(roomId)?.encoreDurationMs ?? 10 * 60_000;
  setTimeout(() => {
    update(roomId, { status: "complete" });
  }, encoreDuration);

  return { ...state, status: "in_progress" };
}

export function forceDeclineEncore(roomId: string): EncoreState {
  return update(roomId, { status: "declined" });
}

export function getEncoreState(roomId: string): EncoreState {
  return encoreStates.get(roomId) ?? defaultEncore(roomId);
}

export function subscribeToEncore(roomId: string, listener: EncoreListener): () => void {
  if (!encoreListeners.has(roomId)) encoreListeners.set(roomId, new Set());
  encoreListeners.get(roomId)!.add(listener);
  const current = encoreStates.get(roomId);
  if (current) listener(current);
  return () => encoreListeners.get(roomId)?.delete(listener);
}

export function getEncoreVoteProgress(roomId: string): number {
  const state = encoreStates.get(roomId) ?? defaultEncore(roomId);
  return state.votesRequired > 0 ? Math.min(1, state.voteYay / state.votesRequired) : 0;
}
