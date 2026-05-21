// packages/freshness-engine/src/freshness.engine.ts
// Platform Law #15: Prevents content repeating on same surface

export interface FreshnessRecord {
  contentId: string;
  contentType: "article" | "artist" | "event" | "room" | "item";
  surfaceId: string;      // which belt/zone showed this
  userId?: string;        // null = global freshness (platform-wide)
  shownAt: Date;
  shownCount: number;
}

// Score 0-100: 0 = very fresh (never shown), 100 = stale (shown many times)
export function calculateFreshnessScore(
  record: FreshnessRecord | null,
  contentPublishedAt: Date
): number {
  if (!record) return 0; // never shown = maximally fresh

  const hoursSinceShown = (Date.now() - record.shownAt.getTime()) / (1000 * 60 * 60);
  const hoursSincePublished = (Date.now() - contentPublishedAt.getTime()) / (1000 * 60 * 60);

  // Older content that's been shown recently = very stale
  let score = Math.min(100, record.shownCount * 15);
  // Recent content recovers freshness quickly
  if (hoursSincePublished < 24) score = Math.max(0, score - 30); // new content gets bonus
  // Time since shown reduces staleness
  if (hoursSinceShown > 48) score = Math.max(0, score - 20);  // 2+ days ago = less stale
  if (hoursSinceShown > 168) score = Math.max(0, score - 40); // 1+ week ago = mostly fresh again

  return Math.round(score);
}

export const FRESHNESS_THRESHOLDS = {
  MAX_SAME_SURFACE_IN_24H:     1,   // same content max 1× per surface per day
  MAX_GLOBAL_SHOWS_PER_WEEK:   3,   // same content max 3× platform-wide per week
  EDITORIAL_BELT_COOLDOWN_H:   6,   // hours between same article on editorial
  DISCOVERY_BELT_COOLDOWN_H:   12,  // hours between same artist on discovery belt
  LOBBY_WALL_COOLDOWN_MINS:    30,  // mins before same room shown again to same user
} as const;
