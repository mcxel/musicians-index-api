/**
 * PointFlightBus — fires when a user's real token/XP balance increases.
 * Client-only event bus (same pattern as PlaylistMonitorCast) — never
 * fabricates an amount. Emitters must pass the real delta they observed
 * from a backend response (e.g. TokenBalance's poll-diff), not a guess.
 */

export const POINTS_EARNED_EVENT = "tmi:points:earned";

export type PointsCurrency = "COIN" | "XP";

export interface PointsEarnedPayload {
  amount: number;
  currency: PointsCurrency;
  sourceLabel?: string;
  /** Screen origin for the flight animation — omit to use a default. */
  originRect?: { top: number; left: number; width: number; height: number };
  /** DOM id of the counter to fly toward. Defaults to the header wallet counter. */
  targetId?: string;
}

function dispatch(name: string, detail: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    /* ignore */
  }
}

export function emitPointsEarned(payload: PointsEarnedPayload): void {
  if (!payload.amount || payload.amount <= 0) return;
  dispatch(POINTS_EARNED_EVENT, payload);
}

export function subscribePointsEarned(
  handler: (payload: PointsEarnedPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<PointsEarnedPayload>).detail;
    if (detail?.amount > 0) handler(detail);
  };
  window.addEventListener(POINTS_EARNED_EVENT, listener);
  return () => window.removeEventListener(POINTS_EARNED_EVENT, listener);
}
