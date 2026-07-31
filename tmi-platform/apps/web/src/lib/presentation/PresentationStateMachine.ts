/**
 * PresentationStateMachine — Governance state machine for room & show presentations.
 * Enforces valid state transitions to prevent overlapping effects or audio glitches:
 *  IDLE → COUNTDOWN → OPENING → LIVE → JUDGING → WINNER_REVEAL → CELEBRATION → COOLDOWN → IDLE
 */

export type PresentationState =
  | "IDLE"
  | "COUNTDOWN"
  | "OPENING"
  | "LIVE"
  | "JUDGING"
  | "WINNER_REVEAL"
  | "CELEBRATION"
  | "COOLDOWN";

const VALID_TRANSITIONS: Record<PresentationState, PresentationState[]> = {
  IDLE: ["COUNTDOWN", "OPENING", "LIVE"],
  COUNTDOWN: ["OPENING", "LIVE", "IDLE"],
  OPENING: ["LIVE", "IDLE"],
  LIVE: ["JUDGING", "WINNER_REVEAL", "CELEBRATION", "COOLDOWN", "IDLE"],
  JUDGING: ["WINNER_REVEAL", "LIVE", "IDLE"],
  WINNER_REVEAL: ["CELEBRATION", "COOLDOWN"],
  CELEBRATION: ["COOLDOWN", "IDLE"],
  COOLDOWN: ["IDLE", "LIVE"],
};

class PresentationStateMachineClass {
  private currentState: PresentationState = "IDLE";
  private listeners: Set<(state: PresentationState) => void> = new Set();

  public getState(): PresentationState {
    return this.currentState;
  }

  public canTransitionTo(nextState: PresentationState): boolean {
    const allowed = VALID_TRANSITIONS[this.currentState] ?? [];
    return allowed.includes(nextState);
  }

  public transitionTo(nextState: PresentationState): boolean {
    if (!this.canTransitionTo(nextState)) {
      console.warn(
        `[PresentationStateMachine] Invalid transition from ${this.currentState} to ${nextState}`
      );
      return false;
    }

    this.currentState = nextState;
    this.listeners.forEach((fn) => fn(nextState));

    try {
      window.dispatchEvent(
        new CustomEvent("tmi:presentation:state_changed", {
          detail: { state: nextState },
        })
      );
    } catch (e) {}

    return true;
  }

  public subscribe(fn: (state: PresentationState) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const PresentationStateMachine = new PresentationStateMachineClass();
export default PresentationStateMachine;
