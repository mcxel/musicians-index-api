export type TmiGenreKey =
  | "hip-hop"
  | "electronic"
  | "rock"
  | "pop"
  | "rnb"
  | "jazz"
  | "gospel"
  | "country"
  | "producer"
  | "dj"
  | "cypher";

export const HOMEPAGE_GENRE_ROTATION: TmiGenreKey[] = [
  "hip-hop",
  "electronic",
  "rock",
  "pop",
  "rnb",
  "jazz",
  "gospel",
  "country",
  "producer",
  "dj",
  "cypher"
];

export function getNextGenre(current: TmiGenreKey): TmiGenreKey {
  const index = HOMEPAGE_GENRE_ROTATION.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % HOMEPAGE_GENRE_ROTATION.length;
  return HOMEPAGE_GENRE_ROTATION[nextIndex];
}
