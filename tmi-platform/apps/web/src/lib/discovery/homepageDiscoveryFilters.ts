/**
 * Homepage DiscoveryBus filters — Home 1 Featured / Home 3 Mosaic / Home 5 Arena.
 * Real rooms only (Rule 20). Never fabricates tiles.
 */

import type { LiveDiscoveryCategory, LiveDiscoveryRecord } from "./LiveDiscoveryRecord";

export type HomepageDiscoverySurface = "home1_featured" | "home3_mosaic" | "home5_arena";

/** Featured showcase — concerts / trending live / premieres mix. Not every room. */
const HOME1_FEATURED_CATS: ReadonlySet<LiveDiscoveryCategory> = new Set([
  "concerts",
  "live_now",
  "dance",
  "djs",
  "videos",
  "listening",
]);

/** Global mosaic — social / lounges / fan lives / casual (exclude pure arena). */
const HOME3_MOSAIC_CATS: ReadonlySet<LiveDiscoveryCategory> = new Set([
  "fan_lobbies",
  "lounges",
  "listening",
  "comedy",
  "djs",
  "live_now",
  "dance",
  "videos",
  "new_empty",
  "worldwide",
  "concerts",
]);

/** Arena — battles, cyphers, challenges, competitions only. */
const HOME5_ARENA_CATS: ReadonlySet<LiveDiscoveryCategory> = new Set([
  "battles",
  "cyphers",
  "challenges",
  "games",
]);

const HOME5_EXCLUDE: ReadonlySet<LiveDiscoveryCategory> = new Set([
  "fan_lobbies",
  "lounges",
  "listening",
  "comedy",
]);

function recordMatches(
  record: LiveDiscoveryRecord,
  allowed: ReadonlySet<LiveDiscoveryCategory>,
): boolean {
  if (allowed.has(record.category)) return true;
  return record.categories.some((c) => allowed.has(c));
}

function scoreFeatured(r: LiveDiscoveryRecord): number {
  let score = r.humanViewerCount * 10;
  if (r.category === "concerts") score += 40;
  if (r.categories.includes("concerts")) score += 20;
  if (r.category === "live_now") score += 15;
  if (r.humanViewerCount >= 5) score += 25;
  if (r.isNewEmpty) score -= 10;
  // Prefer rooms with poster / preview for showcase quality
  if (r.posterUrl) score += 8;
  if (r.previewUrl) score += 5;
  return score;
}

function scoreMosaic(r: LiveDiscoveryRecord): number {
  let score = r.humanViewerCount * 8 + (Date.now() - r.startedAt < 30 * 60 * 1000 ? 20 : 0);
  if (r.category === "fan_lobbies" || r.category === "lounges") score += 18;
  if (r.isNewEmpty) score += 12; // surface open rooms for social discovery
  if (r.isAnchor) score += 30; // permanent 24/7 anchors always surface
  return score;
}

function scoreArena(r: LiveDiscoveryRecord): number {
  let score = r.humanViewerCount * 12;
  if (r.category === "battles") score += 50;
  if (r.category === "cyphers") score += 45;
  if (r.category === "challenges") score += 40;
  if (r.category === "games") score += 30;
  if (r.isAnchor) score += 30;
  return score;
}

export function filterForHomepageSurface(
  records: readonly LiveDiscoveryRecord[],
  surface: HomepageDiscoverySurface,
): LiveDiscoveryRecord[] {
  const live = records.filter((r) => r.isLive);

  if (surface === "home1_featured") {
    const pool = live.filter((r) => recordMatches(r, HOME1_FEATURED_CATS));
    // Cap pool — featured is curated, not the full wall
    return [...pool].sort((a, b) => scoreFeatured(b) - scoreFeatured(a)).slice(0, 12);
  }

  if (surface === "home3_mosaic") {
    const pool = live.filter((r) => {
      if (HOME5_ARENA_CATS.has(r.category)) return false;
      return recordMatches(r, HOME3_MOSAIC_CATS);
    });
    return [...pool].sort((a, b) => scoreMosaic(b) - scoreMosaic(a));
  }

  // home5_arena
  const pool = live.filter((r) => {
    if (HOME5_EXCLUDE.has(r.category)) return false;
    return recordMatches(r, HOME5_ARENA_CATS);
  });
  return [...pool].sort((a, b) => scoreArena(b) - scoreArena(a));
}

/**
 * Pick 3–4 rotating featured channel slots from the curated Home 1 pool.
 * `rotationOffset` advances when idle rotation ticks.
 */
export function pickFeaturedChannelSlots(
  records: readonly LiveDiscoveryRecord[],
  slotCount = 3,
  rotationOffset = 0,
): Array<LiveDiscoveryRecord | null> {
  const pool = filterForHomepageSurface(records, "home1_featured");
  const slots: Array<LiveDiscoveryRecord | null> = [];
  const n = Math.min(Math.max(slotCount, 3), 4);

  if (pool.length === 0) {
    for (let i = 0; i < n; i++) slots.push(null);
    return slots;
  }

  for (let i = 0; i < n; i++) {
    slots.push(pool[(rotationOffset + i) % pool.length]!);
  }
  return slots;
}

export const HOMEPAGE_SURFACE_COPY: Record<
  HomepageDiscoverySurface,
  { title: string; emptyTitle: string; emptyHint: string; goLiveHref: string; accent: string }
> = {
  home1_featured: {
    title: "FEATURED LIVE CHANNELS",
    emptyTitle: "Waiting for featured live…",
    emptyHint: "Go live publicly to appear in CH Featured.",
    goLiveHref: "/live/go",
    accent: "#00FFFF",
  },
  home3_mosaic: {
    title: "LIVE WORLD MOSAIC",
    emptyTitle: "Waiting for social lives…",
    emptyHint: "Lounges, fan lives, and casual streams appear here when live.",
    goLiveHref: "/live/go",
    accent: "#00FF88",
  },
  home5_arena: {
    title: "ARENA LIVE WALL",
    emptyTitle: "Waiting for next battle…",
    emptyHint: "Battles, cyphers, and challenges appear here when live.",
    goLiveHref: "/battles/lobby-wall",
    accent: "#FF2DAA",
  },
};
