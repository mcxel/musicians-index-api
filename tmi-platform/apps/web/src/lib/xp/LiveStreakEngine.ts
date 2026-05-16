/**
 * LiveStreakEngine.ts
 *
 * Tracks consecutive live days for consistency rewards.
 * Streaks: 3-day, 7-day, 30-day bonuses.
 * Purpose: Reward consistent performers.
 */

export interface LiveStreak {
  streakId: string;
  entityId: string;
  currentStreakDays: number;
  lastLiveDate: number; // timestamp
  totalLiveSessionsInStreak: number;
  streakStartDate: number;
  bonus3Day?: number; // XP bonus at 3 days
  bonus7Day?: number; // XP bonus at 7 days
  bonus30Day?: number; // XP bonus at 30 days
}

export interface StreakBonus {
  streakDays: number;
  bonusXP: number;
  unlocks?: string[]; // special items, badges
}

// In-memory registry
const liveStreaks = new Map<string, LiveStreak>();

const STREAK_BONUSES: Record<number, StreakBonus> = {
  3: { streakDays: 3, bonusXP: 50, unlocks: ['3-day-streaker-badge'] },
  7: { streakDays: 7, bonusXP: 150, unlocks: ['7-day-streaker-badge', 'special-border'] },
  30: { streakDays: 30, bonusXP: 500, unlocks: ['30-day-legend-badge', 'profile-glow'] },
};

/**
 * Records live session for streak tracking.
 */
export function recordLiveSessionForStreak(input: {
  entityId: string;
  sessionDate: number; // when the session occurred
}): LiveStreak {
  const today = new Date(input.sessionDate);
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  let streak = liveStreaks.get(input.entityId);

  if (!streak) {
    // New streak
    streak = {
      streakId: `streak-${input.entityId}`,
      entityId: input.entityId,
      currentStreakDays: 1,
      lastLiveDate: todayTime,
      totalLiveSessionsInStreak: 1,
      streakStartDate: todayTime,
    };
  } else {
    const lastLiveDate = new Date(streak.lastLiveDate);
    lastLiveDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((todayTime - lastLiveDate.getTime()) / (24 * 60 * 60 * 1000));

    if (daysDiff === 1) {
      // Streak continues
      streak.currentStreakDays += 1;
      streak.lastLiveDate = todayTime;
      streak.totalLiveSessionsInStreak += 1;
    } else if (daysDiff === 0) {
      // Same day - just count additional session
      streak.totalLiveSessionsInStreak += 1;
    } else {
      // Streak broken - reset
      streak.currentStreakDays = 1;
      streak.lastLiveDate = todayTime;
      streak.totalLiveSessionsInStreak = 1;
      streak.streakStartDate = todayTime;
    }
  }

  // Check for bonuses
  if (streak.currentStreakDays === 3 && !streak.bonus3Day) {
    streak.bonus3Day = STREAK_BONUSES[3].bonusXP;
  }
  if (streak.currentStreakDays === 7 && !streak.bonus7Day) {
    streak.bonus7Day = STREAK_BONUSES[7].bonusXP;
  }
  if (streak.currentStreakDays === 30 && !streak.bonus30Day) {
    streak.bonus30Day = STREAK_BONUSES[30].bonusXP;
  }

  liveStreaks.set(input.entityId, streak);
  return streak;
}

/**
 * Gets live streak for entity.
 */
export function getLiveStreak(entityId: string): LiveStreak | null {
  return liveStreaks.get(entityId) ?? null;
}

/**
 * Gets total streak bonus XP earned.
 */
export function getStreakBonusXP(entityId: string): number {
  const streak = liveStreaks.get(entityId);
  if (!streak) return 0;

  let totalBonus = 0;
  if (streak.bonus3Day) totalBonus += streak.bonus3Day;
  if (streak.bonus7Day) totalBonus += streak.bonus7Day;
  if (streak.bonus30Day) totalBonus += streak.bonus30Day;

  return totalBonus;
}

/**
 * Lists top live streaks.
 */
export function getTopLiveStreaks(limit: number = 10): LiveStreak[] {
  return Array.from(liveStreaks.values())
    .sort((a, b) => b.currentStreakDays - a.currentStreakDays)
    .slice(0, limit);
}

/**
 * Gets streak bonus information for milestone.
 */
export function getStreakBonusInfo(streakDays: number): StreakBonus | null {
  return STREAK_BONUSES[streakDays] ?? null;
}

/**
 * Checks if entity is at a milestone (3, 7, 30 days).
 */
export function isAtStreakMilestone(entityId: string): { milestone: number; bonus: number } | null {
  const streak = liveStreaks.get(entityId);
  if (!streak) return null;

  const milestones = [30, 7, 3]; // Check in reverse order
  for (const milestone of milestones) {
    if (streak.currentStreakDays === milestone) {
      return { milestone, bonus: STREAK_BONUSES[milestone].bonusXP };
    }
  }

  return null;
}
