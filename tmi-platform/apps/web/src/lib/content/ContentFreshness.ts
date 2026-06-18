/**
 * ContentFreshness — Rule 11 (Content Freshness Priority)
 *
 * Every homepage surface must sort content in this order:
 *   LIVE → RECENT → POPULAR → ARCHIVE
 *
 * This prevents old content from burying new creators.
 * New performers must always be able to surface.
 */

export type FreshnessScore = 'live' | 'recent' | 'popular' | 'archive';

const FRESHNESS_WEIGHT: Record<FreshnessScore, number> = {
  live:    1000,
  recent:  100,
  popular: 10,
  archive: 1,
};

const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

/** Compute the freshness category for an item with a timestamp and live flag */
export function getFreshnessScore(opts: {
  isLive?: boolean;
  publishedAt?: string | Date;
  engagementScore?: number;
}): FreshnessScore {
  if (opts.isLive) return 'live';
  if (opts.publishedAt) {
    const age = Date.now() - new Date(opts.publishedAt).getTime();
    if (age < RECENT_WINDOW_MS) return 'recent';
  }
  if (opts.engagementScore !== undefined && opts.engagementScore >= 1000) return 'popular';
  return 'archive';
}

/** Sort any array of items by the LIVE → RECENT → POPULAR → ARCHIVE priority */
export function sortByFreshness<T>(
  items: T[],
  getOpts: (item: T) => { isLive?: boolean; publishedAt?: string | Date; engagementScore?: number }
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = FRESHNESS_WEIGHT[getFreshnessScore(getOpts(a))];
    const scoreB = FRESHNESS_WEIGHT[getFreshnessScore(getOpts(b))];
    if (scoreB !== scoreA) return scoreB - scoreA;
    // Tiebreak: newer publishedAt wins
    const aDate = getOpts(a).publishedAt ? new Date(getOpts(a).publishedAt!).getTime() : 0;
    const bDate = getOpts(b).publishedAt ? new Date(getOpts(b).publishedAt!).getTime() : 0;
    return bDate - aDate;
  });
}

// ── Pre-wired helpers for common registry types ───────────────────────────────

import type { PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import type { MagazineArticle } from '@/lib/magazine/magazineIssueData';

/** Sort performers: live performers first, then by XP (proxy for popularity) */
export function sortPerformersByFreshness(performers: PerformerIdentity[]): PerformerIdentity[] {
  return sortByFreshness(performers, p => ({
    isLive: p.isLive,
    engagementScore: p.xp / 100,
  }));
}

/** Sort articles: breaking/recent first, then by implied engagement */
export function sortArticlesByFreshness(articles: MagazineArticle[]): MagazineArticle[] {
  return sortByFreshness(articles, a => ({
    publishedAt: a.publishedAt,
  }));
}

/**
 * Home surface labels matching the freshness tiers.
 * Used for section headings on Home 1, 2, 3.
 */
export const FRESHNESS_LABELS: Record<string, Record<FreshnessScore, string>> = {
  performers: {
    live:    'LIVE NOW',
    recent:  'RECENTLY ACTIVE',
    popular: 'MOST POPULAR',
    archive: 'LEGENDS',
  },
  articles: {
    live:    'BREAKING',
    recent:  'LATEST STORIES',
    popular: 'MOST READ',
    archive: 'ARCHIVE ISSUES',
  },
  rooms: {
    live:    'LIVE ROOMS',
    recent:  'STARTING SOON',
    popular: 'TRENDING',
    archive: 'PAST HIGHLIGHTS',
  },
};
