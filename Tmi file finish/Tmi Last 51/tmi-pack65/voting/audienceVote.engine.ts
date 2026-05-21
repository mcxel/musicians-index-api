// apps/web/src/lib/engines/audienceVote.engine.ts
// Audience-driven voting for battles, contests, game shows.
// Primary winner selector — not judges.

export type VoteType = "green" | "red" | "blue" | "yellow" | "purple" | "orange" | "yay" | "boo" | "right" | "wrong";

export interface VoteRecord {
  fanId: string;
  optionId: string;
  voteType: VoteType;
  castAtMs: number;
  roomId: string;
  roundId: string;
  isEligible: boolean;    // fan must have passed eligibility
  points: number;         // points awarded for valid vote (2-3)
}

export interface VoteState {
  roundId: string;
  roomId: string;
  options: VoteOption[];
  votes: Map<string, VoteRecord>;     // fanId → VoteRecord
  totalValidVotes: number;
  isOpen: boolean;
  closedAtMs?: number;
  winnerOptionId?: string;
  usedFallback: boolean;
}

export interface VoteOption {
  optionId: string;
  label: string;
  color: VoteType;
  voteCount: number;
  votePercent: number;
  contestantId?: string;
}

export class AudienceVoteEngine {
  private voteStates: Map<string, VoteState> = new Map();

  openRound(roundId: string, roomId: string, options: Omit<VoteOption, "voteCount"|"votePercent">[]): VoteState {
    const state: VoteState = {
      roundId, roomId,
      options: options.map(o => ({ ...o, voteCount: 0, votePercent: 0 })),
      votes: new Map(),
      totalValidVotes: 0,
      isOpen: true,
      usedFallback: false,
    };
    this.voteStates.set(roundId, state);
    console.log(`[AudienceVote] Round opened: ${roundId} with ${options.length} options`);
    return state;
  }

  castVote(roundId: string, fanId: string, optionId: string, isEligible: boolean): { success: boolean; reason: string; pointsAwarded: number } {
    const state = this.voteStates.get(roundId);
    if (!state) return { success: false, reason: "Round not found", pointsAwarded: 0 };
    if (!state.isOpen) return { success: false, reason: "Voting is closed", pointsAwarded: 0 };
    if (state.votes.has(fanId)) return { success: false, reason: "Already voted — duplicate blocked", pointsAwarded: 0 };
    if (!isEligible) return { success: false, reason: "You are not eligible to vote yet — stay in the room", pointsAwarded: 0 };

    const option = state.options.find(o => o.optionId === optionId);
    if (!option) return { success: false, reason: "Invalid option", pointsAwarded: 0 };

    const pointsAwarded = Math.random() > 0.5 ? 3 : 2; // 2-3 points per valid vote

    const record: VoteRecord = {
      fanId, optionId, voteType: option.color,
      castAtMs: Date.now(), roomId: state.roomId,
      roundId, isEligible, points: pointsAwarded,
    };

    state.votes.set(fanId, record);
    option.voteCount++;
    state.totalValidVotes++;

    // Recalculate percentages
    state.options.forEach(o => {
      o.votePercent = state.totalValidVotes > 0 ? Math.round((o.voteCount / state.totalValidVotes) * 100) : 0;
    });

    this.voteStates.set(roundId, state);
    console.log(`[AudienceVote] Vote cast by ${fanId} for ${optionId} — ${pointsAwarded} pts`);
    return { success: true, reason: "Vote counted!", pointsAwarded };
  }

  closeRound(roundId: string): VoteState {
    const state = this.voteStates.get(roundId);
    if (!state) throw new Error(`Round ${roundId} not found`);
    state.isOpen = false;
    state.closedAtMs = Date.now();
    this.voteStates.set(roundId, state);
    return state;
  }

  getVoteResults(roundId: string): VoteState | null {
    return this.voteStates.get(roundId) ?? null;
  }

  getLeader(roundId: string): VoteOption | null {
    const state = this.voteStates.get(roundId);
    if (!state || state.totalValidVotes === 0) return null;
    return [...state.options].sort((a, b) => b.voteCount - a.voteCount)[0];
  }
}

export const audienceVoteEngine = new AudienceVoteEngine();
