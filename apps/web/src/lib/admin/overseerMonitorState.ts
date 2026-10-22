/**
 * Pure monitor assignment state for Overseer Monitor Wall (A/B/C/D).
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Laws:
 * 1. Monitors start clean: NO SOURCE ASSIGNED when unassigned.
 * 2. Every monitor can display any authorized mode: LIVE_NETWORK, SUMMIT, VIDEO_CALL, SCREEN_SHARE, MEDIA.
 * 3. A/B/C/D are completely independent.
 * 4. DETACH moves the presentation surface; ATTACH returns it without restarting the session.
 */

export type OverseerMonitorId = "A" | "B" | "C" | "D";

export const OVERSEER_MONITOR_IDS: OverseerMonitorId[] = ["A", "B", "C", "D"];

export type OverseerMonitorMode =
  | "LIVE_NETWORK"
  | "SUMMIT"
  | "VIDEO_CALL"
  | "SCREEN_SHARE"
  | "MEDIA";

export type OverseerMonitorSlot = {
  sourceId: string | null;
  pinned: boolean;
  mode?: OverseerMonitorMode;
  category?: string;
  roomId?: string | null;
  roomTitle?: string;
  history?: string[];
  historyIndex?: number;
  detached?: boolean;
  muted?: boolean;
  volume?: number;
};

export type OverseerMonitorState = Record<OverseerMonitorId, OverseerMonitorSlot>;

export function createEmptyMonitorState(): OverseerMonitorState {
  return {
    A: { sourceId: null, pinned: false, mode: "LIVE_NETWORK", category: "monday-stage", roomId: null, detached: false, muted: false, volume: 1 },
    B: { sourceId: null, pinned: false, mode: "LIVE_NETWORK", category: "battle", roomId: null, detached: false, muted: true, volume: 1 },
    C: { sourceId: null, pinned: false, mode: "LIVE_NETWORK", category: "go-live", roomId: null, detached: false, muted: true, volume: 1 },
    D: { sourceId: null, pinned: false, mode: "LIVE_NETWORK", category: "fan-lobby", roomId: null, detached: false, muted: true, volume: 1 },
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

export function assignMonitorChannel(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
  params: {
    sourceId: string | null;
    mode?: OverseerMonitorMode;
    category?: string;
    roomId?: string | null;
    roomTitle?: string;
  },
): OverseerMonitorState {
  const currentSlot = state[monitorId];
  const newHistory = currentSlot.history ? [...currentSlot.history] : [];
  if (params.roomId && !newHistory.includes(params.roomId)) {
    newHistory.push(params.roomId);
  }

  return {
    ...state,
    [monitorId]: {
      ...currentSlot,
      sourceId: params.sourceId,
      mode: params.mode ?? currentSlot.mode ?? "LIVE_NETWORK",
      category: params.category ?? currentSlot.category,
      roomId: params.roomId ?? null,
      roomTitle: params.roomTitle ?? (params.roomId ? `Room ${params.roomId}` : undefined),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    },
  };
}

export function cycleMonitorChannel(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
  direction: "next" | "prev",
  availableRooms: Array<{ roomId: string; title?: string; category?: string }>,
): OverseerMonitorState {
  const currentSlot = state[monitorId];
  if (!availableRooms || availableRooms.length === 0) return state;

  // Filter to current category if specified
  const pool = currentSlot.category
    ? availableRooms.filter(
        (r) => !r.category || r.category.toLowerCase() === currentSlot.category?.toLowerCase(),
      )
    : availableRooms;

  const effectivePool = pool.length > 0 ? pool : availableRooms;
  const currentIndex = effectivePool.findIndex((r) => r.roomId === currentSlot.roomId);

  let nextIndex = 0;
  if (direction === "next") {
    nextIndex = currentIndex >= 0 ? (currentIndex + 1) % effectivePool.length : 0;
  } else {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : effectivePool.length - 1;
  }

  const selectedRoom = effectivePool[nextIndex];
  if (!selectedRoom) return state;

  return assignMonitorChannel(state, monitorId, {
    sourceId: `live:${selectedRoom.roomId}`,
    mode: "LIVE_NETWORK",
    category: currentSlot.category,
    roomId: selectedRoom.roomId,
    roomTitle: selectedRoom.title ?? `Room ${selectedRoom.roomId}`,
  });
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

export function toggleMonitorDetach(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
): OverseerMonitorState {
  const current = state[monitorId];
  return {
    ...state,
    [monitorId]: { ...current, detached: !current.detached },
  };
}

export function clearMonitor(
  state: OverseerMonitorState,
  monitorId: OverseerMonitorId,
): OverseerMonitorState {
  return {
    ...state,
    [monitorId]: {
      ...state[monitorId],
      sourceId: null,
      roomId: null,
      roomTitle: undefined,
      detached: false,
    },
  };
}

export function swapMonitorSources(
  state: OverseerMonitorState,
  first: OverseerMonitorId,
  second: OverseerMonitorId,
): OverseerMonitorState {
  const a = state[first];
  const b = state[second];
  return {
    ...state,
    [first]: { ...a, sourceId: b.sourceId, roomId: b.roomId, roomTitle: b.roomTitle, mode: b.mode, category: b.category },
    [second]: { ...b, sourceId: a.sourceId, roomId: a.roomId, roomTitle: a.roomTitle, mode: a.mode, category: a.category },
  };
}

/** Returns false if source is manual-only and assignment was not explicit */
export function canAutoAssignSource(sourceId: string, manualOnlyIds: Set<string>): boolean {
  return !manualOnlyIds.has(sourceId);
}

export function monitorHasSource(state: OverseerMonitorState, monitorId: OverseerMonitorId): boolean {
  return Boolean(state[monitorId].sourceId);
}
