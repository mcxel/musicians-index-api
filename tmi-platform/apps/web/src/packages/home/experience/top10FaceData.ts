import { ARTIST_SEED } from "@/lib/artists/artistSeed";

export type GenreKey = "rnb" | "hiphop" | "rock" | "pop" | "afrobeat" | "local" | "worldwide" | "global";

export type TopArtistFaceEntry = {
  id: string;
  rank: number;
  name: string;
  genreLabel: string;
  score: string;
  image: string;
  isCrowned?: boolean;
};

export const GENRE_ORDER: GenreKey[] = ["rnb", "hiphop", "rock", "pop", "afrobeat", "local", "worldwide", "global"];

const seedByGenre: Record<GenreKey, string[]> = {
  rnb: ["R&B", "Soul"],
  hiphop: ["Hip Hop"],
  rock: ["Rock"],
  pop: ["Pop"],
  afrobeat: ["Afrobeat"],
  local: ["Local"],
  worldwide: ["Worldwide"],
  global: ["Global"],
};

function buildEntries(genre: GenreKey): TopArtistFaceEntry[] {
  const genres = seedByGenre[genre];
  const source = ARTIST_SEED.filter((artist) => genres.includes(artist.genre)).slice(0, 10);
  return source.map((artist, i) => ({
    id: artist.id,
    rank: i + 1,
    name: artist.name,
    genreLabel: artist.genre,
    score: (99 - i * 1.3).toFixed(1),
    image: artist.image,
    isCrowned: i === 0,
  }));
}

export const TOP10_FACE_BY_GENRE: Record<GenreKey, TopArtistFaceEntry[]> = {
  rnb: buildEntries("rnb"),
  hiphop: buildEntries("hiphop"),
  rock: buildEntries("rock"),
  pop: buildEntries("pop"),
  afrobeat: buildEntries("afrobeat"),
  local: buildEntries("local"),
  worldwide: buildEntries("worldwide"),
  global: buildEntries("global"),
};
