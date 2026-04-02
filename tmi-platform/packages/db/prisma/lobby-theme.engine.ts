import { LobbyTier, LobbyConfig } from './types';

export class LobbyThemeEngine {
  /**
   * Returns the configuration and feature flags for a lobby based on the user's tier.
   */
  static getLobbyConfigForTier(tier: LobbyTier): LobbyConfig {
    switch (tier) {
      case LobbyTier.DIAMOND:
        return {
          maxCapacity: 100,
          allowedThemes: ['all'],
          features: ['mini_games', 'jukebox', 'sponsor_booth', 'vip_lounge', 'custom_music', 'memory_wall'],
        };
      case LobbyTier.GOLD:
        return {
          maxCapacity: 50,
          allowedThemes: ['theater', 'bar_lounge', 'club'],
          features: ['mini_games', 'jukebox', 'memory_wall'],
        };
      case LobbyTier.FREE:
      default:
        return {
          maxCapacity: 10,
          allowedThemes: ['theater'],
          features: [],
        };
    }
  }
}