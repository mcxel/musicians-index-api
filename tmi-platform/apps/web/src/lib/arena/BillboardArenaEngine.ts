/**
 * BillboardArenaEngine
 * District data, live state, intent sorting, pull signals for the Arena.
 */

export type DistrictTheme = 'STAGE' | 'BATTLE' | 'SOCIAL' | 'MAGAZINE' | 'MARKET' | 'LOUNGE';

export interface ArenaDistrict {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  destination: string;
  theme: DistrictTheme;
  liveStatus: 'LIVE' | 'UPCOMING' | 'IDLE';
  viewerCount: number;
  energyLevel: number;      // 0–100
  trendingScore: number;    // computed
  pullSignal: boolean;      // energyLevel > 80 → "EVERYONE JOINING"
  color: string;
  glowColor: string;
  ambientEmotes: string[];
}

export type IntentCategory = 'STAGE' | 'BATTLE' | 'SOCIAL' | 'MAGAZINE' | 'MARKET' | 'LOUNGE' | null;

// Module-level live state (updated by WebSocket / polling in production)
const liveState: Record<string, { viewerCount: number; energyLevel: number; liveStatus: ArenaDistrict['liveStatus']; trendingScore: number }> = {
  stage:    { viewerCount: 2840, energyLevel: 88, liveStatus: 'LIVE', trendingScore: 88 * 0.6 + 2840 * 0.0004 },
  battle:   { viewerCount: 1420, energyLevel: 75, liveStatus: 'LIVE', trendingScore: 75 * 0.6 + 1420 * 0.0004 },
  social:   { viewerCount:  640, energyLevel: 42, liveStatus: 'LIVE', trendingScore: 42 * 0.6 +  640 * 0.0004 },
  magazine: { viewerCount:  380, energyLevel: 28, liveStatus: 'LIVE', trendingScore: 28 * 0.6 +  380 * 0.0004 },
  market:   { viewerCount:  290, energyLevel: 35, liveStatus: 'LIVE', trendingScore: 35 * 0.6 +  290 * 0.0004 },
  lounge:   { viewerCount: 1100, energyLevel: 61, liveStatus: 'LIVE', trendingScore: 61 * 0.6 + 1100 * 0.0004 },
};

const BASE_DISTRICTS: Omit<ArenaDistrict, 'viewerCount' | 'energyLevel' | 'liveStatus' | 'trendingScore' | 'pullSignal'>[] = [
  {
    id:           'stage',
    name:         'Stage District',
    emoji:        '🎤',
    tagline:      'Live concerts, showcases, and headliners. The main event.',
    destination:  '/live/stages',
    theme:        'STAGE',
    color:        '#FF2DAA',
    glowColor:    'rgba(255,45,170,0.4)',
    ambientEmotes: ['🔥', '🎤', '🎶', '⚡', '👑'],
  },
  {
    id:           'battle',
    name:         'Battle District',
    emoji:        '⚔️',
    tagline:      'Cyphers, battles, rap offs. Only one wins.',
    destination:  '/live/lobby',
    theme:        'BATTLE',
    color:        '#FFD700',
    glowColor:    'rgba(255,215,0,0.4)',
    ambientEmotes: ['⚔️', '🔥', '💥', '⚡', '🏆'],
  },
  {
    id:           'social',
    name:         'Social District',
    emoji:        '💬',
    tagline:      'Connect, follow, and vibe with fans and artists.',
    destination:  '/hub/fan',
    theme:        'SOCIAL',
    color:        '#00FF88',
    glowColor:    'rgba(0,255,136,0.35)',
    ambientEmotes: ['💬', '❤️', '✨', '🤝', '👥'],
  },
  {
    id:           'magazine',
    name:         'Magazine District',
    emoji:        '📰',
    tagline:      'News, features, and deep dives into the culture.',
    destination:  '/magazine',
    theme:        'MAGAZINE',
    color:        '#00FFFF',
    glowColor:    'rgba(0,255,255,0.35)',
    ambientEmotes: ['📰', '✍️', '🎨', '📸', '⭐'],
  },
  {
    id:           'market',
    name:         'Market District',
    emoji:        '🛒',
    tagline:      'NFTs, beats, merch, season passes. Own the culture.',
    destination:  '/nft-marketplace',
    theme:        'MARKET',
    color:        '#AA2DFF',
    glowColor:    'rgba(170,45,255,0.4)',
    ambientEmotes: ['🛒', '💎', '🎧', '🏷️', '✨'],
  },
  {
    id:           'lounge',
    name:         'Lounge District',
    emoji:        '🎧',
    tagline:      'Chill rooms, ambient sessions, and late-night vibes.',
    destination:  '/live/rooms/world-dance-party',
    theme:        'LOUNGE',
    color:        '#64C8FF',
    glowColor:    'rgba(100,200,255,0.35)',
    ambientEmotes: ['🎧', '🌊', '💫', '🌙', '✨'],
  },
];

export function getDistricts(): ArenaDistrict[] {
  return BASE_DISTRICTS.map((d) => {
    const live = liveState[d.id] ?? { viewerCount: 0, energyLevel: 20, liveStatus: 'IDLE' as const };
    return {
      ...d,
      viewerCount: live.viewerCount,
      energyLevel: live.energyLevel,
      liveStatus:  live.liveStatus,
      trendingScore: live.energyLevel * 0.6 + live.viewerCount * 0.0004,
      pullSignal:  live.energyLevel > 80,
    };
  });
}

export function sortDistrictsByIntent(districts: ArenaDistrict[], intent: IntentCategory): ArenaDistrict[] {
  if (!intent) return [...districts].sort((a, b) => b.trendingScore - a.trendingScore);
  return [...districts].sort((a, b) => {
    const aMatch = a.theme === intent ? 1000 : 0;
    const bMatch = b.theme === intent ? 1000 : 0;
    return (bMatch + b.trendingScore) - (aMatch + a.trendingScore);
  });
}

export function updateDistrictEnergy(districtId: string, delta: number): void {
  const s = liveState[districtId];
  if (!s) return;
  s.energyLevel = Math.max(0, Math.min(100, s.energyLevel + delta));
  s.trendingScore = s.energyLevel * 0.6 + s.viewerCount * 0.0004;
}
