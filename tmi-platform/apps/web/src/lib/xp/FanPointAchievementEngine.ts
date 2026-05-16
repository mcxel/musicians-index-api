/**
 * FanPointAchievementEngine.ts
 *
 * Tracks achievements unlocked through fan points accumulation and spending.
 * Purpose: Celebrate fan milestones and engagement progression.
 */

export interface FanPointAchievement {
  achievementId: string;
  fanId: string;
  achievementType:
    | 'first-points'
    | '100-points'
    | '1000-points'
    | '10000-points'
    | 'first-store-purchase'
    | '10-purchases'
    | '50-purchases'
    | 'big-spender-1000'
    | 'big-spender-5000'
    | 'point-collector'
    | 'store-connoisseur'
    | 'legendary-shopper';
  unlockedAt: number;
  pointsReward: number; // bonus points for unlocking
  badge: string;
}

// In-memory registry
const fanPointAchievements = new Map<string, FanPointAchievement[]>();
let achievementCounter = 0;

const FAN_POINT_ACHIEVEMENT_SPECS: Record<
  FanPointAchievement['achievementType'],
  {
    title: string;
    description: string;
    pointsReward: number;
    badge: string;
  }
> = {
  'first-points': {
    title: 'Starter Points',
    description: 'Earned first 100 points',
    pointsReward: 50,
    badge: 'badge-starter-points',
  },
  '100-points': {
    title: 'Century Collector',
    description: 'Accumulated 100 points total',
    pointsReward: 25,
    badge: 'badge-100pt',
  },
  '1000-points': {
    title: 'Point Millionaire',
    description: 'Accumulated 1,000 points total',
    pointsReward: 100,
    badge: 'badge-1000pt',
  },
  '10000-points': {
    title: 'Point Tycoon',
    description: 'Accumulated 10,000 points total',
    pointsReward: 500,
    badge: 'badge-10000pt',
  },
  'first-store-purchase': {
    title: 'First Buy',
    description: 'Made first store purchase',
    pointsReward: 50,
    badge: 'badge-first-buy',
  },
  '10-purchases': {
    title: 'Regular Shopper',
    description: 'Made 10 store purchases',
    pointsReward: 100,
    badge: 'badge-regular-shopper',
  },
  '50-purchases': {
    title: 'Store Enthusiast',
    description: 'Made 50 store purchases',
    pointsReward: 250,
    badge: 'badge-enthusiast-shopper',
  },
  'big-spender-1000': {
    title: 'Big Spender',
    description: 'Spent 1,000 points in store',
    pointsReward: 150,
    badge: 'badge-big-spender',
  },
  'big-spender-5000': {
    title: 'Whale Collector',
    description: 'Spent 5,000 points in store',
    pointsReward: 500,
    badge: 'badge-whale',
  },
  'point-collector': {
    title: 'Collector',
    description: 'Collected every item type in store',
    pointsReward: 300,
    badge: 'badge-collector',
  },
  'store-connoisseur': {
    title: 'Connoisseur',
    description: 'Owns 10+ rare or epic items',
    pointsReward: 250,
    badge: 'badge-connoisseur',
  },
  'legendary-shopper': {
    title: 'Legend',
    description: 'Collected all legendary items',
    pointsReward: 1000,
    badge: 'badge-legend-shopper',
  },
};

/**
 * Unlocks achievement for fan.
 */
export function unlockFanPointAchievement(
  fanId: string,
  achievementType: FanPointAchievement['achievementType']
): FanPointAchievement | null {
  const spec = FAN_POINT_ACHIEVEMENT_SPECS[achievementType];
  if (!spec) return null;

  let achievements = fanPointAchievements.get(fanId);
  if (!achievements) {
    achievements = [];
    fanPointAchievements.set(fanId, achievements);
  }

  // Check if already unlocked
  if (achievements.some((a) => a.achievementType === achievementType)) {
    return null;
  }

  const achievement: FanPointAchievement = {
    achievementId: `fanpta-${achievementCounter++}`,
    fanId,
    achievementType,
    unlockedAt: Date.now(),
    pointsReward: spec.pointsReward,
    badge: spec.badge,
  };

  achievements.push(achievement);
  return achievement;
}

/**
 * Gets achievements for fan.
 */
export function getFanPointAchievements(fanId: string): FanPointAchievement[] {
  return fanPointAchievements.get(fanId) ?? [];
}

/**
 * Checks if fan has achievement.
 */
export function hasFanPointAchievement(
  fanId: string,
  achievementType: FanPointAchievement['achievementType']
): boolean {
  const achievements = fanPointAchievements.get(fanId);
  if (!achievements) return false;
  return achievements.some((a) => a.achievementType === achievementType);
}

/**
 * Gets total bonus points from achievements.
 */
export function getTotalFanPointAchievementReward(fanId: string): number {
  const achievements = fanPointAchievements.get(fanId);
  if (!achievements) return 0;
  return achievements.reduce((sum, a) => sum + a.pointsReward, 0);
}

/**
 * Gets top achievers.
 */
export function getTopFanPointAchievers(limit: number = 10): { fanId: string; count: number }[] {
  const stats: Record<string, number> = {};

  fanPointAchievements.forEach((achievements, fanId) => {
    stats[fanId] = achievements.length;
  });

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fanId, count]) => ({ fanId, count }));
}

/**
 * Gets achievement report.
 */
export function getFanPointAchievementReport(): {
  totalFansWithAchievements: number;
  totalAchievementsUnlocked: number;
  totalBonusPointsAwarded: number;
  mostCommon: string | null;
} {
  const registries = Array.from(fanPointAchievements.values());
  const allAchievements = registries.flatMap((a) => a);

  const achievementCounts: Record<string, number> = {};
  let totalBonus = 0;

  allAchievements.forEach((a) => {
    achievementCounts[a.achievementType] = (achievementCounts[a.achievementType] ?? 0) + 1;
    totalBonus += a.pointsReward;
  });

  const mostCommon = Object.entries(achievementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalFansWithAchievements: registries.length,
    totalAchievementsUnlocked: allAchievements.length,
    totalBonusPointsAwarded: totalBonus,
    mostCommon,
  };
}
