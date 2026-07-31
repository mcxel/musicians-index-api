/**
 * PresentationEventBridge — Event-driven automated presentation package mapper.
 * Listens to system events and automatically maps them to registered presentation packages:
 *  - WinnerDeclared        → battle-winner-gold
 *  - CypherTurnStarted     → cypher-turn-start
 *  - MonthlyIdolCrown      → monthly-idol-winner
 * Handles state machine transitions automatically prior to launching packages.
 */

import PresentationStateMachine from "./PresentationStateMachine";
import PresentationTimelineEngine from "./PresentationTimelineEngine";

export type TMIEventName =
  | "WinnerDeclared"
  | "CypherTurnStarted"
  | "MonthlyIdolCrown"
  | "PerformerJoinedStage"
  | "SponsorSegmentActivated";

const EVENT_TO_PACKAGE_MAP: Record<TMIEventName, { packageId: string; targetState: "CELEBRATION" | "LIVE" | "WINNER_REVEAL" }> = {
  WinnerDeclared: { packageId: "battle-winner-gold", targetState: "WINNER_REVEAL" },
  CypherTurnStarted: { packageId: "cypher-turn-start", targetState: "LIVE" },
  MonthlyIdolCrown: { packageId: "monthly-idol-winner", targetState: "CELEBRATION" },
  PerformerJoinedStage: { packageId: "cypher-turn-start", targetState: "LIVE" },
  SponsorSegmentActivated: { packageId: "battle-winner-gold", targetState: "LIVE" },
};

class PresentationEventBridgeClass {
  private active: boolean = false;

  public initialize() {
    if (this.active) return;
    this.active = true;

    if (typeof window === "undefined") return;

    window.addEventListener("tmi:system:event", (e: Event) => {
      const customEvent = e as CustomEvent<{ eventName: TMIEventName; payload?: Record<string, unknown> }>;
      const { eventName, payload } = customEvent.detail || {};
      if (eventName) {
        this.handleEvent(eventName, payload);
      }
    });
  }

  public handleEvent(eventName: TMIEventName, payload?: Record<string, unknown>) {
    const config = EVENT_TO_PACKAGE_MAP[eventName];
    if (!config) return;

    // Transition state machine first
    if (PresentationStateMachine.canTransitionTo(config.targetState)) {
      PresentationStateMachine.transitionTo(config.targetState);
    }

    // Play presentation package
    PresentationTimelineEngine.playPackage(config.packageId, payload);
  }
}

export const PresentationEventBridge = new PresentationEventBridgeClass();
export default PresentationEventBridge;
