export enum LobbyTier {
  FREE = 'FREE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum LobbyType {
  THEATER = 'THEATER',
  BAR_LOUNGE = 'BAR_LOUNGE',
  CLUB = 'CLUB',
  ARENA = 'ARENA',
  VIP = 'VIP',
}

export interface LobbyConfig {
  maxCapacity: number;
  allowedThemes: string[];
  features: string[]; // e.g., ['mini_games', 'jukebox', 'sponsor_booth', 'memory_wall']
}