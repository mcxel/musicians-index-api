/**
 * RankingXPPositionEngine.ts
 *
 * Manages XP position and ranking movement across all chart types.
 * Tracks: country rank, global rank, genre rank, movement direction, progression.
 * Purpose: Show artists their path from local → national → global.
 */

export interface RankingPosition {
  positionId: string;
  artistId: string;
  displayName: string;
  countryCode: string;
  countryRank: number;
  globalRank?: number;
  genreRank?: number;
  totalXP: number;
  rankingHistory: Array<{
    timestamp: number;
    countryRank: number;
    globalRank?: number;
    genreRank?: number;
    totalXP: number;
  }>;
  lastUpdated: number;
}

export interface RankingProgression {
  artistId: string;
  currentLevel: 'emerging' | 'regional' | 'national' | 'global';
  progressionPercentage: number; // 0-100
  nextMilestoneXP: number;
  xpToNextLevel: number;
  estimatedDaysToNextLevel: number;
}

export interface RankingMovement {
  movementId: string;
  artistId: string;
  countryCode: string;
  direction: 'up' | 'down' | 'stable';
  rankMovement: number; // how many positions
  xpGainedInPeriod: number;
  periodLength: number; // days
  velocityXPPerDay: number;
}

// In-memory registries
const rankingPositions = new Map<string, RankingPosition>();
const rankingProgressions = new Map<string, RankingProgression>();
const rankingMovements = new Map<string, RankingMovement>();
let positionCounter = 0;

/**
 * Records ranking position for artist.
 */
export function recordRankingPosition(input: {
  artistId: string;
  displayName: string;
  countryCode: string;
  countryRank: number;
  globalRank?: number;
  genreRank?: number;
  totalXP: number;
}): string {
  const positionId = `position-${positionCounter++}`;

  let position = rankingPositions.get(input.artistId);

  if (!position) {
    position = {
      positionId,
      artistId: input.artistId,
      displayName: input.displayName,
      countryCode: input.countryCode,
      countryRank: input.countryRank,
      globalRank: input.globalRank,
      genreRank: input.genreRank,
      totalXP: input.totalXP,
      rankingHistory: [],
      lastUpdated: Date.now(),
    };
  } else {
    position.countryRank = input.countryRank;
    position.globalRank = input.globalRank;
    position.genreRank = input.genreRank;
    position.totalXP = input.totalXP;
    position.lastUpdated = Date.now();
  }

  // Add to history
  position.rankingHistory.push({
    timestamp: Date.now(),
    countryRank: input.countryRank,
    globalRank: input.globalRank,
    genreRank: input.genreRank,
    totalXP: input.totalXP,
  });

  // Trim history to last 90 days of records
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  position.rankingHistory = position.rankingHistory.filter((h) => h.timestamp > ninetyDaysAgo);

  rankingPositions.set(input.artistId, position);

  return positionId;
}

/**
 * Calculates ranking progression level.
 */
export function calculateProgressionLevel(artistId: string): RankingProgression | null {
  const position = rankingPositions.get(artistId);
  if (!position) return null;

  // Define progression thresholds
  const thresholds = {
    emerging: { minXP: 0, maxXP: 1000 },
    regional: { minXP: 1000, maxXP: 5000 },
    national: { minXP: 5000, maxXP: 20000 },
    global: { minXP: 20000, maxXP: Infinity },
  };

  let currentLevel: 'emerging' | 'regional' | 'national' | 'global' = 'emerging';

  if (position.totalXP >= thresholds.global.minXP) {
    currentLevel = 'global';
  } else if (position.totalXP >= thresholds.national.minXP) {
    currentLevel = 'national';
  } else if (position.totalXP >= thresholds.regional.minXP) {
    currentLevel = 'regional';
  }

  const levelThreshold = thresholds[currentLevel];
  const nextLevelEntry = Object.entries(thresholds).find((e) => e[1].minXP > levelThreshold.minXP);
  const nextMilestoneXP = nextLevelEntry ? nextLevelEntry[1].minXP : Infinity;

  const xpInCurrentLevel = position.totalXP - levelThreshold.minXP;
  const xpNeededForLevel = nextMilestoneXP - levelThreshold.minXP;
  const progressionPercentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

  const xpToNextLevel = nextMilestoneXP - position.totalXP;

  // Estimate velocity (XP per day over last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentHistory = position.rankingHistory.filter((h) => h.timestamp > sevenDaysAgo);

  let velocityXPPerDay = 0;
  if (recentHistory.length > 1) {
    const oldestXP = recentHistory[0].totalXP;
    const newestXP = recentHistory[recentHistory.length - 1].totalXP;
    const daysPassed = 7;
    velocityXPPerDay = (newestXP - oldestXP) / daysPassed;
  }

  const estimatedDaysToNextLevel =
    velocityXPPerDay > 0 ? Math.ceil(xpToNextLevel / velocityXPPerDay) : 999;

  const progression: RankingProgression = {
    artistId,
    currentLevel,
    progressionPercentage,
    nextMilestoneXP,
    xpToNextLevel,
    estimatedDaysToNextLevel,
  };

  rankingProgressions.set(artistId, progression);
  return progression;
}

/**
 * Calculates ranking movement.
 */
export function calculateRankingMovement(
  artistId: string,
  periodDays: number = 7
): RankingMovement | null {
  const position = rankingPositions.get(artistId);
  if (!position) return null;

  const periodStartTime = Date.now() - periodDays * 24 * 60 * 60 * 1000;

  // Find position at start of period
  const historyAtStart = position.rankingHistory.find((h) => h.timestamp >= periodStartTime);
  if (!historyAtStart) return null;

  const currentPosition = position.rankingHistory[position.rankingHistory.length - 1];

  const rankMovement = historyAtStart.countryRank - currentPosition.countryRank;
  const xpGained = currentPosition.totalXP - historyAtStart.totalXP;
  const velocityXPPerDay = xpGained / periodDays;

  const movementId = `movement-${artistId}-${Date.now()}`;

  const movement: RankingMovement = {
    movementId,
    artistId,
    countryCode: position.countryCode,
    direction: rankMovement > 0 ? 'up' : rankMovement < 0 ? 'down' : 'stable',
    rankMovement: Math.abs(rankMovement),
    xpGainedInPeriod: xpGained,
    periodLength: periodDays,
    velocityXPPerDay,
  };

  rankingMovements.set(movementId, movement);
  return movement;
}

/**
 * Gets ranking position (non-mutating).
 */
export function getRankingPosition(artistId: string): RankingPosition | null {
  return rankingPositions.get(artistId) ?? null;
}

/**
 * Gets ranking progression (non-mutating).
 */
export function getRankingProgression(artistId: string): RankingProgression | null {
  return rankingProgressions.get(artistId) ?? null;
}

/**
 * Lists artists by progression level.
 */
export function listArtistsByProgressionLevel(
  level: 'emerging' | 'regional' | 'national' | 'global'
): RankingPosition[] {
  const progressions = Array.from(rankingProgressions.values()).filter(
    (p) => p.currentLevel === level
  );
  return progressions
    .map((p) => rankingPositions.get(p.artistId))
    .filter((p) => p !== undefined) as RankingPosition[];
}

/**
 * Gets top movers (artists moving up fastest).
 */
export function getTopMovers(limit: number = 10): RankingMovement[] {
  return Array.from(rankingMovements.values())
    .filter((m) => m.direction === 'up')
    .sort((a, b) => b.rankMovement - a.rankMovement)
    .slice(0, limit);
}

/**
 * Gets ranking report (admin).
 */
export function getRankingReport(): {
  totalArtistsTracked: number;
  byLevel: Record<string, number>;
  averageXPPerArtist: number;
  topMovers: RankingMovement[];
  onGlobalTrack: number;
} {
  const positions = Array.from(rankingPositions.values());
  const progressions = Array.from(rankingProgressions.values());

  const byLevel: Record<string, number> = {
    emerging: 0,
    regional: 0,
    national: 0,
    global: 0,
  };

  progressions.forEach((p) => {
    byLevel[p.currentLevel] += 1;
  });

  const totalXP = positions.reduce((sum, p) => sum + p.totalXP, 0);
  const averageXPPerArtist = positions.length > 0 ? Math.round(totalXP / positions.length) : 0;

  return {
    totalArtistsTracked: positions.length,
    byLevel,
    averageXPPerArtist,
    topMovers: getTopMovers(5),
    onGlobalTrack: byLevel['global'] + byLevel['national'],
  };
}
