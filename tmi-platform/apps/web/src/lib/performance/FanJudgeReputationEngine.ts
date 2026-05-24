export type JudgeTier = "ROOKIE" | "TRUSTED" | "ELITE" | "LEGEND";

export interface FanJudgeProfile {
  fanId: string;
  totalVotesCast: number;
  accuracyScore: number;        // 0-100: how often their votes match final outcome
  correctPredictions: number;
  currentStreak: number;        // consecutive correct calls
  bestStreak: number;
  reputationTier: JudgeTier;
  voteWeight: number;           // multiplier applied to their votes
  voteHistory: { performanceId: string; at: number; correct?: boolean }[];
}

// Vote weights by tier — LEGEND judge counts 2x a ROOKIE
export const TIER_WEIGHTS: Record<JudgeTier, number> = {
  ROOKIE:  1.0,
  TRUSTED: 1.2,
  ELITE:   1.5,
  LEGEND:  2.0,
};

export const TIER_COLORS: Record<JudgeTier, string> = {
  ROOKIE:  "rgba(255,255,255,0.4)",
  TRUSTED: "#00FF88",
  ELITE:   "#00FFFF",
  LEGEND:  "#FFD700",
};

export const TIER_LABELS: Record<JudgeTier, string> = {
  ROOKIE:  "Rookie Judge",
  TRUSTED: "Trusted Judge",
  ELITE:   "Elite Judge",
  LEGEND:  "Legend Judge",
};

export const TIER_REQUIREMENTS: Record<JudgeTier, { votes: number; accuracy: number }> = {
  ROOKIE:  { votes: 0,   accuracy: 0  },
  TRUSTED: { votes: 20,  accuracy: 0  },
  ELITE:   { votes: 100, accuracy: 60 },
  LEGEND:  { votes: 500, accuracy: 65 },
};

const JUDGES = new Map<string, FanJudgeProfile>();

function computeTier(votes: number, accuracy: number): JudgeTier {
  if (votes >= 500 && accuracy >= 65) return "LEGEND";
  if (votes >= 100 && accuracy >= 60) return "ELITE";
  if (votes >= 20)                    return "TRUSTED";
  return "ROOKIE";
}

export function recordJudgeVote(fanId: string, performanceId: string): void {
  const existing = JUDGES.get(fanId) ?? {
    fanId,
    totalVotesCast: 0,
    accuracyScore: 50,
    correctPredictions: 0,
    currentStreak: 0,
    bestStreak: 0,
    reputationTier: "ROOKIE" as JudgeTier,
    voteWeight: TIER_WEIGHTS.ROOKIE,
    voteHistory: [],
  };

  const newCount = existing.totalVotesCast + 1;
  const tier     = computeTier(newCount, existing.accuracyScore);

  const updated: FanJudgeProfile = {
    ...existing,
    totalVotesCast: newCount,
    reputationTier: tier,
    voteWeight:     TIER_WEIGHTS[tier],
    voteHistory:    [...existing.voteHistory, { performanceId, at: Date.now() }],
  };

  JUDGES.set(fanId, updated);
}

export function recordJudgeOutcome(fanId: string, performanceId: string, correct: boolean): void {
  const profile = JUDGES.get(fanId);
  if (!profile) return;

  const newCorrect = profile.correctPredictions + (correct ? 1 : 0);
  const accuracy   = Math.round((newCorrect / profile.totalVotesCast) * 100);
  const streak     = correct ? profile.currentStreak + 1 : 0;
  const bestStreak = Math.max(profile.bestStreak, streak);
  const tier       = computeTier(profile.totalVotesCast, accuracy);

  const updatedHistory = profile.voteHistory.map((v) =>
    v.performanceId === performanceId ? { ...v, correct } : v,
  );

  JUDGES.set(fanId, {
    ...profile,
    correctPredictions: newCorrect,
    accuracyScore: accuracy,
    currentStreak: streak,
    bestStreak,
    reputationTier: tier,
    voteWeight: TIER_WEIGHTS[tier],
    voteHistory: updatedHistory,
  });
}

export function getJudgeProfile(fanId: string): FanJudgeProfile {
  return JUDGES.get(fanId) ?? {
    fanId,
    totalVotesCast: 0,
    accuracyScore: 50,
    correctPredictions: 0,
    currentStreak: 0,
    bestStreak: 0,
    reputationTier: "ROOKIE",
    voteWeight: TIER_WEIGHTS.ROOKIE,
    voteHistory: [],
  };
}

export function getJudgeVoteWeight(fanId: string): number {
  return JUDGES.get(fanId)?.voteWeight ?? TIER_WEIGHTS.ROOKIE;
}
