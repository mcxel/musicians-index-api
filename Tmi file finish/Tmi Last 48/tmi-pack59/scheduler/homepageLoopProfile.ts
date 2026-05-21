// apps/web/src/engines/homepage/homepageLoopProfile.ts
// Timing constants and loop profiles for the homepage scheduler.

export const TIMING = {
  // Scene durations (min/max in milliseconds)
  GENRE_CLUSTER:      { min: 70000,  max: 95000  },  // 70-95s
  CROWN_TOP10:        { min: 55000,  max: 80000  },  // 55-80s
  MAGAZINE_INSERT:    { min: 120000, max: 180000 },  // 2-3 min ← identity segment
  SHOW_GAME:          { min: 35000,  max: 60000  },  // 35-60s
  BRIDGE:             { min: 20000,  max: 30000  },  // 20-30s
  LIVE_URGENT:        { min: 60000,  max: 120000 },  // 1-2 min
  CYPHER_BATTLE:      { min: 40000,  max: 65000  },  // 40-65s
  WINNER_REVEAL:      { min: 45000,  max: 70000  },  // 45-70s
  SPONSOR_CTA:        { min: 25000,  max: 40000  },  // 25-40s
  JOIN_CTA:           { min: 20000,  max: 35000  },  // 20-35s
} as const;

// Artist card timing on Homepage 1
export const ARTIST_CLIP_TIMING = {
  RANK_2_TO_10: { min: 2800,  max: 4200  },  // 2.8-4.2s excerpts
  RANK_1_CROWN: { min: 5200,  max: 6800  },  // 5.2-6.8s excerpts
  DEFAULT_RANK: 3400,   // fallback target
  DEFAULT_CROWN: 5900,  // fallback target
} as const;

// Magazine segment internal timing (runs inside the 2-3 min magazine scene)
export const MAGAZINE_SEGMENT_TIMING = {
  COVER_REVEAL:     { min: 12000, max: 18000 },  // 12-18s
  ARTICLE_SPREAD:   { min: 18000, max: 28000 },  // 18-28s
  FEATURE_ARTIST:   { min: 15000, max: 25000 },  // 15-25s
  ISSUE_CTA:        { min: 8000,  max: 12000 },  // 8-12s
  SECOND_SPREAD:    { min: 15000, max: 25000 },  // 15-25s (optional)
} as const;

// Genre rotation: which genre combo shows per cycle
// Varies so same pairs don't always appear together
export const GENRE_ROTATION_SETS = [
  ["Hip Hop", "R&B"],
  ["Hip Hop", "Electronic", "Pop"],
  ["Jazz", "Soul"],
  ["Rock", "Hip Hop"],
  ["R&B", "Electronic", "Pop"],
  ["Jazz", "Rock", "R&B"],
  ["Hip Hop", "Soul", "Pop"],
  ["Electronic", "Jazz"],
] as const;

export const LOOP_PROFILES = {
  standard: { loopDurationTarget: 8.5 * 60 * 1000 },   // 8.5 min
  extended: { loopDurationTarget: 10.5 * 60 * 1000 },  // 10.5 min
} as const;
