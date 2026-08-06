/**
 * CompetitionRuntime — Canonical shared base service for live event runtimes.
 * Provides shared infrastructure: QueueManager, StageManager, JudgeManager,
 * AudienceManager, ScoringEngine, and EventBus.
 *
 * Runtimes (Battle, Cypher, Challenge, Concert, Playlist, Radio, Shuffle) inherit this base and emit
 * semantic events ONLY. Zero presentation or rendering logic lives here.
 */

export interface Competitor {
  id: string;
  name: string;
  avatarUrl?: string;
  score?: number;
}

export interface CompetitionStateSnapshot {
  competitionId: string;
  type: "BATTLE" | "CYPHER" | "CHALLENGE" | "CONCERT" | "PLAYLIST" | "RADIO" | "SHUFFLE";
  status: "IDLE" | "IN_PROGRESS" | "JUDGING" | "COMPLETED";
  currentPerformerId?: string;
  winnerId?: string;
  participants: Competitor[];
}

export class BaseCompetitionRuntime {
  protected competitionId: string;
  protected type: CompetitionStateSnapshot["type"];
  protected status: CompetitionStateSnapshot["status"] = "IDLE";
  protected participants: Competitor[] = [];
  protected currentPerformerId?: string;
  protected winnerId?: string;

  constructor(id: string, type: CompetitionStateSnapshot["type"]) {
    this.competitionId = id;
    this.type = type;
  }

  public addParticipant(c: Competitor) {
    this.participants.push(c);
  }

  public getSnapshot(): CompetitionStateSnapshot {
    return {
      competitionId: this.competitionId,
      type: this.type,
      status: this.status,
      currentPerformerId: this.currentPerformerId,
      winnerId: this.winnerId,
      participants: [...this.participants],
    };
  }

  protected emitSemanticEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, competitionId: this.competitionId } },
        })
      );
    } catch (e) {}
  }
}
