// apps/api/src/engines/freshness.engine.ts
// Prevents the same content from appearing repeatedly.
// Keeps homepage, magazine, and feeds feeling fresh.

export interface FreshnessRule {
  entityType: 'article' | 'artist' | 'station' | 'ad' | 'sponsor' | 'game';
  surfaceId: string;          // which surface this rule applies to
  cooldownMinutes: number;    // min time before same entity appears again on this surface
  maxRepeatsPer24h: number;   // max times same entity can appear in 24 hours
  diversityMinimum: number;   // min unique entities before first can repeat (0 = no rule)
}

export const FRESHNESS_RULES: FreshnessRule[] = [
  // Homepage belts
  { entityType: 'article',  surfaceId: 'HOME_EDITORIAL', cooldownMinutes: 240, maxRepeatsPer24h: 1, diversityMinimum: 5 },
  { entityType: 'artist',   surfaceId: 'HOME_COVER',     cooldownMinutes: 168*60, maxRepeatsPer24h: 1, diversityMinimum: 9 }, // weekly
  { entityType: 'ad',       surfaceId: 'HOME_ADV_TILE_1', cooldownMinutes: 30, maxRepeatsPer24h: 8, diversityMinimum: 3 },
  { entityType: 'sponsor',  surfaceId: 'HOME_EDITORIAL_SPONSOR_STRIP', cooldownMinutes: 0, maxRepeatsPer24h: 99, diversityMinimum: 0 },

  // Magazine feeds
  { entityType: 'article',  surfaceId: 'MAGAZINE_FEATURED', cooldownMinutes: 60, maxRepeatsPer24h: 2, diversityMinimum: 4 },
  { entityType: 'article',  surfaceId: 'MAGAZINE_NEWS',     cooldownMinutes: 30, maxRepeatsPer24h: 3, diversityMinimum: 5 },

  // Artist discovery surfaces
  { entityType: 'artist',   surfaceId: 'LOBBY_WALL',         cooldownMinutes: 0, maxRepeatsPer24h: 99, diversityMinimum: 0 }, // always live, no cooldown
  { entityType: 'artist',   surfaceId: 'UNDISCOVERED_BOOST', cooldownMinutes: 24*60, maxRepeatsPer24h: 1, diversityMinimum: 1 },

  // Ad slots
  { entityType: 'ad',       surfaceId: 'ART_INLINE_1',    cooldownMinutes: 30, maxRepeatsPer24h: 6, diversityMinimum: 3 },
  { entityType: 'ad',       surfaceId: 'GAME_INTERMISSION', cooldownMinutes: 0, maxRepeatsPer24h: 4, diversityMinimum: 2 },
];

// Rotation memory interface (stored in Redis)
export interface RotationMemoryEntry {
  entityId: string;
  surfaceId: string;
  lastShownAt: Date;
  showCount24h: number;
}

// Rotation scoring — higher score = more likely to be shown next
export function scoreForRotation(
  entityId: string,
  surfaceId: string,
  memory: RotationMemoryEntry[],
  freshnessFactor: number = 1.0, // 0-1 from analytics (engagement rate)
): number {
  const entry = memory.find(m => m.entityId === entityId && m.surfaceId === surfaceId);
  if (!entry) return 100 * freshnessFactor; // Never shown = highest priority

  const rule = FRESHNESS_RULES.find(r => r.surfaceId === surfaceId);
  const minutesSinceShown = (Date.now() - entry.lastShownAt.getTime()) / 60000;
  const cooldownMet = !rule || minutesSinceShown >= rule.cooldownMinutes;
  const repeatLimitMet = !rule || entry.showCount24h < rule.maxRepeatsPer24h;

  if (!cooldownMet || !repeatLimitMet) return 0; // Blocked by rule

  // Higher score for content shown less recently
  const recencyScore = Math.min(minutesSinceShown / (rule?.cooldownMinutes || 60), 5);
  return recencyScore * freshnessFactor * 100;
}
