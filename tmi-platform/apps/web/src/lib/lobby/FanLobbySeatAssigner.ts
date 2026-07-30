/**
 * Thin seat-anchor assignment for Fan Avatar Lobby free-roam.
 * Assigns 2D floor chair nodes from FanLobbySkinRegistry — NOT a fan-facing
 * seat-grid picker, NOT VenueSeatRenderer / AvatarSeatUI.
 */

import type { SeatAnchor } from "./FanLobbySkinRegistry";

export type LobbyAvatarLocomotion = "STANDING" | "SEATED" | "WALKING";

/** Seats currently claimed by active presence (excluding self). */
export function occupiedSeatIds(
  participants: Array<{ seatId?: string | null; isSeated?: boolean }>,
): Set<string> {
  const set = new Set<string>();
  for (const p of participants) {
    if (p.isSeated && p.seatId) set.add(p.seatId);
  }
  return set;
}

/** First open seat in registry order (conversation circle fill). */
export function assignOpenSeat(
  anchors: SeatAnchor[],
  occupied: Set<string>,
): SeatAnchor | null {
  for (const a of anchors) {
    if (a.state === "reserved") continue;
    if (!occupied.has(a.id)) return a;
  }
  return null;
}

/** Nearest open seat to a floor point (tap-to-sit). */
export function nearestOpenSeat(
  anchors: SeatAnchor[],
  occupied: Set<string>,
  xPct: number,
  yPct: number,
): SeatAnchor | null {
  let best: SeatAnchor | null = null;
  let bestDist = Infinity;
  for (const a of anchors) {
    if (a.state === "reserved" || occupied.has(a.id)) continue;
    const dx = a.xPct - xPct;
    const dy = a.yPct - yPct;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}

/** Hit-test: seat under a floor tap (within radiusPct). */
export function seatAtPoint(
  anchors: SeatAnchor[],
  xPct: number,
  yPct: number,
  radiusPct = 7,
): SeatAnchor | null {
  let best: SeatAnchor | null = null;
  let bestDist = radiusPct * radiusPct;
  for (const a of anchors) {
    const dx = a.xPct - xPct;
    const dy = a.yPct - yPct;
    const d = dx * dx + dy * dy;
    if (d <= bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}
