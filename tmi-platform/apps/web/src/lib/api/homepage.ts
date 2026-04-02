// Typed API service layer for homepage data
// All fetches go through Next.js route handlers (which proxy to the NestJS API)
// Falls back gracefully — components use static stubs until data arrives

export interface TrendingArtist {
  id: string;
  slug: string | null;
  stageName: string;
  genres: string[];
  followers: number;
  views: number;
  verified: boolean;
  image: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  author?: { name: string } | null;
  category?: string | null;
  tags?: string[];
}

export interface LiveEvent {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  venue?: string | null;
  coverImage?: string | null;
  eventType?: string | null;
  hostName?: string | null;
}

export interface SponsorPackage {
  id: string;
  name: string;
  tier?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
}

export interface ContestSeason {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  prizePool?: string | null;
  prizes?: Array<{ place: string; prize: string }>;
}

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export interface ChartEntry {
  id: string;
  rank: number;
  slug: string | null;
  stageName: string;
  genres: string[];
  followers: number;
  views: number;
  verified: boolean;
  image: string | null;
}

export interface BeatRelease {
  id: string;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  previewUrl: string;
  playCount: number;
  createdAt: string;
}

export const fetchTrendingArtists = (limit = 8) =>
  get<TrendingArtist[]>(`/api/homepage/trending-artists?limit=${limit}`);

export const fetchLatestArticles = (limit = 6) =>
  get<Article[]>(`/api/homepage/latest-articles?limit=${limit}`);

export const fetchActiveSponsors = () =>
  get<SponsorPackage[]>(`/api/homepage/sponsors`);

export const fetchUpcomingEvents = (limit = 4) =>
  get<LiveEvent[]>(`/api/homepage/events?limit=${limit}`);

export const fetchActiveSeason = () =>
  get<ContestSeason>(`/api/homepage/contest`);

export const fetchTop10 = (limit = 10) =>
  get<ChartEntry[]>(`/api/homepage/top10?limit=${limit}`);

export const fetchNewReleases = (limit = 6) =>
  get<BeatRelease[]>(`/api/homepage/new-releases?limit=${limit}`);

export const fetchFeaturedArtist = () =>
  get<TrendingArtist>(`/api/homepage/featured-artist`);

/** Format raw follower/stream count to short string e.g. "2.4M", "940K" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
