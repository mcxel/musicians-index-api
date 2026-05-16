// GenreBalanceEngine
// Prevents genre clustering in magazine spreads.
// Bad: rap → rap → rap → rap
// Better: rap → jazz → rock → reggae → electronic → gospel

const GENRE_COOLDOWN_SLOTS = 3; // don't repeat same genre within N consecutive slots

const _recentGenres: string[] = [];

export function resetGenreTracking(): void {
  _recentGenres.length = 0;
}

export function recordGenre(genre: string): void {
  _recentGenres.unshift(genre);
  if (_recentGenres.length > GENRE_COOLDOWN_SLOTS * 2) _recentGenres.pop();
}

export function isGenreInCooldown(genre: string): boolean {
  const recent = _recentGenres.slice(0, GENRE_COOLDOWN_SLOTS);
  return recent.includes(genre);
}

export function filterByGenreBalance<T extends { genres: string[] }>(
  artists: T[],
  currentSlot: number,
): T[] {
  if (currentSlot === 0) return artists;
  const balanced = artists.filter(a => !a.genres.some(g => isGenreInCooldown(g)));
  return balanced.length > 0 ? balanced : artists; // fallback if all in cooldown
}

export interface GenreDistribution {
  genre: string;
  count: number;
  percentage: number;
}

export function analyzeGenreDistribution(
  artists: Array<{ genres: string[] }>,
): GenreDistribution[] {
  const counts = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of artist.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  const total = artists.length;
  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count, percentage: count / total }))
    .sort((a, b) => b.count - a.count);
}
