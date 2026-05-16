/**
 * MonthlyIdolRoundEngine
 * Full round system for Monthly Idol: timer, cutoff, judge panel, voting, crowd reactions, winner.
 */

export type RoundPhase =
  | "pre-show"
  | "open-call"
  | "round-1"
  | "round-2"
  | "semifinals"
  | "finals"
  | "winner-ceremony"
  | "ended";

export type ContestantStatus = "competing" | "eliminated" | "advancing" | "winner";

export interface Contestant {
  userId: string;
  displayName: string;
  status: ContestantStatus;
  scores: number[];
  totalScore: number;
  voteCount: number;
  crowdReactionScore: number;
  roundsCompleted: number;
}

export interface JudgeScore {
  judgeId: string;
  judgeName: string;
  contestantId: string;
  score: number; // 0–100
  category: "technique" | "energy" | "originality" | "crowd-connection";
  comment?: string;
  timestamp: number;
}

export interface RoundConfig {
  round: RoundPhase;
  durationMs: number;
  maxContestants: number;
  advanceCount: number;
  votingEnabled: boolean;
  judgeScoreWeight: number; // 0–1
  crowdVoteWeight: number;  // 0–1
}

export interface RoundState {
  showId: string;
  phase: RoundPhase;
  roundStartedAt: number;
  roundEndsAt: number;
  contestants: Map<string, Contestant>;
  judgeScores: JudgeScore[];
  crowdReactions: { userId: string; type: "yay" | "boo" | "fire" | "crown"; timestamp: number }[];
  votes: Map<string, string>; // voterId → contestantId
  eliminatedThisRound: string[];
  advancingThisRound: string[];
}

const ROUND_CONFIGS: Record<RoundPhase, RoundConfig> = {
  "pre-show":       { round: "pre-show",       durationMs: 300_000,  maxContestants: 100, advanceCount: 100, votingEnabled: false, judgeScoreWeight: 0, crowdVoteWeight: 0 },
  "open-call":      { round: "open-call",       durationMs: 600_000,  maxContestants: 50,  advanceCount: 20,  votingEnabled: true,  judgeScoreWeight: 0.4, crowdVoteWeight: 0.6 },
  "round-1":        { round: "round-1",         durationMs: 480_000,  maxContestants: 20,  advanceCount: 10,  votingEnabled: true,  judgeScoreWeight: 0.5, crowdVoteWeight: 0.5 },
  "round-2":        { round: "round-2",         durationMs: 420_000,  maxContestants: 10,  advanceCount: 5,   votingEnabled: true,  judgeScoreWeight: 0.55, crowdVoteWeight: 0.45 },
  "semifinals":     { round: "semifinals",      durationMs: 360_000,  maxContestants: 5,   advanceCount: 3,   votingEnabled: true,  judgeScoreWeight: 0.6, crowdVoteWeight: 0.4 },
  "finals":         { round: "finals",          durationMs: 300_000,  maxContestants: 3,   advanceCount: 1,   votingEnabled: true,  judgeScoreWeight: 0.6, crowdVoteWeight: 0.4 },
  "winner-ceremony":{ round: "winner-ceremony", durationMs: 120_000,  maxContestants: 1,   advanceCount: 0,   votingEnabled: false, judgeScoreWeight: 0, crowdVoteWeight: 0 },
  "ended":          { round: "ended",           durationMs: 0,        maxContestants: 0,   advanceCount: 0,   votingEnabled: false, judgeScoreWeight: 0, crowdVoteWeight: 0 },
};

const PHASE_ORDER: RoundPhase[] = ["pre-show", "open-call", "round-1", "round-2", "semifinals", "finals", "winner-ceremony", "ended"];

export class MonthlyIdolRoundEngine {
  private static _instance: MonthlyIdolRoundEngine | null = null;

  private _state: RoundState | null = null;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _listeners: Set<(state: RoundState) => void> = new Set();

  static getInstance(): MonthlyIdolRoundEngine {
    if (!MonthlyIdolRoundEngine._instance) {
      MonthlyIdolRoundEngine._instance = new MonthlyIdolRoundEngine();
    }
    return MonthlyIdolRoundEngine._instance;
  }

  // ── Show lifecycle ─────────────────────────────────────────────────────────

  startShow(showId: string): RoundState {
    const now = Date.now();
    const config = ROUND_CONFIGS["pre-show"];
    this._state = {
      showId,
      phase: "pre-show",
      roundStartedAt: now,
      roundEndsAt: now + config.durationMs,
      contestants: new Map(),
      judgeScores: [],
      crowdReactions: [],
      votes: new Map(),
      eliminatedThisRound: [],
      advancingThisRound: [],
    };
    this._scheduleRoundEnd(config.durationMs);
    this._emit();
    return this._state;
  }

  advancePhase(): RoundPhase {
    if (!this._state) return "ended";
    const idx = PHASE_ORDER.indexOf(this._state.phase);
    const next = PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
    this._cutoff();
    this._transitionTo(next);
    return next;
  }

  // ── Contestant management ──────────────────────────────────────────────────

  addContestant(userId: string, displayName: string): boolean {
    if (!this._state) return false;
    const config = ROUND_CONFIGS[this._state.phase];
    if (this._state.contestants.size >= config.maxContestants) return false;
    this._state.contestants.set(userId, {
      userId,
      displayName,
      status: "competing",
      scores: [],
      totalScore: 0,
      voteCount: 0,
      crowdReactionScore: 0,
      roundsCompleted: 0,
    });
    return true;
  }

  // ── Judging ────────────────────────────────────────────────────────────────

  submitJudgeScore(score: Omit<JudgeScore, "timestamp">): void {
    if (!this._state) return;
    const full: JudgeScore = { ...score, timestamp: Date.now() };
    this._state.judgeScores.push(full);
    const contestant = this._state.contestants.get(score.contestantId);
    if (contestant) {
      contestant.scores.push(score.score);
      contestant.totalScore = this._calcTotal(contestant);
    }
    this._emit();
  }

  // ── Voting ─────────────────────────────────────────────────────────────────

  castVote(voterId: string, contestantId: string): boolean {
    if (!this._state) return false;
    const config = ROUND_CONFIGS[this._state.phase];
    if (!config.votingEnabled) return false;
    if (this._state.votes.has(voterId)) return false;

    this._state.votes.set(voterId, contestantId);
    const contestant = this._state.contestants.get(contestantId);
    if (contestant) {
      contestant.voteCount++;
      contestant.totalScore = this._calcTotal(contestant);
    }
    this._emit();
    return true;
  }

  // ── Crowd reactions ────────────────────────────────────────────────────────

  addCrowdReaction(userId: string, type: "yay" | "boo" | "fire" | "crown", targetContestantId?: string): void {
    if (!this._state) return;
    this._state.crowdReactions.push({ userId, type, timestamp: Date.now() });
    if (targetContestantId) {
      const contestant = this._state.contestants.get(targetContestantId);
      if (contestant) {
        const delta = type === "boo" ? -1 : type === "fire" || type === "crown" ? 2 : 1;
        contestant.crowdReactionScore += delta;
        contestant.totalScore = this._calcTotal(contestant);
      }
    }
    this._emit();
  }

  // ── Cutoff & results ───────────────────────────────────────────────────────

  private _cutoff(): void {
    if (!this._state) return;
    const config = ROUND_CONFIGS[this._state.phase];
    const ranked = [...this._state.contestants.values()]
      .filter((c) => c.status === "competing")
      .sort((a, b) => b.totalScore - a.totalScore);

    this._state.advancingThisRound = [];
    this._state.eliminatedThisRound = [];

    ranked.forEach((c, i) => {
      if (i < config.advanceCount) {
        c.status = "advancing";
        c.roundsCompleted++;
        this._state!.advancingThisRound.push(c.userId);
      } else {
        c.status = "eliminated";
        this._state!.eliminatedThisRound.push(c.userId);
      }
    });
  }

  private _transitionTo(phase: RoundPhase): void {
    if (!this._state) return;
    const config = ROUND_CONFIGS[phase];
    const now = Date.now();
    this._state.phase = phase;
    this._state.roundStartedAt = now;
    this._state.roundEndsAt = now + config.durationMs;
    this._state.votes.clear();
    this._state.judgeScores = [];
    this._state.crowdReactions = [];

    // Reset advancing contestants back to competing
    for (const c of this._state.contestants.values()) {
      if (c.status === "advancing") c.status = "competing";
    }

    if (config.durationMs > 0) this._scheduleRoundEnd(config.durationMs);
    this._emit();
  }

  private _scheduleRoundEnd(durationMs: number): void {
    if (this._timer) clearTimeout(this._timer);
    if (durationMs <= 0) return;
    this._timer = setTimeout(() => this.advancePhase(), durationMs);
  }

  private _calcTotal(c: Contestant): number {
    const config = ROUND_CONFIGS[this._state?.phase ?? "round-1"];
    const avgScore = c.scores.length > 0
      ? c.scores.reduce((a, b) => a + b, 0) / c.scores.length
      : 0;
    const voteScore = Math.min(c.voteCount * 2, 30);
    const crowdScore = Math.max(-10, Math.min(c.crowdReactionScore * 1.5, 20));
    return (
      avgScore * config.judgeScoreWeight * 50 +
      voteScore * config.crowdVoteWeight +
      crowdScore
    );
  }

  // ── State access ───────────────────────────────────────────────────────────

  getState(): RoundState | null {
    return this._state;
  }

  getRankedContestants(): Contestant[] {
    if (!this._state) return [];
    return [...this._state.contestants.values()].sort((a, b) => b.totalScore - a.totalScore);
  }

  getWinner(): Contestant | null {
    if (!this._state || this._state.phase !== "winner-ceremony") return null;
    return this.getRankedContestants()[0] ?? null;
  }

  getTimeRemaining(): number {
    if (!this._state) return 0;
    return Math.max(0, this._state.roundEndsAt - Date.now());
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (state: RoundState) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(): void {
    if (!this._state) return;
    for (const cb of this._listeners) cb(this._state);
  }
}

export const monthlyIdolRoundEngine = MonthlyIdolRoundEngine.getInstance();
