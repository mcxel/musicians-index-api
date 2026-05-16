/**
 * LiveHUDStateEngine
 * Aggregates live show HUD state for score, voting, elimination, and alert widgets.
 */

export type HudShowPhase =
  | "warmup"
  | "intro"
  | "performance"
  | "judging"
  | "voting"
  | "elimination"
  | "winner_reveal"
  | "post_show";

export type HudScoreEntry = {
  contestantId: string;
  contestantName: string;
  score: number;
  rank: number;
};

export type HudVoteState = {
  open: boolean;
  prompt: string;
  choices: Array<{ key: string; value: number; percentage: number }>;
};

export type HudEliminationState = {
  active: boolean;
  contestantId: string | null;
  contestantName: string | null;
  reason: string | null;
  broadcastLine: string | null;
};

export type LiveHUDState = {
  showId: string;
  showTitle: string;
  phase: HudShowPhase;
  audienceCount: number;
  scores: HudScoreEntry[];
  voting: HudVoteState;
  elimination: HudEliminationState;
  updatedAtMs: number;
};

const DEFAULT_VOTING: HudVoteState = {
  open: false,
  prompt: "",
  choices: [],
};

const DEFAULT_ELIMINATION: HudEliminationState = {
  active: false,
  contestantId: null,
  contestantName: null,
  reason: null,
  broadcastLine: null,
};

function defaultState(showId: string, showTitle: string): LiveHUDState {
  return {
    showId,
    showTitle,
    phase: "warmup",
    audienceCount: 0,
    scores: [],
    voting: { ...DEFAULT_VOTING },
    elimination: { ...DEFAULT_ELIMINATION },
    updatedAtMs: Date.now(),
  };
}

export class LiveHUDStateEngine {
  private readonly stateByShowId: Map<string, LiveHUDState> = new Map();
  private readonly listeners: Array<(state: LiveHUDState) => void> = [];

  onState(listener: (state: LiveHUDState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  private emit(state: LiveHUDState): void {
    for (const listener of this.listeners) listener(state);
  }

  init(showId: string, showTitle: string): LiveHUDState {
    const existing = this.stateByShowId.get(showId);
    if (existing) return existing;
    const created = defaultState(showId, showTitle);
    this.stateByShowId.set(showId, created);
    this.emit(created);
    return created;
  }

  private touch(showId: string): LiveHUDState | null {
    const state = this.stateByShowId.get(showId);
    if (!state) return null;
    state.updatedAtMs = Date.now();
    return state;
  }

  setPhase(showId: string, phase: HudShowPhase): void {
    const state = this.touch(showId);
    if (!state) return;
    state.phase = phase;
    this.emit(state);
  }

  setAudienceCount(showId: string, audienceCount: number): void {
    const state = this.touch(showId);
    if (!state) return;
    state.audienceCount = Math.max(0, audienceCount);
    this.emit(state);
  }

  setScores(showId: string, scores: HudScoreEntry[]): void {
    const state = this.touch(showId);
    if (!state) return;
    state.scores = [...scores].sort((a, b) => a.rank - b.rank);
    this.emit(state);
  }

  setVoting(showId: string, voting: HudVoteState): void {
    const state = this.touch(showId);
    if (!state) return;
    state.voting = voting;
    this.emit(state);
  }

  setElimination(showId: string, elimination: HudEliminationState): void {
    const state = this.touch(showId);
    if (!state) return;
    state.elimination = elimination;
    this.emit(state);
  }

  clearElimination(showId: string): void {
    this.setElimination(showId, { ...DEFAULT_ELIMINATION });
  }

  get(showId: string): LiveHUDState | null {
    return this.stateByShowId.get(showId) ?? null;
  }

  getAllLiveStates(): LiveHUDState[] {
    return [...this.stateByShowId.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  }
}

export const liveHUDStateEngine = new LiveHUDStateEngine();
