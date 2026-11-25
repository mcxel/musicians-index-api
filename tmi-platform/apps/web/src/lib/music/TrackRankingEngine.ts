/**
 * TrackRankingEngine — client-safe pure TRACK/SONG ranking math + types.
 *
 * Durable PlayReceipt reads live in TrackRankingPersistence.ts (server-only).
 * Do not re-introduce prisma into this module.
 */

import type { MusicPrimaryGenreId } from "@/lib/music/MusicGenreTaxonomy";

export type TrackRankingWindowType = "ALL_TIME" | "ROLLING_30_DAY";

export type TrackRankingScope =
  | { kind: "GLOBAL" }
  | { kind: "GENRE"; genre: MusicPrimaryGenreId };

export interface TrackRankingAggregate {
  mediaId: string;
  mediaType: string;
  creatorId: string;
  qualifiedPlays: number;
  uniqueQualifiedListeners: number;
}

export interface TrackRankingEntry extends TrackRankingAggregate {
  score: number;
  rank: number;
}

export const ROLLING_WINDOW_DAYS = 30;

export const TRACK_RANKING_LIMITS = {
  TOP_10: 10,
  TOP_50: 50,
  TOP_100: 100,
} as const;

/** Pure v1 scoring law — see historical file header. Never reads boost/campaign state. */
export function computeTrackRankingScore(
  qualifiedPlays: number,
  uniqueQualifiedListeners: number,
): number {
  return qualifiedPlays + 2 * uniqueQualifiedListeners;
}

/**
 * Pure score + deterministic sort + truthful slice.
 */
export function rankTrackAggregates(
  aggregates: TrackRankingAggregate[],
  limit: number,
): TrackRankingEntry[] {
  const scored: TrackRankingEntry[] = aggregates.map((a) => ({
    ...a,
    score: computeTrackRankingScore(a.qualifiedPlays, a.uniqueQualifiedListeners),
    rank: 0,
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.uniqueQualifiedListeners !== a.uniqueQualifiedListeners) {
      return b.uniqueQualifiedListeners - a.uniqueQualifiedListeners;
    }
    if (b.qualifiedPlays !== a.qualifiedPlays) return b.qualifiedPlays - a.qualifiedPlays;
    return a.mediaId < b.mediaId ? -1 : a.mediaId > b.mediaId ? 1 : 0;
  });

  return scored.slice(0, Math.max(0, limit)).map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function windowStartDate(
  window: TrackRankingWindowType,
  now: number = Date.now(),
): Date | undefined {
  if (window === "ALL_TIME") return undefined;
  return new Date(now - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Server DB reads live in `@/lib/music/TrackRankingPersistence` (server-only).
 * Import getTrackRanking / fetchRankingAggregates / resolveMediaGenres from there
 * in API routes and RSC — never from client components.
 */
