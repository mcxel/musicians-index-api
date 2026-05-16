/**
 * PerformanceScoreEngine
 * Calculates aggregate live performance scores from judges, crowd votes, and host marks.
 */

export type ScoreSource = "judge" | "crowd_vote" | "host_mark" | "bonus" | "penalty";

export type ScoreEntry = {
  id: string;
  contestantId: string;
  source: ScoreSource;
  points: number;
  weight: number;
  judgeId?: string;
  reason?: string;
  timestampMs: number;
};

export type ContestantScore = {
  contestantId: string;
  contestantName: string;
  judgeTotal: number;
  crowdVoteTotal: number;
  hostMarkTotal: number;
  bonusTotal: number;
  penaltyTotal: number;
  compositeScore: number;
  rank: number;
  entries: ScoreEntry[];
};

export type ScoreWeightConfig = {
  judgeWeight: number;
  crowdVoteWeight: number;
  hostMarkWeight: number;
};

const DEFAULT_WEIGHTS: ScoreWeightConfig = {
  judgeWeight: 0.60,
  crowdVoteWeight: 0.30,
  hostMarkWeight: 0.10,
};

let _entrySeq = 0;

function makeId(): string {
  return `score-${Date.now()}-${++_entrySeq}`;
}

export class PerformanceScoreEngine {
  private readonly weights: ScoreWeightConfig;
  private readonly entries: Map<string, ScoreEntry[]> = new Map();

  constructor(weights: Partial<ScoreWeightConfig> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  addEntry(
    contestantId: string,
    source: ScoreSource,
    points: number,
    meta?: { judgeId?: string; reason?: string },
  ): ScoreEntry {
    const entry: ScoreEntry = {
      id: makeId(),
      contestantId,
      source,
      points,
      weight: this.weightFor(source),
      judgeId: meta?.judgeId,
      reason: meta?.reason,
      timestampMs: Date.now(),
    };

    const existing = this.entries.get(contestantId) ?? [];
    existing.push(entry);
    this.entries.set(contestantId, existing);

    return entry;
  }

  private weightFor(source: ScoreSource): number {
    if (source === "judge") return this.weights.judgeWeight;
    if (source === "crowd_vote") return this.weights.crowdVoteWeight;
    if (source === "host_mark") return this.weights.hostMarkWeight;
    return 1;
  }

  computeScore(contestantId: string, contestantName: string): ContestantScore {
    const entries = this.entries.get(contestantId) ?? [];

    let judgeTotal = 0;
    let crowdVoteTotal = 0;
    let hostMarkTotal = 0;
    let bonusTotal = 0;
    let penaltyTotal = 0;

    for (const e of entries) {
      if (e.source === "judge") judgeTotal += e.points;
      else if (e.source === "crowd_vote") crowdVoteTotal += e.points;
      else if (e.source === "host_mark") hostMarkTotal += e.points;
      else if (e.source === "bonus") bonusTotal += e.points;
      else if (e.source === "penalty") penaltyTotal += e.points;
    }

    const compositeScore =
      judgeTotal * this.weights.judgeWeight +
      crowdVoteTotal * this.weights.crowdVoteWeight +
      hostMarkTotal * this.weights.hostMarkWeight +
      bonusTotal -
      penaltyTotal;

    return {
      contestantId,
      contestantName,
      judgeTotal,
      crowdVoteTotal,
      hostMarkTotal,
      bonusTotal,
      penaltyTotal,
      compositeScore: Math.max(0, Math.round(compositeScore * 10) / 10),
      rank: 0, // caller should call rankAll to resolve
      entries,
    };
  }

  rankAll(scores: ContestantScore[]): ContestantScore[] {
    const sorted = [...scores].sort((a, b) => b.compositeScore - a.compositeScore);
    return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
  }

  clearContestant(contestantId: string): void {
    this.entries.delete(contestantId);
  }

  clearAll(): void {
    this.entries.clear();
  }
}

export const performanceScoreEngine = new PerformanceScoreEngine();
