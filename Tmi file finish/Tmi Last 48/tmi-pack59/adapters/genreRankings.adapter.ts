// apps/web/src/adapters/homepage/genreRankings.adapter.ts
// Provides top-N artists per genre for homepage display.
// Mock data → swap fetchGenreRankings() for real API when ready.

export interface GenreRankingItem {
  rank: number;
  artistId: string;
  stageName: string;
  genre: string;
  slug: string;
  stationSlug: string;
  viewerCount: number;
  weeklyPoints: number;
  weeklyChange: number;     // +2, -1, 0 for leaderboard badge
  isCrownHolder: boolean;
  isNew: boolean;           // new entry this week
  isBattleWinner: boolean;
  clipUrl?: string;         // 3-second motion clip
  avatarUrl?: string;
  tier: string;
  city: string;
}

export interface GenreRankingFeed {
  genre: string;
  color: string;
  top10: GenreRankingItem[];
  lastUpdated: Date;
}

// ── MOCK DATA ─────────────────────────────────────────────────
const GENRE_COLORS: Record<string, string> = {
  "Hip Hop": "#FF2D78", "R&B": "#7B2FBE", "Electronic": "#00E5FF",
  "Pop": "#FFB800", "Jazz": "#00B8A9", "Rock": "#FF8C00",
  "Soul": "#7B2FBE", "Reggae": "#00C896",
};

function makeMockArtists(genre: string, count = 10): GenreRankingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    artistId: `${genre.toLowerCase().replace(/ /g, "-")}-${i+1}`,
    stageName: `${genre} Artist ${i+1}`,
    genre,
    slug: `${genre.toLowerCase().replace(/ /g, "-")}-artist-${i+1}`,
    stationSlug: `${genre.toLowerCase().replace(/ /g, "-")}-station-${i+1}`,
    viewerCount: Math.max(0, 100 - i * 10 + Math.floor(Math.random() * 5)),
    weeklyPoints: Math.max(0, 5000 - i * 450 + Math.floor(Math.random() * 100)),
    weeklyChange: [2, 0, -1, 1, 0, 3, -2, 0, 1, -1][i],
    isCrownHolder: i === 0,
    isNew: i === 7,
    isBattleWinner: i === 3,
    tier: ["DIAMOND","PLATINUM","GOLD","PRO","PRO","STARTER","STARTER","FREE","FREE","FREE"][i],
    city: "Chico",
  }));
}

export const GENRE_RANKING_FALLBACK: GenreRankingFeed[] = [
  { genre:"Hip Hop",    color:GENRE_COLORS["Hip Hop"],    top10:makeMockArtists("Hip Hop"),    lastUpdated: new Date() },
  { genre:"R&B",        color:GENRE_COLORS["R&B"],        top10:makeMockArtists("R&B"),        lastUpdated: new Date() },
  { genre:"Electronic", color:GENRE_COLORS["Electronic"], top10:makeMockArtists("Electronic"), lastUpdated: new Date() },
  { genre:"Pop",        color:GENRE_COLORS["Pop"],        top10:makeMockArtists("Pop"),        lastUpdated: new Date() },
  { genre:"Jazz",       color:GENRE_COLORS["Jazz"],       top10:makeMockArtists("Jazz"),       lastUpdated: new Date() },
  { genre:"Rock",       color:GENRE_COLORS["Rock"],       top10:makeMockArtists("Rock"),       lastUpdated: new Date() },
  { genre:"Soul",       color:GENRE_COLORS["Soul"],       top10:makeMockArtists("Soul"),       lastUpdated: new Date() },
];

// Blackbox: replace with GET /api/rankings/genres
export async function fetchGenreRankings(): Promise<GenreRankingFeed[]> {
  try {
    // const res = await fetch("/api/rankings/genres");
    // return await res.json();
    return GENRE_RANKING_FALLBACK;
  } catch {
    return GENRE_RANKING_FALLBACK;
  }
}

export async function fetchTopArtistForGenre(genre: string): Promise<GenreRankingItem | null> {
  const feeds = await fetchGenreRankings();
  const feed = feeds.find(f => f.genre === genre);
  return feed?.top10[0] ?? null;
}
