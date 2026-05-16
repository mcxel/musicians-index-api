/**
 * PredictionStreakEngine
 * Tracks per-user battle prediction accuracy and streak.
 * A prediction streak increments when the user calls the winner correctly.
 * Breaks on first wrong prediction.
 */

export interface PredictionStreakRecord {
  userId: string;
  /** Consecutive correct predictions */
  currentStreak: number;
  /** Longest ever streak */
  longestStreak: number;
  totalCorrect: number;
  totalWrong: number;
  totalPredictions: number;
  /** 0–100 */
  accuracy: number;
  lastPredictionAt: number;
  updatedAt: number;
}

class PredictionStreakEngine {
  private records = new Map<string, PredictionStreakRecord>();

  private get(userId: string): PredictionStreakRecord {
    return this.records.get(userId) ?? {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalPredictions: 0,
      accuracy: 0,
      lastPredictionAt: 0,
      updatedAt: Date.now(),
    };
  }

  recordPrediction(userId: string, correct: boolean): PredictionStreakRecord {
    const r = this.get(userId);
    const newStreak = correct ? r.currentStreak + 1 : 0;
    const totalCorrect = r.totalCorrect + (correct ? 1 : 0);
    const totalPredictions = r.totalPredictions + 1;
    const updated: PredictionStreakRecord = {
      ...r,
      currentStreak:    newStreak,
      longestStreak:    Math.max(r.longestStreak, newStreak),
      totalCorrect,
      totalWrong:       r.totalWrong + (correct ? 0 : 1),
      totalPredictions,
      accuracy:         Math.round((totalCorrect / totalPredictions) * 100),
      lastPredictionAt: Date.now(),
      updatedAt:        Date.now(),
    };
    this.records.set(userId, updated);
    return updated;
  }

  getRecord(userId: string): PredictionStreakRecord | undefined {
    return this.records.get(userId);
  }

  seed(userId: string, correct: number, wrong: number, currentStreak: number): void {
    const total = correct + wrong;
    this.records.set(userId, {
      userId,
      currentStreak,
      longestStreak: Math.max(currentStreak, Math.floor(correct * 0.4)),
      totalCorrect: correct,
      totalWrong: wrong,
      totalPredictions: total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      lastPredictionAt: Date.now() - 3600000,
      updatedAt: Date.now(),
    });
  }
}

export const predictionStreakEngine = new PredictionStreakEngine();
