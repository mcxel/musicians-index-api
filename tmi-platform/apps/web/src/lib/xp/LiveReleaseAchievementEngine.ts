/**
 * LiveReleaseAchievementEngine.ts
 *
 * Tracks achievements unlocked through live work, releases, premieres.
 * Achievements unlock badges, visual upgrades, season pass items.
 * Purpose: Gamify creator journey and celebrate milestones.
 */

export interface Achievement {
  achievementId: string;
  artistId: string;
  achievementType:
    | 'first-live'
    | 'first-world-concert'
    | 'first-premiere'
    | 'first-single-drop'
    | 'first-comedy-special'
    | '100-live-minutes'
    | '1000-live-minutes'
    | 'global-premiere'
    | 'country-chart-mover'
    | 'billboard-climber'
    | 'crowd-keeper'
    | 'release-week-winner'
    | 'super-streaker-3day'
    | 'super-streaker-7day'
    | 'super-streaker-30day'
    | '10-live-sessions'
    | '50-live-sessions'
    | '100-live-sessions';
  unlockedAt: number;
  xpReward: number;
  badgeId: string;
  unlocks: string[]; // profile effects, season pass items, visual upgrades
}

export interface AchievementRegistry {
  artistId: string;
  achievements: Achievement[];
  totalXPFromAchievements: number;
  unlockedBadges: string[];
}

// In-memory registry
const achievementRegistries = new Map<string, AchievementRegistry>();
let achievementCounter = 0;

const ACHIEVEMENT_SPECS: Record<
  Achievement['achievementType'],
  {
    title: string;
    description: string;
    xpReward: number;
    badgeId: string;
    unlocks: string[];
  }
> = {
  'first-live': {
    title: 'First Live',
    description: 'Went live for the first time',
    xpReward: 50,
    badgeId: 'badge-first-live',
    unlocks: ['profile-glow-blue'],
  },
  'first-world-concert': {
    title: 'Global Stage',
    description: 'Hosted first world concert',
    xpReward: 200,
    badgeId: 'badge-world-concert',
    unlocks: ['concert-badge', 'stage-border'],
  },
  'first-premiere': {
    title: 'Premiere Moment',
    description: 'Held first premiere event',
    xpReward: 100,
    badgeId: 'badge-premiere',
    unlocks: ['premiere-badge'],
  },
  'first-single-drop': {
    title: 'Artist Drop',
    description: 'Released first single',
    xpReward: 75,
    badgeId: 'badge-single-drop',
    unlocks: ['artist-badge'],
  },
  'first-comedy-special': {
    title: 'Comedy Gold',
    description: 'Released first comedy special',
    xpReward: 100,
    badgeId: 'badge-comedy',
    unlocks: ['comedy-badge'],
  },
  '100-live-minutes': {
    title: 'Live Enthusiast',
    description: '100 total minutes live',
    xpReward: 150,
    badgeId: 'badge-100-min',
    unlocks: ['verified-badge', 'hour-milestone-border'],
  },
  '1000-live-minutes': {
    title: 'Live Legend',
    description: '1000 total minutes live',
    xpReward: 500,
    badgeId: 'badge-1000-min',
    unlocks: ['legend-badge', 'profile-shine'],
  },
  'global-premiere': {
    title: 'Global Release',
    description: 'Premiere reached global chart',
    xpReward: 300,
    badgeId: 'badge-global-premiere',
    unlocks: ['global-badge', 'special-border'],
  },
  'country-chart-mover': {
    title: 'National Star',
    description: 'Reached top 10 in country chart',
    xpReward: 200,
    badgeId: 'badge-country-top10',
    unlocks: ['country-badge', 'flag-badge'],
  },
  'billboard-climber': {
    title: 'Billboard Hero',
    description: 'Appeared on Billboard',
    xpReward: 250,
    badgeId: 'badge-billboard',
    unlocks: ['billboard-badge', 'climbing-badge'],
  },
  'crowd-keeper': {
    title: 'Crowd Keeper',
    description: 'Maintained 80%+ audience retention',
    xpReward: 150,
    badgeId: 'badge-crowd-keeper',
    unlocks: ['retention-badge'],
  },
  'release-week-winner': {
    title: 'Weekly Champion',
    description: 'Won release week chart',
    xpReward: 200,
    badgeId: 'badge-week-champ',
    unlocks: ['champion-badge'],
  },
  'super-streaker-3day': {
    title: '3-Day Streaker',
    description: 'Went live 3 days in a row',
    xpReward: 100,
    badgeId: 'badge-streak-3',
    unlocks: ['streak-badge', 'fire-effect'],
  },
  'super-streaker-7day': {
    title: 'Weekly Warrior',
    description: 'Went live 7 days in a row',
    xpReward: 250,
    badgeId: 'badge-streak-7',
    unlocks: ['warrior-badge', 'special-aura'],
  },
  'super-streaker-30day': {
    title: 'Month of Fire',
    description: 'Went live 30 days in a row',
    xpReward: 750,
    badgeId: 'badge-streak-30',
    unlocks: ['legend-badge', 'master-aura', 'season-pass-unlock'],
  },
  '10-live-sessions': {
    title: 'Pro Performer',
    description: 'Completed 10 live sessions',
    xpReward: 100,
    badgeId: 'badge-10-sessions',
    unlocks: ['pro-badge'],
  },
  '50-live-sessions': {
    title: 'Live Master',
    description: 'Completed 50 live sessions',
    xpReward: 300,
    badgeId: 'badge-50-sessions',
    unlocks: ['master-badge', 'profile-frame'],
  },
  '100-live-sessions': {
    title: 'Century Club',
    description: 'Completed 100 live sessions',
    xpReward: 600,
    badgeId: 'badge-100-sessions',
    unlocks: ['century-badge', 'golden-frame', 'special-title'],
  },
};

/**
 * Unlocks achievement for artist.
 */
export function unlockAchievement(
  artistId: string,
  achievementType: Achievement['achievementType']
): Achievement | null {
  const spec = ACHIEVEMENT_SPECS[achievementType];
  if (!spec) return null;

  // Get or create registry
  let registry = achievementRegistries.get(artistId);
  if (!registry) {
    registry = {
      artistId,
      achievements: [],
      totalXPFromAchievements: 0,
      unlockedBadges: [],
    };
    achievementRegistries.set(artistId, registry);
  }

  // Check if already unlocked
  if (registry.achievements.some((a) => a.achievementType === achievementType)) {
    return null; // Already unlocked
  }

  const achievement: Achievement = {
    achievementId: `ach-${achievementCounter++}`,
    artistId,
    achievementType,
    unlockedAt: Date.now(),
    xpReward: spec.xpReward,
    badgeId: spec.badgeId,
    unlocks: spec.unlocks,
  };

  registry.achievements.push(achievement);
  registry.totalXPFromAchievements += spec.xpReward;
  registry.unlockedBadges.push(spec.badgeId);

  return achievement;
}

/**
 * Gets registry for artist.
 */
export function getAchievementRegistry(artistId: string): AchievementRegistry | null {
  return achievementRegistries.get(artistId) ?? null;
}

/**
 * Lists all achievements for artist.
 */
export function listAchievements(artistId: string): Achievement[] {
  const registry = achievementRegistries.get(artistId);
  return registry?.achievements ?? [];
}

/**
 * Checks if artist has specific achievement.
 */
export function hasAchievement(
  artistId: string,
  achievementType: Achievement['achievementType']
): boolean {
  const registry = achievementRegistries.get(artistId);
  if (!registry) return false;
  return registry.achievements.some((a) => a.achievementType === achievementType);
}

/**
 * Gets total achievement XP.
 */
export function getTotalAchievementXP(artistId: string): number {
  return achievementRegistries.get(artistId)?.totalXPFromAchievements ?? 0;
}

/**
 * Gets unlocked visual items from achievements.
 */
export function getUnlockedVisualItems(artistId: string): string[] {
  const registry = achievementRegistries.get(artistId);
  if (!registry) return [];

  const items = new Set<string>();
  registry.achievements.forEach((a) => {
    a.unlocks.forEach((item) => items.add(item));
  });

  return Array.from(items);
}

/**
 * Gets achievement report.
 */
export function getAchievementReport(): {
  totalArtistsWithAchievements: number;
  mostCommonAchievement: { type: Achievement['achievementType']; count: number } | null;
  totalAchievementsUnlocked: number;
  totalXPAwarded: number;
} {
  const registries = Array.from(achievementRegistries.values());
  const allAchievements = registries.flatMap((r) => r.achievements);

  const achievementCounts: Record<string, number> = {};
  let totalXP = 0;

  allAchievements.forEach((a) => {
    achievementCounts[a.achievementType] = (achievementCounts[a.achievementType] ?? 0) + 1;
    totalXP += a.xpReward;
  });

  const mostCommon = Object.entries(achievementCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalArtistsWithAchievements: registries.length,
    mostCommonAchievement: mostCommon
      ? { type: mostCommon[0] as Achievement['achievementType'], count: mostCommon[1] }
      : null,
    totalAchievementsUnlocked: allAchievements.length,
    totalXPAwarded: totalXP,
  };
}
