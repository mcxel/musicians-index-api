/**
 * Contestant Forfeit Engine
 * Applies 2-minute grace window before automatic forfeit.
 */

export interface ContestantPresence {
  contestantId: string;
  showId: string;
  absentSinceMs: number;
  graceUntilMs: number;
  state: 'FORFEIT_WINDOW';
}

export interface ForfeitDecision {
  contestantId: string;
  showId: string;
  forfeited: boolean;
  reason: 'grace-active' | 'grace-expired';
  checkedAtMs: number;
}

export class ContestantForfeitEngine {
  static readonly GRACE_WINDOW_MS = 2 * 60_000;

  startForfeitWindow(contestantId: string, showId: string, nowMs = Date.now()): ContestantPresence {
    return {
      contestantId,
      showId,
      absentSinceMs: nowMs,
      graceUntilMs: nowMs + ContestantForfeitEngine.GRACE_WINDOW_MS,
      state: 'FORFEIT_WINDOW',
    };
  }

  evaluate(window: ContestantPresence, nowMs = Date.now()): ForfeitDecision {
    const forfeited = nowMs >= window.graceUntilMs;
    return {
      contestantId: window.contestantId,
      showId: window.showId,
      forfeited,
      reason: forfeited ? 'grace-expired' : 'grace-active',
      checkedAtMs: nowMs,
    };
  }
}

export const contestantForfeitEngine = new ContestantForfeitEngine();
