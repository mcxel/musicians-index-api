// apps/web/src/config/game-registry.ts
// Every game type on the platform with rules, scoring, and room config.

export type GameType =
  | 'dirty_dozens'       // roast battle / Dirty Dozens
  | 'deal_or_feud'       // survey-style game show
  | 'name_that_tune'     // music trivia
  | 'lyric_cipher'       // fill-in-the-lyric
  | 'beat_challenge'     // producer battle
  | 'trivia_thousand'    // 1,000-point trivia sprint
  | 'cypher_1v1'         // freestyle rap battle
  | 'cypher_open'        // open cypher rotation
  | 'audience_vote';     // any audience-voted competition

export type ScoringMode =
  | 'audience_vote'      // pure audience vote
  | 'judge_panel'        // judge scores only
  | 'hybrid'             // combined audience + judges
  | 'objective'          // points-based, no judges
  | 'time_based'         // fastest correct answer wins
  | 'elimination';       // progressive elimination rounds

export interface GameDefinition {
  type: GameType;
  label: string;
  description: string;
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  hasRounds: boolean;
  roundCount?: number;
  roundDurationSeconds?: number;
  scoringMode: ScoringMode;
  pointsPerAction: Partial<PointsMap>;
  audienceParticipation: boolean;
  requiresJudges: boolean;
  minJudges?: number;
  maxJudges?: number;
  hostRequired: boolean;
  djOptional: boolean;
  tieBreakRule: TieBreakRule;
  winnerCount: number;      // how many winners
  rewardMultiplier: number; // x base reward points
  sponsorSlotsAvailable: number;
  adSlotsAvailable: number;
  sceneId: string;          // default scene from scene-registry
  ambience: string;         // default audio ambience
}

export type TieBreakRule =
  | 'highest_audience_vote' | 'highest_judge_score' | 'fastest_submission'
  | 'most_round_wins' | 'admin_override' | 'replay_round';

export interface PointsMap {
  participation: number;
  per_correct_answer: number;
  per_vote_cast: number;
  per_round_win: number;
  per_match_win: number;
  per_event_win: number;
  first_place_bonus: number;
  streak_multiplier: number;
  audience_cheer_point: number;
  sponsor_interaction: number;
}

export const BASE_POINTS: PointsMap = {
  participation: 10,
  per_correct_answer: 20,
  per_vote_cast: 5,
  per_round_win: 50,
  per_match_win: 100,
  per_event_win: 250,
  first_place_bonus: 500,
  streak_multiplier: 1.5,
  audience_cheer_point: 2,
  sponsor_interaction: 15,
};

export const GAME_REGISTRY: Record<GameType, GameDefinition> = {
  dirty_dozens: {
    type: 'dirty_dozens', label: 'Dirty Dozens', emoji: '🔥',
    description: 'The ultimate roast battle. Two contestants. One mic. The crowd decides.',
    minPlayers: 2, maxPlayers: 2, hasRounds: true,
    roundCount: 3, roundDurationSeconds: 60,
    scoringMode: 'hybrid',
    pointsPerAction: { participation: 10, per_round_win: 75, per_match_win: 150, first_place_bonus: 750, audience_cheer_point: 3 },
    audienceParticipation: true, requiresJudges: true, minJudges: 3, maxJudges: 5,
    hostRequired: true, djOptional: true,
    tieBreakRule: 'highest_audience_vote',
    winnerCount: 1, rewardMultiplier: 2.5,
    sponsorSlotsAvailable: 3, adSlotsAvailable: 2,
    sceneId: 'underground-cypher', ambience: 'cypher-beat-loop',
  },
  deal_or_feud: {
    type: 'deal_or_feud', label: 'Deal or Feud 1000', emoji: '🎲',
    description: 'Survey says! Music fan edition. Answer questions the crowd answered most.',
    minPlayers: 2, maxPlayers: 10, hasRounds: true,
    roundCount: 5, roundDurationSeconds: 30,
    scoringMode: 'objective',
    pointsPerAction: { participation: 10, per_correct_answer: 50, per_round_win: 100, first_place_bonus: 1000, streak_multiplier: 2 },
    audienceParticipation: true, requiresJudges: false,
    hostRequired: true, djOptional: true,
    tieBreakRule: 'fastest_submission',
    winnerCount: 1, rewardMultiplier: 2.0,
    sponsorSlotsAvailable: 4, adSlotsAvailable: 3,
    sceneId: 'game-night', ambience: 'game-show-cues',
  },
  name_that_tune: {
    type: 'name_that_tune', label: 'Name That Tune', emoji: '🎵',
    description: 'First to identify the song wins the round. Music knowledge is currency.',
    minPlayers: 2, maxPlayers: 20, hasRounds: true,
    roundCount: 10, roundDurationSeconds: 15,
    scoringMode: 'time_based',
    pointsPerAction: { participation: 10, per_correct_answer: 30, per_round_win: 60, first_place_bonus: 600, streak_multiplier: 1.5 },
    audienceParticipation: false, requiresJudges: false,
    hostRequired: false, djOptional: true,
    tieBreakRule: 'fastest_submission',
    winnerCount: 3, rewardMultiplier: 1.5,
    sponsorSlotsAvailable: 2, adSlotsAvailable: 2,
    sceneId: 'game-night', ambience: 'game-show-cues',
  },
  lyric_cipher: {
    type: 'lyric_cipher', label: 'Lyric Cipher', emoji: '🎤',
    description: 'Fill in the blank. How well do you know your favorite songs?',
    minPlayers: 2, maxPlayers: 50, hasRounds: true,
    roundCount: 8, roundDurationSeconds: 20,
    scoringMode: 'objective',
    pointsPerAction: { participation: 10, per_correct_answer: 25, per_round_win: 50, first_place_bonus: 400 },
    audienceParticipation: false, requiresJudges: false,
    hostRequired: false, djOptional: false,
    tieBreakRule: 'fastest_submission',
    winnerCount: 3, rewardMultiplier: 1.2,
    sponsorSlotsAvailable: 2, adSlotsAvailable: 2,
    sceneId: 'game-night', ambience: 'game-show-cues',
  },
  beat_challenge: {
    type: 'beat_challenge', label: 'Beat Challenge', emoji: '🎹',
    description: 'Drop a beat. Audience judges. Producers put it on the line.',
    minPlayers: 2, maxPlayers: 8, hasRounds: true,
    roundCount: 3, roundDurationSeconds: 90,
    scoringMode: 'hybrid',
    pointsPerAction: { participation: 15, per_round_win: 100, per_match_win: 200, first_place_bonus: 800, audience_cheer_point: 2 },
    audienceParticipation: true, requiresJudges: true, minJudges: 3, maxJudges: 5,
    hostRequired: true, djOptional: false,
    tieBreakRule: 'highest_judge_score',
    winnerCount: 1, rewardMultiplier: 2.0,
    sponsorSlotsAvailable: 3, adSlotsAvailable: 2,
    sceneId: 'studio', ambience: 'studio-ambient',
  },
  trivia_thousand: {
    type: 'trivia_thousand', label: 'Trivia 1000', emoji: '📚',
    description: 'Race to 1,000 points. Music trivia, history, and industry knowledge.',
    minPlayers: 2, maxPlayers: 100, hasRounds: false,
    scoringMode: 'objective',
    pointsPerAction: { participation: 10, per_correct_answer: 100, streak_multiplier: 2, first_place_bonus: 500 },
    audienceParticipation: true, requiresJudges: false,
    hostRequired: false, djOptional: false,
    tieBreakRule: 'fastest_submission',
    winnerCount: 5, rewardMultiplier: 1.5,
    sponsorSlotsAvailable: 3, adSlotsAvailable: 2,
    sceneId: 'game-night', ambience: 'game-show-cues',
  },
  cypher_1v1: {
    type: 'cypher_1v1', label: '1v1 Cypher Battle', emoji: '⚔️',
    description: 'One-on-one freestyle rap battle. Audience and judges decide the winner.',
    minPlayers: 2, maxPlayers: 2, hasRounds: true,
    roundCount: 4, roundDurationSeconds: 60,
    scoringMode: 'hybrid',
    pointsPerAction: { participation: 10, per_round_win: 75, per_match_win: 200, first_place_bonus: 1000, audience_cheer_point: 3 },
    audienceParticipation: true, requiresJudges: true, minJudges: 3, maxJudges: 5,
    hostRequired: true, djOptional: true,
    tieBreakRule: 'highest_audience_vote',
    winnerCount: 1, rewardMultiplier: 3.0,
    sponsorSlotsAvailable: 4, adSlotsAvailable: 2,
    sceneId: 'underground-cypher', ambience: 'cypher-beat-loop',
  },
  cypher_open: {
    type: 'cypher_open', label: 'Open Cypher', emoji: '🎙️',
    description: 'Take a verse, pass the mic. The crowd keeps it alive.',
    minPlayers: 2, maxPlayers: 50, hasRounds: false,
    scoringMode: 'audience_vote',
    pointsPerAction: { participation: 20, audience_cheer_point: 5, sponsor_interaction: 20 },
    audienceParticipation: true, requiresJudges: false,
    hostRequired: false, djOptional: true,
    tieBreakRule: 'highest_audience_vote',
    winnerCount: 3, rewardMultiplier: 1.0,
    sponsorSlotsAvailable: 2, adSlotsAvailable: 1,
    sceneId: 'neon-club', ambience: 'crowd-ambient',
  },
  audience_vote: {
    type: 'audience_vote', label: 'Audience Vote', emoji: '🗳️',
    description: 'The crowd decides. Used for any voted competition.',
    minPlayers: 2, maxPlayers: 20, hasRounds: false,
    scoringMode: 'audience_vote',
    pointsPerAction: { participation: 10, per_vote_cast: 5, audience_cheer_point: 2 },
    audienceParticipation: true, requiresJudges: false,
    hostRequired: false, djOptional: false,
    tieBreakRule: 'highest_audience_vote',
    winnerCount: 1, rewardMultiplier: 1.0,
    sponsorSlotsAvailable: 2, adSlotsAvailable: 1,
    sceneId: 'contest-arena', ambience: 'crowd-ambient',
  },
};
