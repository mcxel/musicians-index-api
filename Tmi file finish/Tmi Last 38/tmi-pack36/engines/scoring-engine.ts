// apps/api/src/modules/scoring/scoring.engine.ts
// Universal scoring, winner determination, and leaderboards.
// Used by all games, contests, battles, and events.

export type ScoringMode =
  | 'audience_vote'          // pure audience vote percentage
  | 'judge_score'            // judge scores 1-10 per category
  | 'hybrid_vote_judge'      // 50% audience + 50% judge
  | 'objective_game_score'   // system-calculated (trivia, speed, etc.)
  | 'time_based'             // fastest correct answer wins
  | 'elimination'            // last one standing
  | 'accumulation';          // most points accumulated over time

export type TieBreakMethod =
  | 'speed'           // fastest answer/response time
  | 'higher_round'    // won more individual rounds
  | 'judge_override'  // judge manually selects
  | 'audience_revote' // run another audience vote
  | 'sudden_death'    // one more question, first correct wins
  | 'coin_flip';      // truly random (only if all else fails)

export interface ScoreRule {
  competitionType: string;
  scoringMode: ScoringMode;
  tieBreakOrder: TieBreakMethod[];
  minimumParticipants: number;
  voteWindowSeconds: number;
  judgeSubmitDeadlineSeconds: number;
  maxPointsPerRound: number;
  bonusMultipliers: { condition: string; multiplier: number }[];
  disqualificationConditions: string[];
  participationPointsBaseValue: number;
  winnerRewardType: string; // references reward catalog
}

// ── PARTICIPATION POINTS MAP ──────────────────────────────
// Every action has a defined point value. Anti-spam caps enforced.
export const PARTICIPATION_POINTS = {
  // Attendance / presence
  join_event:              10,
  stay_10_minutes:         15,
  stay_30_minutes:         25,
  stay_full_show:          50,
  
  // Engagement
  vote:                     5,
  comment:                  2,
  share:                    8,
  react:                    1,
  
  // Contest / game participation
  enter_contest:           25,
  enter_game:              20,
  finish_game_round:       30,
  win_game_round:          50,
  win_full_game:          150,
  
  // Content
  upload_content:          20,
  publish_article:         20,
  get_article_featured:   100,
  
  // Social
  invite_friend:           20,
  friend_joins:            30,
  
  // Economy
  sponsor_interaction:     10,
  purchase_item:            5,
  
  // Daily / streak
  daily_login:              5,
  daily_streak_bonus:      10,  // multiplied by streak days
  weekly_completion:       50,
  
  // Stream & Win
  watched_30_min:          10,
  tipped_artist:           15,
  completed_sponsor_task:  25,
  went_live:               30,
  article_published:       20,
  won_contest:            100,

  // Limits (per day, per event)
  maxVotesPerDay:          50,
  maxCommentsPerDay:       20,
  maxSharesPerDay:         10,
  maxPerEventAttendance:  100,  // cap on event-based points per event
} as const;

// ── WINNER RESOLUTION ─────────────────────────────────────
export interface WinnerResolution {
  competitionId: string;
  winnerId: string | null;
  runnerUpId?: string;
  thirdPlaceId?: string;
  finalScores: Record<string, number>;  // userId → score
  tieBreakApplied: TieBreakMethod | null;
  tieBreakReason?: string;
  wasDisqualification: boolean;
  auditNotes: string[];
  resolvedAt: Date;
  requiresBigAceReview: boolean;  // if manual override needed
}

// ── CROWN SYSTEM ──────────────────────────────────────────
export interface CrownState {
  currentHolderId: string | null;
  currentHolderDisplayName: string | null;
  currentHolderStationSlug: string | null;
  wonAt: Date | null;
  weekNumber: number;
  totalDefenses: number;         // how many weeks held
  genreCategory: string;
  crownPoints: number;           // accumulated points on the crown
  isDefendingThisWeek: boolean;
  challengers: string[];         // userIds eligible to challenge
  nextCrownEventAt: Date | null;
}

// Crown is only awarded through the weekly cypher battle.
// Permanent Diamond users (Marcel + BJ M Beat's) can participate
// but their crown status is separate from their Diamond tier.
export const CROWN_RULES = {
  eligibilityMinTier: 'free',    // any tier can compete
  pointsToEnter: 0,              // free to enter weekly cypher
  crownDefenseFrequency: 'weekly',
  crownDecayAfterWeeks: 1,       // crown resets every week
  hallOfFameAfterWeeks: 1,       // every winner goes to hall of fame
  animationDurationMs: 3000,     // crown pop-on / pop-off animation
} as const;

// ── LEADERBOARD ENGINE ────────────────────────────────────
export type LeaderboardType =
  | 'weekly_crown' | 'season_points' | 'game_wins' | 'battle_wins'
  | 'top_earners' | 'top_fans' | 'top_sponsors' | 'top_advertisers'
  | 'venue_attendance' | 'content_creators' | 'stream_watchers';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  value: number;        // points, wins, earnings, etc.
  change: number;       // rank change since last refresh (+2, -1, 0)
  isNew: boolean;       // first time on this leaderboard
  tier: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

// Top 10 entries get the flame animation (see visual rules)
// Position 1: strongest flame
// Positions 2-3: medium flame
// Positions 4-10: lighter flame accent
export const TOP_10_FLAME_RULES = {
  positions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  flamePower: { 1: 'strong', 2: 'medium', 3: 'medium', 4: 'light', 5: 'light', 6: 'light', 7: 'light', 8: 'light', 9: 'light', 10: 'light' },
  glowColors: { 1: '#FFD700', 2: '#FF8C00', 3: '#FF8C00', default: '#FFB800' },
  animationDurationMs: 1800,
  fallbackToGlowIfSlowDevice: true,
} as const;

// ── FRAUD DETECTION ───────────────────────────────────────
export const FRAUD_RULES = {
  maxVotesPerUserPerEvent: 1,
  maxPointsPerActionPerDay: PARTICIPATION_POINTS.maxVotesPerDay,
  suspiciousVelocityThreshold: 10,  // actions per minute
  requiresAccountAgeForVoting: false,  // set to true if abuse detected
  duplicateDetectionWindow: 300,    // seconds
  autoFlagThreshold: 25,            // auto-flag above this velocity
} as const;
