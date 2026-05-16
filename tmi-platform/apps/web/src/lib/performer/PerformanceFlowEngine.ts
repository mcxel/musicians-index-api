/**
 * PerformanceFlowEngine
 * Tracks and controls the arc of the live performance.
 * Manages setlist position, segment transitions, timed moments, and energy arc.
 */

export type FlowPhase =
  | "pre_show"
  | "intro_cinematic"
  | "opening_set"
  | "mid_set"
  | "climax"
  | "cool_down"
  | "encore_tease"
  | "encore"
  | "outro"
  | "complete";

export interface SetlistItem {
  id: string;
  title: string;
  estimatedDurationMs: number;
  energyTarget: number;   // 0-100
  notes: string | null;
}

export interface FlowMoment {
  id: string;
  phase: FlowPhase;
  title: string;
  triggeredAt: number;
  durationMs: number | null;
}

export interface PerformanceFlowState {
  roomId: string;
  performerId: string;
  phase: FlowPhase;
  setlist: SetlistItem[];
  currentSetlistIndex: number;
  currentEnergyLevel: number;    // 0-100
  performanceDurationMs: number;
  startedAt: number | null;
  moments: FlowMoment[];         // log of phase transitions
  crowdEngagementScore: number;  // 0-100
  pacing: "slow" | "steady" | "fast" | "frantic";
}

const flowStates = new Map<string, PerformanceFlowState>();
type FlowListener = (state: PerformanceFlowState) => void;
const flowListeners = new Map<string, Set<FlowListener>>();

const PHASE_ENERGY: Record<FlowPhase, number> = {
  pre_show: 10, intro_cinematic: 40, opening_set: 65, mid_set: 75,
  climax: 100, cool_down: 50, encore_tease: 60, encore: 90, outro: 35, complete: 0,
};

function computePacing(duration: number, setlistCount: number): "slow" | "steady" | "fast" | "frantic" {
  const avgSec = setlistCount > 0 ? duration / setlistCount / 1000 : 300;
  if (avgSec > 240) return "slow";
  if (avgSec > 150) return "steady";
  if (avgSec > 90) return "fast";
  return "frantic";
}

function notify(roomId: string, state: PerformanceFlowState): void {
  flowListeners.get(roomId)?.forEach(l => l(state));
}

export function initPerformanceFlow(roomId: string, performerId: string, setlist: SetlistItem[]): PerformanceFlowState {
  const state: PerformanceFlowState = {
    roomId, performerId, phase: "pre_show", setlist, currentSetlistIndex: 0,
    currentEnergyLevel: PHASE_ENERGY["pre_show"], performanceDurationMs: 0,
    startedAt: null, moments: [], crowdEngagementScore: 50, pacing: "steady",
  };
  flowStates.set(roomId, state);
  return state;
}

export function transitionPhase(roomId: string, phase: FlowPhase): PerformanceFlowState {
  const current = flowStates.get(roomId);
  if (!current) return initPerformanceFlow(roomId, "", []);

  const moment: FlowMoment = {
    id: `moment_${Date.now()}`,
    phase,
    title: phase.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    triggeredAt: Date.now(),
    durationMs: null,
  };

  const now = Date.now();
  const performanceDurationMs = current.startedAt ? now - current.startedAt : current.performanceDurationMs;
  const startedAt = current.startedAt ?? (phase === "intro_cinematic" ? now : null);

  const updated: PerformanceFlowState = {
    ...current, phase, currentEnergyLevel: PHASE_ENERGY[phase],
    performanceDurationMs, startedAt,
    moments: [...current.moments, moment].slice(-50),
    pacing: computePacing(performanceDurationMs, current.setlist.length),
  };
  flowStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function advanceSetlist(roomId: string): PerformanceFlowState {
  const current = flowStates.get(roomId);
  if (!current) return initPerformanceFlow(roomId, "", []);
  const next = Math.min(current.currentSetlistIndex + 1, current.setlist.length - 1);
  const updated = { ...current, currentSetlistIndex: next };
  flowStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function updateCrowdEngagement(roomId: string, score: number): PerformanceFlowState {
  const current = flowStates.get(roomId);
  if (!current) return initPerformanceFlow(roomId, "", []);
  const updated = { ...current, crowdEngagementScore: Math.max(0, Math.min(100, score)) };
  flowStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function nudgeEnergy(roomId: string, delta: number): PerformanceFlowState {
  const current = flowStates.get(roomId);
  if (!current) return initPerformanceFlow(roomId, "", []);
  const updated = { ...current, currentEnergyLevel: Math.max(0, Math.min(100, current.currentEnergyLevel + delta)) };
  flowStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function getCurrentSetlistItem(roomId: string): SetlistItem | null {
  const state = flowStates.get(roomId);
  return state?.setlist[state.currentSetlistIndex] ?? null;
}

export function getPerformanceFlow(roomId: string): PerformanceFlowState | null {
  return flowStates.get(roomId) ?? null;
}

export function subscribeToPerformanceFlow(roomId: string, listener: FlowListener): () => void {
  if (!flowListeners.has(roomId)) flowListeners.set(roomId, new Set());
  flowListeners.get(roomId)!.add(listener);
  const current = flowStates.get(roomId);
  if (current) listener(current);
  return () => flowListeners.get(roomId)?.delete(listener);
}
