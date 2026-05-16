/**
 * BattleStreakEngine
 * Tracks per-user battle win/loss/participation streaks.
 * Feeds into ProfileStreakEngine for unified snapshots.
 */

export interface BattleStreakRecord {
  userId: string;
  displayName: string;
  /** Consecutive wins without a loss */
  currentWinStreak: number;
  /** All-time longest win streak */
  longestWinStreak: number;
  /** Consecutive battles participated in (no skips) */
  participationStreak: number;
  totalWins: number;
  totalLosses: number;
  totalBattles: number;
  /** Most recent battle result */
  lastResult: "win" | "loss" | null;
  lastBattleAt: number;
  updatedAt: number;
}

class BattleStreakEngine {
  private records = new Map<string, BattleStreakRecord>();

  private get(userId: string, displayName: string): BattleStreakRecord {
    return this.records.get(userId) ?? {
      userId,
      displayName,
      currentWinStreak: 0,
      longestWinStreak: 0,
      participationStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      totalBattles: 0,
      lastResult: null,
      lastBattleAt: 0,
      updatedAt: Date.now(),
    };
  }

  recordResult(userId: string, displayName: string, result: "win" | "loss"): BattleStreakRecord {
    const r = this.get(userId, displayName);
    const newWinStreak  = result === "win" ? r.currentWinStreak + 1 : 0;
    const updated: BattleStreakRecord = {
      ...r,
      displayName,
      currentWinStreak:    newWinStreak,
      longestWinStreak:    Math.max(r.longestWinStreak, newWinStreak),
      participationStreak: r.participationStreak + 1,
      totalWins:   r.totalWins   + (result === "win"  ? 1 : 0),
      totalLosses: r.totalLosses + (result === "loss" ? 1 : 0),
      totalBattles: r.totalBattles + 1,
      lastResult:  result,
      lastBattleAt: Date.now(),
      updatedAt:   Date.now(),
    };
    this.records.set(userId, updated);
    return updated;
  }

  getRecord(userId: string): BattleStreakRecord | undefined {
    return this.records.get(userId);
  }

  getTopStreaks(limit = 10): BattleStreakRecord[] {
    return [...this.records.values()]
      .sort((a, b) => b.currentWinStreak - a.currentWinStreak)
      .slice(0, limit);
  }

  /** Seed with demo values */
  seed(userId: string, displayName: string, wins: number, losses: number, currentStreak: number): void {
    this.records.set(userId, {
      userId,
      displayName,
      currentWinStreak: currentStreak,
      longestWinStreak: Math.max(currentStreak, wins > 0 ? Math.floor(wins * 0.4) : 0),
      participationStreak: wins + losses,
      totalWins: wins,
      totalLosses: losses,
      totalBattles: wins + losses,
      lastResult: wins > 0 ? "win" : null,
      lastBattleAt: Date.now() - 86400000,
      updatedAt: Date.now(),
    });
  }
}

export const battleStreakEngine = new BattleStreakEngine();
