/**
 * GenreRankingEngine
 * Genre-separated rankings for artists and performers.
 */

export type CanonicalGenre =
  | "hip-hop"
  | "r-and-b"
  | "rock"
  | "country"
  | "pop"
  | "jazz"
  | "soul"
  | "electronic"
  | "metal"
  | "latin"
  | "gospel"
  | "custom";

export type GenreRankEntry = {
  artistId: string;
  genre: CanonicalGenre | string;
  rank: number;
  previousRank: number | null;
  rankMovement: number;
  score: number;
};

const genreRankings = new Map<string, GenreRankEntry[]>();

export function updateGenreRanking(input: {
  genre: CanonicalGenre | string;
  entries: Array<{ artistId: string; score: number }>;
}): GenreRankEntry[] {
  const previous = genreRankings.get(input.genre) ?? [];
  const previousMap = new Map(previous.map((entry) => [entry.artistId, entry]));

  const ranked = [...input.entries]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => {
      const old = previousMap.get(entry.artistId) ?? null;
      const rank = index + 1;
      const previousRank = old?.rank ?? null;
      return {
        artistId: entry.artistId,
        genre: input.genre,
        rank,
        previousRank,
        rankMovement: previousRank === null ? 0 : previousRank - rank,
        score: entry.score,
      };
    });

  genreRankings.set(input.genre, ranked);
  return ranked;
}

export function getGenreRanking(genre: CanonicalGenre | string): GenreRankEntry[] {
  return genreRankings.get(genre) ?? [];
}

export function listTrackedGenres(): Array<CanonicalGenre | string> {
  return [...genreRankings.keys()];
}
