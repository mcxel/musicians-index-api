// packages/scoring-engine/src/scoring.service.ts
// Universal scoring, winner determination, crown logic, leaderboards.
// This is the authoritative source for ALL competition outcomes.

import type { ScoringMode, TieBreakMethod } from "./scoring.types";

export interface ScoreCalculationResult {
  winnerId: string | null;
  runnerUpId?: string;
  finalScores: Record<string, number>;
  tieBreakApplied: TieBreakMethod | null;
  pointsAwarded: Record<string, number>;  // participation + win bonus
  crownUpdate?: CrownUpdate;
  leaderboardEntries: LeaderboardEntry[];
  auditTrail: string[];
}

export interface CrownUpdate {
  previousHolderId: string | null;
  newHolderId: string;
  animationTrigger: "crown_pop_on";   // always pop-on animation
  animationDurationMs: 3000;           // Platform Law — always 3s
  weekNumber: number;
  hallOfFameEntry: boolean;            // every winner → hall of fame
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  value: number;
  rank: number;
  change: number;
  flameLevel?: "strong" | "medium" | "light" | "none"; // top-10 flame rules
}

// ── PARTICIPATION POINT ACTIONS ───────────────────────────
export const POINT_ACTIONS = {
  JOIN_EVENT: 10,
  STAY_10MIN: 15,
  STAY_30MIN: 25,
  STAY_FULL_SHOW: 50,
  VOTE: 5,
  COMMENT: 2,
  SHARE: 8,
  REACT: 1,
  ENTER_CONTEST: 25,
  ENTER_GAME: 20,
  FINISH_GAME_ROUND: 30,
  WIN_GAME_ROUND: 50,
  WIN_FULL_GAME: 150,
  WIN_CONTEST: 100,
  UPLOAD_CONTENT: 20,
  PUBLISH_ARTICLE: 20,
  GET_FEATURED: 100,
  INVITE_FRIEND: 20,
  FRIEND_JOINS: 30,
  SPONSOR_INTERACTION: 10,
  PURCHASE_ITEM: 5,
  DAILY_LOGIN: 5,
  DAILY_STREAK: 10,       // × streak days
  WEEKLY_COMPLETION: 50,
  WATCH_30MIN: 10,
  TIP_ARTIST: 15,
  SPONSOR_TASK_COMPLETE: 25,
  WENT_LIVE: 30,
} as const;

// Daily/weekly caps — Platform Law (fraud prevention)
export const POINT_CAPS = {
  MAX_DAILY: 500,
  MAX_WEEKLY: 2000,
  MAX_PER_EVENT: 100,
  MAX_VOTES_PER_DAY: 50,
  MAX_COMMENTS_PER_DAY: 20,
  MAX_SHARES_PER_DAY: 10,
} as const;

// ── TIEBREAK RESOLUTION ORDER ─────────────────────────────
export const TIEBREAK_ORDER: TieBreakMethod[] = [
  "speed",           // fastest buzz-in time
  "higher_round",    // won more individual rounds
  "judge_override",  // judge manually selects
  "audience_revote", // run another audience vote
  "sudden_death",    // one more question
  "coin_flip",       // truly random last resort
];

// ── FLAME RULES FOR TOP 10 ────────────────────────────────
export function getFlameLevel(rank: number): "strong" | "medium" | "light" | "none" {
  if (rank === 1) return "strong";
  if (rank <= 3) return "medium";
  if (rank <= 10) return "light";
  return "none";
}

// ── SCORE EXPLAINABILITY ──────────────────────────────────
// Users can see exactly why they won/lost
export function generateScoreExplanation(
  userId: string,
  sessionId: string,
  finalScores: Record<string, number>,
  tieBreakApplied: TieBreakMethod | null
): string[] {
  const explanation: string[] = [];
  const score = finalScores[userId] ?? 0;
  const sorted = Object.entries(finalScores).sort(([,a],[,b]) => b - a);
  const rank = sorted.findIndex(([id]) => id === userId) + 1;
  
  explanation.push(`Your final score: ${score} points`);
  explanation.push(`Your ranking: #${rank} of ${sorted.length} players`);
  if (tieBreakApplied) explanation.push(`Tiebreak used: ${tieBreakApplied}`);
  explanation.push("Points breakdown available in /history/results");
  
  return explanation;
}

// ── ANTI-FRAUD VELOCITY CHECK ─────────────────────────────
export const FRAUD_THRESHOLDS = {
  MAX_VOTES_PER_USER_PER_EVENT: 1,    // Platform Law (audience votes)
  SUSPICIOUS_VELOCITY: 10,             // actions per minute
  AUTO_FLAG_VELOCITY: 25,             // auto-flag above this
  DUPLICATE_WINDOW_SECONDS: 300,
} as const;
