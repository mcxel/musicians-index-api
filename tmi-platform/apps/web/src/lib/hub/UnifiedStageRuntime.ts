/**
 * UnifiedStageRuntime
 * Single authority for stage state across all rooms and hubs.
 * Every surface reads stage state from here — no room holds its own copy.
 */

import type { StageState } from "@/components/stage/StageCurtain";
import { worldStateEngine } from "@/lib/hub/WorldStateEngine";

export interface StageRecord {
  roomId: string;
  state: StageState;
  showTitle: string;
  performerId: string | null;
  performerName: string | null;
  startedAt: number | null;
  scheduledAt: number | null;
  heat: number;
  crowdCount: number;
  encoreActive: boolean;
  lastTransition: number;
}

export interface StageTransitionEvent {
  roomId: string;
  from: StageState;
  to: StageState;
  timestamp: number;
  triggeredBy: "system" | "performer" | "admin" | "auto";
}

type StageListener = (record: StageRecord) => void;

const stageMap = new Map<string, StageRecord>();
const stageListeners = new Map<string, Set<StageListener>>();
const transitionLog: StageTransitionEvent[] = [];
const MAX_LOG = 200;

function defaultRecord(roomId: string): StageRecord {
  return {
    roomId,
    state: "IDLE",
    showTitle: "",
    performerId: null,
    performerName: null,
    startedAt: null,
    scheduledAt: null,
    heat: 0,
    crowdCount: 0,
    encoreActive: false,
    lastTransition: Date.now(),
  };
}

export function registerStage(roomId: string, initial?: Partial<StageRecord>): StageRecord {
  const record = { ...defaultRecord(roomId), ...(initial ?? {}) };
  stageMap.set(roomId, record);
  return record;
}

export function transitionStage(
  roomId: string,
  toState: StageState,
  triggeredBy: StageTransitionEvent["triggeredBy"] = "system",
  patch?: Partial<StageRecord>
): StageRecord {
  const current = stageMap.get(roomId) ?? defaultRecord(roomId);
  const transition: StageTransitionEvent = {
    roomId,
    from: current.state,
    to: toState,
    timestamp: Date.now(),
    triggeredBy,
  };

  transitionLog.unshift(transition);
  if (transitionLog.length > MAX_LOG) transitionLog.pop();

  const updated: StageRecord = {
    ...current,
    ...(patch ?? {}),
    state: toState,
    lastTransition: Date.now(),
    startedAt: toState === "LIVE" ? (current.startedAt ?? Date.now()) : current.startedAt,
  };

  stageMap.set(roomId, updated);
  stageListeners.get(roomId)?.forEach(l => l(updated));

  // Sync to world state
  if (updated.performerId) {
    worldStateEngine.updatePerformer(updated.performerId, { stageState: toState });
  }

  return updated;
}

export function updateStageData(roomId: string, patch: Partial<Omit<StageRecord, "state" | "roomId">>): StageRecord {
  const current = stageMap.get(roomId) ?? defaultRecord(roomId);
  const updated = { ...current, ...patch };
  stageMap.set(roomId, updated);
  stageListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function getStageRecord(roomId: string): StageRecord {
  return stageMap.get(roomId) ?? defaultRecord(roomId);
}

export function getAllActiveStages(): StageRecord[] {
  return [...stageMap.values()].filter(s => s.state === "LIVE" || s.state === "CURTAIN_OPENING");
}

export function subscribeToStage(roomId: string, listener: StageListener): () => void {
  if (!stageListeners.has(roomId)) stageListeners.set(roomId, new Set());
  stageListeners.get(roomId)!.add(listener);
  const record = stageMap.get(roomId);
  if (record) listener(record);
  return () => stageListeners.get(roomId)?.delete(listener);
}

export function getStageTransitionLog(roomId?: string): StageTransitionEvent[] {
  return roomId ? transitionLog.filter(t => t.roomId === roomId) : transitionLog;
}

export function isLive(roomId: string): boolean {
  return stageMap.get(roomId)?.state === "LIVE";
}
