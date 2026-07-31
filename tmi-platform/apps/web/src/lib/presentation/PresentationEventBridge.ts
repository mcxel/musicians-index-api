/**
 * PresentationEventBridge — Event-driven automated presentation package mapper.
 * Listens to system events and maps them to Show Packages / legacy timelines:
 *  - Semantic battle events → ShowPackageDirector (Battle Pack v1)
 *  - Legacy WinnerDeclared / CypherTurnStarted / MonthlyIdolCrown → timeline packages
 */

import PresentationStateMachine from "./PresentationStateMachine";
import PresentationTimelineEngine from "./PresentationTimelineEngine";
import ShowPackageDirector from "./ShowPackageDirector";
import type { PresentationSemanticEvent } from "./PresentationEvents";

export type TMIEventName =
  | "WinnerDeclared"
  | "CypherTurnStarted"
  | "MonthlyIdolCrown"
  | "PerformerJoinedStage"
  | "SponsorSegmentActivated"
  | PresentationSemanticEvent;

const LEGACY_EVENT_TO_PACKAGE_MAP: Partial<
  Record<TMIEventName, { packageId: string; targetState: "CELEBRATION" | "LIVE" | "WINNER_REVEAL" }>
> = {
  WinnerDeclared: { packageId: "battle-winner-gold", targetState: "WINNER_REVEAL" },
  CypherTurnStarted: { packageId: "cypher-turn-start", targetState: "LIVE" },
  MonthlyIdolCrown: { packageId: "monthly-idol-winner", targetState: "CELEBRATION" },
  PerformerJoinedStage: { packageId: "cypher-turn-start", targetState: "LIVE" },
  SponsorSegmentActivated: { packageId: "battle-winner-gold", targetState: "LIVE" },
};

const SEMANTIC_EVENTS = new Set<PresentationSemanticEvent>([
  "BATTLE_START",
  "BATTLE_INTRO",
  "VS_REVEAL",
  "PERFORMER_TURN",
  "PERFORMANCE_START",
  "VOTING_OPEN",
  "VOTING_CLOSE",
  "WINNER_DECLARED",
  "ROUND_COMPLETE",
  "SHOW_IDLE",
  "CRITICAL_ALERT",
]);

class PresentationEventBridgeClass {
  private active: boolean = false;

  public initialize() {
    if (this.active) return;
    this.active = true;

    if (typeof window === "undefined") return;

    window.addEventListener("tmi:system:event", (e: Event) => {
      const customEvent = e as CustomEvent<{
        eventName: TMIEventName;
        payload?: Record<string, unknown>;
      }>;
      const { eventName, payload } = customEvent.detail || {};
      if (eventName) {
        this.handleEvent(eventName, payload);
      }
    });

    window.addEventListener("tmi:presentation:event", (e: Event) => {
      const customEvent = e as CustomEvent<{
        event: PresentationSemanticEvent;
        payload?: Record<string, unknown>;
      }>;
      const { event, payload } = customEvent.detail || {};
      if (event) {
        this.handleSemantic(event, payload);
      }
    });
  }

  public handleSemantic(event: PresentationSemanticEvent, payload?: Record<string, unknown>) {
    ShowPackageDirector.handleEvent(event, {
      roomId: typeof payload?.roomId === "string" ? payload.roomId : undefined,
      leftLabel: typeof payload?.leftLabel === "string" ? payload.leftLabel : undefined,
      rightLabel: typeof payload?.rightLabel === "string" ? payload.rightLabel : undefined,
      performerLabel:
        typeof payload?.performerLabel === "string" ? payload.performerLabel : undefined,
      winnerLabel: typeof payload?.winnerLabel === "string" ? payload.winnerLabel : undefined,
      roundLabel: typeof payload?.roundLabel === "string" ? payload.roundLabel : undefined,
      alertMessage: typeof payload?.alertMessage === "string" ? payload.alertMessage : undefined,
      meta: payload,
    });
  }

  public handleEvent(eventName: TMIEventName, payload?: Record<string, unknown>) {
    if (SEMANTIC_EVENTS.has(eventName as PresentationSemanticEvent)) {
      this.handleSemantic(eventName as PresentationSemanticEvent, payload);
      return;
    }

    const config = LEGACY_EVENT_TO_PACKAGE_MAP[eventName];
    if (!config) return;

    if (PresentationStateMachine.canTransitionTo(config.targetState)) {
      PresentationStateMachine.transitionTo(config.targetState);
    }

    if (eventName === "WinnerDeclared") {
      ShowPackageDirector.handleEvent("WINNER_DECLARED", {
        winnerLabel: typeof payload?.winnerName === "string" ? payload.winnerName : undefined,
        meta: payload,
      });
    }

    PresentationTimelineEngine.playPackage(config.packageId, payload);
  }
}

export const PresentationEventBridge = new PresentationEventBridgeClass();
export default PresentationEventBridge;
