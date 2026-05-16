/**
 * Show Runtime Engine — Base class for all TMI shows.
 */

export type ShowPhase =
  | 'WARMUP'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'FINALS'
  | 'ELIMINATION'
  | 'WINNER_REVEAL'
  | 'POST_SHOW';

export interface ShowResult {
  winnerId: string;
  winnerName: string;
  score: number;
  showId: string;
  timestamp: number;
  prizeIds: string[];
}

export interface Contestant {
  id: string;
  name: string;
  score: number;
  active: boolean;
  eliminated: boolean;
  joinedAt: number;
}

export interface ShowState {
  showId: string;
  phase: ShowPhase;
  contestants: Contestant[];
  round: number;
  maxRounds: number;
  timeRemainingMs: number;
  crowdVoteOpen: boolean;
  crowdYayCount: number;
  crowdBooCount: number;
  winner: ShowResult | null;
  startedAt: number | null;
}

const PHASE_ORDER: ShowPhase[] = [
  'WARMUP',
  'ROUND_1',
  'ROUND_2',
  'ROUND_3',
  'FINALS',
  'ELIMINATION',
  'WINNER_REVEAL',
  'POST_SHOW',
];

export class ShowRuntimeEngine {
  protected state: ShowState;

  constructor(showId: string, maxRounds = 3) {
    this.state = {
      showId,
      phase: 'WARMUP',
      contestants: [],
      round: 0,
      maxRounds,
      timeRemainingMs: 0,
      crowdVoteOpen: false,
      crowdYayCount: 0,
      crowdBooCount: 0,
      winner: null,
      startedAt: null,
    };
  }

  addContestant(id: string, name: string): void {
    if (this.state.contestants.find((c) => c.id === id)) return;
    this.state.contestants.push({
      id,
      name,
      score: 0,
      active: true,
      eliminated: false,
      joinedAt: Date.now(),
    });
  }

  removeContestant(id: string): void {
    this.state.contestants = this.state.contestants.filter((c) => c.id !== id);
  }

  startShow(): void {
    this.state.startedAt = Date.now();
    this.state.phase = 'ROUND_1';
    this.state.round = 1;
    this.state.timeRemainingMs = 180_000; // 3 minutes per round default
  }

  advancePhase(): ShowPhase {
    const currentIndex = PHASE_ORDER.indexOf(this.state.phase);
    const nextIndex = Math.min(currentIndex + 1, PHASE_ORDER.length - 1);
    this.state.phase = PHASE_ORDER[nextIndex];

    // Advance round counter on ROUND_x transitions
    if (
      this.state.phase === 'ROUND_2' ||
      this.state.phase === 'ROUND_3' ||
      this.state.phase === 'FINALS'
    ) {
      this.state.round = Math.min(this.state.round + 1, this.state.maxRounds);
    }

    this.state.timeRemainingMs = 180_000;
    return this.state.phase;
  }

  openCrowdVote(): void {
    this.state.crowdVoteOpen = true;
    this.state.crowdYayCount = 0;
    this.state.crowdBooCount = 0;
  }

  closeCrowdVote(): void {
    this.state.crowdVoteOpen = false;
  }

  recordCrowdVote(type: 'yay' | 'boo'): void {
    if (!this.state.crowdVoteOpen) return;
    if (type === 'yay') {
      this.state.crowdYayCount += 1;
    } else {
      this.state.crowdBooCount += 1;
    }
  }

  eliminateContestant(id: string): void {
    const contestant = this.state.contestants.find((c) => c.id === id);
    if (!contestant) return;
    contestant.eliminated = true;
    contestant.active = false;
  }

  setWinner(contestantId: string, prizeIds: string[] = []): ShowResult {
    const contestant = this.state.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      throw new Error(`Contestant ${contestantId} not found`);
    }

    const result: ShowResult = {
      winnerId: contestant.id,
      winnerName: contestant.name,
      score: contestant.score,
      showId: this.state.showId,
      timestamp: Date.now(),
      prizeIds,
    };

    this.state.winner = result;
    this.state.phase = 'WINNER_REVEAL';
    return result;
  }

  getState(): ShowState {
    return { ...this.state, contestants: this.state.contestants.map((c) => ({ ...c })) };
  }

  getActiveContestants(): Contestant[] {
    return this.state.contestants.filter((c) => c.active && !c.eliminated);
  }
}
