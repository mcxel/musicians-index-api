/**
 * Seat Intelligence Engine
 * Full seat layout management with group booking, VIP upgrades, late arrivals, and locking.
 */

export type SeatStatus = 'OPEN' | 'CLAIMED' | 'RESERVED' | 'VIP' | 'LOCKED' | 'LATE_ARRIVAL';
export type SeatTier = 'GENERAL' | 'PREMIUM' | 'VIP' | 'STAGE_SIDE' | 'FRONT_ROW';

export interface Seat {
  id: string;
  position: { row: number; col: number };
  tier: SeatTier;
  status: SeatStatus;
  occupantId: string | null;
  reservedForId: string | null;
  groupId: string | null;
  lockedAt: number | null;
}

export interface SeatGroup {
  id: string;
  name: string;
  memberIds: string[];
  seatIds: string[];
}

/** Tier assignment based on row proximity to stage */
function tierForRow(row: number, totalRows: number): SeatTier {
  const pct = row / totalRows;
  if (pct <= 0.05) return 'FRONT_ROW';
  if (pct <= 0.15) return 'STAGE_SIDE';
  if (pct <= 0.35) return 'VIP';
  if (pct <= 0.6) return 'PREMIUM';
  return 'GENERAL';
}

export class SeatIntelligenceEngine {
  private seats: Map<string, Seat>;
  private groups: Map<string, SeatGroup>;
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.seats = new Map();
    this.groups = new Map();
    this.rows = rows;
    this.cols = cols;
    this.buildLayout(rows, cols);
  }

  buildLayout(rows: number, cols: number): void {
    this.seats.clear();
    this.rows = rows;
    this.cols = cols;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `seat-${r}-${c}`;
        const tier = tierForRow(r, rows);
        this.seats.set(id, {
          id,
          position: { row: r, col: c },
          tier,
          status: 'OPEN',
          occupantId: null,
          reservedForId: null,
          groupId: null,
          lockedAt: null,
        });
      }
    }
  }

  claimSeat(seatId: string, userId: string): boolean {
    const seat = this.seats.get(seatId);
    if (!seat) return false;
    if (seat.status !== 'OPEN' && seat.status !== 'RESERVED') return false;
    if (seat.status === 'RESERVED' && seat.reservedForId !== userId) return false;
    seat.status = 'CLAIMED';
    seat.occupantId = userId;
    seat.reservedForId = null;
    return true;
  }

  releaseSeat(seatId: string): void {
    const seat = this.seats.get(seatId);
    if (!seat) return;
    seat.status = 'OPEN';
    seat.occupantId = null;
    seat.reservedForId = null;
    seat.groupId = null;
    seat.lockedAt = null;
  }

  reserveGroupSeats(groupId: string, memberIds: string[], preferredTier?: SeatTier): SeatGroup | null {
    const availableSeats = this.getAvailableSeats(preferredTier);
    if (availableSeats.length < memberIds.length) return null;

    // Pick contiguous seats (same row where possible)
    const grouped = this.groupByRow(availableSeats);
    let chosen: Seat[] = [];

    for (const rowSeats of Object.values(grouped)) {
      if (rowSeats.length >= memberIds.length) {
        chosen = rowSeats.slice(0, memberIds.length);
        break;
      }
    }

    if (chosen.length < memberIds.length) {
      chosen = availableSeats.slice(0, memberIds.length);
    }

    const seatIds: string[] = [];
    for (let i = 0; i < memberIds.length; i++) {
      const seat = chosen[i];
      seat.status = 'RESERVED';
      seat.reservedForId = memberIds[i];
      seat.groupId = groupId;
      seatIds.push(seat.id);
    }

    const group: SeatGroup = { id: groupId, name: `Group ${groupId}`, memberIds: [...memberIds], seatIds };
    this.groups.set(groupId, group);
    return group;
  }

  inviteFriendToGroup(groupId: string, friendId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    // Find a nearby open seat
    const groupSeat = this.seats.get(group.seatIds[0]);
    if (!groupSeat) return false;

    const nearby = this.findNearby(groupSeat, 3);
    if (!nearby) return false;

    nearby.status = 'RESERVED';
    nearby.reservedForId = friendId;
    nearby.groupId = groupId;
    group.memberIds.push(friendId);
    group.seatIds.push(nearby.id);
    return true;
  }

  upgradeToVIP(seatId: string, userId: string): boolean {
    const seat = this.seats.get(seatId);
    if (!seat) return false;
    if (seat.occupantId !== userId) return false;
    seat.status = 'VIP';
    seat.tier = 'VIP';
    return true;
  }

  autoSeatLateArrival(userId: string): Seat | null {
    // Prefer GENERAL or PREMIUM seats in the back rows
    const available = this.getAvailableSeats();
    const backSeats = available.filter((s) => s.tier === 'GENERAL' || s.tier === 'PREMIUM');
    const target = backSeats[0] ?? available[0] ?? null;
    if (!target) return null;

    target.status = 'LATE_ARRIVAL';
    target.occupantId = userId;
    return { ...target };
  }

  lockAllSeatsBeforeShow(): void {
    const now = Date.now();
    for (const seat of this.seats.values()) {
      if (seat.status === 'OPEN') {
        seat.status = 'LOCKED';
        seat.lockedAt = now;
      }
    }
  }

  unlockSeats(): void {
    for (const seat of this.seats.values()) {
      if (seat.status === 'LOCKED') {
        seat.status = 'OPEN';
        seat.lockedAt = null;
      }
    }
  }

  getSeat(id: string): Seat | undefined {
    const seat = this.seats.get(id);
    return seat ? { ...seat } : undefined;
  }

  getAvailableSeats(tier?: SeatTier): Seat[] {
    const result: Seat[] = [];
    for (const seat of this.seats.values()) {
      if (seat.status !== 'OPEN') continue;
      if (tier && seat.tier !== tier) continue;
      result.push({ ...seat });
    }
    return result;
  }

  getSeatsForGroup(groupId: string): Seat[] {
    const group = this.groups.get(groupId);
    if (!group) return [];
    return group.seatIds
      .map((id) => this.seats.get(id))
      .filter((s): s is Seat => s !== undefined)
      .map((s) => ({ ...s }));
  }

  getOccupancyPercent(): number {
    const total = this.seats.size;
    if (total === 0) return 0;
    let occupied = 0;
    for (const seat of this.seats.values()) {
      if (seat.status === 'CLAIMED' || seat.status === 'VIP' || seat.status === 'LATE_ARRIVAL') {
        occupied++;
      }
    }
    return occupied / total;
  }

  private groupByRow(seats: Seat[]): Record<number, Seat[]> {
    const map: Record<number, Seat[]> = {};
    for (const seat of seats) {
      const row = seat.position.row;
      if (!map[row]) map[row] = [];
      map[row].push(seat);
    }
    return map;
  }

  private findNearby(from: Seat, maxDistance: number): Seat | null {
    for (const seat of this.seats.values()) {
      if (seat.status !== 'OPEN') continue;
      const dr = Math.abs(seat.position.row - from.position.row);
      const dc = Math.abs(seat.position.col - from.position.col);
      if (dr + dc <= maxDistance) return seat;
    }
    return null;
  }
}
