/**
 * Monthly Idol Engine
 * All-month tournament with two daily windows, idol-style rounds, hall of fame.
 */
import { ShowRuntimeEngine, ShowState, ShowResult } from './ShowRuntimeEngine';

export type IdolWindow = 'MORNING_GLOBAL' | 'EVENING_7PM';
export type IdolRound = 'AUDITION' | 'SEMI_FINAL' | 'FINAL';

export interface MonthlyIdolState extends ShowState {
  currentWindow: IdolWindow;
  currentIdolRound: IdolRound;
  monthlyResetDate: string; // ISO date string
  hallOfFameIds: string[];
  forfeitCount: number;
}

const IDOL_ROUND_ORDER: IdolRound[] = ['AUDITION', 'SEMI_FINAL', 'FINAL'];

export class MonthlyIdolEngine extends ShowRuntimeEngine {
  private idolState: MonthlyIdolState;

  constructor() {
    super('monthly-idol', 3);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    this.idolState = {
      ...this.state,
      currentWindow: 'MORNING_GLOBAL',
      currentIdolRound: 'AUDITION',
      monthlyResetDate: nextMonth.toISOString().split('T')[0],
      hallOfFameIds: [],
      forfeitCount: 0,
    };
  }

  openWindow(window: IdolWindow): void {
    this.idolState.currentWindow = window;
    this.syncBaseState();
  }

  forfeitContestant(id: string): void {
    const contestant = this.idolState.contestants.find((c) => c.id === id);
    if (!contestant) return;
    contestant.active = false;
    contestant.eliminated = true;
    this.idolState.forfeitCount += 1;
    this.syncBaseState();
  }

  bumpContestant(id: string, replacementId: string, replacementName: string): void {
    // Remove the original contestant and add the replacement
    this.forfeitContestant(id);
    this.addContestant(replacementId, replacementName);
    this.syncBaseState();
  }

  advanceToFinals(): void {
    this.idolState.currentIdolRound = 'FINAL';
    this.idolState.phase = 'FINALS';
    this.idolState.round = 3;

    // Keep only top 3 active contestants by score
    const sorted = this.idolState.contestants
      .filter((c) => c.active && !c.eliminated)
      .sort((a, b) => b.score - a.score);

    const topIds = new Set(sorted.slice(0, 3).map((c) => c.id));

    for (const contestant of this.idolState.contestants) {
      if (!topIds.has(contestant.id) && !contestant.eliminated) {
        contestant.active = false;
        contestant.eliminated = true;
      }
    }

    this.syncBaseState();
  }

  crownMonthlyIdol(contestantId: string): ShowResult {
    const result = this.setWinner(contestantId, ['prize-monthly-idol-trophy', 'prize-season-pass', 'prize-winner-nft']);
    this.addToHallOfFame(contestantId);
    this.idolState.phase = 'WINNER_REVEAL';
    this.idolState.winner = result;
    this.syncBaseState();
    return result;
  }

  addToHallOfFame(winnerId: string): void {
    if (!this.idolState.hallOfFameIds.includes(winnerId)) {
      this.idolState.hallOfFameIds.push(winnerId);
    }
    this.syncBaseState();
  }

  getMonthlyResetDate(): string {
    return this.idolState.monthlyResetDate;
  }

  getIdolState(): MonthlyIdolState {
    return {
      ...this.idolState,
      contestants: this.idolState.contestants.map((c) => ({ ...c })),
      hallOfFameIds: [...this.idolState.hallOfFameIds],
    };
  }

  private syncBaseState(): void {
    // Keep the idolState in sync with base state mutations
    this.state = this.idolState;
  }

  override startShow(): void {
    super.startShow();
    this.idolState = { ...this.idolState, ...this.state };
    this.idolState.currentIdolRound = 'AUDITION';
    this.idolState.phase = 'ROUND_1';
  }

  override getState(): MonthlyIdolState {
    return this.getIdolState();
  }
}
