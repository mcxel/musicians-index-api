/**
 * BattleRuntimeEngine — 🥇 1. Battle Runtime
 * Manages match creation, contestant introductions, rounds, judge scoring, and winner declaration.
 * Emits semantic events ONLY (BattleStarted, PerformerTurnStarted, WinnerDeclared).
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";

export class BattleRuntimeEngine extends BaseCompetitionRuntime {
  constructor(battleId: string) {
    super(battleId, "BATTLE");
  }

  public startBattle() {
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("BattleStarted", {
      participants: this.participants,
    });
  }

  public startPerformerTurn(performerId: string) {
    this.currentPerformerId = performerId;
    this.emitSemanticEvent("PerformerJoinedStage", {
      performerId,
    });
  }

  public declareWinner(winnerId: string, winnerName: string) {
    this.status = "COMPLETED";
    this.winnerId = winnerId;
    this.emitSemanticEvent("WinnerDeclared", {
      winnerId,
      winnerName,
    });
  }
}

export default BattleRuntimeEngine;
