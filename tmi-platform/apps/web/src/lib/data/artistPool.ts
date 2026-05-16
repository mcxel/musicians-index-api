import { ARTIST_SEED, type ArtistSeedRecord } from "@/lib/artists/artistSeed";
import { GENRE_ROTATION_ORDER, type GENRE_LABELS } from "@/lib/engine/GenreRotationEngine";

export type LiveArtist = ArtistSeedRecord & {
  rank: number;
  score: number;
};

const GENRE_TO_SEED: Record<string, ArtistSeedRecord["genre"][]> = {
  rnb: ["R&B", "Soul"],
  hiphop: ["Hip Hop"],
  rock: ["Rock"],
  pop: ["Pop"],
  afrobeat: ["Afrobeat"],
  local: ["Local"],
  worldwide: ["Worldwide"],
  global: ["Global"],
};

export function getArtistsByGenre(genreKey: keyof typeof GENRE_TO_SEED, limit = 10): LiveArtist[] {
  const accepted = GENRE_TO_SEED[genreKey] ?? ["Pop"];
  const pool = ARTIST_SEED.filter((a) => accepted.includes(a.genre)).slice(0, limit);
  return pool.map((artist, index) => ({
    ...artist,
    rank: index + 1,
    score: Number((99 - index * 1.3).toFixed(1)),
  }));
}

export function getGenreForIndex(index: number): keyof typeof GENRE_TO_SEED {
  return GENRE_ROTATION_ORDER[index % GENRE_ROTATION_ORDER.length];
}
