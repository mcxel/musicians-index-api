// ─── GENRE CYCLE ENGINE ──────────────────────────────────────────────────────
// Controls genre diversity across the Top 10 magazine slots.
//
// Rules:
//   1. No more than 2 consecutive slots may share the same genre.
//   2. At least 30% of the 10 slots must be "rising" (discovery) artists.
//   3. Genre rotation across spreads must avoid repetitive sequences.
// ─────────────────────────────────────────────────────────────────────────────

import { RISING_ARTIST_RATIO, TOP_10_SLOT_COUNT } from "@/lib/rankings/RankRotationEngine";

// ─── GENRE REGISTRY ──────────────────────────────────────────────────────────

export const MAGAZINE_GENRES = [
  "Hip-Hop",
  "Electronic",
  "Rock",
  "R&B",
  "Country",
  "Jazz",
  "Pop",
  "Soul",
  "Afrobeats",
  "Latin",
] as const;

export type MagazineGenre = (typeof MAGAZINE_GENRES)[number];

// ─── DIVERSITY RULE ──────────────────────────────────────────────────────────

/** Max consecutive slots with the same genre before the engine forces a break */
export const MAX_CONSECUTIVE_SAME_GENRE = 2;

/**
 * Checks if adding `genre` at `position` would violate the consecutive rule.
 * Looks at the last N = MAX_CONSECUTIVE_SAME_GENRE entries before position.
 */
export function wouldViolateConsecutiveRule(
  genre: MagazineGenre,
  currentSequence: MagazineGenre[]
): boolean {
  const tail = currentSequence.slice(-MAX_CONSECUTIVE_SAME_GENRE);
  return tail.length === MAX_CONSECUTIVE_SAME_GENRE && tail.every((g) => g === genre);
}

/**
 * Picks a genre for the next slot that does not violate the consecutive rule.
 * Falls back to any non-violating genre if the preferred genre would stack.
 */
export function pickNextGenre(
  preferredGenre: MagazineGenre,
  currentSequence: MagazineGenre[],
  bannedGenres: MagazineGenre[] = []
): MagazineGenre {
  if (
    !wouldViolateConsecutiveRule(preferredGenre, currentSequence) &&
    !bannedGenres.includes(preferredGenre)
  ) {
    return preferredGenre;
  }

  // Find the first non-violating, non-banned alternative
  const alternatives = MAGAZINE_GENRES.filter(
    (g) =>
      g !== preferredGenre &&
      !bannedGenres.includes(g) &&
      !wouldViolateConsecutiveRule(g, currentSequence)
  );

  return alternatives[0] ?? preferredGenre; // fallback if all violate (shouldn't happen)
}

// ─── DISCOVERY INJECTION ──────────────────────────────────────────────────────

/** Returns the minimum number of rising-artist slots required */
export function getRequiredRisingSlots(): number {
  return Math.ceil(TOP_10_SLOT_COUNT * RISING_ARTIST_RATIO);
}

/**
 * Validates a slot list and returns the indices that should be marked as
 * rising/discovery artist slots. Ensures at least RISING_ARTIST_RATIO are set.
 */
export function getRisingSlotIndices(count: number = TOP_10_SLOT_COUNT): number[] {
  const required = Math.ceil(count * RISING_ARTIST_RATIO);
  // Spread rising slots through the list — avoid all stacking at the bottom.
  // Pattern: every ~3 slots, one rising slot, starting from slot 7.
  const indices: number[] = [];
  let step = Math.floor(count / required);
  for (let i = 0; i < required; i++) {
    const idx = Math.min(count - required + i, i * step + (step - 1));
    indices.push(idx);
  }
  return indices;
}

// ─── SPREAD GENRE ROTATION ────────────────────────────────────────────────────
// Tracks which genres have been shown across spreads and weights selection
// away from recently shown genres.

export interface GenreCycleState {
  /** Recently shown genres in spread order (most recent last) */
  recentGenres: MagazineGenre[];
  /** How many spreads worth of history to keep */
  windowSize: number;
}

export function createGenreCycleState(windowSize = 5): GenreCycleState {
  return { recentGenres: [], windowSize };
}

/**
 * Returns genres eligible for the next spread given recent history.
 * Genres shown more recently get lower weight.
 */
export function getEligibleGenresForSpread(
  state: GenreCycleState
): MagazineGenre[] {
  const recentSet = new Set(state.recentGenres.slice(-state.windowSize));
  // Prefer genres not seen in recent window
  const fresh = MAGAZINE_GENRES.filter((g) => !recentSet.has(g));
  return fresh.length > 0 ? [...fresh] : [...MAGAZINE_GENRES];
}

export function recordSpreadGenre(
  state: GenreCycleState,
  genre: MagazineGenre
): GenreCycleState {
  const updated = [...state.recentGenres, genre];
  return {
    ...state,
    recentGenres: updated.slice(-state.windowSize * 2),
  };
}

// ─── GENRE SEQUENCE BUILDER ───────────────────────────────────────────────────
// Builds a genre sequence for a 10-slot spread satisfying all diversity rules.

export function buildGenreSequence(
  leadGenre: MagazineGenre,
  risingSlotIndices: number[]
): MagazineGenre[] {
  const sequence: MagazineGenre[] = [];
  const risingSet = new Set(risingSlotIndices);

  for (let i = 0; i < TOP_10_SLOT_COUNT; i++) {
    const preferred: MagazineGenre = risingSet.has(i)
      ? pickAlternativeGenre(leadGenre, sequence)
      : leadGenre;
    sequence.push(pickNextGenre(preferred, sequence));
  }

  return sequence;
}

function pickAlternativeGenre(
  leadGenre: MagazineGenre,
  sequence: MagazineGenre[]
): MagazineGenre {
  const alternatives = MAGAZINE_GENRES.filter((g) => g !== leadGenre);
  for (const alt of alternatives) {
    if (!wouldViolateConsecutiveRule(alt, sequence)) return alt;
  }
  return alternatives[0] ?? leadGenre;
}

// ─── GENRE ACCENT COLORS ─────────────────────────────────────────────────────

export const GENRE_ACCENT: Record<MagazineGenre, string> = {
  "Hip-Hop":    "#FF2DAA",
  "Electronic": "#00FFFF",
  "Rock":       "#FF6B35",
  "R&B":        "#AA2DFF",
  "Country":    "#FFD700",
  "Jazz":       "#00FF88",
  "Pop":        "#FF9ECD",
  "Soul":       "#FF8C42",
  "Afrobeats":  "#4DFFB0",
  "Latin":      "#FF4D6A",
};
