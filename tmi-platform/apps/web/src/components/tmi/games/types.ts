/**
 * game.types.ts
 * Repo: apps/web/src/config/game.types.ts
 * Action: CREATE | Wave: B9
 * Purpose: Game type definitions and reveal config mapping.
 */

export type GameType =
  | 'quick_poll'          // 1 winner, fast reveal
  | 'trivia_round'        // 1–3 winners
  | 'talent_show'         // 1–5 winners, small game
  | 'platform_contest'    // 5–10 winners, big contest
  | 'grand_finals'        // 1 featured winner from top 10
  | 'season_finale';      // Full ceremony, all top 10

export interface GameTypeConfig {
  id: GameType;
  label: string;
  minWinners: number;
  maxWinners: number;
  revealMode: 'single' | 'small_game' | 'big_contest';
  groupHoldSeconds: number;
  allowVoiceChatter: boolean;
  hostRequired: boolean;
  cameraPresets: string[];
}

export const GAME_TYPE_CONFIGS: Record<GameType, GameTypeConfig> = {
  quick_poll: {
    id: 'quick_poll', label: 'Quick Poll', minWinners: 1, maxWinners: 1,
    revealMode: 'single', groupHoldSeconds: 0, allowVoiceChatter: false,
    hostRequired: false, cameraPresets: ['hero_zoom'],
  },
  trivia_round: {
    id: 'trivia_round', label: 'Trivia Round', minWinners: 1, maxWinners: 3,
    revealMode: 'small_game', groupHoldSeconds: 2, allowVoiceChatter: false,
    hostRequired: false, cameraPresets: ['hero_zoom', 'podium_pan'],
  },
  talent_show: {
    id: 'talent_show', label: 'Talent Show', minWinners: 1, maxWinners: 5,
    revealMode: 'small_game', groupHoldSeconds: 3, allowVoiceChatter: true,
    hostRequired: false, cameraPresets: ['group_celebration', 'podium_pan', 'hero_zoom'],
  },
  platform_contest: {
    id: 'platform_contest', label: 'Platform Contest', minWinners: 5, maxWinners: 10,
    revealMode: 'big_contest', groupHoldSeconds: 4, allowVoiceChatter: true,
    hostRequired: true, cameraPresets: ['group_celebration', 'podium_pan', 'chaotic_reaction_sweep', 'hero_zoom'],
  },
  grand_finals: {
    id: 'grand_finals', label: 'Grand Finals', minWinners: 5, maxWinners: 10,
    revealMode: 'big_contest', groupHoldSeconds: 4, allowVoiceChatter: true,
    hostRequired: true, cameraPresets: ['group_celebration', 'crowd_bounce_shot', 'winner_isolation', 'hero_zoom'],
  },
  season_finale: {
    id: 'season_finale', label: 'Season Finale', minWinners: 5, maxWinners: 10,
    revealMode: 'big_contest', groupHoldSeconds: 5, allowVoiceChatter: true,
    hostRequired: true, cameraPresets: ['group_celebration', 'podium_pan', 'crowd_bounce_shot', 'winner_isolation', 'hero_zoom', 'final_goodbye_orbit'],
  },
};

export function getGameConfig(type: GameType): GameTypeConfig {
  return GAME_TYPE_CONFIGS[type];
}
