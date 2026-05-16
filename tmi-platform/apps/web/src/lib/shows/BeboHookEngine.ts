/**
 * Bebo Hook Engine
 * Manages Bebo's hook/cane panel system for Monday Night Stage.
 * Crowd vote thresholds trigger automatic hooks or returns.
 */

export type BeboAction = 'HOOK' | 'RETURN' | 'HOLD' | 'IDLE';

export interface BeboPanelState {
  contestantId: string | null;
  action: BeboAction;
  crowdBooThreshold: number;  // boo% to trigger auto-hook
  crowdYayThreshold: number;  // yay% to trigger return
  autoHookEnabled: boolean;
  hookHistory: Array<{
    contestantId: string;
    action: BeboAction;
    timestamp: number;
    crowdBooAtHook: number;
  }>;
}

export class BeboHookEngine {
  private state: BeboPanelState;

  constructor(crowdBooThreshold = 0.6, crowdYayThreshold = 0.7) {
    this.state = {
      contestantId: null,
      action: 'IDLE',
      crowdBooThreshold,
      crowdYayThreshold,
      autoHookEnabled: true,
      hookHistory: [],
    };
  }

  checkCrowdVote(booCount: number, yayCount: number): BeboAction | null {
    const total = booCount + yayCount;
    if (total === 0) return null;

    const booPercent = booCount / total;
    const yayPercent = yayCount / total;

    if (booPercent >= this.state.crowdBooThreshold && this.state.autoHookEnabled) {
      return 'HOOK';
    }
    if (yayPercent >= this.state.crowdYayThreshold && this.state.action === 'HOOK') {
      return 'RETURN';
    }
    return null;
  }

  hookPerformer(contestantId: string, crowdBooPercent: number): void {
    this.state.contestantId = contestantId;
    this.state.action = 'HOOK';
    this.state.hookHistory.push({
      contestantId,
      action: 'HOOK',
      timestamp: Date.now(),
      crowdBooAtHook: crowdBooPercent,
    });
  }

  returnPerformer(contestantId: string, crowdYayPercent: number): void {
    this.state.contestantId = contestantId;
    this.state.action = 'RETURN';
    this.state.hookHistory.push({
      contestantId,
      action: 'RETURN',
      timestamp: Date.now(),
      crowdBooAtHook: 1 - crowdYayPercent,
    });
  }

  holdAction(contestantId: string): void {
    this.state.contestantId = contestantId;
    this.state.action = 'HOLD';
    this.state.hookHistory.push({
      contestantId,
      action: 'HOLD',
      timestamp: Date.now(),
      crowdBooAtHook: 0,
    });
  }

  getState(): BeboPanelState {
    return {
      ...this.state,
      hookHistory: [...this.state.hookHistory],
    };
  }

  getHookHistory(): BeboPanelState['hookHistory'] {
    return [...this.state.hookHistory];
  }

  shouldAutoHook(booCount: number, totalVotes: number): boolean {
    if (totalVotes === 0) return false;
    return booCount / totalVotes >= this.state.crowdBooThreshold;
  }

  shouldAutoReturn(yayCount: number, totalVotes: number): boolean {
    if (totalVotes === 0) return false;
    return yayCount / totalVotes >= this.state.crowdYayThreshold;
  }
}
