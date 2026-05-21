/**
 * feature.flags.ts
 * Repo: apps/web/src/config/feature.flags.ts
 * Action: CREATE | Wave: B8
 * Purpose: Single source of truth for feature toggles.
 * These control experimental/optional platform features.
 * Update these — do NOT scatter boolean checks around the codebase.
 */

export const FEATURE_FLAGS = {
  // Contest
  CONTEST_ENABLED: true,
  CONTEST_VOTING_ENABLED: true,
  CONTEST_MULTI_WINNER_REVEAL: true,
  CONTEST_VOICE_CHATTER: false,         // Set true when WebRTC voice is wired
  CONTEST_ADAPTIVE_TRANSITIONS: false,  // Set true after analytics baseline established
  CONTEST_REPLAY_CLIPS: false,          // Set true when clip storage is wired

  // Sponsor
  SPONSOR_ROI_ANALYTICS: true,
  SPONSOR_LEADERBOARD: true,
  SPONSOR_OVERLAY_ON_STAGE: true,
  SPONSOR_SLOT_CAPS_ENFORCED: true,

  // Host
  RAY_JOURNEY_LIVE_MODE: false,         // Set true when WebSocket host cue is wired
  RAY_JOURNEY_VOICE: false,             // Set true when ElevenLabs/TTS is wired

  // Reveal
  REVEAL_CAMERA_DIRECTOR: true,
  REVEAL_REACTION_BURST: true,
  REVEAL_WINNER_LINEUP_STRIP: true,

  // Platform
  PLATFORM_DARK_MODE_ONLY: true,        // TMI is always dark
  PLATFORM_SEASONAL_THEMES: false,      // Set true when theme packs are ready
  PLATFORM_ARCADE_GAMES: false,         // Set true when game engine is wired

  // Ops
  MAINTENANCE_MODE: false,
  CONTEST_REGISTRATION_OPEN: false,     // Controlled by August 8 date rule — do not manually set
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}


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


/**
 * sponsor.tiers.ts
 * Repo: apps/web/src/config/sponsor.tiers.ts
 * Action: CREATE | Wave: B10
 * Purpose: Single source of truth for all sponsor tier rules.
 * NEVER hardcode tier prices or benefits in components.
 */

export type SponsorTierType = 'local-bronze' | 'local-silver' | 'local-gold' | 'major-bronze' | 'major-silver' | 'major-gold' | 'title';
export type SponsorCategory = 'local' | 'major';

export interface SponsorTier {
  id: SponsorTierType;
  label: string;
  category: SponsorCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  price: number;            // USD minimum contribution
  benefits: string[];
  logoOnProfile: boolean;
  stageOverlay: boolean;
  stageMentionCount: number; // 0 = none, -1 = unlimited
  analyticsDepth: 'none' | 'basic' | 'full' | 'premium';
  overlayFrequency: 'none' | 'low' | 'medium' | 'high' | 'exclusive';
  namingRights: boolean;
  color: string;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: 'local-bronze', label: 'Local Bronze', category: 'local', tier: 'bronze',
    price: 50, benefits: ['Name on profile', 'Contest entry acknowledgment'],
    logoOnProfile: false, stageOverlay: false, stageMentionCount: 0,
    analyticsDepth: 'none', overlayFrequency: 'none', namingRights: false, color: '#cd7f32',
  },
  {
    id: 'local-silver', label: 'Local Silver', category: 'local', tier: 'silver',
    price: 100, benefits: ['Name + logo on profile', 'Fan page visibility'],
    logoOnProfile: true, stageOverlay: false, stageMentionCount: 0,
    analyticsDepth: 'basic', overlayFrequency: 'none', namingRights: false, color: '#c0c0c0',
  },
  {
    id: 'local-gold', label: 'Local Gold', category: 'local', tier: 'gold',
    price: 250, benefits: ['Logo + profile placement', 'Stage mention', 'Analytics'],
    logoOnProfile: true, stageOverlay: false, stageMentionCount: 1,
    analyticsDepth: 'basic', overlayFrequency: 'none', namingRights: false, color: '#ffd700',
  },
  {
    id: 'major-bronze', label: 'Major Bronze', category: 'major', tier: 'bronze',
    price: 1000, benefits: ['Logo + profile placement', 'Stage mention', 'Analytics'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: 2,
    analyticsDepth: 'basic', overlayFrequency: 'low', namingRights: false, color: '#cd7f32',
  },
  {
    id: 'major-silver', label: 'Major Silver', category: 'major', tier: 'silver',
    price: 5000, benefits: ['Logo + stage overlay', 'Priority mention', 'Full analytics', 'Email spotlight'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: 4,
    analyticsDepth: 'full', overlayFrequency: 'medium', namingRights: false, color: '#c0c0c0',
  },
  {
    id: 'major-gold', label: 'Major Gold', category: 'major', tier: 'gold',
    price: 10000, benefits: ['All surfaces', 'Pre-performance slate', 'Premium analytics', 'Monthly report'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: -1,
    analyticsDepth: 'premium', overlayFrequency: 'high', namingRights: false, color: '#ffd700',
  },
  {
    id: 'title', label: 'Title Sponsor', category: 'major', tier: 'title',
    price: 25000, benefits: ['Full naming rights', 'Exclusive overlays', 'All surfaces exclusive', 'Season co-branding', 'Direct analytics API'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: -1,
    analyticsDepth: 'premium', overlayFrequency: 'exclusive', namingRights: true, color: '#00e5ff',
  },
];

export const LOCAL_SPONSORS_REQUIRED = 10;
export const MAJOR_SPONSORS_REQUIRED = 10;
export const TOTAL_SPONSORS_REQUIRED = LOCAL_SPONSORS_REQUIRED + MAJOR_SPONSORS_REQUIRED;

export function getTierById(id: SponsorTierType): SponsorTier {
  return SPONSOR_TIERS.find(t => t.id === id) ?? SPONSOR_TIERS[0];
}

export function getTiersByCategory(category: SponsorCategory): SponsorTier[] {
  return SPONSOR_TIERS.filter(t => t.category === category);
}

export function isLocalTier(id: SponsorTierType): boolean {
  return id.startsWith('local-');
}
