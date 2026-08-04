/**
 * CypherRuntimeEngine — Phase 5.2 Turn-Based Performance Engine.
 * Manages turn-based cypher, spoken word, poetry, and showcase lifecycle states.
 * Emits pure semantic events ONLY with zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime, Competitor } from "@/lib/competition/CompetitionRuntime";

export interface CypherBeatInfo {
  beatId: string;
  title: string;
  producer: string;
  bpm: number;
  genre: string;
  audioUrl: string;
}

export class CypherRuntimeEngine extends BaseCompetitionRuntime {
  private currentTurnIndex: number = 0;
  private selectedBeat?: CypherBeatInfo;
  private currentRoundNumber: number = 1;

  constructor(cypherId: string) {
    super(cypherId, "CYPHER");
  }

  public initializeCypher(participants: Competitor[]) {
    this.participants = participants;
    this.status = "IDLE";
    this.currentTurnIndex = 0;
    this.emitSemanticEvent("InitializeCypher", {
      cypherId: this.competitionId,
      participants: this.participants,
    });
  }

  public startHostIntroduction(hostName: string = "Big Ace") {
    this.emitSemanticEvent("HostIntroduction", {
      hostName,
      cypherId: this.competitionId,
    });
  }

  public selectBeat(beat: CypherBeatInfo) {
    this.selectedBeat = beat;
    this.emitSemanticEvent("BeatSelection", {
      beat,
      cypherId: this.competitionId,
    });
  }

  public startBeatCountdown(durationSeconds: number = 5) {
    this.emitSemanticEvent("BeatCountdown", {
      durationSeconds,
      beat: this.selectedBeat,
    });
  }

  public startCypher() {
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("CypherStart", {
      participants: this.participants,
      beat: this.selectedBeat,
    });
  }

  public introducePerformer(performerId: string) {
    const performer = this.participants.find((p) => p.id === performerId);
    this.emitSemanticEvent("PerformerIntroduction", {
      performerId,
      performerName: performer?.name ?? "Unknown Performer",
    });
  }

  public passMic(fromPerformerId: string, toPerformerId: string) {
    this.currentPerformerId = toPerformerId;
    this.emitSemanticEvent("MicPass", {
      fromPerformerId,
      toPerformerId,
      toPerformerName: this.participants.find((p) => p.id === toPerformerId)?.name,
    });
  }

  public startPerformerTurn(performerId: string) {
    this.currentPerformerId = performerId;
    this.emitSemanticEvent("PerformerTurnStart", {
      performerId,
      performerName: this.participants.find((p) => p.id === performerId)?.name,
      turnIndex: this.currentTurnIndex,
    });
  }

  public triggerBeatDrop() {
    this.emitSemanticEvent("BeatDrop", {
      beat: this.selectedBeat,
      performerId: this.currentPerformerId,
    });
  }

  public setPerformanceActive() {
    this.emitSemanticEvent("PerformanceActive", {
      performerId: this.currentPerformerId,
    });
  }

  public triggerCrowdReaction(intensity: number = 0.8) {
    this.emitSemanticEvent("CrowdReaction", {
      intensity,
      performerId: this.currentPerformerId,
    });
  }

  public completeTurn() {
    this.emitSemanticEvent("TurnComplete", {
      completedPerformerId: this.currentPerformerId,
      turnIndex: this.currentTurnIndex,
    });
    this.currentTurnIndex += 1;
  }

  public nextPerformer(): Competitor | null {
    if (this.currentTurnIndex < this.participants.length) {
      const next = this.participants[this.currentTurnIndex]!;
      this.currentPerformerId = next.id;
      this.emitSemanticEvent("NextPerformer", {
        nextPerformerId: next.id,
        nextPerformerName: next.name,
      });
      return next;
    }
    this.emitSemanticEvent("FinalPerformance", {
      cypherId: this.competitionId,
    });
    return null;
  }

  public openVoting() {
    this.status = "JUDGING";
    this.emitSemanticEvent("VotingOpen", {
      participants: this.participants,
    });
  }

  public closeVoting() {
    this.emitSemanticEvent("VotingClosed", {
      cypherId: this.competitionId,
    });
  }

  public declareWinner(winnerId: string, winnerName: string, score: number = 100) {
    this.status = "COMPLETED";
    this.winnerId = winnerId;
    this.emitSemanticEvent("WinnerDeclared", {
      winnerId,
      winnerName,
      score,
    });
  }

  public revealSpotlight(winnerId: string) {
    this.emitSemanticEvent("SpotlightReveal", {
      winnerId,
      winnerName: this.participants.find((p) => p.id === winnerId)?.name,
    });
  }

  public cooldown() {
    this.status = "IDLE";
    this.currentPerformerId = undefined;
    this.winnerId = undefined;
    this.emitSemanticEvent("CypherCooldown", {
      cypherId: this.competitionId,
    });
  }
}

export default CypherRuntimeEngine;
