/**
 * ConcertRuntimeEngine — 🎤 4. Concert Runtime
 * Manages live concert setlists, song transitions, guest appearances, encore logic, and finales.
 * Emits semantic events ONLY (ConcertStarted, SongStarted, EncoreTriggered, FinaleCompleted).
 */

import { BaseCompetitionRuntime } from "./CompetitionRuntime";

export class ConcertRuntimeEngine extends BaseCompetitionRuntime {
  constructor(concertId: string) {
    super(concertId, "CONCERT");
  }

  public startConcert(headlinerName: string) {
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("ConcertStarted", { headlinerName });
  }

  public playSong(songTitle: string, index: number) {
    this.emitSemanticEvent("SongStarted", { songTitle, index });
  }

  public triggerEncore() {
    this.emitSemanticEvent("EncoreTriggered", { timestamp: Date.now() });
  }

  public completeFinale() {
    this.status = "COMPLETED";
    this.emitSemanticEvent("MonthlyIdolCrown", { concertId: this.competitionId });
  }
}

export default ConcertRuntimeEngine;
