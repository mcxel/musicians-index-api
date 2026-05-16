export const GENRES = [
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "Electronic",
  "Afrobeats",
  "Jazz",
  "Country",
  "Latin",
  "Reggae",
  "Dancehall",
  "K-Pop",
  "Gospel",
  "Blues",
  "Funk",
  "Soul",
  "Metal",
  "Indie",
  "Folk",
  "Alternative",
  "Trap",
  "Drill",
  "House",
  "Techno",
  "EDM",
  "Lo-fi",
  "Classical",
  "Soundtrack",
  "World",
  "Experimental",
] as const;

const MAJOR_GENRE_SET = new Set<string>([
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "Electronic",
  "Afrobeats",
  "Latin",
  "EDM",
]);

const ALIASES: Record<string, string> = {
  "hiphop": "Hip Hop",
  "hip hop": "Hip Hop",
  "r&b": "R&B",
  "rnb": "R&B",
  "afrobeat": "Afrobeats",
  "afrobeats": "Afrobeats",
  "worldwide": "World",
  "global": "World",
};

const dynamicGenres: string[] = [...GENRES];

function canonicalKey(label: string): string {
  return label.trim().toLowerCase();
}

export function normalizeGenreLabel(input: string): string {
  const key = canonicalKey(input);
  return ALIASES[key] ?? input;
}

export function getAllGenres(): string[] {
  return [...dynamicGenres];
}

export function registerGenre(genre: string): string {
  const normalized = normalizeGenreLabel(genre);
  const exists = dynamicGenres.some((entry) => canonicalKey(entry) === canonicalKey(normalized));
  if (!exists) {
    dynamicGenres.push(normalized);
  }
  return normalized;
}

export function isMajorGenre(genre: string): boolean {
  return MAJOR_GENRE_SET.has(normalizeGenreLabel(genre));
}

export function genreMatches(left: string, right: string): boolean {
  return canonicalKey(normalizeGenreLabel(left)) === canonicalKey(normalizeGenreLabel(right));
}
