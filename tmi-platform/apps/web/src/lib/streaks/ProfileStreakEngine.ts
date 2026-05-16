/**
 * ProfileStreakEngine
 * Central registry for all streak types per user.
 * Aggregates data from the five sub-engines into a single profile snapshot.
 *
 * Usage:
 *   const snapshot = profileStreakEngine.getSnapshot(userId);
 */

export interface StreakBadge {
  label: string;
  icon: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
}

export interface StreakSnapshot {
  userId: string;
  displayName: string;
  /** Battle win streak — consecutive wins without a loss */
  battleWinStreak: number;
  /** Battle participation streak — consecutive events attended */
  battleParticipationStreak: number;
  /** Total battles entered */
  totalBattles: number;
  /** Total battles won */
  totalWins: number;
  /** Total losses */
  totalLosses: number;
  /** Prediction streak — consecutive correct predictions */
  predictionStreak: number;
  /** All-time prediction accuracy 0–100 */
  predictionAccuracy: number;
  /** Total predictions made */
  totalPredictions: number;
  /** Fan support streak — consecutive sessions where user tipped/subscribed */
  supportStreak: number;
  /** Total tip/support events */
  totalSupportEvents: number;
  /** Attendance streak — consecutive weekly events attended */
  attendanceStreak: number;
  /** All-time events attended */
  totalEventsAttended: number;
  /** Crowns currently held */
  crownsHeld: number;
  /** Total crowns won all-time */
  totalCrownsWon: number;
  /** Title defenses — defended a crown at least once */
  titleDefenses: number;
  /** Computed badges from streak milestones */
  badges: StreakBadge[];
  updatedAt: number;
}

function badgeForStreak(streak: number, type: "win" | "predict" | "support" | "attend"): StreakBadge | null {
  const configs: Record<string, { tiers: [number, StreakBadge][] }> = {
    win: {
      tiers: [
        [3,  { label: "3-WIN STREAK",    icon: "🔥", color: "#FF6B35", tier: "bronze"   }],
        [5,  { label: "5-WIN STREAK",    icon: "⚡", color: "#FFD700", tier: "silver"   }],
        [10, { label: "10-WIN STREAK",   icon: "💎", color: "#00FFFF", tier: "gold"     }],
        [20, { label: "20-WIN STREAK",   icon: "👑", color: "#AA2DFF", tier: "platinum" }],
        [50, { label: "DYNASTY",         icon: "🏆", color: "#FF2DAA", tier: "legendary"}],
      ],
    },
    predict: {
      tiers: [
        [3,  { label: "PROPHET",         icon: "🔮", color: "#AA2DFF", tier: "bronze"   }],
        [7,  { label: "ORACLE",          icon: "🌟", color: "#FFD700", tier: "silver"   }],
        [15, { label: "SEER",            icon: "👁️",  color: "#00FFFF", tier: "gold"     }],
        [30, { label: "NOSTRADAMUS",     icon: "🧿", color: "#FF2DAA", tier: "legendary"}],
      ],
    },
    support: {
      tiers: [
        [3,  { label: "SUPPORTER",       icon: "💚", color: "#00FF88", tier: "bronze"   }],
        [7,  { label: "PATRON",          icon: "💎", color: "#00FFFF", tier: "silver"   }],
        [14, { label: "SUPER FAN",       icon: "❤️‍🔥", color: "#FF2DAA", tier: "gold"    }],
        [30, { label: "LEGEND FAN",      icon: "🌠", color: "#FFD700", tier: "legendary"}],
      ],
    },
    attend: {
      tiers: [
        [3,  { label: "REGULAR",         icon: "📅", color: "#00FFFF", tier: "bronze"   }],
        [8,  { label: "VETERAN",         icon: "🎖️", color: "#FFD700", tier: "silver"   }],
        [20, { label: "LIFER",           icon: "🏟️", color: "#FF2DAA", tier: "gold"     }],
        [52, { label: "IMMORTAL",        icon: "♾️",  color: "#AA2DFF", tier: "legendary"}],
      ],
    },
  };
  const cfg = configs[type];
  if (!cfg) return null;
  let best: StreakBadge | null = null;
  for (const [threshold, badge] of cfg.tiers) {
    if (streak >= threshold) best = badge;
  }
  return best;
}

class ProfileStreakEngine {
  private snapshots = new Map<string, StreakSnapshot>();

  /**
   * Upsert or create a streak snapshot for a user.
   */
  upsert(params: Partial<StreakSnapshot> & { userId: string; displayName: string }): StreakSnapshot {
    const existing = this.snapshots.get(params.userId) ?? {
      userId: params.userId,
      displayName: params.displayName,
      battleWinStreak: 0,
      battleParticipationStreak: 0,
      totalBattles: 0,
      totalWins: 0,
      totalLosses: 0,
      predictionStreak: 0,
      predictionAccuracy: 0,
      totalPredictions: 0,
      supportStreak: 0,
      totalSupportEvents: 0,
      attendanceStreak: 0,
      totalEventsAttended: 0,
      crownsHeld: 0,
      totalCrownsWon: 0,
      titleDefenses: 0,
      badges: [],
      updatedAt: Date.now(),
    };

    const merged: StreakSnapshot = { ...existing, ...params, updatedAt: Date.now() };

    // Recompute badges
    const badges: StreakBadge[] = [];
    const winBadge  = badgeForStreak(merged.battleWinStreak, "win");
    const predBadge = badgeForStreak(merged.predictionStreak, "predict");
    const suppBadge = badgeForStreak(merged.supportStreak, "support");
    const attBadge  = badgeForStreak(merged.attendanceStreak, "attend");
    if (winBadge)  badges.push(winBadge);
    if (predBadge) badges.push(predBadge);
    if (suppBadge) badges.push(suppBadge);
    if (attBadge)  badges.push(attBadge);
    if (merged.crownsHeld > 0) {
      badges.push({ label: `${merged.crownsHeld} CROWN${merged.crownsHeld > 1 ? "S" : ""}`, icon: "👑", color: "#FFD700", tier: "gold" });
    }
    if (merged.titleDefenses >= 3) {
      badges.push({ label: `${merged.titleDefenses} DEFENSES`, icon: "🛡️", color: "#AA2DFF", tier: "platinum" });
    }

    merged.badges = badges;
    this.snapshots.set(params.userId, merged);
    return merged;
  }

  getSnapshot(userId: string): StreakSnapshot | undefined {
    return this.snapshots.get(userId);
  }

  /** Record a battle result */
  recordBattleResult(userId: string, displayName: string, won: boolean): StreakSnapshot {
    const s = this.getSnapshot(userId) ?? this.upsert({ userId, displayName });
    return this.upsert({
      userId,
      displayName,
      battleWinStreak: won ? s.battleWinStreak + 1 : 0,
      battleParticipationStreak: s.battleParticipationStreak + 1,
      totalBattles: s.totalBattles + 1,
      totalWins: s.totalWins + (won ? 1 : 0),
      totalLosses: s.totalLosses + (won ? 0 : 1),
    });
  }

  /** Record a crown win */
  recordCrownWin(userId: string, displayName: string, isDefense: boolean): StreakSnapshot {
    const s = this.getSnapshot(userId) ?? this.upsert({ userId, displayName });
    return this.upsert({
      userId,
      displayName,
      crownsHeld: s.crownsHeld + 1,
      totalCrownsWon: s.totalCrownsWon + 1,
      titleDefenses: s.titleDefenses + (isDefense ? 1 : 0),
    });
  }

  /** Seed demo data for a user */
  seedDemo(userId: string, displayName: string): StreakSnapshot {
    return this.upsert({
      userId,
      displayName,
      battleWinStreak: 5,
      battleParticipationStreak: 12,
      totalBattles: 18,
      totalWins: 13,
      totalLosses: 5,
      predictionStreak: 7,
      predictionAccuracy: 74,
      totalPredictions: 42,
      supportStreak: 14,
      totalSupportEvents: 67,
      attendanceStreak: 8,
      totalEventsAttended: 31,
      crownsHeld: 2,
      totalCrownsWon: 3,
      titleDefenses: 4,
    });
  }

  getLeaderboard(by: "battleWinStreak" | "predictionStreak" | "supportStreak", limit = 10): StreakSnapshot[] {
    return [...this.snapshots.values()]
      .sort((a, b) => b[by] - a[by])
      .slice(0, limit);
  }
}

export const profileStreakEngine = new ProfileStreakEngine();
