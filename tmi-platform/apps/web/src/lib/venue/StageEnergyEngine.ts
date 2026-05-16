/**
 * StageEnergyEngine
 * Tracks stage-level energy derived from performer activity, crowd reaction,
 * and production elements. Drives lighting, camera, and Julius responses.
 */

import { getVenueState } from "@/lib/venue/VenueStateEngine";
import { getCrowdSnapshot } from "@/lib/personality/CrowdReactionEngine";

export type StageEvent =
  | "drop"
  | "breakdown"
  | "buildup"
  | "battle-verse"
  | "crowd-sing-along"
  | "encore-call"
  | "silent-moment"
  | "ad-lib"
  | "wardrobe-moment"
  | "stage-dive";

export interface StageEnergyState {
  venueId: string;
  energyScore: number;        // 0-100
  peakScore: number;
  phase: "rising" | "peak" | "dropping" | "flat";
  lastEvent: StageEvent | null;
  lastEventAt: number | null;
  momentumVector: number;     // positive = accelerating, negative = decelerating
  performerCount: number;
  battleActive: boolean;
  updatedAt: number;
}

type StageEnergyListener = (state: StageEnergyState) => void;

const STAGE_EVENT_WEIGHTS: Record<StageEvent, number> = {
  "drop":             25,
  "breakdown":        -8,
  "buildup":          12,
  "battle-verse":     18,
  "crowd-sing-along": 20,
  "encore-call":      22,
  "silent-moment":    -15,
  "ad-lib":           8,
  "wardrobe-moment":  5,
  "stage-dive":       30,
};

const DECAY_PER_TICK = 1.5;
const TICK_MS = 2500;

const stageStates = new Map<string, StageEnergyState>();
const stageListeners = new Map<string, Set<StageEnergyListener>>();
const tickIntervals = new Map<string, ReturnType<typeof setInterval>>();

function derivePhase(score: number, prev: number): StageEnergyState["phase"] {
  if (score >= 75) return "peak";
  if (score > prev + 3) return "rising";
  if (score < prev - 3) return "dropping";
  return "flat";
}

function notify(venueId: string, state: StageEnergyState): void {
  stageListeners.get(venueId)?.forEach(l => l(state));
}

function tick(venueId: string): void {
  const state = stageStates.get(venueId);
  if (!state) return;

  // Pull crowd energy boost
  const crowd = getCrowdSnapshot(venueId);
  const crowdBoost = crowd ? (crowd.energyScore / 100) * 2 : 0;
  const prev = state.energyScore;
  const decayed = Math.max(0, prev - DECAY_PER_TICK + crowdBoost);

  const venue = getVenueState(venueId);
  const performerCount = venue?.activePerformers.length ?? state.performerCount;
  const battleActive = venue?.phase === "battle";

  const updated: StageEnergyState = {
    ...state,
    energyScore: decayed,
    peakScore: Math.max(state.peakScore, decayed),
    phase: derivePhase(decayed, prev),
    momentumVector: decayed - prev,
    performerCount,
    battleActive,
    updatedAt: Date.now(),
  };
  stageStates.set(venueId, updated);
  notify(venueId, updated);
}

export function initStageEnergy(venueId: string): StageEnergyState {
  const venue = getVenueState(venueId);
  const state: StageEnergyState = {
    venueId,
    energyScore: 0,
    peakScore: 0,
    phase: "flat",
    lastEvent: null,
    lastEventAt: null,
    momentumVector: 0,
    performerCount: venue?.activePerformers.length ?? 0,
    battleActive: false,
    updatedAt: Date.now(),
  };
  stageStates.set(venueId, state);

  if (!tickIntervals.has(venueId)) {
    const interval = setInterval(() => tick(venueId), TICK_MS);
    tickIntervals.set(venueId, interval);
  }

  return state;
}

export function emitStageEvent(venueId: string, event: StageEvent): StageEnergyState | null {
  const state = stageStates.get(venueId);
  if (!state) return null;

  const delta = STAGE_EVENT_WEIGHTS[event];
  const newScore = Math.max(0, Math.min(100, state.energyScore + delta));
  const prev = state.energyScore;

  const updated: StageEnergyState = {
    ...state,
    energyScore: newScore,
    peakScore: Math.max(state.peakScore, newScore),
    phase: derivePhase(newScore, prev),
    lastEvent: event,
    lastEventAt: Date.now(),
    momentumVector: newScore - prev,
    updatedAt: Date.now(),
  };
  stageStates.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function getStageEnergy(venueId: string): StageEnergyState | null {
  return stageStates.get(venueId) ?? null;
}

export function subscribeToStageEnergy(venueId: string, listener: StageEnergyListener): () => void {
  if (!stageListeners.has(venueId)) stageListeners.set(venueId, new Set());
  stageListeners.get(venueId)!.add(listener);
  const current = stageStates.get(venueId);
  if (current) listener(current);
  return () => stageListeners.get(venueId)?.delete(listener);
}

export function destroyStageEnergy(venueId: string): void {
  const interval = tickIntervals.get(venueId);
  if (interval) { clearInterval(interval); tickIntervals.delete(venueId); }
  stageStates.delete(venueId);
  stageListeners.delete(venueId);
}
