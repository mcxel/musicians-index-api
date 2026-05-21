// apps/api/src/modules/games/game.engine.ts
// All game types: Dirty Dozens, Deal or Feud 1000, Name That Tune, etc.

export type GameType =
  | 'dirty_dozens'
  | 'deal_or_feud_1000'
  | 'name_that_tune'
  | 'lyric_fill'
  | 'beat_challenge'
  | 'music_trivia'
  | 'cypher_battle'
  | 'audience_vote'
  | 'spin_and_win'
  | 'speed_round';

export type GameStatus =
  | 'lobby' | 'starting' | 'round_active' | 'round_complete'
  | 'intermission' | 'final_round' | 'complete' | 'cancelled';

export type GameRoundType =
  | 'standard' | 'speed' | 'double_points' | 'sudden_death'
  | 'redemption' | 'final' | 'tiebreak';

// ── GAME DEFINITIONS ──────────────────────────────────────
export interface GameDefinition {
  type: GameType;
  label: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  audienceVoting: boolean;      // audience can vote/affect outcome
  judgeRequired: boolean;       // needs official judge
  roundCount: number;
  roundDurationSeconds: number;
  intermissionSeconds: number;  // break between rounds
  pointsPerCorrectAnswer: number;
  bonusPointsForSpeed: number;
  participationPoints: number;  // just for showing up
  winnerPoints: number;
  adSlotOnIntermission: boolean;  // shows ad between rounds
  adSlotOnEndScreen: boolean;
  sponsorBannerEnabled: boolean;
  scene: string;                  // scene preset ID
  lighting: string;               // lighting preset
}

export const GAME_DEFINITIONS: Record<GameType, GameDefinition> = {
  dirty_dozens: {
    type: 'dirty_dozens',
    label: 'Dirty Dozens',
    description: 'The classic dozens battle — two contestants go head-to-head with the crowd judging every line. Most crowd energy wins the round.',
    minPlayers: 2, maxPlayers: 2,
    audienceVoting: true, judgeRequired: false,
    roundCount: 3, roundDurationSeconds: 120,
    intermissionSeconds: 15,
    pointsPerCorrectAnswer: 0,
    bonusPointsForSpeed: 0,
    participationPoints: 25,
    winnerPoints: 150,
    adSlotOnIntermission: true, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'underground-cypher',
    lighting: 'battle_red',
  },
  deal_or_feud_1000: {
    type: 'deal_or_feud_1000',
    label: 'Deal or Feud 1000',
    description: 'Survey says! Teams compete to find the top answers. Get to 1000 points or steal the board to win.',
    minPlayers: 2, maxPlayers: 8,
    audienceVoting: false, judgeRequired: false,
    roundCount: 5, roundDurationSeconds: 60,
    intermissionSeconds: 10,
    pointsPerCorrectAnswer: 50,
    bonusPointsForSpeed: 25,
    participationPoints: 20,
    winnerPoints: 200,
    adSlotOnIntermission: true, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'rainbow_party',
  },
  name_that_tune: {
    type: 'name_that_tune',
    label: 'Name That Tune',
    description: 'First to correctly name the track wins the round. DJ plays a clip — buzz in, guess fast!',
    minPlayers: 2, maxPlayers: 8,
    audienceVoting: false, judgeRequired: false,
    roundCount: 10, roundDurationSeconds: 30,
    intermissionSeconds: 5,
    pointsPerCorrectAnswer: 100,
    bonusPointsForSpeed: 50,
    participationPoints: 15,
    winnerPoints: 250,
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'neon_purple',
  },
  lyric_fill: {
    type: 'lyric_fill',
    label: 'Lyric Fill',
    description: 'Complete the missing lyric before time runs out. Fastest correct answer wins.',
    minPlayers: 2, maxPlayers: 12,
    audienceVoting: false, judgeRequired: false,
    roundCount: 15, roundDurationSeconds: 20,
    intermissionSeconds: 3,
    pointsPerCorrectAnswer: 75,
    bonusPointsForSpeed: 25,
    participationPoints: 10,
    winnerPoints: 200,
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'cypher_cyan',
  },
  beat_challenge: {
    type: 'beat_challenge',
    label: 'Beat Challenge',
    description: 'Producer vs. producer — drop a beat in the time limit. Audience votes on who had the hardest bar.',
    minPlayers: 2, maxPlayers: 4,
    audienceVoting: true, judgeRequired: false,
    roundCount: 3, roundDurationSeconds: 90,
    intermissionSeconds: 20,
    pointsPerCorrectAnswer: 0,
    bonusPointsForSpeed: 0,
    participationPoints: 30,
    winnerPoints: 300,
    adSlotOnIntermission: true, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'underground-cypher',
    lighting: 'neon_purple',
  },
  music_trivia: {
    type: 'music_trivia',
    label: 'Music Trivia',
    description: 'Multiple-choice music knowledge battle. Questions span genres, history, and current charts.',
    minPlayers: 1, maxPlayers: 20,
    audienceVoting: false, judgeRequired: false,
    roundCount: 20, roundDurationSeconds: 15,
    intermissionSeconds: 3,
    pointsPerCorrectAnswer: 50,
    bonusPointsForSpeed: 30,
    participationPoints: 10,
    winnerPoints: 150,
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'standard',
  },
  cypher_battle: {
    type: 'cypher_battle',
    label: 'Cypher Battle',
    description: '1v1 live rap battle. Audience votes determine the winner after each round. Best of 3.',
    minPlayers: 2, maxPlayers: 2,
    audienceVoting: true, judgeRequired: true,
    roundCount: 3, roundDurationSeconds: 180,
    intermissionSeconds: 30,
    pointsPerCorrectAnswer: 0,
    bonusPointsForSpeed: 0,
    participationPoints: 50,
    winnerPoints: 500,
    adSlotOnIntermission: true, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'underground-cypher',
    lighting: 'battle_red',
  },
  audience_vote: {
    type: 'audience_vote',
    label: 'Audience Vote',
    description: 'The audience decides everything. Live poll determines the outcome.',
    minPlayers: 1, maxPlayers: 50,
    audienceVoting: true, judgeRequired: false,
    roundCount: 1, roundDurationSeconds: 60,
    intermissionSeconds: 5,
    pointsPerCorrectAnswer: 10,
    bonusPointsForSpeed: 0,
    participationPoints: 15,
    winnerPoints: 100,
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: false,
    scene: 'lobby',
    lighting: 'standard',
  },
  spin_and_win: {
    type: 'spin_and_win',
    label: 'Spin & Win',
    description: 'Daily spin for points, items, and rewards. One spin per user per day.',
    minPlayers: 1, maxPlayers: 1,
    audienceVoting: false, judgeRequired: false,
    roundCount: 1, roundDurationSeconds: 10,
    intermissionSeconds: 0,
    pointsPerCorrectAnswer: 0,
    bonusPointsForSpeed: 0,
    participationPoints: 5,
    winnerPoints: 0, // rewards are variable
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'victory_gold',
  },
  speed_round: {
    type: 'speed_round',
    label: 'Speed Round',
    description: 'Rapid-fire questions. 5 seconds per answer. Most correct in 2 minutes wins.',
    minPlayers: 2, maxPlayers: 10,
    audienceVoting: false, judgeRequired: false,
    roundCount: 1, roundDurationSeconds: 120,
    intermissionSeconds: 10,
    pointsPerCorrectAnswer: 25,
    bonusPointsForSpeed: 50,
    participationPoints: 10,
    winnerPoints: 150,
    adSlotOnIntermission: false, adSlotOnEndScreen: true,
    sponsorBannerEnabled: true,
    scene: 'game-night',
    lighting: 'strobe_hype',
  },
};

// ── GAME SESSION ──────────────────────────────────────────
export interface GameSession {
  id: string;
  gameType: GameType;
  status: GameStatus;
  venueId?: string;
  roomId: string;
  hostUserId: string;
  coHostUserId?: string;
  djUserId?: string;
  players: GamePlayer[];
  currentRound: number;
  currentRoundType: GameRoundType;
  roundStartsAt?: Date;
  roundEndsAt?: Date;
  sponsorId?: string;   // if this session is sponsored
  isLiveStreamed: boolean;
  audienceCount: number;
  adBreakActive: boolean;
}

export interface GamePlayer {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  teamId?: string;
  score: number;
  participationPoints: number;
  roundScores: number[];
  isActive: boolean;
  isEliminated: boolean;
  buzzInTimeMs?: number; // for speed-based games
}

// ── SCORING WITHIN GAMES ──────────────────────────────────
export function calculateRoundWinner(players: GamePlayer[], roundType: GameRoundType): string | null {
  const activePlayers = players.filter(p => p.isActive && !p.isEliminated);
  if (activePlayers.length === 0) return null;
  
  // Sort by score DESC, then by buzzInTimeMs ASC for tiebreak
  const sorted = [...activePlayers].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.buzzInTimeMs && b.buzzInTimeMs) return a.buzzInTimeMs - b.buzzInTimeMs;
    return 0;
  });
  
  return sorted[0]?.userId ?? null;
}
