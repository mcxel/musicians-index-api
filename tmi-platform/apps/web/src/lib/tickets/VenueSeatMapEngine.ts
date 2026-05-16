/**
 * VenueSeatMapEngine
 * Seat layout, hold, release, and real-time availability for venues.
 */

export type SeatStatus = "available" | "held" | "sold" | "reserved" | "blocked" | "aisle";
export type SeatTier = "general" | "vip" | "backstage" | "accessible" | "standing";

export interface Seat {
  id: string;           // "A-1", "B-12", etc.
  row: string;
  number: number;
  section: string;
  tier: SeatTier;
  status: SeatStatus;
  price: number;
  heldByUserId?: string;
  heldUntil?: number;
  soldToUserId?: string;
  isAccessible: boolean;
  x: number;            // 0–1 normalized layout position
  y: number;
}

export interface SeatSection {
  id: string;
  label: string;
  tier: SeatTier;
  color: string;
  seats: Seat[];
}

export interface VenueSeatMap {
  venueId: string;
  venueName: string;
  totalCapacity: number;
  sections: SeatSection[];
  stageX: number;
  stageY: number;
  stageWidth: number;
  stageHeight: number;
}

export interface SeatHoldResult {
  success: boolean;
  seatIds: string[];
  expiresAt: number;
  holdId: string;
  reason?: string;
}

export interface SeatMapStats {
  total: number;
  available: number;
  held: number;
  sold: number;
  blocked: number;
  percentSold: number;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateSeats(
  section: string,
  tier: SeatTier,
  rows: string[],
  seatsPerRow: number,
  basePrice: number,
  startX: number,
  startY: number,
  rowSpacing: number,
  seatSpacing: number,
): Seat[] {
  const seats: Seat[] = [];
  rows.forEach((row, ri) => {
    for (let n = 1; n <= seatsPerRow; n++) {
      seats.push({
        id: `${section}-${row}-${n}`,
        row,
        number: n,
        section,
        tier,
        status: "available",
        price: basePrice,
        isAccessible: (ri === rows.length - 1 && (n === 1 || n === seatsPerRow)),
        x: startX + (n - 1) * seatSpacing,
        y: startY + ri * rowSpacing,
      });
    }
  });
  return seats;
}

export class VenueSeatMapEngine {
  private static _instance: VenueSeatMapEngine | null = null;

  private _maps: Map<string, VenueSeatMap> = new Map();
  private _holds: Map<string, { userId: string; seatIds: string[]; expiresAt: number }> = new Map();
  private _listeners: Set<(venueId: string, seatId: string, status: SeatStatus) => void> = new Set();

  static getInstance(): VenueSeatMapEngine {
    if (!VenueSeatMapEngine._instance) {
      VenueSeatMapEngine._instance = new VenueSeatMapEngine();
    }
    return VenueSeatMapEngine._instance;
  }

  // ── Map generation ─────────────────────────────────────────────────────────

  generateDefaultMap(venueId: string, venueName: string): VenueSeatMap {
    const generalRows = ["A","B","C","D","E","F","G","H","I","J"];
    const vipRows = ["VIP-A","VIP-B","VIP-C"];

    const generalSeats = generateSeats("MAIN", "general", generalRows, 20, 25, 0.1, 0.3, 0.06, 0.04);
    const vipSeats = generateSeats("VIP", "vip", vipRows, 10, 85, 0.3, 0.12, 0.06, 0.04);
    const standingSeats: Seat[] = [
      { id: "STAND-1", row: "STAND", number: 1, section: "STANDING", tier: "standing", status: "available", price: 15, isAccessible: false, x: 0.1, y: 0.85 },
      { id: "STAND-2", row: "STAND", number: 2, section: "STANDING", tier: "standing", status: "available", price: 15, isAccessible: false, x: 0.5, y: 0.85 },
      { id: "STAND-3", row: "STAND", number: 3, section: "STANDING", tier: "standing", status: "available", price: 15, isAccessible: false, x: 0.9, y: 0.85 },
    ];

    const map: VenueSeatMap = {
      venueId,
      venueName,
      totalCapacity: generalSeats.length + vipSeats.length + standingSeats.length,
      sections: [
        { id: "MAIN", label: "Main Floor", tier: "general", color: "#22d3ee", seats: generalSeats },
        { id: "VIP",  label: "VIP Section", tier: "vip",    color: "#f59e0b", seats: vipSeats },
        { id: "STANDING", label: "Standing", tier: "standing", color: "#a855f7", seats: standingSeats },
      ],
      stageX: 0.3, stageY: 0.02, stageWidth: 0.4, stageHeight: 0.08,
    };

    this._maps.set(venueId, map);
    return map;
  }

  setMap(map: VenueSeatMap): void {
    this._maps.set(map.venueId, map);
  }

  getMap(venueId: string): VenueSeatMap | null {
    return this._maps.get(venueId) ?? null;
  }

  // ── Seat operations ────────────────────────────────────────────────────────

  private _findSeat(venueId: string, seatId: string): Seat | null {
    const map = this._maps.get(venueId);
    if (!map) return null;
    for (const section of map.sections) {
      const seat = section.seats.find((s) => s.id === seatId);
      if (seat) return seat;
    }
    return null;
  }

  holdSeats(venueId: string, seatIds: string[], userId: string, ttlMs = 600_000): SeatHoldResult {
    const failedSeats: string[] = [];

    // Expire stale holds first
    this._gcHolds(venueId);

    for (const seatId of seatIds) {
      const seat = this._findSeat(venueId, seatId);
      if (!seat || seat.status !== "available") {
        failedSeats.push(seatId);
      }
    }

    if (failedSeats.length > 0) {
      return { success: false, seatIds: failedSeats, expiresAt: 0, holdId: "", reason: `seats unavailable: ${failedSeats.join(",")}` };
    }

    const holdId = makeId();
    const expiresAt = Date.now() + ttlMs;

    for (const seatId of seatIds) {
      const seat = this._findSeat(venueId, seatId)!;
      seat.status = "held";
      seat.heldByUserId = userId;
      seat.heldUntil = expiresAt;
      this._emitChange(venueId, seatId, "held");
    }

    this._holds.set(holdId, { userId, seatIds, expiresAt });

    setTimeout(() => this.releaseHold(venueId, holdId), ttlMs);

    return { success: true, seatIds, expiresAt, holdId };
  }

  releaseHold(venueId: string, holdId: string): void {
    const hold = this._holds.get(holdId);
    if (!hold) return;
    for (const seatId of hold.seatIds) {
      const seat = this._findSeat(venueId, seatId);
      if (seat && seat.status === "held" && seat.heldByUserId === hold.userId) {
        seat.status = "available";
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        this._emitChange(venueId, seatId, "available");
      }
    }
    this._holds.delete(holdId);
  }

  confirmSale(venueId: string, holdId: string, userId: string): boolean {
    const hold = this._holds.get(holdId);
    if (!hold || hold.userId !== userId) return false;
    if (Date.now() > hold.expiresAt) return false;

    for (const seatId of hold.seatIds) {
      const seat = this._findSeat(venueId, seatId);
      if (seat) {
        seat.status = "sold";
        seat.soldToUserId = userId;
        seat.heldByUserId = undefined;
        seat.heldUntil = undefined;
        this._emitChange(venueId, seatId, "sold");
      }
    }
    this._holds.delete(holdId);
    return true;
  }

  getAvailableSeats(venueId: string, tier?: SeatTier): Seat[] {
    const map = this._maps.get(venueId);
    if (!map) return [];
    this._gcHolds(venueId);
    const seats: Seat[] = [];
    for (const section of map.sections) {
      if (tier && section.tier !== tier) continue;
      seats.push(...section.seats.filter((s) => s.status === "available"));
    }
    return seats;
  }

  getStats(venueId: string): SeatMapStats {
    const map = this._maps.get(venueId);
    if (!map) return { total: 0, available: 0, held: 0, sold: 0, blocked: 0, percentSold: 0 };
    const all = map.sections.flatMap((s) => s.seats);
    const sold = all.filter((s) => s.status === "sold").length;
    return {
      total: all.length,
      available: all.filter((s) => s.status === "available").length,
      held: all.filter((s) => s.status === "held").length,
      sold,
      blocked: all.filter((s) => s.status === "blocked").length,
      percentSold: all.length > 0 ? Math.round((sold / all.length) * 100) : 0,
    };
  }

  // ── Events ────────────────────────────────────────────────────────────────

  onChange(cb: (venueId: string, seatId: string, status: SeatStatus) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emitChange(venueId: string, seatId: string, status: SeatStatus): void {
    for (const cb of this._listeners) cb(venueId, seatId, status);
  }

  private _gcHolds(venueId: string): void {
    const now = Date.now();
    for (const [holdId, hold] of this._holds.entries()) {
      if (now > hold.expiresAt) {
        this.releaseHold(venueId, holdId);
      }
    }
  }
}

export const venueSeatMapEngine = VenueSeatMapEngine.getInstance();
