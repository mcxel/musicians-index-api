/**
 * LiveWindowDockingEngine
 * Manages the docking, resizing, and layout of live video windows within the wall.
 * Supports free-float, docked-grid, side-dock, and fullscreen modes.
 */

export type DockMode = "grid" | "side-dock" | "free-float" | "fullscreen" | "theater";
export type DockSlot = "primary" | "secondary" | "tertiary" | "sidebar-top" | "sidebar-bottom" | "overlay";

export interface DockedWindow {
  feedId: string;
  slot: DockSlot;
  mode: DockMode;
  x: number;         // 0-1 (fraction of container)
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  pinned: boolean;
  label: string | null;
}

export interface DockingState {
  sessionId: string;
  dockMode: DockMode;
  windows: DockedWindow[];
  focusedFeedId: string | null;
  layoutVersion: number;
}

const SLOT_DEFAULTS: Record<DockSlot, Pick<DockedWindow, "x" | "y" | "w" | "h">> = {
  primary:        { x: 0,    y: 0,    w: 0.7,  h: 1.0  },
  secondary:      { x: 0.7,  y: 0,    w: 0.3,  h: 0.5  },
  tertiary:       { x: 0.7,  y: 0.5,  w: 0.3,  h: 0.5  },
  "sidebar-top":  { x: 0.8,  y: 0,    w: 0.2,  h: 0.33 },
  "sidebar-bottom": { x: 0.8, y: 0.67, w: 0.2, h: 0.33 },
  overlay:        { x: 0.05, y: 0.05, w: 0.4,  h: 0.35 },
};

const dockingStates = new Map<string, DockingState>();
type DockListener = (state: DockingState) => void;
const dockListeners = new Map<string, Set<DockListener>>();

function notify(sessionId: string, state: DockingState): void {
  dockListeners.get(sessionId)?.forEach(l => l(state));
}

export function initDocking(sessionId: string, initialMode: DockMode = "grid"): DockingState {
  const state: DockingState = { sessionId, dockMode: initialMode, windows: [], focusedFeedId: null, layoutVersion: 0 };
  dockingStates.set(sessionId, state);
  return state;
}

export function dockFeed(sessionId: string, feedId: string, slot: DockSlot, label?: string): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  if (current.windows.find(w => w.feedId === feedId)) return current;

  const defaults = SLOT_DEFAULTS[slot];
  const window: DockedWindow = { feedId, slot, mode: current.dockMode, ...defaults, minimized: false, pinned: false, label: label ?? null };
  const state: DockingState = {
    ...current, windows: [...current.windows, window], layoutVersion: current.layoutVersion + 1,
  };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function undockFeed(sessionId: string, feedId: string): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  const state: DockingState = {
    ...current, windows: current.windows.filter(w => w.feedId !== feedId), layoutVersion: current.layoutVersion + 1,
  };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function setDockMode(sessionId: string, mode: DockMode): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  const state: DockingState = {
    ...current, dockMode: mode, layoutVersion: current.layoutVersion + 1,
    windows: current.windows.map(w => ({ ...w, mode })),
  };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function focusFeed(sessionId: string, feedId: string): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  const state: DockingState = { ...current, focusedFeedId: feedId };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function resizeFeed(sessionId: string, feedId: string, w: number, h: number): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  const state: DockingState = {
    ...current,
    windows: current.windows.map(win => win.feedId === feedId ? { ...win, w: Math.max(0.1, Math.min(1, w)), h: Math.max(0.1, Math.min(1, h)) } : win),
    layoutVersion: current.layoutVersion + 1,
  };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function toggleMinimize(sessionId: string, feedId: string): DockingState {
  const current = dockingStates.get(sessionId) ?? initDocking(sessionId);
  const state: DockingState = {
    ...current, windows: current.windows.map(w => w.feedId === feedId ? { ...w, minimized: !w.minimized } : w),
  };
  dockingStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function getDockingState(sessionId: string): DockingState | null {
  return dockingStates.get(sessionId) ?? null;
}

export function subscribeToDocking(sessionId: string, listener: DockListener): () => void {
  if (!dockListeners.has(sessionId)) dockListeners.set(sessionId, new Set());
  dockListeners.get(sessionId)!.add(listener);
  const current = dockingStates.get(sessionId);
  if (current) listener(current);
  return () => dockListeners.get(sessionId)?.delete(listener);
}
