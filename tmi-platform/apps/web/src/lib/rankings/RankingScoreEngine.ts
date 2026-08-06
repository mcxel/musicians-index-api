/**
 * TMI Championship Ranking Score Engine
 * ======================================
 * Rule 3: Rankings are XP-driven, never manual.
 * Rule 20: No fake data — every number comes from a real DB field.
 *
 * Three Pillars (as specified by Marcel Dickens):
 *   1. Competition Performance  (30%) — battles, cyphers, achievements, live
 *   2. Creator Business         (25%) — commerce, sales, merch, rewards
 *   3. Fan Engagement           (25%) — tips, fan club, shares, community
 *   4. Consistent Activity      (20%) — broad platform XP (login, posts, streams)
 *
 * Confidence Score — how many pillars have verified, non-zero activity.
 * Ranking Score    — 0–1000 integer, normalized within population.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type RankingCategory =
  | 'overall'
  | 'singer'
  | 'rapper'
  | 'producer'
  | 'beat_producer'
  | 'dj'
  | 'dancer'
  | 'comedian'
  | 'band'
  | 'battle_champion'
  | 'cypher_champion'
  | 'challenge_champion'
  | 'dance_champion'
  | 'live_performer'
  | 'songwriter'
  | 'fastest_rising'
  | 'fan_favorite'
  | 'commerce_leader'
  | 'magazine_leader'
  | 'community_leader';

export type GeoScope = 'city' | 'state' | 'country' | 'global';

export type RankingPeriod = 'today' | 'week' | 'month' | 'year' | 'alltime';

export type ConfidenceLevel = 'High' | 'Solid' | 'Moderate' | 'Low' | 'Unverified';

/** Raw numbers pulled from the DB for a single performer */
export interface PerformerMetrics {
  userId:          string;
  xp:              number;   // UserStats.xp — overall activity
  engagementPoints: number;  // UserStats.engagementPoints — tips, fan club, shares
  achievementPts:  number;   // UserStats.achievementPts — competitions, wins
  rewardPoints:    number;   // UserStats.rewardPoints — commerce, sales
  followers:       number;   // ArtistProfile.followers — growth velocity
  accountAgeDays:  number;   // days since User.createdAt — used for rising calc
  lastActiveDays:  number;   // days since UserStats.updatedAt — recency check
  genres:          string[]; // ArtistProfile.genres — category matching
  city?:           string;
  state?:          string;
  country?:        string;
  displayName?:    string;
  avatarUrl?:      string;
  stageName?:      string;
}

/** Category-specific pillar weights (must sum to 1.0) */
export interface PillarWeights {
  competition: number; // achievementPts
  commerce:    number; // rewardPoints
  engagement:  number; // engagementPoints
  activity:    number; // xp
}

/** Computed score for a performer */
export interface RankingScore {
  userId:           string;
  rawScore:         number;   // 0–1000
  pillarScores: {
    competition: number;
    commerce:    number;
    engagement:  number;
    activity:    number;
  };
  confidence:       ConfidenceLevel;
  confidenceFactors: string[]; // which pillars are verified
  risingScore:      number;    // normalized 0–100 for Fastest Rising
}

// ── Category weights ───────────────────────────────────────────────────────

const CATEGORY_WEIGHTS: Record<RankingCategory, PillarWeights> = {
  overall:           { competition: 0.30, commerce: 0.25, engagement: 0.25, activity: 0.20 },
  singer:            { competition: 0.25, commerce: 0.20, engagement: 0.35, activity: 0.20 },
  rapper:            { competition: 0.40, commerce: 0.20, engagement: 0.25, activity: 0.15 },
  producer:          { competition: 0.20, commerce: 0.45, engagement: 0.15, activity: 0.20 },
  beat_producer:     { competition: 0.15, commerce: 0.50, engagement: 0.15, activity: 0.20 },
  dj:                { competition: 0.20, commerce: 0.25, engagement: 0.35, activity: 0.20 },
  dancer:            { competition: 0.45, commerce: 0.10, engagement: 0.30, activity: 0.15 },
  comedian:          { competition: 0.30, commerce: 0.15, engagement: 0.40, activity: 0.15 },
  band:              { competition: 0.30, commerce: 0.30, engagement: 0.25, activity: 0.15 },
  battle_champion:   { competition: 0.65, commerce: 0.10, engagement: 0.15, activity: 0.10 },
  cypher_champion:   { competition: 0.60, commerce: 0.05, engagement: 0.20, activity: 0.15 },
  challenge_champion:{ competition: 0.55, commerce: 0.10, engagement: 0.20, activity: 0.15 },
  dance_champion:    { competition: 0.55, commerce: 0.10, engagement: 0.25, activity: 0.10 },
  live_performer:    { competition: 0.25, commerce: 0.20, engagement: 0.30, activity: 0.25 },
  songwriter:        { competition: 0.20, commerce: 0.35, engagement: 0.25, activity: 0.20 },
  fastest_rising:    { competition: 0.20, commerce: 0.20, engagement: 0.20, activity: 0.40 },
  fan_favorite:      { competition: 0.10, commerce: 0.10, engagement: 0.65, activity: 0.15 },
  commerce_leader:   { competition: 0.10, commerce: 0.70, engagement: 0.10, activity: 0.10 },
  magazine_leader:   { competition: 0.25, commerce: 0.25, engagement: 0.30, activity: 0.20 },
  community_leader:  { competition: 0.10, commerce: 0.10, engagement: 0.50, activity: 0.30 },
};

// ── Core scoring logic ─────────────────────────────────────────────────────

/**
 * Normalize a value 0–1000 relative to the population max.
 * Returns 0 if max is 0 (no one has any activity).
 */
function normalize(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(1000, Math.round((value / max) * 1000));
}

/**
 * Compute confidence level and verified factors from pillar raw values.
 * A pillar is "verified" when its raw value > 0.
 */
function computeConfidence(
  m: PerformerMetrics,
): { level: ConfidenceLevel; factors: string[] } {
  const factors: string[] = [];
  if (m.achievementPts > 0)  factors.push('Competition Results');
  if (m.rewardPoints > 0)    factors.push('Commerce Activity');
  if (m.engagementPoints > 0) factors.push('Fan Engagement');
  if (m.xp > 100)            factors.push('Verified Platform Activity');
  if (m.followers > 0)       factors.push('Growth Velocity');

  const score = factors.length;
  let level: ConfidenceLevel;
  if      (score >= 4) level = 'High';
  else if (score === 3) level = 'Solid';
  else if (score === 2) level = 'Moderate';
  else if (score === 1) level = 'Low';
  else                  level = 'Unverified';

  return { level, factors };
}

/**
 * Compute rising score (0–100):
 * Boosts newer accounts that have high XP for their age.
 * xp / (accountAgeDays + 1) = xp per day, normalized vs population.
 */
function computeRisingScore(m: PerformerMetrics, maxXpPerDay: number): number {
  const xpPerDay = m.xp / (m.accountAgeDays + 1);
  return normalize(xpPerDay, maxXpPerDay) / 10; // 0–100
}

/**
 * Score a full population for a given category.
 * Returns scored array sorted descending (rank 1 = index 0).
 */
export function scorePopulation(
  performers:  PerformerMetrics[],
  category:    RankingCategory = 'overall',
): (PerformerMetrics & RankingScore)[] {
  const weights = CATEGORY_WEIGHTS[category] ?? CATEGORY_WEIGHTS.overall;

  // Population maxes for normalization
  const maxAchievement  = Math.max(1, ...performers.map(p => p.achievementPts));
  const maxReward       = Math.max(1, ...performers.map(p => p.rewardPoints));
  const maxEngagement   = Math.max(1, ...performers.map(p => p.engagementPoints));
  const maxXP           = Math.max(1, ...performers.map(p => p.xp));
  const maxXpPerDay     = Math.max(1, ...performers.map(p => p.xp / (p.accountAgeDays + 1)));

  return performers
    .map(m => {
      const normCompetition = normalize(m.achievementPts,  maxAchievement);
      const normCommerce    = normalize(m.rewardPoints,     maxReward);
      const normEngagement  = normalize(m.engagementPoints, maxEngagement);
      const normActivity    = normalize(m.xp,               maxXP);

      const rawScore = Math.round(
        normCompetition * weights.competition +
        normCommerce    * weights.commerce    +
        normEngagement  * weights.engagement  +
        normActivity    * weights.activity,
      );

      const { level: confidence, factors: confidenceFactors } = computeConfidence(m);
      const risingScore = computeRisingScore(m, maxXpPerDay);

      return {
        ...m,
        userId:    m.userId,
        rawScore,
        pillarScores: {
          competition: normCompetition,
          commerce:    normCommerce,
          engagement:  normEngagement,
          activity:    normActivity,
        },
        confidence,
        confidenceFactors,
        risingScore,
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);
}

/**
 * Find a user's rank position (1-based) in a pre-sorted scored array.
 * Returns total+1 if not found (new entrant at the bottom).
 */
export function findRank(
  scored: { userId: string }[],
  userId: string,
): number {
  const idx = scored.findIndex(s => s.userId === userId);
  return idx === -1 ? scored.length + 1 : idx + 1;
}

/**
 * Filter a metric array to a geo scope.
 */
export function filterByGeo(
  performers: PerformerMetrics[],
  scope: GeoScope,
  geoValues: { city?: string; state?: string; country?: string },
): PerformerMetrics[] {
  if (scope === 'global') return performers;

  return performers.filter(p => {
    const match = (a?: string, b?: string) =>
      !!a && !!b && a.toLowerCase() === b.toLowerCase();

    if (scope === 'city')    return match(p.city,    geoValues.city);
    if (scope === 'state')   return match(p.state,   geoValues.state);
    if (scope === 'country') return match(p.country, geoValues.country);
    return true;
  });
}

/**
 * Check if a category is genre-based (vs activity-based).
 * Genre categories filter by artistProfile.genres.
 */
export const GENRE_CATEGORIES: Record<string, string> = {
  singer:       'Singer',
  rapper:       'Rapper',
  producer:     'Producer',
  beat_producer: 'Beat Producer',
  dj:           'DJ',
  dancer:       'Dancer',
  comedian:     'Comedian',
  band:         'Band',
  songwriter:   'Songwriter',
};

export const ACTIVITY_CATEGORIES: RankingCategory[] = [
  'battle_champion',
  'cypher_champion',
  'challenge_champion',
  'dance_champion',
  'live_performer',
  'fastest_rising',
  'fan_favorite',
  'commerce_leader',
  'magazine_leader',
  'community_leader',
];

export const ALL_CATEGORIES: RankingCategory[] = [
  'overall',
  ...Object.keys(GENRE_CATEGORIES) as RankingCategory[],
  ...ACTIVITY_CATEGORIES,
];

/**
 * Category-specific pre-filter: genre categories filter performers by genre.
 * Activity categories use all performers (weights do the differentiation).
 */
export function filterByCategory(
  performers: PerformerMetrics[],
  category: RankingCategory,
): PerformerMetrics[] {
  const genreLabel = GENRE_CATEGORIES[category];
  if (!genreLabel) return performers; // activity category — no pre-filter

  return performers.filter(p =>
    p.genres.some(g => g.toLowerCase() === genreLabel.toLowerCase()),
  );
}

/**
 * Pillar names for display on the UI.
 */
export const PILLAR_LABELS = {
  competition: 'Competition Performance',
  commerce:    'Creator Business',
  engagement:  'Fan Engagement',
  activity:    'Consistent Activity',
} as const;

/**
 * Pillar descriptions for the UI tooltip / explanation.
 */
export const PILLAR_DESCRIPTIONS = {
  competition: 'Battle wins, cypher placements, challenge results, tournament finishes',
  commerce:    'Album sales, beat licensing, merch, tickets, membership growth',
  engagement:  'Fan tips, fan club members, shares, community participation',
  activity:    'Daily platform use, live rooms, streaming, commenting, discovery',
} as const;
