export type { CreatorRole, AllTag, UniversalTag, RoleTag, RoleTagConfig } from "./roles";
export { ROLE_CONFIGS, getRoleConfig, TAG_LABELS } from "./roles";

export type { OriginalityRating, ReturnIntent, PerformanceVote, PerformanceStats } from "./PerformanceScoreEngine";
export { castPerformanceVote, getPerformanceStats, hasVoted, listPerformanceVotes } from "./PerformanceScoreEngine";

export type { PerformanceRecord, CreatorEvolutionStats } from "./CreatorEvolutionStatsEngine";
export { registerPerformance, getCreatorEvolutionStats } from "./CreatorEvolutionStatsEngine";

export type { ContestEntry, ContestResult } from "./WinnerDeclarationEngine";
export { declareWinner } from "./WinnerDeclarationEngine";

export type { FanJudgeProfile, JudgeTier } from "./FanJudgeReputationEngine";
export {
  recordJudgeVote,
  recordJudgeOutcome,
  getJudgeProfile,
  getJudgeVoteWeight,
  TIER_COLORS,
  TIER_LABELS,
  TIER_WEIGHTS,
  TIER_REQUIREMENTS,
} from "./FanJudgeReputationEngine";
