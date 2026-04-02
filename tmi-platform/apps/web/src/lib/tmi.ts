/**
 * tmi.ts — Central typed API client for TMI platform
 * Server-side fetch only (use in Server Components and Route Handlers)
 */

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  if (!res.ok) {
    throw new Error(`TMI API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface LatestArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null } | null;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  venueName: string | null;
  status: string;
  artistUserId: string | null;
}

export interface ActiveContest {
  id: string;
  name: string;
  status: string;
  endsAt: string | null;
  prizePool: number | null;
  rounds: Array<{ id: string; name: string }>;
  prizes: Array<{ id: string; rank: number; label: string; value: number | null }>;
}

export interface SponsorPackage {
  id: string;
  label: string;
  packageType: string;
  tier: string;
  price: number;
  description: string | null;
  benefits: unknown;
  isActive: boolean;
}

export interface NewRelease {
  id: string;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  previewUrl: string;
  basicPrice: number;
  playCount: number;
  createdAt: string;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const tmi = {
  artists: {
    trending: (limit = 20) =>
      apiFetch<TrendingArtist[]>(`/artist/trending?limit=${limit}`),
    bySlug: (slug: string) =>
      apiFetch<Record<string, unknown>>(`/artist/${slug}`),
    all: (limit = 50) =>
      apiFetch<TrendingArtist[]>(`/artist?limit=${limit}`),
  },

  articles: {
    latest: (limit = 10) =>
      apiFetch<LatestArticle[]>(`/editorial/articles/latest?limit=${limit}`),
    bySlug: (slug: string) =>
      apiFetch<Record<string, unknown>>(`/editorial/articles/slug/${slug}`),
  },

  events: {
    upcoming: (limit = 10) =>
      apiFetch<UpcomingEvent[]>(`/events/upcoming?limit=${limit}`),
    all: () => apiFetch<UpcomingEvent[]>(`/events`),
  },

  contest: {
    active: () => apiFetch<ActiveContest | null>(`/contest/seasons/active`),
    leaderboard: () =>
      apiFetch<Record<string, unknown>>(`/contest/leaderboard`),
  },

  sponsors: {
    active: () => apiFetch<SponsorPackage[]>(`/sponsors/active`),
    all: () => apiFetch<SponsorPackage[]>(`/sponsors`),
  },

  releases: {
    new: (limit = 6) =>
      apiFetch<NewRelease[]>(`/search?q=&type=beats&page=1`).then((data) => {
        const arr = (data as { beats?: NewRelease[] }).beats ?? [];
        return arr.slice(0, limit);
      }),
  },
};
