/**
 * PresentationEventBus — spectacularizes authoritative domain events only.
 * Never manufactures crowd / tips / winners.
 */

export type AuthoritativeDomainEventType =
  | "BATTLE_SCORE_UPDATED"
  | "BATTLE_WINNER_DECLARED"
  | "CHALLENGE_OBJECTIVE_PASSED"
  | "CHALLENGE_OBJECTIVE_FAILED"
  | "CYPHER_MIC_HANDOFF"
  | "ROUND_TIMER_TICK"
  | "REAL_REACTION"
  | "REAL_TIP"
  | "QUEUE_ADVANCED"
  | "GAME_SHOW_TURN_CHANGED"
  | "OCCUPANT_JOINED"
  | "OCCUPANT_LEFT";

/** Events the bus will refuse — fabrication / fake engagement */
export type FabricatedCrowdEvent =
  | "FAKE_CROWD_APPLAUSE"
  | "SYNTHETIC_VIEWER_COUNT"
  | "FABRICATED_REACTION_STORM"
  | "FAKE_TIP_RAIN"
  | "INVENTED_WINNER";

export interface PresentationSpectacleEvent {
  eventId: string;
  sessionId: string;
  type: AuthoritativeDomainEventType;
  issuedAtMs: number;
  /** Must point at domain engine / ledger that owns the fact */
  authoritativeSourceId: string;
  payload: Record<string, unknown>;
}

export function isFabricatedCrowdEvent(type: string): type is FabricatedCrowdEvent {
  return (
    type === "FAKE_CROWD_APPLAUSE" ||
    type === "SYNTHETIC_VIEWER_COUNT" ||
    type === "FABRICATED_REACTION_STORM" ||
    type === "FAKE_TIP_RAIN" ||
    type === "INVENTED_WINNER"
  );
}

const AUTHORITATIVE = new Set<string>([
  "BATTLE_SCORE_UPDATED",
  "BATTLE_WINNER_DECLARED",
  "CHALLENGE_OBJECTIVE_PASSED",
  "CHALLENGE_OBJECTIVE_FAILED",
  "CYPHER_MIC_HANDOFF",
  "ROUND_TIMER_TICK",
  "REAL_REACTION",
  "REAL_TIP",
  "QUEUE_ADVANCED",
  "GAME_SHOW_TURN_CHANGED",
  "OCCUPANT_JOINED",
  "OCCUPANT_LEFT",
]);

export class PresentationEventBus {
  private listeners: Array<(e: PresentationSpectacleEvent) => void> = [];
  private history: PresentationSpectacleEvent[] = [];

  subscribe(fn: (e: PresentationSpectacleEvent) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  /**
   * Publish only authoritative domain events.
   * Rejects fabricated crowd / fake money / invented winners.
   */
  publish(event: PresentationSpectacleEvent): void {
    if (isFabricatedCrowdEvent(event.type)) {
      throw new Error(`PresentationEventBus rejects fabricated crowd event: ${event.type}`);
    }
    if (!AUTHORITATIVE.has(event.type)) {
      throw new Error(`PresentationEventBus rejects non-authoritative event: ${event.type}`);
    }
    if (!event.authoritativeSourceId) {
      throw new Error("PresentationEventBus requires authoritativeSourceId");
    }
    this.history.push(event);
    for (const l of this.listeners) l(event);
  }

  /** Test/observability — does not accept fabricated types */
  tryPublishUnsafe(type: string, sessionId: string): never | void {
    if (isFabricatedCrowdEvent(type)) {
      throw new Error(`PresentationEventBus rejects fabricated crowd event: ${type}`);
    }
    throw new Error(`PresentationEventBus rejects non-authoritative event: ${type}`);
  }

  getHistory(): readonly PresentationSpectacleEvent[] {
    return this.history;
  }
}
