/**
 * DirtyDozensBattleEngine
 * 12-contestant battle format: head-to-head matchups, crowd vote, judge calls.
 */

export type BattlePhase = "lobby" | "matchup" | "voting" | "result" | "semifinals" | "finals" | "champion" | "ended";

export interface Battler {
  userId: string;
  displayName: string;
  wins: number;
  losses: number;
  totalCrowdVotes: number;
  isEliminated: boolean;
  seed: number; // 1–12
}

export interface Matchup {
  id: string;
  battlerAId: string;
  battlerBId: string;
  phase: BattlePhase;
  startedAt: number;
  durationMs: number;
  votes: Map<string, "A" | "B">;  // voterId → pick
  judgeCall?: "A" | "B";
  winnerId?: string;
  loserId?: string;
  crowdVotesA: number;
  crowdVotesB: number;
}

export interface DirtyDozensState {
  showId: string;
  phase: BattlePhase;
  battlers: Map<string, Battler>;
  currentMatchup: Matchup | null;
  completedMatchups: Matchup[];
  bracket: string[][];
  champion: string | null;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class DirtyDozensBattleEngine {
  private static _instance: DirtyDozensBattleEngine | null = null;

  private _state: DirtyDozensState | null = null;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _listeners: Set<(state: DirtyDozensState) => void> = new Set();

  static getInstance(): DirtyDozensBattleEngine {
    if (!DirtyDozensBattleEngine._instance) {
      DirtyDozensBattleEngine._instance = new DirtyDozensBattleEngine();
    }
    return DirtyDozensBattleEngine._instance;
  }

  startShow(showId: string): DirtyDozensState {
    this._state = {
      showId,
      phase: "lobby",
      battlers: new Map(),
      currentMatchup: null,
      completedMatchups: [],
      bracket: [],
      champion: null,
    };
    this._emit();
    return this._state;
  }

  registerBattler(userId: string, displayName: string): boolean {
    if (!this._state || this._state.battlers.size >= 12) return false;
    if (this._state.phase !== "lobby") return false;
    const seed = this._state.battlers.size + 1;
    this._state.battlers.set(userId, {
      userId,
      displayName,
      wins: 0,
      losses: 0,
      totalCrowdVotes: 0,
      isEliminated: false,
      seed,
    });
    return true;
  }

  startBattles(): boolean {
    if (!this._state || this._state.battlers.size < 2) return false;
    this._state.phase = "matchup";
    this._buildBracket();
    this._startNextMatchup();
    return true;
  }

  castVote(voterId: string, pick: "A" | "B"): boolean {
    const matchup = this._state?.currentMatchup;
    if (!matchup || this._state?.phase !== "voting") return false;
    if (matchup.votes.has(voterId)) return false;
    matchup.votes.set(voterId, pick);
    if (pick === "A") matchup.crowdVotesA++;
    else matchup.crowdVotesB++;

    const battlerA = this._state!.battlers.get(matchup.battlerAId);
    const battlerB = this._state!.battlers.get(matchup.battlerBId);
    if (pick === "A" && battlerA) battlerA.totalCrowdVotes++;
    if (pick === "B" && battlerB) battlerB.totalCrowdVotes++;

    this._emit();
    return true;
  }

  submitJudgeCall(pick: "A" | "B"): void {
    if (!this._state?.currentMatchup) return;
    this._state.currentMatchup.judgeCall = pick;
    this._emit();
  }

  closeVoting(): void {
    if (!this._state?.currentMatchup) return;
    this._state.phase = "result";
    this._resolveMatchup();
    this._emit();
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _buildBracket(): void {
    if (!this._state) return;
    const ids = [...this._state.battlers.keys()];
    const pairs: string[][] = [];
    for (let i = 0; i < ids.length - 1; i += 2) {
      pairs.push([ids[i], ids[i + 1]]);
    }
    this._state.bracket = pairs;
  }

  private _startNextMatchup(): void {
    if (!this._state) return;
    const remaining = this._state.bracket.find(([a, b]) => {
      const ba = this._state!.battlers.get(a);
      const bb = this._state!.battlers.get(b);
      return ba && !ba.isEliminated && bb && !bb.isEliminated;
    });

    if (!remaining) {
      this._checkAdvance();
      return;
    }

    const [aId, bId] = remaining;
    const matchup: Matchup = {
      id: makeId(),
      battlerAId: aId,
      battlerBId: bId,
      phase: "matchup",
      startedAt: Date.now(),
      durationMs: 180_000,
      votes: new Map(),
      crowdVotesA: 0,
      crowdVotesB: 0,
    };

    this._state.currentMatchup = matchup;
    this._state.phase = "matchup";

    this._timer = setTimeout(() => {
      this._state!.phase = "voting";
      this._emit();
      this._timer = setTimeout(() => this.closeVoting(), 60_000);
    }, matchup.durationMs);

    this._emit();
  }

  private _resolveMatchup(): void {
    const matchup = this._state?.currentMatchup;
    if (!matchup) return;

    const judgeWeight = matchup.judgeCall ? 0.4 : 0;
    const crowdWeight = 1 - judgeWeight;

    const totalVotes = matchup.crowdVotesA + matchup.crowdVotesB || 1;
    const crowdScoreA = (matchup.crowdVotesA / totalVotes) * crowdWeight;
    const crowdScoreB = (matchup.crowdVotesB / totalVotes) * crowdWeight;
    const judgeScoreA = matchup.judgeCall === "A" ? judgeWeight : 0;
    const judgeScoreB = matchup.judgeCall === "B" ? judgeWeight : 0;

    const scoreA = crowdScoreA + judgeScoreA;
    const scoreB = crowdScoreB + judgeScoreB;
    const winnerId = scoreA >= scoreB ? matchup.battlerAId : matchup.battlerBId;
    const loserId = winnerId === matchup.battlerAId ? matchup.battlerBId : matchup.battlerAId;

    matchup.winnerId = winnerId;
    matchup.loserId = loserId;

    const winner = this._state!.battlers.get(winnerId);
    const loser = this._state!.battlers.get(loserId);
    if (winner) winner.wins++;
    if (loser) { loser.losses++; loser.isEliminated = true; }

    this._state!.completedMatchups.push(matchup);
    this._state!.currentMatchup = null;

    setTimeout(() => this._startNextMatchup(), 5000);
  }

  private _checkAdvance(): void {
    if (!this._state) return;
    const alive = [...this._state.battlers.values()].filter((b) => !b.isEliminated);
    if (alive.length === 1) {
      this._state.champion = alive[0].userId;
      this._state.phase = "champion";
    } else if (alive.length <= 4 && this._state.phase !== "semifinals") {
      this._state.phase = "semifinals";
      this._state.bracket = [];
      for (let i = 0; i < alive.length - 1; i += 2) {
        this._state.bracket.push([alive[i].userId, alive[i + 1].userId]);
      }
      this._startNextMatchup();
    } else {
      this._state.phase = "ended";
    }
    this._emit();
  }

  // ── Access ────────────────────────────────────────────────────────────────

  getState(): DirtyDozensState | null {
    return this._state;
  }

  getLeaderboard(): Battler[] {
    if (!this._state) return [];
    return [...this._state.battlers.values()].sort((a, b) => b.wins - a.wins || b.totalCrowdVotes - a.totalCrowdVotes);
  }

  onChange(cb: (state: DirtyDozensState) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(): void {
    if (!this._state) return;
    for (const cb of this._listeners) cb(this._state);
  }
}

export const dirtyDozensBattleEngine = DirtyDozensBattleEngine.getInstance();
