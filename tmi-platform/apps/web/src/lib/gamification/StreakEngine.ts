export interface UserStreak {
  userId: string;
  currentStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD' UTC
  longestStreak: number;
}

export interface StreakResult {
  streak: UserStreak;
  isNewDay: boolean;
  xpMultiplier: number;
  xpGranted: number;
}

const XP_BASE = 25;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function diffDays(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

function getMultiplier(streak: number): number {
  if (streak >= 7) return 2.5;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.2;
  return 1.0;
}

const store = new Map<string, UserStreak>();

export const StreakEngine = {
  recordDailyVisit(userId: string): StreakResult {
    const today = todayUTC();
    const existing = store.get(userId);

    // Already checked in today — idempotent
    if (existing?.lastActiveDate === today) {
      return {
        streak: existing,
        isNewDay: false,
        xpMultiplier: getMultiplier(existing.currentStreak),
        xpGranted: 0,
      };
    }

    let newStreak: number;
    let longestStreak: number;

    if (!existing || !existing.lastActiveDate) {
      newStreak = 1;
      longestStreak = 1;
    } else {
      const diff = diffDays(existing.lastActiveDate, today);
      newStreak = diff === 1 ? existing.currentStreak + 1 : 1;
      longestStreak = Math.max(existing.longestStreak, newStreak);
    }

    const updated: UserStreak = {
      userId,
      currentStreak: newStreak,
      lastActiveDate: today,
      longestStreak,
    };
    store.set(userId, updated);

    const xpMultiplier = getMultiplier(newStreak);
    const xpGranted = Math.round(XP_BASE * xpMultiplier);

    return { streak: updated, isNewDay: true, xpMultiplier, xpGranted };
  },

  getStreak(userId: string): UserStreak {
    return (
      store.get(userId) ?? {
        userId,
        currentStreak: 0,
        lastActiveDate: '',
        longestStreak: 0,
      }
    );
  },

  /** Returns userIds whose streak > 1 and last active date was yesterday (break risk). */
  getAtRiskUsers(): string[] {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);
    const result: string[] = [];
    for (const [userId, s] of store.entries()) {
      if (s.currentStreak > 1 && s.lastActiveDate === yesterday) {
        result.push(userId);
      }
    }
    return result;
  },
};
