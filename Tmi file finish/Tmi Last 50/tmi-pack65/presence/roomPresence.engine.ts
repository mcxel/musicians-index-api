// apps/web/src/lib/avatars/roomPresence.engine.ts
// Populates venues with user avatars in seats.
// 1 user = 1 bobblehead in a seat. Up to thousands in a venue.

export interface SeatPosition {
  seatId: string;
  zone: "premium_front_row" | "standard" | "balcony" | "vip" | "standing";
  row: number;
  col: number;
  x: number;         // scene coordinate
  y: number;
  z: number;
  isOccupied: boolean;
  occupantId?: string;
  occupantAvatarId?: string;
}

export interface VenuePresenceState {
  venueId: string;
  roomId: string;
  totalSeats: number;
  occupiedSeats: number;
  seats: SeatPosition[];
  standingZoneOccupants: string[];  // for dance party / open floor
  viewerCount: number;
  showsAvatarBubbles: boolean;      // false for very large venues (performance mode)
}

// Dynamic seat fill — discovery-first principles apply to seating too
// Empty premium seats visible to attract users (0 occupied = most visible)
export function distributeSeatsFill(
  viewers: Array<{ userId: string; tier: string }>,
  layout: SeatPosition[]
): SeatPosition[] {
  const seats = [...layout];
  const sortedViewers = [...viewers].sort((a, b) => {
    const tierOrder = { DIAMOND:0, PLATINUM:1, GOLD:2, PRO:3, STARTER:4, FREE:5 };
    return (tierOrder[a.tier as keyof typeof tierOrder] ?? 5) - (tierOrder[b.tier as keyof typeof tierOrder] ?? 5);
  });

  // Diamond/Platinum fill front row first
  let seatIndex = 0;
  for (const viewer of sortedViewers) {
    if (seatIndex >= seats.length) break;
    seats[seatIndex] = { ...seats[seatIndex], isOccupied: true, occupantId: viewer.userId };
    seatIndex++;
  }

  return seats;
}

// Avatar reactions in seated positions
export type SeatedReaction = "clap" | "cheer" | "boo" | "laugh" | "surprised" | "stand_up";

export function triggerSeatedReaction(
  seats: SeatPosition[],
  reaction: SeatedReaction,
  intensity: number  // 0-1, affects how many avatars react
): { seatId: string; reaction: SeatedReaction }[] {
  const reacting: { seatId: string; reaction: SeatedReaction }[] = [];
  for (const seat of seats.filter(s => s.isOccupied)) {
    if (Math.random() < intensity) {
      reacting.push({ seatId: seat.seatId, reaction });
    }
  }
  return reacting;
}
