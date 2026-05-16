/**
 * LiveExperienceCoordinator
 * Orchestrates the full performance lifecycle: anticipation → curtain → reveal → live → exit → encore.
 * Single engine that drives the emotional arc of every show.
 */

import type { StageState } from "@/components/stage/StageCurtain";
import { transitionStage, updateStageData } from "@/lib/hub/UnifiedStageRuntime";
import { worldStateEngine } from "@/lib/hub/WorldStateEngine";

export type ExperiencePhase =
  | "idle"
  | "lobby_open"        // crowd gathering, ambient audio
  | "anticipation"      // countdown, audience buildup
  | "curtain_rising"    // curtain opens, smoke/fog
  | "performer_reveal"  // spotlight on performer
  | "live_performance"  // full show
  | "climax"            // peak energy moment
  | "wind_down"         // performance tapering
  | "curtain_close"     // show ending
  | "post_show"         // applause, tip prompts, reactions
  | "encore_window"     // encore vote open
  | "encore_live"       // encore in progress
  | "finale"            // final bow
  | "lobby_return";     // back to lobby

export interface ExperienceState {
  roomId: string;
  phase: ExperiencePhase;
  performerId: string | null;
  performerName: string | null;
  showTitle: string;
  countdownMs: number;
  crowdEnergy: number;        // 0-100
  smokeActive: boolean;
  lightsUp: boolean;
  encoreVoteOpen: boolean;
  encoreVoteYay: number;
  encoreVoteNay: number;
  phaseStartedAt: number;
  totalDurationMs: number;
}

const STALE_ENERGY_FLOOR = 20;
const LIVE_ENERGY_CEILING = 100;

type ExperienceListener = (state: ExperienceState) => void;

const experiences = new Map<string, ExperienceState>();
const listeners = new Map<string, Set<ExperienceListener>>();

function defaultState(roomId: string): ExperienceState {
  return {
    roomId, phase: "idle", performerId: null, performerName: null,
    showTitle: "", countdownMs: 0, crowdEnergy: STALE_ENERGY_FLOOR,
    smokeActive: false, lightsUp: false, encoreVoteOpen: false,
    encoreVoteYay: 0, encoreVoteNay: 0, phaseStartedAt: Date.now(), totalDurationMs: 0,
  };
}

function notify(roomId: string): void {
  const state = experiences.get(roomId);
  if (!state) return;
  listeners.get(roomId)?.forEach(l => l(state));
}

function setPhase(roomId: string, phase: ExperiencePhase, patch?: Partial<ExperienceState>): ExperienceState {
  const current = experiences.get(roomId) ?? defaultState(roomId);
  const updated: ExperienceState = {
    ...current,
    ...(patch ?? {}),
    phase,
    phaseStartedAt: Date.now(),
  };
  experiences.set(roomId, updated);
  notify(roomId);
  return updated;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function initExperience(roomId: string, config: {
  performerId: string;
  performerName: string;
  showTitle: string;
  countdownMs?: number;
}): ExperienceState {
  const state = setPhase(roomId, "lobby_open", {
    performerId: config.performerId,
    performerName: config.performerName,
    showTitle: config.showTitle,
    countdownMs: config.countdownMs ?? 5 * 60_000,
    crowdEnergy: 30,
    smokeActive: false,
    lightsUp: false,
  });

  transitionStage(roomId, "CURTAIN_CLOSED", "system", {
    performerId: config.performerId,
    performerName: config.performerName,
    showTitle: config.showTitle,
    scheduledAt: Date.now() + (config.countdownMs ?? 0),
  });

  return state;
}

export function startAnticipation(roomId: string): ExperienceState {
  worldStateEngine.emit({ type: "hub_activated", roomId, payload: { phase: "anticipation" } });
  return setPhase(roomId, "anticipation", { crowdEnergy: 55, smokeActive: true });
}

export function openCurtain(roomId: string): ExperienceState {
  transitionStage(roomId, "CURTAIN_OPENING", "performer");
  return setPhase(roomId, "curtain_rising", { crowdEnergy: 70, smokeActive: true, lightsUp: true });
}

export function revealPerformer(roomId: string): ExperienceState {
  return setPhase(roomId, "performer_reveal", { crowdEnergy: 85, lightsUp: true });
}

export function goLive(roomId: string): ExperienceState {
  transitionStage(roomId, "LIVE", "performer");
  worldStateEngine.emit({ type: "performer_went_live", roomId, payload: { phase: "live" } });
  return setPhase(roomId, "live_performance", { crowdEnergy: LIVE_ENERGY_CEILING });
}

export function triggerClimax(roomId: string): ExperienceState {
  return setPhase(roomId, "climax", { crowdEnergy: 100 });
}

export function beginWindDown(roomId: string): ExperienceState {
  return setPhase(roomId, "wind_down", { crowdEnergy: 75 });
}

export function closeCurtain(roomId: string): ExperienceState {
  transitionStage(roomId, "CURTAIN_CLOSING", "system");
  return setPhase(roomId, "curtain_close", { crowdEnergy: 60, smokeActive: false });
}

export function enterPostShow(roomId: string): ExperienceState {
  transitionStage(roomId, "ENDED", "system");
  return setPhase(roomId, "post_show", { crowdEnergy: 50, lightsUp: false, encoreVoteOpen: true });
}

export function openEncoreVote(roomId: string): ExperienceState {
  return setPhase(roomId, "encore_window", { encoreVoteOpen: true, encoreVoteYay: 0, encoreVoteNay: 0 });
}

export function voteEncore(roomId: string, vote: "yay" | "nay"): ExperienceState {
  const current = experiences.get(roomId) ?? defaultState(roomId);
  const patch = vote === "yay"
    ? { encoreVoteYay: current.encoreVoteYay + 1 }
    : { encoreVoteNay: current.encoreVoteNay + 1 };
  const updated = { ...current, ...patch };
  experiences.set(roomId, updated);
  notify(roomId);
  return updated;
}

export function triggerEncore(roomId: string): ExperienceState {
  transitionStage(roomId, "LIVE", "system");
  worldStateEngine.emit({ type: "encore_triggered", roomId, payload: {} });
  return setPhase(roomId, "encore_live", { encoreVoteOpen: false, crowdEnergy: 95 });
}

export function endShow(roomId: string): ExperienceState {
  transitionStage(roomId, "ENDED", "system");
  return setPhase(roomId, "finale", { crowdEnergy: 40, smokeActive: false, lightsUp: false });
}

export function returnToLobby(roomId: string): ExperienceState {
  return setPhase(roomId, "lobby_return", { crowdEnergy: STALE_ENERGY_FLOOR });
}

export function getExperience(roomId: string): ExperienceState {
  return experiences.get(roomId) ?? defaultState(roomId);
}

export function subscribeToExperience(roomId: string, listener: ExperienceListener): () => void {
  if (!listeners.has(roomId)) listeners.set(roomId, new Set());
  listeners.get(roomId)!.add(listener);
  const current = experiences.get(roomId);
  if (current) listener(current);
  return () => listeners.get(roomId)?.delete(listener);
}

export function getEncoreResult(roomId: string): "encore" | "no_encore" | "pending" {
  const state = experiences.get(roomId);
  if (!state || state.phase !== "encore_window") return "pending";
  return state.encoreVoteYay > state.encoreVoteNay ? "encore" : "no_encore";
}
