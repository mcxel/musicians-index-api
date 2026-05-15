/**
 * Seating Mesh Engine — Room/session/fan binding layer over the seat coordinate model.
 * Links each seat to a roomId, sessionId, and fan/avatar identity.
 * Supports claim, release, check-in, and return-loop (fan reclaims their seat on re-entry).
 */

import type { SeatTier } from './SeatIntelligenceEngine';

export type SeatMeshStatus = 'open' | 'claimed' | 'reserved' | 'vip';

export interface MeshSeat {
  seatId: string;
  row: number;
  col: number;
  tier: SeatTier;
  status: SeatMeshStatus;
  occupantFanId: string | null;
  occupantAvatarUrl: string | null;
  claimedAt: number | null;
}

export interface SeatingMeshState {
  roomId: string;
  sessionId: string;
  rows: number;
  cols: number;
  seats: Record<string, MeshSeat>;
  /** fanId → seatId — fast lookup for return-loop */
  fanSeatIndex: Record<string, string>;
}

function tierForRow(row: number, totalRows: number): SeatTier {
  const pct = row / totalRows;
  if (pct <= 0.05) return 'FRONT_ROW';
  if (pct <= 0.15) return 'STAGE_SIDE';
  if (pct <= 0.35) return 'VIP';
  if (pct <= 0.6) return 'PREMIUM';
  return 'GENERAL';
}

export function createSeatingMesh(
  roomId: string,
  sessionId: string,
  rows: number,
  cols: number,
): SeatingMeshState {
  const seats: Record<string, MeshSeat> = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seatId = `${roomId}:seat-${r}-${c}`;
      seats[seatId] = {
        seatId,
        row: r,
        col: c,
        tier: tierForRow(r, rows),
        status: 'open',
        occupantFanId: null,
        occupantAvatarUrl: null,
        claimedAt: null,
      };
    }
  }
  return { roomId, sessionId, rows, cols, seats, fanSeatIndex: {} };
}

/**
 * Claim a specific seat for a fan.
 * Returns updated state, or null if the seat is unavailable.
 * A fan may only hold one seat per room — any prior seat is auto-released.
 */
export function claimSeat(
  state: SeatingMeshState,
  fanId: string,
  seatId: string,
  avatarUrl: string | null = null,
  nowMs = Date.now(),
): SeatingMeshState | null {
  const seat = state.seats[seatId];
  if (!seat) return null;
  if (seat.status !== 'open') return null;

  // Release any existing seat this fan holds in this room
  const released = releaseFanSeat(state, fanId);

  const updatedSeat: MeshSeat = {
    ...released.seats[seatId]!,
    status: 'claimed',
    occupantFanId: fanId,
    occupantAvatarUrl: avatarUrl,
    claimedAt: nowMs,
  };

  return {
    ...released,
    seats: { ...released.seats, [seatId]: updatedSeat },
    fanSeatIndex: { ...released.fanSeatIndex, [fanId]: seatId },
  };
}

/** Release a fan's current seat. No-op if they have no seat. */
export function releaseFanSeat(
  state: SeatingMeshState,
  fanId: string,
): SeatingMeshState {
  const currentSeatId = state.fanSeatIndex[fanId];
  if (!currentSeatId) return state;

  const seat = state.seats[currentSeatId];
  if (!seat) return state;

  const cleared: MeshSeat = {
    ...seat,
    status: 'open',
    occupantFanId: null,
    occupantAvatarUrl: null,
    claimedAt: null,
  };

  const newIndex = { ...state.fanSeatIndex };
  delete newIndex[fanId];

  return {
    ...state,
    seats: { ...state.seats, [currentSeatId]: cleared },
    fanSeatIndex: newIndex,
  };
}

/**
 * Check-in: fan re-enters the room and reclaims their previously held seat.
 * Returns the seat they returned to, or null if no prior seat exists or it was taken.
 */
export function checkInFan(
  state: SeatingMeshState,
  fanId: string,
  avatarUrl: string | null = null,
  nowMs = Date.now(),
): { state: SeatingMeshState; seat: MeshSeat | null } {
  const priorSeatId = state.fanSeatIndex[fanId];
  if (!priorSeatId) return { state, seat: null };

  const seat = state.seats[priorSeatId];
  // Seat might have been reclaimed by someone else while fan was away
  if (!seat || seat.status !== 'open') return { state, seat: null };

  const next = claimSeat(state, fanId, priorSeatId, avatarUrl, nowMs);
  if (!next) return { state, seat: null };

  return { state: next, seat: next.seats[priorSeatId] ?? null };
}

/** Get the seat a fan currently holds. */
export function getFanSeat(state: SeatingMeshState, fanId: string): MeshSeat | null {
  const seatId = state.fanSeatIndex[fanId];
  if (!seatId) return null;
  return state.seats[seatId] ?? null;
}

/** All open seats ordered by row/col — for the seat picker UI. */
export function getOpenSeats(state: SeatingMeshState): MeshSeat[] {
  return Object.values(state.seats)
    .filter((s) => s.status === 'open')
    .sort((a, b) => a.row - b.row || a.col - b.col);
}

/** Flat array of all seats in row/col order — for rendering the grid. */
export function getSeatGrid(state: SeatingMeshState): MeshSeat[] {
  return Object.values(state.seats).sort((a, b) => a.row - b.row || a.col - b.col);
}

/** Occupancy fraction 0–1 */
export function getOccupancyRate(state: SeatingMeshState): number {
  const total = Object.keys(state.seats).length;
  if (total === 0) return 0;
  const claimed = Object.values(state.seats).filter((s) => s.status !== 'open').length;
  return claimed / total;
}

/**
 * Auto-assign: fan enters room and needs a seat picked for them.
 * Prefers front rows; falls back to any open seat.
 * Returns updated state + the assigned seat, or null if room is full.
 */
export function autoAssignSeat(
  state: SeatingMeshState,
  fanId: string,
  avatarUrl: string | null = null,
  nowMs = Date.now(),
): { state: SeatingMeshState; seat: MeshSeat } | null {
  // If fan already has a seat, return it (idempotent entry)
  const existing = getFanSeat(state, fanId);
  if (existing) return { state, seat: existing };

  const open = getOpenSeats(state); // already sorted front-to-back
  if (open.length === 0) return null;

  const target = open[0]!;
  const next = claimSeat(state, fanId, target.seatId, avatarUrl, nowMs);
  if (!next) return null;

  return { state: next, seat: next.seats[target.seatId]! };
}

export interface AvatarPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Convert a seat's grid coordinates to a 3D arena position.
 * Origin (0,0,0) is center-front (row 0, col 0).
 * x grows left→right across columns, z grows front→back across rows.
 * Column spacing: 1.5 units, Row spacing: 2 units, all seats at y=0.
 */
export function seatToAvatarPosition(seat: MeshSeat, totalCols: number): AvatarPosition {
  const COL_SPACING = 1.5;
  const ROW_SPACING = 2.0;
  const x = (seat.col - totalCols / 2) * COL_SPACING;
  const y = 0;
  const z = seat.row * ROW_SPACING;
  return { x, y, z };
}
