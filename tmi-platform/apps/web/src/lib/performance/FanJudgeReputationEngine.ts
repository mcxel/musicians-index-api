export interface FanJudgeProfile {
  fanId: string;
  totalVotesCast: number;
  accuracyScore: number;   // 0-100: how often their votes match final outcome
  reputationTier: "ROOKIE" | "TRUSTED" | "ELITE" | "LEGEND";
  voteHistory: { performanceId: string; at: number }[];
}

const JUDGES = new Map<string, FanJudgeProfile>();

export function recordJudgeVote(fanId: string, performanceId: string): void {
  const existing = JUDGES.get(fanId) ?? {
    fanId,
    totalVotesCast: 0,
    accuracyScore: 50,
    reputationTier: "ROOKIE",
    voteHistory: [],
  };
  const updated: FanJudgeProfile = {
    ...existing,
    totalVotesCast: existing.totalVotesCast + 1,
    voteHistory: [...existing.voteHistory, { performanceId, at: Date.now() }],
    reputationTier: reputationTier(existing.totalVotesCast + 1),
  };
  JUDGES.set(fanId, updated);
}

function reputationTier(votes: number): FanJudgeProfile["reputationTier"] {
  if (votes >= 500) return "LEGEND";
  if (votes >= 100) return "ELITE";
  if (votes >= 20)  return "TRUSTED";
  return "ROOKIE";
}

export function getJudgeProfile(fanId: string): FanJudgeProfile {
  return JUDGES.get(fanId) ?? {
    fanId,
    totalVotesCast: 0,
    accuracyScore: 50,
    reputationTier: "ROOKIE",
    voteHistory: [],
  };
}

export const TIER_COLORS: Record<FanJudgeProfile["reputationTier"], string> = {
  ROOKIE:  "rgba(255,255,255,0.4)",
  TRUSTED: "#00FF88",
  ELITE:   "#00FFFF",
  LEGEND:  "#FFD700",
};

export const TIER_LABELS: Record<FanJudgeProfile["reputationTier"], string> = {
  ROOKIE:  "Rookie Judge",
  TRUSTED: "Trusted Judge",
  ELITE:   "Elite Judge",
  LEGEND:  "Legend Judge",
};
