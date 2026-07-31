/**
 * CypherRuntimeEngine — 🥈 2. Cypher Runtime
 * Manages performer queue, mic passing, beat switching, and spotlight handoffs.
 * Emits semantic events ONLY (CypherStarted, CypherTurnStarted, MicPassed).
 */

import { BaseCompetitionRuntime } from "./CompetitionRuntime";

export class CypherRuntimeEngine extends BaseCompetitionRuntime {
  constructor(cypherId: string) {
    super(cypherId, "CYPHER");
  }

  public startCypher() {
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("CypherStarted", {
      circleSize: this.participants.length,
    });
  }

  public passMicToNext(nextPerformerId: string, nextPerformerName: string) {
    this.currentPerformerId = nextPerformerId;
    this.emitSemanticEvent("CypherTurnStarted", {
      performerId: nextPerformerId,
      performerName: nextPerformerName,
    });
  }
}

export default CypherRuntimeEngine;
