import {
  buildPhaseSchedule,
  PAGE_FLIP_TIMINGS,
  type PageFlipPhase,
  type PageTurnDirection,
} from "./MagazinePageTurnEngine";

// Canonical turn duration — longer than the raw engine's 680ms to feel cinematic
export const TURN_DURATION = 1100;

// Midpoint fires when the page is edge-on and content is invisible — perfect swap moment
export const MIDPOINT = Math.round(TURN_DURATION / 2);

type PageTurnCallbacks = {
  onPhaseChange?: (phase: PageFlipPhase) => void;
  /** Fires when the page is edge-on (invisible). Swap content here. */
  onMidpoint: () => void;
  /** Fires when the page has fully settled back to flat. */
  onComplete: () => void;
};

/**
 * Drives a single page turn using MagazinePageTurnEngine's 7-phase schedule,
 * scaled to TURN_DURATION. The "swap" phase maps to onMidpoint (the invisible
 * edge-on moment), and "idle" maps to onComplete.
 *
 * Returns a cancel function — call it on cleanup to clear all pending timers.
 */
export function runPageTurn(
  direction: PageTurnDirection = "forward",
  callbacks: PageTurnCallbacks
): () => void {
  const baseTotal = PAGE_FLIP_TIMINGS[direction].totalMs;
  const scale = TURN_DURATION / baseTotal;
  const schedule = buildPhaseSchedule(direction);
  const ids: ReturnType<typeof setTimeout>[] = [];

  for (const entry of schedule) {
    const delay = Math.round(entry.delayMs * scale);
    const id = setTimeout(() => {
      callbacks.onPhaseChange?.(entry.phase);
      if (entry.phase === "swap") callbacks.onMidpoint();
      if (entry.phase === "idle") callbacks.onComplete();
    }, delay);
    ids.push(id);
  }

  return () => ids.forEach(clearTimeout);
}
