/**
 * SeatPopulationEngine
 * Manages individual seat occupancy state for structured venue layouts.
 * Powers seating maps, VIP overlays, and social seat-linking features.
 */

export type SeatStatus = "empty" | "reserved" | "occupied" | "vip" | "battle-judge" | "held" | "blocked";
export type SeatSection = "floor" | "vip" | "balcony" | "box" | "standing" | "press-pit";

export interface Seat {
  seatId: string;
  venueId: string;
  section: SeatSection;
  row: string;
  number: number;
  status: SeatStatus;
  occupantId: string | null;
  occupantDisplayName: string | null;
  reservedAt: number | null;
  occupiedAt: number | null;
  isAisle: boolean;
  hasAccessibility: boolean;
}

export interface SeatMap {
  venueId: string;
  seats: Seat[];
  totalSeats: number;
  occupiedCount: number;
  reservedCount: number;
  vipCount: number;
  availableCount: number;
  lastUpdatedAt: number;
}

type SeatListener = (map: SeatMap) => void;

const seatMaps = new Map<string, SeatMap>();
const seatListeners = new Map<string, Set<SeatListener>>();

function notify(venueId: string, map: SeatMap): void {
  seatListeners.get(venueId)?.forEach(l => l(map));
}

function recalcStats(seats: Seat[]): Pick<SeatMap, "occupiedCount" | "reservedCount" | "vipCount" | "availableCount"> {
  let occupiedCount = 0, reservedCount = 0, vipCount = 0, availableCount = 0;
  for (const s of seats) {
    if (s.status === "occupied") occupiedCount++;
    else if (s.status === "reserved" || s.status === "held") reservedCount++;
    else if (s.status === "vip") vipCount++;
    else if (s.status === "empty") availableCount++;
  }
  return { occupiedCount, reservedCount, vipCount, availableCount };
}

export function initSeatMap(
  venueId: string,
  layout: Array<{ section: SeatSection; rows: number; seatsPerRow: number; hasAccessibility?: boolean }>
): SeatMap {
  const seats: Seat[] = [];

  for (const { section, rows, seatsPerRow, hasAccessibility } of layout) {
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A, B, C...
      for (let n = 1; n <= seatsPerRow; n++) {
        seats.push({
          seatId: `${venueId}_${section}_${rowLabel}${n}`,
          venueId,
          section,
          row: rowLabel,
          number: n,
          status: "empty",
          occupantId: null,
          occupantDisplayName: null,
          reservedAt: null,
          occupiedAt: null,
          isAisle: n === 1 || n === seatsPerRow,
          hasAccessibility: (hasAccessibility ?? false) && n <= 2 && r === 0,
        });
      }
    }
  }

  const stats = recalcStats(seats);
  const map: SeatMap = {
    venueId,
    seats,
    totalSeats: seats.length,
    lastUpdatedAt: Date.now(),
    ...stats,
  };
  seatMaps.set(venueId, map);
  return map;
}

export function occupySeat(
  venueId: string,
  seatId: string,
  occupantId: string,
  displayName: string,
  status: SeatStatus = "occupied"
): SeatMap | null {
  const map = seatMaps.get(venueId);
  if (!map) return null;

  const seats = map.seats.map(s =>
    s.seatId === seatId
      ? { ...s, status, occupantId, occupantDisplayName: displayName, occupiedAt: Date.now() }
      : s
  );

  const stats = recalcStats(seats);
  const updated: SeatMap = { ...map, seats, lastUpdatedAt: Date.now(), ...stats };
  seatMaps.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function vacateSeat(venueId: string, seatId: string): SeatMap | null {
  const map = seatMaps.get(venueId);
  if (!map) return null;

  const seats = map.seats.map(s =>
    s.seatId === seatId
      ? { ...s, status: "empty" as SeatStatus, occupantId: null, occupantDisplayName: null, occupiedAt: null, reservedAt: null }
      : s
  );

  const stats = recalcStats(seats);
  const updated: SeatMap = { ...map, seats, lastUpdatedAt: Date.now(), ...stats };
  seatMaps.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function reserveSeat(venueId: string, seatId: string, occupantId: string): SeatMap | null {
  const map = seatMaps.get(venueId);
  if (!map) return null;
  const target = map.seats.find(s => s.seatId === seatId);
  if (!target || target.status !== "empty") return null;

  const seats = map.seats.map(s =>
    s.seatId === seatId
      ? { ...s, status: "reserved" as SeatStatus, occupantId, reservedAt: Date.now() }
      : s
  );

  const stats = recalcStats(seats);
  const updated: SeatMap = { ...map, seats, lastUpdatedAt: Date.now(), ...stats };
  seatMaps.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function getSeatMap(venueId: string): SeatMap | null {
  return seatMaps.get(venueId) ?? null;
}

export function getSeat(venueId: string, seatId: string): Seat | null {
  return seatMaps.get(venueId)?.seats.find(s => s.seatId === seatId) ?? null;
}

export function getSeatsBySection(venueId: string, section: SeatSection): Seat[] {
  return seatMaps.get(venueId)?.seats.filter(s => s.section === section) ?? [];
}

export function subscribeToSeatMap(venueId: string, listener: SeatListener): () => void {
  if (!seatListeners.has(venueId)) seatListeners.set(venueId, new Set());
  seatListeners.get(venueId)!.add(listener);
  const current = seatMaps.get(venueId);
  if (current) listener(current);
  return () => seatListeners.get(venueId)?.delete(listener);
}
