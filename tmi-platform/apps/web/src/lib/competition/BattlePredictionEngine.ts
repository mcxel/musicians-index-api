/**
 * BattlePredictionEngine
 * Spectator prediction market with close-time lock, underdog multipliers, streaks, and leaderboard.
 */

import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";

export interface BattlePrediction {
  predictionId: string;
  battleId: string;
  fanUserId: string;
  predictedWinnerId: string;
  stakePoints: number;
  oddsMultiplier: number;
  createdAt: number;
  settled: boolean;
  won?: boolean;
  payoutPoints?: number;
}

export interface PredictionStanding {
  userId: string;
  totalPredictions: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  pointsWon: number;
}

const DEFAULT_CUTOFF_ELAPSED_SECONDS = 5 * 60;

export class BattlePredictionEngine {
  private predictionsByBattle: Map<string, BattlePrediction[]> = new Map();
  private standings: Map<string, PredictionStanding> = new Map();
  private battleStartAt: Map<string, number> = new Map();

  startPredictionWindow(battleId: string, startedAt: number = Date.now()): void {
    this.battleStartAt.set(battleId, startedAt);
  }

  isPredictionOpen(battleId: string): boolean {
    const started = this.battleStartAt.get(battleId);
    if (!started) return true;
    const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
    return elapsedSeconds < DEFAULT_CUTOFF_ELAPSED_SECONDS;
  }

  submitPrediction(input: {
    battleId: string;
    fanUserId: string;
    predictedWinnerId: string;
    stakePoints: number;
    underdog: boolean;
  }): { ok: boolean; prediction?: BattlePrediction; reason?: string } {
    if (!this.isPredictionOpen(input.battleId)) {
      return { ok: false, reason: "prediction-window-closed" };
    }

    const stake = Math.max(1, Math.floor(input.stakePoints));
    const spent = battleChallengeEconomyEngine.spendPoints(input.fanUserId, stake);
    if (!spent.ok) {
      return { ok: false, reason: spent.reason ?? "insufficient-earned-points" };
    }

    const prediction: BattlePrediction = {
      predictionId: `pred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      battleId: input.battleId,
      fanUserId: input.fanUserId,
      predictedWinnerId: input.predictedWinnerId,
      stakePoints: stake,
      oddsMultiplier: input.underdog ? 2.2 : 1.4,
      createdAt: Date.now(),
      settled: false,
    };

    const rows = this.predictionsByBattle.get(input.battleId) ?? [];
    rows.push(prediction);
    this.predictionsByBattle.set(input.battleId, rows);

    return { ok: true, prediction };
  }

  settlePredictions(input: {
    battleId: string;
    winnerId: string;
    upsetWin: boolean;
  }): { settledCount: number; payouts: Array<{ userId: string; payout: number; won: boolean }> } {
    const rows = this.predictionsByBattle.get(input.battleId) ?? [];
    const payouts: Array<{ userId: string; payout: number; won: boolean }> = [];

    rows.forEach((row) => {
      if (row.settled) return;
      const won = row.predictedWinnerId === input.winnerId;
      const bonusMultiplier = input.upsetWin ? 1.25 : 1;
      const payout = won
        ? Math.max(1, Math.floor(row.stakePoints * row.oddsMultiplier * bonusMultiplier))
        : 0;

      row.settled = true;
      row.won = won;
      row.payoutPoints = payout;

      if (payout > 0) {
        battleChallengeEconomyEngine.awardPoints(row.fanUserId, payout);
      }

      this.updateStanding(row.fanUserId, won, payout);
      payouts.push({ userId: row.fanUserId, payout, won });
    });

    return { settledCount: payouts.length, payouts };
  }

  getPredictionsForBattle(battleId: string): BattlePrediction[] {
    return [...(this.predictionsByBattle.get(battleId) ?? [])];
  }

  getPredictionLeaderboard(limit: number = 20): PredictionStanding[] {
    return [...this.standings.values()]
      .sort((a, b) => b.pointsWon - a.pointsWon || b.currentStreak - a.currentStreak)
      .slice(0, limit);
  }

  getUserStanding(userId: string): PredictionStanding {
    return this.standings.get(userId) ?? {
      userId,
      totalPredictions: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      pointsWon: 0,
    };
  }

  private updateStanding(userId: string, won: boolean, payout: number): void {
    const current = this.getUserStanding(userId);
    current.totalPredictions += 1;

    if (won) {
      current.wins += 1;
      current.currentStreak += 1;
      current.bestStreak = Math.max(current.bestStreak, current.currentStreak);
      current.pointsWon += payout;
    } else {
      current.losses += 1;
      current.currentStreak = 0;
    }

    this.standings.set(userId, current);
  }
}

export const battlePredictionEngine = new BattlePredictionEngine();
