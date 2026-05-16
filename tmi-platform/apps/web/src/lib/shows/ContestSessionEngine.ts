/**
 * ContestSessionEngine
 * Contest entry management, judging pipeline, score aggregation.
 */

export type ContestPhase = "submission" | "judging" | "public_vote" | "results" | "closed";

export type ContestEntry = {
  entryId: string;
  contestantId: string;
  contestantName: string;
  title: string;
  mediaUrl?: string;
  description?: string;
  submittedAtMs: number;
  judgeScores: Record<string, number>;
  publicVotes: number;
  disqualified: boolean;
  disqualifyReason?: string;
};

export type Contest = {
  contestId: string;
  title: string;
  description: string;
  phase: ContestPhase;
  entries: ContestEntry[];
  maxEntries: number;
  judgeIds: string[];
  openAtMs: number;
  judgeByMs: number | null;
  resultsAtMs: number | null;
  winnerId: string | null;
};

let _contestSeq = 0;
let _entrySeq = 0;

export class ContestSessionEngine {
  private readonly contests: Map<string, Contest> = new Map();

  createContest(params: {
    title: string;
    description: string;
    judgeIds: string[];
    maxEntries?: number;
  }): Contest {
    const contestId = `contest-${Date.now()}-${++_contestSeq}`;
    const contest: Contest = {
      contestId,
      title: params.title,
      description: params.description,
      phase: "submission",
      entries: [],
      maxEntries: params.maxEntries ?? 100,
      judgeIds: params.judgeIds,
      openAtMs: Date.now(),
      judgeByMs: null,
      resultsAtMs: null,
      winnerId: null,
    };
    this.contests.set(contestId, contest);
    return contest;
  }

  submitEntry(
    contestId: string,
    contestantId: string,
    contestantName: string,
    title: string,
    mediaUrl?: string,
    description?: string,
  ): ContestEntry | null {
    const contest = this.contests.get(contestId);
    if (!contest || contest.phase !== "submission") return null;
    if (contest.entries.length >= contest.maxEntries) return null;

    const entry: ContestEntry = {
      entryId: `entry-${Date.now()}-${++_entrySeq}`,
      contestantId,
      contestantName,
      title,
      mediaUrl,
      description,
      submittedAtMs: Date.now(),
      judgeScores: {},
      publicVotes: 0,
      disqualified: false,
    };

    contest.entries.push(entry);
    return entry;
  }

  scoreEntry(contestId: string, entryId: string, judgeId: string, score: number): void {
    const contest = this.contests.get(contestId);
    if (!contest || contest.phase !== "judging") return;
    if (!contest.judgeIds.includes(judgeId)) return;

    const entry = contest.entries.find((e) => e.entryId === entryId);
    if (!entry || entry.disqualified) return;

    entry.judgeScores[judgeId] = Math.min(100, Math.max(0, score));
  }

  addPublicVote(contestId: string, entryId: string): void {
    const contest = this.contests.get(contestId);
    if (!contest || contest.phase !== "public_vote") return;
    const entry = contest.entries.find((e) => e.entryId === entryId);
    if (entry && !entry.disqualified) entry.publicVotes += 1;
  }

  disqualify(contestId: string, entryId: string, reason: string): void {
    const contest = this.contests.get(contestId);
    if (!contest) return;
    const entry = contest.entries.find((e) => e.entryId === entryId);
    if (entry) {
      entry.disqualified = true;
      entry.disqualifyReason = reason;
    }
  }

  advancePhase(contestId: string): ContestPhase | null {
    const contest = this.contests.get(contestId);
    if (!contest) return null;

    const PHASE_FLOW: ContestPhase[] = ["submission", "judging", "public_vote", "results", "closed"];
    const idx = PHASE_FLOW.indexOf(contest.phase);
    if (idx < PHASE_FLOW.length - 1) {
      contest.phase = PHASE_FLOW[idx + 1];
    }

    return contest.phase;
  }

  getLeaderboard(contestId: string, judgeWeight: number = 0.7, voteWeight: number = 0.3): Array<{ entry: ContestEntry; score: number; rank: number }> {
    const contest = this.contests.get(contestId);
    if (!contest) return [];

    const scored = contest.entries
      .filter((e) => !e.disqualified)
      .map((entry) => {
        const judgeScoreValues = Object.values(entry.judgeScores);
        const avgJudge = judgeScoreValues.length > 0
          ? judgeScoreValues.reduce((s, v) => s + v, 0) / judgeScoreValues.length
          : 0;
        const score = avgJudge * judgeWeight + entry.publicVotes * voteWeight;
        return { entry, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.map((s, i) => ({ ...s, rank: i + 1 }));
  }

  declareWinner(contestId: string): ContestEntry | null {
    const leaderboard = this.getLeaderboard(contestId);
    const contest = this.contests.get(contestId);
    if (!contest || leaderboard.length === 0) return null;

    const winner = leaderboard[0].entry;
    contest.winnerId = winner.contestantId;
    contest.resultsAtMs = Date.now();
    return winner;
  }

  getContest(contestId: string): Contest | null {
    return this.contests.get(contestId) ?? null;
  }
}

export const contestSessionEngine = new ContestSessionEngine();
