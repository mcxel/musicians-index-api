/**
 * UniversalMotionRuntime
 * Central registry for all runtime motion states.
 * Every animated element — portrait, card, HUD, billboard, button — registers here.
 */

export type MotionTarget =
  | "portrait"
  | "card"
  | "hud-module"
  | "billboard"
  | "button"
  | "reaction-particle"
  | "venue-surface"
  | "stage-element"
  | "overlay"
  | "seat-indicator";

export type MotionState =
  | "idle"
  | "hover"
  | "active"
  | "breathing"
  | "energy-pulse"
  | "entrance"
  | "exit"
  | "shimmer"
  | "frozen"
  | "disabled";

export interface MotionEntry {
  elementId: string;
  ownerId: string;
  target: MotionTarget;
  state: MotionState;
  intensity: number;        // 0-1
  energyReactive: boolean;
  loopDurationMs: number;
  registeredAt: number;
  lastStateChangeAt: number;
}

export interface MotionRuntimeStats {
  totalRegistered: number;
  byState: Record<MotionState, number>;
  byTarget: Record<MotionTarget, number>;
  energyReactiveCount: number;
}

type MotionListener = (entry: MotionEntry) => void;

const motionRegistry = new Map<string, MotionEntry>();
const motionListeners = new Map<string, Set<MotionListener>>();
const globalListeners = new Set<MotionListener>();

function notify(elementId: string, entry: MotionEntry): void {
  motionListeners.get(elementId)?.forEach(l => l(entry));
  globalListeners.forEach(l => l(entry));
}

export function registerMotionElement(
  elementId: string,
  ownerId: string,
  target: MotionTarget,
  opts: {
    initialState?: MotionState;
    intensity?: number;
    energyReactive?: boolean;
    loopDurationMs?: number;
  } = {}
): MotionEntry {
  const entry: MotionEntry = {
    elementId,
    ownerId,
    target,
    state: opts.initialState ?? "idle",
    intensity: opts.intensity ?? 0.5,
    energyReactive: opts.energyReactive ?? false,
    loopDurationMs: opts.loopDurationMs ?? 3000,
    registeredAt: Date.now(),
    lastStateChangeAt: Date.now(),
  };
  motionRegistry.set(elementId, entry);
  notify(elementId, entry);
  return entry;
}

export function setMotionState(
  elementId: string,
  state: MotionState,
  intensity?: number
): MotionEntry | null {
  const entry = motionRegistry.get(elementId);
  if (!entry) return null;

  const updated: MotionEntry = {
    ...entry,
    state,
    intensity: intensity ?? entry.intensity,
    lastStateChangeAt: Date.now(),
  };
  motionRegistry.set(elementId, updated);
  notify(elementId, updated);
  return updated;
}

export function broadcastEnergyLevel(energyNormalized: number): void {
  const now = Date.now();
  for (const [id, entry] of motionRegistry) {
    if (!entry.energyReactive) continue;

    let newState: MotionState = "idle";
    if (energyNormalized > 0.85) newState = "energy-pulse";
    else if (energyNormalized > 0.55) newState = "breathing";
    else if (energyNormalized > 0.25) newState = "shimmer";

    if (newState !== entry.state) {
      const updated: MotionEntry = {
        ...entry,
        state: newState,
        intensity: energyNormalized,
        lastStateChangeAt: now,
      };
      motionRegistry.set(id, updated);
      notify(id, updated);
    }
  }
}

export function freezeAll(): void {
  const now = Date.now();
  for (const [id, entry] of motionRegistry) {
    if (entry.state === "disabled") continue;
    const frozen = { ...entry, state: "frozen" as MotionState, lastStateChangeAt: now };
    motionRegistry.set(id, frozen);
    notify(id, frozen);
  }
}

export function unfreezeAll(): void {
  const now = Date.now();
  for (const [id, entry] of motionRegistry) {
    if (entry.state !== "frozen") continue;
    const resumed = { ...entry, state: "idle" as MotionState, lastStateChangeAt: now };
    motionRegistry.set(id, resumed);
    notify(id, resumed);
  }
}

export function unregisterMotionElement(elementId: string): void {
  motionRegistry.delete(elementId);
  motionListeners.delete(elementId);
}

export function getMotionEntry(elementId: string): MotionEntry | null {
  return motionRegistry.get(elementId) ?? null;
}

export function getMotionByOwner(ownerId: string): MotionEntry[] {
  return [...motionRegistry.values()].filter(e => e.ownerId === ownerId);
}

export function subscribeToMotionElement(elementId: string, listener: MotionListener): () => void {
  if (!motionListeners.has(elementId)) motionListeners.set(elementId, new Set());
  motionListeners.get(elementId)!.add(listener);
  const current = motionRegistry.get(elementId);
  if (current) listener(current);
  return () => motionListeners.get(elementId)?.delete(listener);
}

export function subscribeToAllMotion(listener: MotionListener): () => void {
  globalListeners.add(listener);
  return () => globalListeners.delete(listener);
}

export function getMotionStats(): MotionRuntimeStats {
  const byState: Record<string, number> = {};
  const byTarget: Record<string, number> = {};
  let energyReactiveCount = 0;

  for (const e of motionRegistry.values()) {
    byState[e.state] = (byState[e.state] ?? 0) + 1;
    byTarget[e.target] = (byTarget[e.target] ?? 0) + 1;
    if (e.energyReactive) energyReactiveCount++;
  }

  return {
    totalRegistered: motionRegistry.size,
    byState: byState as Record<MotionState, number>,
    byTarget: byTarget as Record<MotionTarget, number>,
    energyReactiveCount,
  };
}
