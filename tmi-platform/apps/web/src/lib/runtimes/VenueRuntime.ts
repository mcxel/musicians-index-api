/**
 * VenueRuntime — Unified Spatial Base Runtime for all TMI environments.
 * Owns spatial room behavior across lounges, arenas, amphitheaters, and theaters:
 *  - Seat anchors & capacity
 *  - Spawn points & doors
 *  - Camera rails & lighting rigs
 *  - Spatial anchors & monitor surfaces
 * Emits semantic events (VenueInitialized, UserSpawned, SeatAssigned).
 */

import type { SpatialAnchorId } from "@/lib/presentation/PresentationDirector";

export interface VenueSeat {
  id: string;
  position: { x: number; y: number; z: number };
  occupiedByUserId?: string;
}

export interface VenueSnapshot {
  venueId: string;
  name: string;
  capacity: number;
  seats: VenueSeat[];
  spawnPoint: { x: number; y: number; z: number };
  activeAnchors: SpatialAnchorId[];
}

export class VenueRuntime {
  private venueId: string;
  private name: string;
  private capacity: number;
  private seats: VenueSeat[] = [];
  private spawnPoint = { x: 0, y: 0, z: 10 };

  constructor(id: string, name: string, capacity: number = 50) {
    this.venueId = id;
    this.name = name;
    this.capacity = capacity;
    this.initializeSeats();
  }

  private initializeSeats() {
    for (let i = 0; i < Math.min(this.capacity, 20); i++) {
      this.seats.push({
        id: `seat-${i + 1}`,
        position: { x: (i % 5) * 1.5 - 3, y: 0, z: Math.floor(i / 5) * 1.5 + 2 },
      });
    }
  }

  public assignSeat(userId: string): VenueSeat | null {
    const freeSeat = this.seats.find((s) => !s.occupiedByUserId);
    if (!freeSeat) return null;
    freeSeat.occupiedByUserId = userId;

    this.emitEvent("SeatAssigned", { userId, seatId: freeSeat.id, position: freeSeat.position });
    return freeSeat;
  }

  public releaseSeat(seatId: string) {
    const seat = this.seats.find((s) => s.id === seatId);
    if (seat) {
      const prevUser = seat.occupiedByUserId;
      seat.occupiedByUserId = undefined;
      this.emitEvent("SeatReleased", { userId: prevUser, seatId });
    }
  }

  public getSnapshot(): VenueSnapshot {
    return {
      venueId: this.venueId,
      name: this.name,
      capacity: this.capacity,
      seats: [...this.seats],
      spawnPoint: this.spawnPoint,
      activeAnchors: [
        "performer-primary",
        "avatar-head-top",
        "lounge-center-screen",
        "winner-focus-center",
      ],
    };
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, venueId: this.venueId } },
        })
      );
    } catch (e) {}
  }
}

export default VenueRuntime;
