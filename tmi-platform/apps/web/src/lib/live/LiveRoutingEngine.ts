export type LiveEventType =
  | 'LIVE_GENERAL'
  | 'LIVE_BATTLE'
  | 'LIVE_CHALLENGE'
  | 'LIVE_CONCERT'
  | 'LIVE_CYPHER';

export type DestinationWall =
  | 'GENERAL_LIVE_WALL'
  | 'BATTLE_LIVE_WALL'
  | 'CHALLENGE_LIVE_WALL'
  | 'CONCERT_LIVE_WALL'
  | 'CYPHER_LIVE_WALL';

export type RoutedCategory = 'live' | 'battle' | 'challenge' | 'concert' | 'cypher';

export interface RoutedLivePlacement {
  eventType: LiveEventType;
  category: RoutedCategory;
  destinationWall: DestinationWall;
  lobbyRoute: string;
}

const FALLBACK_PLACEMENT: RoutedLivePlacement = {
  eventType: 'LIVE_GENERAL',
  category: 'live',
  destinationWall: 'GENERAL_LIVE_WALL',
  lobbyRoute: '/live/lobby-wall',
};

export function routeLivePlacement(input: {
  eventType?: string | null;
  category?: string | null;
}): RoutedLivePlacement {
  const normalizedEventType = (input.eventType ?? '').trim().toUpperCase();
  const normalizedCategory = (input.category ?? '').trim().toLowerCase();

  const fromEventType: Record<LiveEventType, RoutedLivePlacement> = {
    LIVE_GENERAL: {
      eventType: 'LIVE_GENERAL',
      category: 'live',
      destinationWall: 'GENERAL_LIVE_WALL',
      lobbyRoute: '/live/lobby-wall',
    },
    LIVE_BATTLE: {
      eventType: 'LIVE_BATTLE',
      category: 'battle',
      destinationWall: 'BATTLE_LIVE_WALL',
      lobbyRoute: '/battles/lobby-wall',
    },
    LIVE_CHALLENGE: {
      eventType: 'LIVE_CHALLENGE',
      category: 'challenge',
      destinationWall: 'CHALLENGE_LIVE_WALL',
      lobbyRoute: '/challenges/lobby-wall',
    },
    LIVE_CONCERT: {
      eventType: 'LIVE_CONCERT',
      category: 'concert',
      destinationWall: 'CONCERT_LIVE_WALL',
      lobbyRoute: '/live/lobby-wall',
    },
    LIVE_CYPHER: {
      eventType: 'LIVE_CYPHER',
      category: 'cypher',
      destinationWall: 'CYPHER_LIVE_WALL',
      lobbyRoute: '/cypher/lobby-wall',
    },
  };

  if (normalizedEventType in fromEventType) {
    return fromEventType[normalizedEventType as LiveEventType];
  }

  switch (normalizedCategory) {
    case 'battle':
      return fromEventType.LIVE_BATTLE;
    case 'challenge':
      return fromEventType.LIVE_CHALLENGE;
    case 'concert':
      return fromEventType.LIVE_CONCERT;
    case 'cypher':
      return fromEventType.LIVE_CYPHER;
    case 'live':
      return fromEventType.LIVE_GENERAL;
    default:
      return FALLBACK_PLACEMENT;
  }
}

export function normalizeWallFilter(input: string | null): 'all' | RoutedCategory {
  const v = (input ?? '').trim().toLowerCase();
  if (!v || v === 'general' || v === 'mixed' || v === 'all') return 'all';
  if (v === 'battle' || v === 'challenge' || v === 'concert' || v === 'cypher' || v === 'live') return v;
  return 'all';
}
