// apps/api/src/modules/scoring/scoring-engine.ts
// Universal automated scoring for ALL games, battles, and contests.
// This is the single source of truth for all competition results.

import { GameType, ScoringMode, GAME_REGISTRY, BASE_POINTS } from '../games/game-registry';

// ── SCORE EVENT ────────────────────────────────────────
// Every scoring action emits a ScoreEvent that is recorded immutably.
export interface ScoreEvent {
  id: string;
  competitionId: string;
  roundId?: string;
  userId: string;
  action: ScoreAction;
  pointsDelta: number;
  reason: string;
  timestamp: Date;
  verifiedBy: 'system' | 'judge' | 'audience' | 'admin';
  fraudFlag: boolean;
}

export type ScoreAction =
  | 'participation_join'
  | 'correct_answer'
  | 'round_win'
  | 'match_win'
  | 'audience_vote_received'
  | 'audience_vote_cast'
  | 'judge_score_received'
  | 'streak_bonus'
  | 'sponsor_interaction'
  | 'participation_bonus'
  | 'cheer_received'
  | 'admin_adjustment'
  | 'disqualification';

// ── COMPETITION STATE ──────────────────────────────────
export interface CompetitionState {
  id: string;
  gameType: GameType;
  status: 'LOBBY' | 'ACTIVE' | 'ROUND_BREAK' | 'JUDGING' | 'TIE_BREAK' | 'FINALIZING' | 'COMPLETE';
  currentRound: number;
  totalRounds: number;
  participants: ParticipantScore[];
  judges: JudgeAssignment[];
  audienceVotes: AudienceVoteTotal[];
  scoreEvents: ScoreEvent[];
  startedAt?: Date;
  endedAt?: Date;
  winnerId?: string;
  winnerIds?: string[];    // for multi-winner competitions
  tieBreakTriggered: boolean;
  sponsorId?: string;      // if sponsor-backed
  prizePoolCents: number;
}

export interface ParticipantScore {
  userId: string;
  displayName: string;
  totalPoints: number;
  roundScores: number[];   // score per round
  judgeScores: number[];   // raw judge scores
  audienceVotes: number;   // raw vote count
  rank: number;            // current standing
  isEliminated: boolean;
  isDisqualified: boolean;
  disqualificationReason?: string;
  streakCount: number;     // consecutive wins/correct answers
}

export interface JudgeAssignment {
  userId: string;
  displayName: string;
  scores: { roundId: string; participantId: string; score: number; submitted: boolean }[];
  allSubmitted: boolean;
}

export interface AudienceVoteTotal {
  participantId: string;
  voteCount: number;
  percentageOfTotal: number;
}

// ── WINNER RESOLUTION ──────────────────────────────────
// Automated, deterministic, auditable winner logic.
export function resolveWinner(state: CompetitionState): {
  winnerId: string | null;
  winnerIds: string[];
  method: string;
  tieBreakUsed: boolean;
  explanation: string;
} {
  const game = GAME_REGISTRY[state.gameType];
  const active = state.participants.filter(p => !p.isDisqualified && !p.isEliminated);
  const sorted = [...active].sort((a, b) => b.totalPoints - a.totalPoints);

  if (sorted.length === 0) return { winnerId: null, winnerIds: [], method: 'no_valid_participants', tieBreakUsed: false, explanation: 'No eligible participants' };

  const top = sorted[0];
  const tiedWithTop = sorted.filter(p => p.totalPoints === top.totalPoints);

  if (tiedWithTop.length === 1) {
    const winners = sorted.slice(0, game.winnerCount).map(p => p.userId);
    return {
      winnerId: winners[0],
      winnerIds: winners,
      method: `highest_total_points (${top.totalPoints}pts)`,
      tieBreakUsed: false,
      explanation: `${top.displayName} won with ${top.totalPoints} total points. Scoring: ${game.scoringMode}.`,
    };
  }

  // ── TIE BREAK ──────────────────────────────────────
  let tieWinner = tiedWithTop[0];
  let tieMethod = game.tieBreakRule;

  if (tieMethod === 'highest_audience_vote') {
    const byVotes = [...tiedWithTop].sort((a, b) => b.audienceVotes - a.audienceVotes);
    tieWinner = byVotes[0];
  } else if (tieMethod === 'highest_judge_score') {
    const byJudge = [...tiedWithTop].sort((a, b) => {
      const aJudge = a.judgeScores.reduce((s, x) => s + x, 0);
      const bJudge = b.judgeScores.reduce((s, x) => s + x, 0);
      return bJudge - aJudge;
    });
    tieWinner = byJudge[0];
  }

  return {
    winnerId: tieWinner.userId,
    winnerIds: [tieWinner.userId],
    method: `tie_break:${tieMethod}`,
    tieBreakUsed: true,
    explanation: `Tie broken by ${tieMethod}. ${tieWinner.displayName} wins.`,
  };
}

// ── PARTICIPATION POINTS ───────────────────────────────
// Every action a user takes earns points — automatically tracked.
export const GLOBAL_PARTICIPATION_ACTIONS: Record<string, number> = {
  // Live engagement
  join_live_room:          10,
  watch_30_min:            15,
  watch_60_min:            25,
  tip_artist:              20,
  send_cheer:              2,

  // Game participation
  join_game:               10,
  complete_game:           30,
  win_game_round:          50,
  win_full_game:           150,
  win_tournament:          500,

  // Contest / battle
  enter_contest:           25,
  complete_contest_round:  50,
  win_cypher_battle:       200,
  take_the_crown:          1000,

  // Content
  vote_in_contest:         5,
  submit_article:          20,
  article_gets_featured:   100,
  profile_100_pct:         50,

  // Social
  daily_login:             5,
  login_streak_7_days:     50,
  invite_friend:           100,
  first_sponsor_task:      150,

  // Stream & Win
  stream_win_milestone:    25,

  // Sponsor tasks
  complete_sponsor_task:   30,
  sponsor_mention_verified:50,

  // Limits (anti-spam, per 24h unless noted)
  _daily_vote_cap:         50,
  _daily_cheer_cap:        20,
  _daily_content_cap:      200,
};

// ── FRAUD DETECTION ────────────────────────────────────
export function detectFraud(events: ScoreEvent[], userId: string): {
  flagged: boolean;
  reason?: string;
  confidence: number;
} {
  const userEvents = events.filter(e => e.userId === userId);
  const last5min = userEvents.filter(e => Date.now() - e.timestamp.getTime() < 5 * 60 * 1000);

  // Velocity check: too many events too fast
  if (last5min.length > 50) return { flagged: true, reason: 'velocity_exceeded', confidence: 0.95 };

  // Duplicate action within same session
  const actionTypes = last5min.map(e => e.action);
  const duplicates = actionTypes.filter((a, i) => actionTypes.indexOf(a) !== i);
  if (duplicates.length > 5) return { flagged: true, reason: 'duplicate_actions', confidence: 0.80 };

  // Audience vote stuffing (casting more than allowed)
  const votes = last5min.filter(e => e.action === 'audience_vote_cast');
  if (votes.length > 10) return { flagged: true, reason: 'vote_stuffing', confidence: 0.90 };

  return { flagged: false, confidence: 0.0 };
}
