/**
 * EvolutionDirector
 * Orchestrates hub self-evolution — reads world signals and coordinates
 * theme, module, and seasonal changes in response to live conditions.
 */

import { adaptToEnergy, adaptToTimeOfDay } from "@/lib/evolution/AdaptiveThemeEngine";
import { worldStateEngine } from "@/lib/hub/WorldStateEngine";

export type EvolutionTrigger =
  | "crowd_surge"
  | "encore_triggered"
  | "battle_started"
  | "winner_declared"
  | "time_of_day"
  | "season_change"
  | "ranking_shift"
  | "manual";

export interface EvolutionEvent {
  id: string;
  trigger: EvolutionTrigger;
  hubId: string;
  appliedAt: number;
  summary: string;
}

export interface EvolutionDirectorState {
  hubId: string;
  active: boolean;
  eventLog: EvolutionEvent[];
  lastEvolvedAt: number | null;
  evolutionCount: number;
}

const MAX_LOG = 50;

const directorStates = new Map<string, EvolutionDirectorState>();
type DirectorListener = (state: EvolutionDirectorState) => void;
const directorListeners = new Map<string, Set<DirectorListener>>();

function logEvent(hubId: string, trigger: EvolutionTrigger, summary: string): void {
  const current = directorStates.get(hubId);
  if (!current) return;

  const event: EvolutionEvent = {
    id: `evo_${Date.now()}`,
    trigger, hubId, appliedAt: Date.now(), summary,
  };
  const updated: EvolutionDirectorState = {
    ...current,
    eventLog: [event, ...current.eventLog].slice(0, MAX_LOG),
    lastEvolvedAt: Date.now(),
    evolutionCount: current.evolutionCount + 1,
  };
  directorStates.set(hubId, updated);
  directorListeners.get(hubId)?.forEach(l => l(updated));
}

export function initEvolutionDirector(hubId: string): EvolutionDirectorState {
  const state: EvolutionDirectorState = {
    hubId, active: false, eventLog: [], lastEvolvedAt: null, evolutionCount: 0,
  };
  directorStates.set(hubId, state);
  return state;
}

export function activateEvolutionDirector(hubId: string): () => void {
  const current = directorStates.get(hubId) ?? initEvolutionDirector(hubId);
  directorStates.set(hubId, { ...current, active: true });

  // Subscribe to world state events and drive evolution
  const unsubWorld = worldStateEngine.onEvent((event) => {
    const state = directorStates.get(hubId);
    if (!state?.active) return;

    if (event.type === "crowd_surge") {
      adaptToEnergy(hubId, 90);
      logEvent(hubId, "crowd_surge", "Crowd surge detected — energy theme activated");
    } else if (event.type === "encore_triggered") {
      adaptToEnergy(hubId, 100);
      logEvent(hubId, "encore_triggered", "Encore triggered — cosmic theme activated");
    } else if (event.type === "battle_started") {
      adaptToEnergy(hubId, 75);
      logEvent(hubId, "battle_started", "Battle started — neon theme activated");
    } else if (event.type === "winner_declared") {
      adaptToEnergy(hubId, 60);
      logEvent(hubId, "winner_declared", "Winner declared — evolution settled");
    }
  });

  // Time-of-day adaptation every 30 minutes
  const timeInterval = setInterval(() => {
    const s = directorStates.get(hubId);
    if (!s?.active) return;
    adaptToTimeOfDay(hubId);
    logEvent(hubId, "time_of_day", "Time-of-day theme adaptation applied");
  }, 30 * 60 * 1000);

  return () => {
    unsubWorld();
    clearInterval(timeInterval);
    const s = directorStates.get(hubId);
    if (s) directorStates.set(hubId, { ...s, active: false });
  };
}

export function manualEvolve(hubId: string, summary: string): EvolutionDirectorState {
  logEvent(hubId, "manual", summary);
  return directorStates.get(hubId) ?? initEvolutionDirector(hubId);
}

export function getEvolutionDirector(hubId: string): EvolutionDirectorState | null {
  return directorStates.get(hubId) ?? null;
}

export function subscribeToEvolutionDirector(hubId: string, listener: DirectorListener): () => void {
  if (!directorListeners.has(hubId)) directorListeners.set(hubId, new Set());
  directorListeners.get(hubId)!.add(listener);
  const current = directorStates.get(hubId);
  if (current) listener(current);
  return () => directorListeners.get(hubId)?.delete(listener);
}
