/**
 * LEGACY (Rule 21, 2026-07-31): settleBattle() has no callers anywhere in
 * the codebase as of this audit — the live vote-declare path
 * (PerformanceVotePanel.declare()) awards XP via ProfileRewardsEngine
 * instead. This engine's composite scoring (audience/engagement/
 * performance/safety weighting), streak bonuses, upset detection, and
 * replay-vault/eligibility integration are real, richer capabilities
 * worth inheriting into the canonical path later — do not delete. Note
 * battleChallengeEconomyEngine.awardPoints() also writes to its own
 * isolated in-memory ledger, separate from UniversalRankingSnapshot.
 *
 * BattleRewardSettlementEngine
 * Settles winner/loser points and marks replay + leaderboard publication artifacts.
 */

import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battleMatchLifecycleEngine } from "@/lib/competition/BattleMatchLifecycleEngine";
import { battleEligibilityEngine } from "@/lib/competition/BattleEligibilityEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";
import { battleReplayVaultEngine } from "@/lib/competition/BattleReplayVaultEngine";

export interface BattleSettlementResult {
  battleId: string;
  winnerId: string;
  loserId: string;
  winnerAwardedPoints: number;
  loserAwardedPoints: number;
  winnerCompositeScore: number;
  loserCompositeScore: number;
  status: "settled" | "failed";
}

export interface BattleSettlementMetrics {
  audienceVotesWinner: number;
  audienceVotesLoser: number;
  engagementWinner: number;
  engagementLoser: number;
  performanceWinner: number;
  performanceLoser: number;
  safetyWinner: number;
  safetyLoser: number;
  upsetWin?: boolean;
  streakBonusPoints?: number;
  chatMessages?: number;
}

export class BattleRewardSettlementEngine {
  settleBattle(
    battleId: string,
    winnerId: string,
    loserId: string,
    metrics: BattleSettlementMetrics,
  ): BattleSettlementResult {
    const match = battleMatchLifecycleEngine.markCompleted(battleId, winnerId);
    if (!match) {
      return {
        battleId,
        winnerId,
        loserId,
        winnerAwardedPoints: 0,
        loserAwardedPoints: 0,
        winnerCompositeScore: 0,
        loserCompositeScore: 0,
        status: "failed",
      };
    }

    const winnerCompositeScore =
      metrics.audienceVotesWinner * 0.6 +
      metrics.engagementWinner * 0.2 +
      metrics.performanceWinner * 0.15 +
      metrics.safetyWinner * 0.05;
    const loserCompositeScore =
      metrics.audienceVotesLoser * 0.6 +
      metrics.engagementLoser * 0.2 +
      metrics.performanceLoser * 0.15 +
      metrics.safetyLoser * 0.05;

    const winnerBase = metrics.upsetWin ? 60 : 45;
    const defenderBonus = metrics.upsetWin ? 0 : 10;
    const streakBonus = Math.max(0, Math.floor(metrics.streakBonusPoints ?? 0));
    const winnerAwarded = winnerBase + defenderBonus + streakBonus;
    const loserAwarded = 10;

    battleChallengeEconomyEngine.awardPoints(winnerId, winnerAwarded);
    battleChallengeEconomyEngine.awardPoints(loserId, loserAwarded);

    battlePredictionEngine.settlePredictions({
      battleId,
      winnerId,
      upsetWin: Boolean(metrics.upsetWin),
    });

    battleReplayVaultEngine.archiveBattle({
      battleId,
      winnerId,
      loserId,
      winnerScore: winnerCompositeScore,
      loserScore: loserCompositeScore,
      totalVotes: metrics.audienceVotesWinner + metrics.audienceVotesLoser,
      chatMessages: metrics.chatMessages ?? 0,
    });

    battleBillboardLobbyWallEngine.markCompleted(battleId);
    battleBillboardLobbyWallEngine.markReplayReady(battleId);
    battleBillboardLobbyWallEngine.markLeaderboardUpdated(battleId);

    battleEligibilityEngine.markCompletedMatch(winnerId, loserId);
    battleEligibilityEngine.markCompletedMatch(loserId, winnerId);

    battleMatchLifecycleEngine.setStatus(battleId, "rewarded");

    return {
      battleId,
      winnerId,
      loserId,
      winnerAwardedPoints: winnerAwarded,
      loserAwardedPoints: loserAwarded,
      winnerCompositeScore,
      loserCompositeScore,
      status: "settled",
    };
  }
}

export const battleRewardSettlementEngine = new BattleRewardSettlementEngine();
