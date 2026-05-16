/**
 * FanStreakEngine.ts
 *
 * Tracks consecutive fan engagement streaks: voting daily, attending weekly, etc.
 * Purpose: Reward consistent fan engagement.
 */

export interface FanStreak {
  streakId: string;
  fanId: string;
  streakType: 'daily-visits' | 'weekly-attendance' | 'voting-streak';
  currentStreakDays: number;
  lastActivityDate: number;
  totalXPBonus: number;
  milestonesBonuses: Record<number, number>; // milestone → XP claimed
}

// In-memory registry
const fanStreaks = new Map<string, FanStreak>();

const STREAK_MILESTONES: Record<number, number> = {
  3: 30,
  7: 75,
  14: 150,
  30: 300,
  100: 1000,
};

/**
 * Records fan streak activity.
 */
export function recordFanStreakActivity(input: {
  fanId: string;
  streakType: FanStreak['streakType'];
  activityDate: number;
}): FanStreak {
  const streakKey = `${input.fanId}-${input.streakType}`;
  let streak = fanStreaks.get(streakKey);

  const today = new Date(input.activityDate);
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  if (!streak) {
    // New streak
    streak = {
      streakId: streakKey,
      fanId: input.fanId,
      streakType: input.streakType,
      currentStreakDays: 1,
      lastActivityDate: todayTime,
      totalXPBonus: 0,
      milestonesBonuses: {},
    };
  } else {
    const lastDate = new Date(streak.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((todayTime - lastDate.getTime()) / (24 * 60 * 60 * 1000));

    if (daysDiff === 1) {
      // Streak continues
      streak.currentStreakDays += 1;
      streak.lastActivityDate = todayTime;
    } else if (daysDiff === 0) {
      // Same day, no change
    } else {
      // Streak broken
      streak.currentStreakDays = 1;
      streak.lastActivityDate = todayTime;
    }
  }

  // Check for milestone bonuses
  const milestones = Object.keys(STREAK_MILESTONES)
    .map((k) => parseInt(k))
    .sort((a, b) => a - b);

  for (const milestone of milestones) {
    if (streak.currentStreakDays === milestone && !streak.milestonesBonuses[milestone]) {
      const bonus = STREAK_MILESTONES[milestone];
      streak.milestonesBonuses[milestone] = bonus;
      streak.totalXPBonus += bonus;
    }
  }

  fanStreaks.set(streakKey, streak);
  return streak;
}

/**
 * Gets fan streak.
 */
export function getFanStreak(fanId: string, streakType: FanStreak['streakType']): FanStreak | null {
  return fanStreaks.get(`${fanId}-${streakType}`) ?? null;
}

/**
 * Gets all streaks for fan.
 */
export function getFanAllStreaks(fanId: string): FanStreak[] {
  const streaks: FanStreak[] = [];
  fanStreaks.forEach((streak) => {
    if (streak.fanId === fanId) {
      streaks.push(streak);
    }
  });
  return streaks;
}

/**
 * Gets total streak bonus XP for fan.
 */
export function getFanTotalStreakBonus(fanId: string): number {
  let total = 0;
  fanStreaks.forEach((streak) => {
    if (streak.fanId === fanId) {
      total += streak.totalXPBonus;
    }
  });
  return total;
}

/**
 * Gets top streak fans.
 */
export function getTopStreakFans(limit: number = 10): FanStreak[] {
  return Array.from(fanStreaks.values())
    .sort((a, b) => b.currentStreakDays - a.currentStreakDays)
    .slice(0, limit);
}
