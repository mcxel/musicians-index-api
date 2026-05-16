/**
 * FanAchievementEngine.ts
 *
 * Tracks fan achievements: attending events, watching hours, voting streaks, collecting NFTs.
 * Purpose: Gamify fan journey and celebrate milestones.
 */

export interface FanAchievement {
  achievementId: string;
  fanId: string;
  achievementType:
    | 'first-event'
    | '10-events'
    | '50-events'
    | '100-events'
    | '100-watch-hours'
    | '500-watch-hours'
    | 'first-vote'
    | '100-votes'
    | 'first-tip'
    | '10-tips'
    | 'first-nft'
    | '5-nfts'
    | 'collector'
    | 'cypher-pro'
    | 'critic'
    | 'super-fan';
  unlockedAt: number;
  xpReward: number;
  badgeId: string;
}

// In-memory registry
const fanAchievements = new Map<string, FanAchievement[]>();
let achievementCounter = 0;

const FAN_ACHIEVEMENT_SPECS: Record<
  FanAchievement['achievementType'],
  {
    title: string;
    description: string;
    xpReward: number;
    badgeId: string;
  }
> = {
  'first-event': {
    title: 'Fan Debut',
    description: 'Attended first event',
    xpReward: 25,
    badgeId: 'badge-fan-debut',
  },
  '10-events': {
    title: 'Regular Attendee',
    description: 'Attended 10 events',
    xpReward: 75,
    badgeId: 'badge-regular',
  },
  '50-events': {
    title: 'Event Enthusiast',
    description: 'Attended 50 events',
    xpReward: 200,
    badgeId: 'badge-enthusiast',
  },
  '100-events': {
    title: 'Century Fan',
    description: 'Attended 100 events',
    xpReward: 500,
    badgeId: 'badge-century-fan',
  },
  '100-watch-hours': {
    title: 'Binge Watcher',
    description: 'Watched 100 hours of live content',
    xpReward: 150,
    badgeId: 'badge-binge',
  },
  '500-watch-hours': {
    title: 'Master Observer',
    description: 'Watched 500 hours of live content',
    xpReward: 400,
    badgeId: 'badge-master-observer',
  },
  'first-vote': {
    title: 'First Vote',
    description: 'Cast first vote',
    xpReward: 10,
    badgeId: 'badge-first-vote',
  },
  '100-votes': {
    title: 'Voting Pro',
    description: 'Cast 100 votes',
    xpReward: 100,
    badgeId: 'badge-voting-pro',
  },
  'first-tip': {
    title: 'Supporter',
    description: 'Tipped an artist for the first time',
    xpReward: 25,
    badgeId: 'badge-supporter',
  },
  '10-tips': {
    title: 'Major Supporter',
    description: 'Tipped 10 times',
    xpReward: 150,
    badgeId: 'badge-major-supporter',
  },
  'first-nft': {
    title: 'Collector',
    description: 'Claimed first NFT',
    xpReward: 50,
    badgeId: 'badge-nft-collector',
  },
  '5-nfts': {
    title: 'NFT Curator',
    description: 'Collected 5 NFTs',
    xpReward: 200,
    badgeId: 'badge-nft-curator',
  },
  collector: {
    title: 'Master Collector',
    description: 'Collected 20+ NFTs',
    xpReward: 400,
    badgeId: 'badge-master-collector',
  },
  'cypher-pro': {
    title: 'Cypher Pro',
    description: 'Attended 10 cyphers',
    xpReward: 150,
    badgeId: 'badge-cypher-pro',
  },
  critic: {
    title: 'Critic',
    description: 'Left 20 meaningful comments',
    xpReward: 100,
    badgeId: 'badge-critic',
  },
  'super-fan': {
    title: 'Super Fan',
    description: 'Top engagement all categories',
    xpReward: 500,
    badgeId: 'badge-super-fan',
  },
};

/**
 * Unlocks achievement for fan.
 */
export function unlockFanAchievement(
  fanId: string,
  achievementType: FanAchievement['achievementType']
): FanAchievement | null {
  const spec = FAN_ACHIEVEMENT_SPECS[achievementType];
  if (!spec) return null;

  // Get achievements for fan
  let achievements = fanAchievements.get(fanId);
  if (!achievements) {
    achievements = [];
    fanAchievements.set(fanId, achievements);
  }

  // Check if already unlocked
  if (achievements.some((a) => a.achievementType === achievementType)) {
    return null;
  }

  const achievement: FanAchievement = {
    achievementId: `fan-ach-${achievementCounter++}`,
    fanId,
    achievementType,
    unlockedAt: Date.now(),
    xpReward: spec.xpReward,
    badgeId: spec.badgeId,
  };

  achievements.push(achievement);
  return achievement;
}

/**
 * Gets fan achievements.
 */
export function getFanAchievements(fanId: string): FanAchievement[] {
  return fanAchievements.get(fanId) ?? [];
}

/**
 * Checks if fan has achievement.
 */
export function hasFanAchievement(
  fanId: string,
  achievementType: FanAchievement['achievementType']
): boolean {
  const achievements = fanAchievements.get(fanId);
  if (!achievements) return false;
  return achievements.some((a) => a.achievementType === achievementType);
}

/**
 * Gets total XP from achievements.
 */
export function getFanAchievementXP(fanId: string): number {
  const achievements = fanAchievements.get(fanId);
  if (!achievements) return 0;
  return achievements.reduce((sum, a) => sum + a.xpReward, 0);
}

/**
 * Lists fans with most achievements.
 */
export function getTopAchieversInFans(limit: number = 10): { fanId: string; count: number }[] {
  const stats: Record<string, number> = {};
  fanAchievements.forEach((achievements, fanId) => {
    stats[fanId] = achievements.length;
  });
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fanId, count]) => ({ fanId, count }));
}
