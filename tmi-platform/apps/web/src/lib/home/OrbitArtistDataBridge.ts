// Orbit Artist Data Bridge
// Source chain: ARTIST_SEED → TOP10_FACE_BY_GENRE → EDITORIAL_ARTICLES article slug lookup
// Provides OrbitArtistEntry[] for the Home 1 cover orbit — no static arrays in the renderer.

import {
  TOP10_FACE_BY_GENRE,
  type TopArtistFaceEntry,
  type GenreKey,
} from "@/packages/home/experience/top10FaceData";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";

export interface OrbitArtistEntry {
  id: string;
  rank: number;
  name: string;
  portrait: string;
  color: string;
  articleSlug: string;
  profileRoute: string;
  isCrowned: boolean;
}

const RANK_COLORS: string[] = [
  "#FFD700", // #1  gold
  "#00FFFF", // #2  cyan
  "#00FF88", // #3  green
  "#AA2DFF", // #4  purple
  "#FF6B35", // #5  orange
  "#FF2DAA", // #6  pink
  "#00FFFF", // #7  cyan
  "#FFD700", // #8  gold
  "#AA2DFF", // #9  purple
  "#00FF88", // #10 green
];

function artistColor(rank: number): string {
  return RANK_COLORS[(rank - 1) % RANK_COLORS.length] ?? "#00FFFF";
}

export function getOrbitArtistPool(genreKey: GenreKey = "hiphop"): OrbitArtistEntry[] {
  const pool: TopArtistFaceEntry[] =
    TOP10_FACE_BY_GENRE[genreKey] ?? TOP10_FACE_BY_GENRE.hiphop ?? [];

  if (pool.length === 0) return [];

  return pool.map((entry) => {
    const article = EDITORIAL_ARTICLES.find(
      (a) => a.category === "artist" && a.relatedArtistSlug === entry.id
    );
    const profileRoute = article
      ? `/articles/artist/${article.slug}`
      : `/artists/${entry.id}`;

    return {
      id: entry.id,
      rank: entry.rank,
      name: entry.name,
      portrait: entry.image,
      color: artistColor(entry.rank),
      articleSlug: article?.slug ?? entry.id,
      profileRoute,
      isCrowned: entry.isCrowned ?? entry.rank === 1,
    };
  });
}
