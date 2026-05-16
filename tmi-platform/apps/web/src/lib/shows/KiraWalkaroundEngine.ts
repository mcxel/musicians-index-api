/**
 * Kira Walkaround Engine
 * Tracks Kira's position, actions, and move history across the show floor.
 */

export type KiraPosition =
  | 'stage-left'
  | 'stage-right'
  | 'center-stage'
  | 'audience-walk'
  | 'contestant-spot'
  | 'judge-area'
  | 'entrance';

export type KiraAction =
  | 'INTERVIEW_CONTESTANT'
  | 'AUDIENCE_CHAT'
  | 'INTRO_ACT'
  | 'RECAP'
  | 'SPONSOR_READ'
  | 'PRIZE_TEASE'
  | 'BEBO_REACTION'
  | 'IDLE_WALK';

export interface KiraWalkaroundState {
  currentPosition: KiraPosition;
  currentAction: KiraAction;
  targetContestantId: string | null;
  lastMoveAt: number;
  moveHistory: Array<{
    from: KiraPosition;
    to: KiraPosition;
    action: KiraAction;
    timestamp: number;
  }>;
}

export class KiraWalkaroundEngine {
  private state: KiraWalkaroundState;

  constructor() {
    this.state = {
      currentPosition: 'entrance',
      currentAction: 'IDLE_WALK',
      targetContestantId: null,
      lastMoveAt: Date.now(),
      moveHistory: [],
    };
  }

  moveTo(position: KiraPosition, action: KiraAction, contestantId?: string): void {
    const from = this.state.currentPosition;
    this.state.moveHistory.push({
      from,
      to: position,
      action,
      timestamp: Date.now(),
    });
    this.state.currentPosition = position;
    this.state.currentAction = action;
    this.state.targetContestantId = contestantId ?? null;
    this.state.lastMoveAt = Date.now();
  }

  interviewContestant(contestantId: string): void {
    this.moveTo('contestant-spot', 'INTERVIEW_CONTESTANT', contestantId);
  }

  walkToAudience(): void {
    this.moveTo('audience-walk', 'AUDIENCE_CHAT');
  }

  reactToBeboHook(hookedContestantId: string): void {
    // Kira moves to the contestant's spot and reacts
    this.moveTo('stage-left', 'BEBO_REACTION', hookedContestantId);
  }

  introAct(contestantId: string): void {
    this.moveTo('center-stage', 'INTRO_ACT', contestantId);
  }

  getState(): KiraWalkaroundState {
    return {
      ...this.state,
      moveHistory: [...this.state.moveHistory],
    };
  }

  getWalkPath(): KiraWalkaroundState['moveHistory'] {
    return [...this.state.moveHistory];
  }

  suggestNextMove(showPhase: string, activeContestantId?: string): KiraAction {
    switch (showPhase) {
      case 'WARMUP':
        return 'AUDIENCE_CHAT';
      case 'ROUND_1':
      case 'ROUND_2':
      case 'ROUND_3':
        return activeContestantId ? 'INTRO_ACT' : 'AUDIENCE_CHAT';
      case 'FINALS':
        return activeContestantId ? 'INTERVIEW_CONTESTANT' : 'RECAP';
      case 'ELIMINATION':
        return 'BEBO_REACTION';
      case 'WINNER_REVEAL':
        return 'PRIZE_TEASE';
      case 'POST_SHOW':
        return 'RECAP';
      default:
        return 'IDLE_WALK';
    }
  }
}
