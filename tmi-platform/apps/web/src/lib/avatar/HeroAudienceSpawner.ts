/**
 * HeroAudienceSpawner — Determines WHO spawns WHERE in the AudienceScene
 *
 * Priority order for seat assignment:
 *   1. Icon-tier heroes (front_row_center)
 *   2. Legend-tier heroes (front_row_left/right)
 *   3. Venue-linked heroes (their home venue)
 *   4. User-linked heroes (follow the user in)
 *   5. Generic audience (fill remaining seats)
 *
 * Returns a SeatAssignment array that AudienceScene renders.
 * P11A: emoji + color representation. P12: replace with 3D rig IDs.
 */

import { getHeroesForVenue, type HeroPosition } from "./HeroPresenceRegistry";

export type SeatTier = "hero_icon" | "hero_legend" | "hero_rare" | "vip" | "standard";

export interface SeatAssignment {
  seatIndex:   number;
  tier:        SeatTier;
  heroId?:     string;
  emoji:       string;        // current representation (P12: rig path)
  color:       string;        // glow color for canvas rendering
  position:    HeroPosition | "generic";
  animState:   "idle" | "wave" | "celebrate" | "dance" | "signature_move";
  label?:      string;        // name shown on hover / in VIP seats
}

// Canvas seat positions by index for each venue type
// venueIndex 0=Theater(2730), 1=Arena(18500), 2=Club(420), 3=Outdoor(8200)
export const FRONT_ROW_SEAT_INDICES: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4, 5],          // Theater front row
  1: [0, 1, 2, 3, 4, 5, 6, 7],   // Arena front row (wider)
  2: [0, 1, 2],                   // Club front area
  3: [0, 1, 2, 3, 4],             // Outdoor front
};

export const VIP_SEAT_INDICES: Record<number, number[]> = {
  0: [10, 11, 12],
  1: [15, 16, 17, 18],
  2: [5, 6],
  3: [8, 9, 10],
};

export const JUDGE_SEAT_INDICES: Record<number, number[]> = {
  0: [20, 21, 22],
  1: [25, 26, 27],
  2: [8],
  3: [12, 13],
};

// Generic crowd emojis (diverse — all ages, types, colors)
const CROWD_EMOJIS = [
  "👤","🧑‍🦱","👩‍🦰","🧔","👱‍♀️","🧑‍🦳","👴","👵","🧑‍🦲",
  "👩","👨","🧑","👦","👧","🧒","🙆","🙋","🤷","🤸",
];

function genericSeat(seatIndex: number): SeatAssignment {
  const emoji = CROWD_EMOJIS[seatIndex % CROWD_EMOJIS.length]!;
  return { seatIndex, tier: "standard", emoji, color: "rgba(255,255,255,0.3)", position: "generic", animState: "idle" };
}

export function buildSeatAssignments(venueSlug: string, venueIndex: number, totalSeats: number): SeatAssignment[] {
  const heroes = getHeroesForVenue(venueSlug);
  const assignments: SeatAssignment[] = [];
  const usedSeats = new Set<number>();

  // Place heroes in their designated positions
  for (const hero of heroes) {
    let seatIdx: number | undefined;

    if (hero.position === "front_row_center") {
      const frontRow = FRONT_ROW_SEAT_INDICES[venueIndex] ?? [0];
      seatIdx = frontRow.find(i => !usedSeats.has(i));
    } else if (hero.position === "front_row_left") {
      const frontRow = FRONT_ROW_SEAT_INDICES[venueIndex] ?? [0];
      seatIdx = frontRow[Math.floor(frontRow.length / 4)];
      if (seatIdx && usedSeats.has(seatIdx)) seatIdx = frontRow.find(i => !usedSeats.has(i));
    } else if (hero.position === "front_row_right") {
      const frontRow = FRONT_ROW_SEAT_INDICES[venueIndex] ?? [0];
      seatIdx = frontRow[Math.floor((frontRow.length * 3) / 4)];
      if (seatIdx && usedSeats.has(seatIdx)) seatIdx = frontRow.find(i => !usedSeats.has(i));
    } else if (hero.position === "vip_booth") {
      const vip = VIP_SEAT_INDICES[venueIndex] ?? [10];
      seatIdx = vip.find(i => !usedSeats.has(i));
    } else if (hero.position === "judge_panel") {
      const judge = JUDGE_SEAT_INDICES[venueIndex] ?? [20];
      seatIdx = judge.find(i => !usedSeats.has(i));
    } else if (hero.position === "stage" || hero.position === "dj_booth") {
      seatIdx = 0; // stage presence handled separately in renderer
    }

    if (seatIdx !== undefined && seatIdx < totalSeats && !usedSeats.has(seatIdx)) {
      usedSeats.add(seatIdx);
      const tier: SeatTier = hero.rarity === "iconic" ? "hero_icon" : hero.rarity === "legendary" ? "hero_legend" : "hero_rare";
      assignments.push({
        seatIndex:  seatIdx,
        tier,
        heroId:     hero.id,
        emoji:      hero.emoji,
        color:      hero.accentColor,
        position:   hero.position,
        animState:  hero.animState,
        label:      hero.displayName,
      });
    }
  }

  // Fill remaining seats with generic audience
  for (let i = 0; i < Math.min(totalSeats, 200); i++) {
    if (!usedSeats.has(i)) {
      assignments.push(genericSeat(i));
    }
  }

  return assignments.sort((a, b) => a.seatIndex - b.seatIndex);
}

// Returns just the hero seats for AudienceScene canvas overlay
export function getHeroSeatOverlay(venueSlug: string, venueIndex: number): SeatAssignment[] {
  return buildSeatAssignments(venueSlug, venueIndex, 200).filter(s => s.tier !== "standard");
}
