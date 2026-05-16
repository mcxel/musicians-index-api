// Cover Genre Rotation Authority — anti-repeat, weighted by engagement

export const MUSIC_GENRES = [
  "Hip-Hop",
  "R&B",
  "Rock",
  "Country",
  "Jazz",
  "Pop",
  "Electronic",
  "Latin",
  "Reggae",
  "Gospel",
  "Soul",
  "Trap",
  "Alternative",
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];

// Accent colors paired with each genre
export const GENRE_ACCENT: Record<MusicGenre, string> = {
  "Hip-Hop":     "#00FFFF",
  "R&B":         "#FF2DAA",
  "Rock":        "#FF4500",
  "Country":     "#FFD700",
  "Jazz":        "#AA2DFF",
  "Pop":         "#FF69B4",
  "Electronic":  "#00E5FF",
  "Latin":       "#FF6B35",
  "Reggae":      "#00FF88",
  "Gospel":      "#FFD700",
  "Soul":        "#FF2DAA",
  "Trap":        "#AA2DFF",
  "Alternative": "#00FFFF",
};

// Derive the active genre for a given week index (0-based)
// Cycles through all genres before repeating
export function getGenreForWeek(weekIndex: number): MusicGenre {
  const idx = weekIndex % MUSIC_GENRES.length;
  return MUSIC_GENRES[idx]!;
}

// Returns the current week index based on the calendar week of the year
export function getCurrentWeekIndex(): number {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff  = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

// Primary export: get the active genre for this week
export function getActiveGenre(): MusicGenre {
  return getGenreForWeek(getCurrentWeekIndex());
}

// Get the next genre (for preview)
export function getNextGenre(): MusicGenre {
  return getGenreForWeek(getCurrentWeekIndex() + 1);
}

// Returns a genre that does NOT conflict with any items in the exclusion list
export function getNonConflictingGenre(
  excluded: MusicGenre[]
): MusicGenre {
  const excludedSet = new Set(excluded);
  const available = MUSIC_GENRES.filter((g) => !excludedSet.has(g));
  if (!available.length) return MUSIC_GENRES[0]!;
  // Pick deterministically based on current week so it's stable across renders
  const weekIdx = getCurrentWeekIndex();
  return available[weekIdx % available.length]!;
}
