/**
 * PiPTransitionEngine
 * Manages Picture-in-Picture state and transitions for the live video wall.
 * Coordinates which feed is main vs pip, and animates between them.
 */

export type PiPPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type PiPTransitionState = "idle" | "entering" | "active" | "swapping" | "exiting";

export interface PiPWindow {
  feedId: string;
  position: PiPPosition;
  width: number;       // fraction of parent, 0-1
  height: number;
  opacity: number;
  zIndex: number;
}

export interface PiPState {
  sessionId: string;
  mainFeedId: string | null;
  pipWindows: PiPWindow[];
  transitionState: PiPTransitionState;
  transitionStartedAt: number | null;
  transitionDurationMs: number;
  maxPiPWindows: number;
}

const pipStates = new Map<string, PiPState>();
type PiPListener = (state: PiPState) => void;
const pipListeners = new Map<string, Set<PiPListener>>();

function notify(sessionId: string, state: PiPState): void {
  pipListeners.get(sessionId)?.forEach(l => l(state));
}

export function initPiP(sessionId: string, mainFeedId: string, maxPiPWindows = 3): PiPState {
  const state: PiPState = {
    sessionId, mainFeedId, pipWindows: [], transitionState: "idle",
    transitionStartedAt: null, transitionDurationMs: 400, maxPiPWindows,
  };
  pipStates.set(sessionId, state);
  return state;
}

export function openPiP(sessionId: string, feedId: string, position: PiPPosition = "bottom-right"): PiPState {
  const current = pipStates.get(sessionId);
  if (!current) return initPiP(sessionId, feedId);

  if (current.pipWindows.length >= current.maxPiPWindows) return current;
  if (current.pipWindows.find(w => w.feedId === feedId)) return current;

  const newWindow: PiPWindow = { feedId, position, width: 0.25, height: 0.25, opacity: 1, zIndex: 10 + current.pipWindows.length };
  const state: PiPState = {
    ...current,
    pipWindows: [...current.pipWindows, newWindow],
    transitionState: "entering",
    transitionStartedAt: Date.now(),
  };
  pipStates.set(sessionId, state);
  notify(sessionId, state);

  setTimeout(() => {
    const s = pipStates.get(sessionId);
    if (s?.transitionState === "entering") {
      const next = { ...s, transitionState: "active" as PiPTransitionState };
      pipStates.set(sessionId, next);
      notify(sessionId, next);
    }
  }, current.transitionDurationMs);

  return state;
}

export function closePiP(sessionId: string, feedId: string): PiPState {
  const current = pipStates.get(sessionId);
  if (!current) return initPiP(sessionId, "");

  const state: PiPState = {
    ...current,
    pipWindows: current.pipWindows.filter(w => w.feedId !== feedId),
    transitionState: current.pipWindows.length <= 1 ? "idle" : "active",
  };
  pipStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function swapMainWithPiP(sessionId: string, pipFeedId: string): PiPState {
  const current = pipStates.get(sessionId);
  if (!current || !current.mainFeedId) return current ?? initPiP(sessionId, "");

  const oldMain = current.mainFeedId;
  const pipWindow = current.pipWindows.find(w => w.feedId === pipFeedId);
  if (!pipWindow) return current;

  const newPipWindows = current.pipWindows.map(w =>
    w.feedId === pipFeedId ? { ...w, feedId: oldMain } : w
  );

  const state: PiPState = {
    ...current, mainFeedId: pipFeedId, pipWindows: newPipWindows,
    transitionState: "swapping", transitionStartedAt: Date.now(),
  };
  pipStates.set(sessionId, state);
  notify(sessionId, state);

  setTimeout(() => {
    const s = pipStates.get(sessionId);
    if (s?.transitionState === "swapping") {
      const next = { ...s, transitionState: "active" as PiPTransitionState };
      pipStates.set(sessionId, next);
      notify(sessionId, next);
    }
  }, current.transitionDurationMs);

  return state;
}

export function movePiP(sessionId: string, feedId: string, position: PiPPosition): PiPState {
  const current = pipStates.get(sessionId);
  if (!current) return initPiP(sessionId, "");

  const state = { ...current, pipWindows: current.pipWindows.map(w => w.feedId === feedId ? { ...w, position } : w) };
  pipStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function getPiPState(sessionId: string): PiPState | null {
  return pipStates.get(sessionId) ?? null;
}

export function subscribeToPiP(sessionId: string, listener: PiPListener): () => void {
  if (!pipListeners.has(sessionId)) pipListeners.set(sessionId, new Set());
  pipListeners.get(sessionId)!.add(listener);
  const current = pipStates.get(sessionId);
  if (current) listener(current);
  return () => pipListeners.get(sessionId)?.delete(listener);
}
