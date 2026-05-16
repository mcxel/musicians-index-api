/**
 * Monday Night Stage Engine
 * Combines ShowRuntimeEngine + BeboHookEngine + KiraWalkaroundEngine.
 */
import { ShowRuntimeEngine } from './ShowRuntimeEngine';
import { BeboHookEngine } from './BeboHookEngine';
import { KiraWalkaroundEngine } from './KiraWalkaroundEngine';

export interface MondayNightStageState {
  show: ReturnType<ShowRuntimeEngine['getState']>;
  bebo: ReturnType<BeboHookEngine['getState']>;
  kira: ReturnType<KiraWalkaroundEngine['getState']>;
  panelVisible: boolean;
  panelContestantId: string | null;
}

export class MondayNightStageEngine {
  readonly show: ShowRuntimeEngine;
  readonly bebo: BeboHookEngine;
  readonly kira: KiraWalkaroundEngine;

  private panelVisible = false;
  private panelContestantId: string | null = null;

  constructor() {
    this.show = new ShowRuntimeEngine('monday-night-stage', 3);
    this.bebo = new BeboHookEngine(0.6, 0.7);
    this.kira = new KiraWalkaroundEngine();
  }

  startShow(): void {
    this.show.startShow();
    this.kira.moveTo('entrance', 'IDLE_WALK');
  }

  presentContestant(contestantId: string): void {
    this.panelContestantId = contestantId;
    this.panelVisible = true;
    // Kira walks up and intros the contestant
    this.kira.introAct(contestantId);
    // Open crowd vote
    this.show.openCrowdVote();
  }

  processCrowdVote(): void {
    const state = this.show.getState();
    const booCount = state.crowdBooCount;
    const yayCount = state.crowdYayCount;
    const action = this.bebo.checkCrowdVote(booCount, yayCount);
    const total = booCount + yayCount;

    if (action === 'HOOK' && this.panelContestantId) {
      const booPercent = total > 0 ? booCount / total : 0;
      this.bebo.hookPerformer(this.panelContestantId, booPercent);
      this.show.eliminateContestant(this.panelContestantId);
      this.kira.reactToBeboHook(this.panelContestantId);
      this.panelVisible = false;
    } else if (action === 'RETURN' && this.panelContestantId) {
      const yayPercent = total > 0 ? yayCount / total : 0;
      this.bebo.returnPerformer(this.panelContestantId, yayPercent);
    }

    this.show.closeCrowdVote();
  }

  getFullState(): MondayNightStageState {
    return {
      show: this.show.getState(),
      bebo: this.bebo.getState(),
      kira: this.kira.getState(),
      panelVisible: this.panelVisible,
      panelContestantId: this.panelContestantId,
    };
  }
}
