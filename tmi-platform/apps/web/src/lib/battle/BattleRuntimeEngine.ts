/**
 * BattleRuntimeEngine — Phase 5.2 Battle Runtime Core Engine.
 * Manages match creation, contestant introductions, round lifecycle, judge scoring,
 * audience voting, winner declaration, prize reveal, and cooldown.
 * Emits semantic events ONLY (BattleStarted, RoundStarted, PerformerJoinedStage,
 * VotingOpened, VotingClosed, WinnerDeclared, PrizeRevealed, BattleCooldown).
 */

import { BaseCompetitionRuntime, Competitor } from "@/lib/competition/CompetitionRuntime";

export class BattleRuntimeEngine extends BaseCompetitionRuntime {
  private currentRound: number = 1;
  private prizeLabel: string = "10,000 XP & Diamond Belt";

  constructor(battleId: string) {
    super(battleId, "BATTLE");
  }

  public startBattle(participants?: Competitor[]) {
    if (participants && participants.length) {
      this.participants = participants;
    }
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("BattleStarted", {
      participants: this.participants,
    });
  }

  public startRound(roundNumber: number = 1, leftCompetitor?: Competitor, rightCompetitor?: Competitor) {
    this.currentRound = roundNumber;
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("RoundStarted", {
      roundNumber,
      leftCompetitor: leftCompetitor ?? this.participants[0],
      rightCompetitor: rightCompetitor ?? this.participants[1],
    });
  }

  public startPerformerTurn(performerId: string, performerName?: string) {
    this.currentPerformerId = performerId;
    this.emitSemanticEvent("PerformerJoinedStage", {
      performerId,
      performerName: performerName ?? this.participants.find((p) => p.id === performerId)?.name,
      roundNumber: this.currentRound,
    });
  }

  public openVoting() {
    this.status = "JUDGING";
    this.emitSemanticEvent("VotingOpened", {
      roundNumber: this.currentRound,
      participants: this.participants,
    });
  }

  public closeVoting() {
    this.emitSemanticEvent("VotingClosed", {
      roundNumber: this.currentRound,
    });
  }

  public declareWinner(winnerId: string, winnerName: string, score: number = 100) {
    this.status = "COMPLETED";
    this.winnerId = winnerId;
    this.emitSemanticEvent("WinnerDeclared", {
      winnerId,
      winnerName,
      score,
      roundNumber: this.currentRound,
    });
  }

  public startPrizeReveal(prize?: string) {
    if (prize) this.prizeLabel = prize;
    this.emitSemanticEvent("PrizeRevealed", {
      winnerId: this.winnerId,
      prizeLabel: this.prizeLabel,
    });
  }

  public cooldown() {
    this.status = "IDLE";
    this.currentPerformerId = undefined;
    this.winnerId = undefined;
    this.emitSemanticEvent("BattleCooldown", {
      battleId: this.competitionId,
    });
  }
}

export default BattleRuntimeEngine;
