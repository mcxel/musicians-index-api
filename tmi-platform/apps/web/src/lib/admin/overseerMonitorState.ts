/**
 * Pure monitor assignment state for Overseer Monitor Wall (A/B/C/D).
 */

export type OverseerMonitorId = "A" | "B" | "C" | "D";

export const OVERSEER_MONITOR_IDS: OverseerMonitorId[] = ["A", "B", "C", "D"];

export type OverseerMonitorSlot = {
  sourceId: string | null;
  pinned: boolean;
};

export type OverseerMonitorState = Record<OverseerMonitorId, OverseerMonitorSlot>;

export function createEmptyMonitorState(): OverseerMonitorState {
  return {
    A: { sourceId: null, pinned: false },
    B: { sourceId: null, pinned: false },
    C: { sourceId: null, pinned: false },
    D: { sourceId: null, pinned: false },
  };
}

export function assignMonitorSource(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
  sourceId: string | null,
): OverseerMonitorState {
  return {
    ...state,
    [monitorId]: { ...state[monitorId], sourceId },
  };
}

export function toggleMonitorPin(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
): OverseerMonitorState {
  return {
    ...state,
    [monitorId]: { ...state[monitorId], pinned: !state[monitorId].pinned },
  };
}

export function swapMonitorSources(
  state: OverseerMonitorState,
  first: OverseerMonitorId,
  second: OverseerMonitorId,
): OverseerMonitorState {
  const a = state[first].sourceId;
  const b = state[second].sourceId;
  return {
    ...state,
    [first]: { ...state[first], sourceId: b },
    [second]: { ...state[second], sourceId: a },
  };
}

/** Returns false if source is manual-only and assignment was not explicit */
export function canAutoAssignSource(sourceId: string, manualOnlyIds: Set<string>): boolean {
  return !manualOnlyIds.has(sourceId);
}

export function monitorHasSource(state: OverseerMonitorState, monitorId: OverseerMonitorId): boolean {
  return Boolean(state[monitorId].sourceId);
}
