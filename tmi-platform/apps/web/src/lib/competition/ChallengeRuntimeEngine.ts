/**
 * ChallengeRuntimeEngine — 🥉 3. Challenge Runtime
 * Configurable challenge formats (Dance battles, Producer showcases, Comedy, DJ sets).
 * Emits semantic events ONLY (ChallengeStarted, SubmissionEvaluated, ChallengeWinner).
 */

import { BaseCompetitionRuntime } from "./CompetitionRuntime";

export class ChallengeRuntimeEngine extends BaseCompetitionRuntime {
  constructor(challengeId: string) {
    super(challengeId, "CHALLENGE");
  }

  public startChallenge(format: string) {
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("ChallengeStarted", { format });
  }

  public declareChallengeWinner(winnerId: string, winnerName: string) {
    this.status = "COMPLETED";
    this.winnerId = winnerId;
    this.emitSemanticEvent("WinnerDeclared", { winnerId, winnerName });
  }
}

export default ChallengeRuntimeEngine;
