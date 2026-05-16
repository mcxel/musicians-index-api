// ─── RANK ROTATION ENGINE ────────────────────────────────────────────────────
// Authority for Top 10 slot ownership on Homepage 1-2.
//
// Core model:
//   - 10 slots are FIXED positions. They never move.
//   - OCCUPANTS rotate: artists claim and vacate slots based on rank.
//   - #1 slot has a 2-month maximum hold rule.
//   - Slots carry embedded page-surface visual rules (flush to paper, no float).
// ─────────────────────────────────────────────────────────────────────────────

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

/** Max consecutive days an artist may hold the #1 slot (2 months) */
export const MAX_RANK1_HOLD_DAYS = 60;

/** Number of top 10 slots */
export const TOP_10_SLOT_COUNT = 10;

/** Fraction of slots reserved for rising/discovery artists */
export const RISING_ARTIST_RATIO = 0.3;

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type OccupantStatus = "holding" | "promoted" | "demoted" | "entering" | "exiting";

export interface RankOccupant {
  id: string;
  name: string;
  genre: string;
  /** Visual: profile image URL */
  profileImage: string;
  /** Current rank (1–10) */
  rank: number;
  /** Rank from the previous cycle */
  previousRank: number;
  /** Vote / score count */
  score: number;
  /** Days holding current rank position */
  daysHeld: number;
  /** Whether this occupant is classified as a rising/discovery artist */
  isRising: boolean;
  /** Status in this render cycle */
  status: OccupantStatus;
}

export interface RankSlot {
  /** Fixed position 1–10. Never changes. */
  position: number;
  /** Current occupant, or null if slot is briefly empty during a swap */
  occupant: RankOccupant | null;
  /** Whether this slot is currently animating */
  isAnimating: boolean;
  /** Visual embedding rules for the magazine page surface */
  surfaceStyle: SlotSurfaceStyle;
}

/** Drives the "cards belong to the paper, not over it" visual rule */
export interface SlotSurfaceStyle {
  /** Recessed card frame inset (px) */
  recessInset: number;
  /** Page-shadow contact depth (0–1) */
  shadowContact: number;
  /** Embedded glow edge color */
  glowEdge: string;
  /** Whether to show the printed frame illusion border */
  printedFrame: boolean;
}

// ─── SLOT SURFACE STYLES ─────────────────────────────────────────────────────
// Slot 1 is the most prominent; slots 2–5 slightly subdued; 6–10 compact.

function buildSlotSurfaceStyle(position: number): SlotSurfaceStyle {
  if (position === 1) {
    return { recessInset: 3, shadowContact: 0.8, glowEdge: "#FFD700", printedFrame: true };
  }
  if (position <= 3) {
    return { recessInset: 2, shadowContact: 0.55, glowEdge: "#FF2DAA", printedFrame: true };
  }
  if (position <= 5) {
    return { recessInset: 2, shadowContact: 0.38, glowEdge: "#00FFFF", printedFrame: true };
  }
  return { recessInset: 1, shadowContact: 0.22, glowEdge: "#AA2DFF", printedFrame: false };
}

// ─── SLOT FACTORY ─────────────────────────────────────────────────────────────

export function buildEmptySlots(): RankSlot[] {
  return Array.from({ length: TOP_10_SLOT_COUNT }, (_, i) => ({
    position: i + 1,
    occupant: null,
    isAnimating: false,
    surfaceStyle: buildSlotSurfaceStyle(i + 1),
  }));
}

/** Assign an ordered list of occupants into the fixed slot positions */
export function fillSlots(occupants: RankOccupant[]): RankSlot[] {
  const slots = buildEmptySlots();
  for (let i = 0; i < Math.min(occupants.length, TOP_10_SLOT_COUNT); i++) {
    slots[i]!.occupant = occupants[i]!;
  }
  return slots;
}

// ─── #1 HOLD RULE ─────────────────────────────────────────────────────────────

/** Returns true if the #1 occupant has exceeded the maximum hold period */
export function isRank1HoldExpired(occupant: RankOccupant): boolean {
  return occupant.rank === 1 && occupant.daysHeld >= MAX_RANK1_HOLD_DAYS;
}

/**
 * Applies the 2-month hold rule: if #1 occupant has held too long,
 * marks them for demotion so the next cycle removes them from slot 1.
 */
export function applyRank1HoldRule(slots: RankSlot[]): RankSlot[] {
  return slots.map((slot) => {
    if (slot.position !== 1 || !slot.occupant) return slot;
    if (isRank1HoldExpired(slot.occupant)) {
      return {
        ...slot,
        occupant: { ...slot.occupant, status: "demoted" as OccupantStatus },
        isAnimating: true,
      };
    }
    return slot;
  });
}

// ─── OCCUPANT STATUS DERIVATION ───────────────────────────────────────────────

export function deriveOccupantStatus(occupant: RankOccupant): OccupantStatus {
  if (occupant.previousRank === 0) return "entering";
  if (occupant.rank < occupant.previousRank) return "promoted";
  if (occupant.rank > occupant.previousRank) return "demoted";
  return "holding";
}

/** Apply status derivation across a full occupant list */
export function tagOccupantStatuses(occupants: RankOccupant[]): RankOccupant[] {
  return occupants.map((o) => ({ ...o, status: deriveOccupantStatus(o) }));
}

// ─── RANK TICK SIMULATION ─────────────────────────────────────────────────────
// Simulates a live rank update — small swap probability produces natural churn.
// Consumers call this on a timer to animate the spread.

export function simulateRankTick(
  occupants: RankOccupant[],
  swapProbability = 0.25
): RankOccupant[] {
  if (occupants.length < 2) return occupants;

  const next = occupants.map((o) => ({ ...o, previousRank: o.rank }));

  for (let i = 0; i < next.length - 1; i++) {
    if (Math.random() < swapProbability) {
      const a = next[i]!;
      const b = next[i + 1]!;
      next[i] = { ...b, rank: a.rank, status: "promoted" };
      next[i + 1] = { ...a, rank: b.rank, status: "demoted" };
      i++; // skip next to avoid double-swapping
    }
  }

  return next;
}
