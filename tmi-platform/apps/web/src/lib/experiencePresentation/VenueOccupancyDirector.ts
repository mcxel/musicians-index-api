/**
 * VenueOccupancyDirector — real participants only (no fake crowds).
 */

export interface VenueOccupant {
  occupantId: string;
  userId: string;
  displayName: string;
  role: "FAN" | "PERFORMER" | "HOST" | "SYSTEM_BOT";
  /** SYSTEM_BOT must be policy-labeled — never presented as human */
  isLabeledBot: boolean;
  joinedAtMs: number;
}

export interface VenueOccupancyDirector {
  admit(occupant: VenueOccupant): void;
  leave(occupantId: string): void;
  listOccupants(): VenueOccupant[];
  countHumans(): number;
}

export function assertNoFakeOccupancy(occupants: readonly VenueOccupant[]): void {
  for (const o of occupants) {
    if (!o.userId || !o.occupantId) {
      throw new Error("Occupant missing identity — fake occupancy rejected");
    }
    if (o.role === "SYSTEM_BOT" && !o.isLabeledBot) {
      throw new Error("Unlabeled bot occupancy rejected");
    }
  }
}

export function createVenueOccupancyDirector(): VenueOccupancyDirector {
  const map = new Map<string, VenueOccupant>();
  return {
    admit(occupant) {
      assertNoFakeOccupancy([occupant]);
      map.set(occupant.occupantId, occupant);
    },
    leave(occupantId) {
      map.delete(occupantId);
    },
    listOccupants() {
      return [...map.values()];
    },
    countHumans() {
      return [...map.values()].filter((o) => o.role !== "SYSTEM_BOT").length;
    },
  };
}
