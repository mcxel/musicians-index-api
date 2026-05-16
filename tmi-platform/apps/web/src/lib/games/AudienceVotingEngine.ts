/**
 * AudienceVotingEngine
 * Real-time crowd voting system — YAY/BOO, contestant votes, poll questions.
 */

export type VoteType = "yay_boo" | "contestant_pick" | "poll_choice" | "crowd_veto";

export type VoteEntry = {
  userId: string;
  vote: string;
  voteType: VoteType;
  castAtMs: number;
  weight: number;
};

export type VoteSession = {
  sessionId: string;
  prompt: string;
  voteType: VoteType;
  choices: string[];
  openAtMs: number;
  closeAtMs: number | null;
  votes: VoteEntry[];
  closed: boolean;
};

export type VoteTally = {
  sessionId: string;
  prompt: string;
  results: Record<string, number>;
  totalVotes: number;
  leadingChoice: string | null;
  percentages: Record<string, number>;
};

let _sessionSeq = 0;

export class AudienceVotingEngine {
  private readonly sessions: Map<string, VoteSession> = new Map();
  private readonly userVotes: Map<string, Set<string>> = new Map(); // userId -> sessionIds voted in

  openSession(prompt: string, voteType: VoteType, choices: string[], durationMs?: number): VoteSession {
    const sessionId = `vote-${Date.now()}-${++_sessionSeq}`;
    const session: VoteSession = {
      sessionId,
      prompt,
      voteType,
      choices,
      openAtMs: Date.now(),
      closeAtMs: durationMs ? Date.now() + durationMs : null,
      votes: [],
      closed: false,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  castVote(sessionId: string, userId: string, vote: string, weight: number = 1): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.closed) return false;
    if (!session.choices.includes(vote)) return false;

    // Enforce one vote per user per session
    const userSessions = this.userVotes.get(userId) ?? new Set<string>();
    if (userSessions.has(sessionId)) return false;

    session.votes.push({
      userId,
      vote,
      voteType: session.voteType,
      castAtMs: Date.now(),
      weight,
    });

    userSessions.add(sessionId);
    this.userVotes.set(userId, userSessions);
    return true;
  }

  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.closed = true;
      session.closeAtMs = Date.now();
    }
  }

  tally(sessionId: string): VoteTally | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const results: Record<string, number> = {};
    for (const choice of session.choices) results[choice] = 0;

    let totalVotes = 0;
    for (const v of session.votes) {
      results[v.vote] = (results[v.vote] ?? 0) + v.weight;
      totalVotes += v.weight;
    }

    const leadingChoice = totalVotes === 0 ? null :
      Object.entries(results).sort((a, b) => b[1] - a[1])[0][0];

    const percentages: Record<string, number> = {};
    for (const [choice, count] of Object.entries(results)) {
      percentages[choice] = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 1000) / 10;
    }

    return { sessionId, prompt: session.prompt, results, totalVotes, leadingChoice, percentages };
  }

  getYayBooSplit(sessionId: string): { yay: number; boo: number; yayPct: number; booPct: number } {
    const session = this.sessions.get(sessionId);
    if (!session || session.voteType !== "yay_boo") return { yay: 0, boo: 0, yayPct: 0, booPct: 0 };

    let yay = 0;
    let boo = 0;
    for (const v of session.votes) {
      if (v.vote === "yay") yay += v.weight;
      else if (v.vote === "boo") boo += v.weight;
    }

    const total = yay + boo;
    return {
      yay,
      boo,
      yayPct: total === 0 ? 0 : Math.round((yay / total) * 1000) / 10,
      booPct: total === 0 ? 0 : Math.round((boo / total) * 1000) / 10,
    };
  }

  getActiveSession(): VoteSession | null {
    for (const session of this.sessions.values()) {
      if (!session.closed) return session;
    }
    return null;
  }

  hasUserVoted(sessionId: string, userId: string): boolean {
    return this.userVotes.get(userId)?.has(sessionId) ?? false;
  }
}

export const audienceVotingEngine = new AudienceVotingEngine();
