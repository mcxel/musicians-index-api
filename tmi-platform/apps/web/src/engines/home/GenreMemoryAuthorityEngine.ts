// Genre Memory Authority Engine
// Prevents /home/1 and /home/1-2 from showing the same genre.
// Tracks shown genres to avoid immediate repeats.

import {
  type MusicGenre,
  MUSIC_GENRES,
  getGenreForWeek,
  getCurrentWeekIndex,
} from "./CoverGenreRotationAuthority";

// Spread categories per issue — never mirrors the cover genre
// Left/right columns on /home/1-2 rotate by issue number
export interface SpreadCategories {
  left: string;
  right: string;
}

const SPREAD_ROTATIONS: SpreadCategories[] = [
  { left: "Comedians",   right: "Streamers"   },   // Issue 1 (week % 4 === 0)
  { left: "Dancers",     right: "Producers"   },   // Issue 2
  { left: "Rappers",     right: "Singers"     },   // Issue 3
  { left: "DJs",         right: "Influencers" },   // Issue 4
];

// Get the spread category pair for the current week
export function getCurrentSpreadCategories(): SpreadCategories {
  const weekIdx = getCurrentWeekIndex();
  const issueIdx = weekIdx % SPREAD_ROTATIONS.length;
  return SPREAD_ROTATIONS[issueIdx]!;
}

// Get spread categories for a specific issue index (1-based)
export function getSpreadCategoriesForIssue(issue: number): SpreadCategories {
  const idx = (issue - 1) % SPREAD_ROTATIONS.length;
  return SPREAD_ROTATIONS[idx]!;
}

// Memory store — which genres have been shown on each surface this session
const shownOnCover:  Set<MusicGenre> = new Set();
const shownOnSpread: Set<MusicGenre> = new Set();

// Record that a genre was displayed on a surface
export function markGenreShown(
  surface: "cover" | "spread",
  genre: MusicGenre
): void {
  if (surface === "cover")  shownOnCover.add(genre);
  if (surface === "spread") shownOnSpread.add(genre);
}

// Get a cover genre for this week that doesn't conflict with the current spread
export function getCoverGenre(): MusicGenre {
  const weekIdx   = getCurrentWeekIndex();
  const candidate = getGenreForWeek(weekIdx);

  // If spread also uses this genre label as category, offset by +1
  const spreadCats = getCurrentSpreadCategories();
  const spreadGenres = [spreadCats.left, spreadCats.right].map((c) => c.toLowerCase());
  const candidateLower = candidate.toLowerCase();
  if (spreadGenres.includes(candidateLower)) {
    return getGenreForWeek(weekIdx + 1);
  }
  return candidate;
}

// Get the previous two cover genres (for "no repeat from last 2 cycles" rule)
export function getPreviousCoverGenres(): MusicGenre[] {
  const weekIdx = getCurrentWeekIndex();
  return [
    getGenreForWeek(weekIdx - 1),
    getGenreForWeek(weekIdx - 2),
  ];
}

// Returns true if the given genre was recently shown
export function isRecentlyShown(genre: MusicGenre): boolean {
  return shownOnCover.has(genre) || shownOnSpread.has(genre);
}

// Full genre eligibility check
export function isGenreEligible(genre: MusicGenre): boolean {
  const recent = getPreviousCoverGenres();
  if (recent.includes(genre)) return false;
  if (isRecentlyShown(genre)) return false;
  return true;
}

// Get all eligible genres this week
export function getEligibleGenres(): MusicGenre[] {
  return [...MUSIC_GENRES].filter(isGenreEligible);
}
