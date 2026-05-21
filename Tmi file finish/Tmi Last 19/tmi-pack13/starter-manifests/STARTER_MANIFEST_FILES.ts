// ════════════════════════════════════════════════════════
// FILE: apps/web/src/config/homepage-belts.config.ts
// PURPOSE: Config-driven homepage belt registry
// ════════════════════════════════════════════════════════

export const HOMEPAGE_BELTS = {
  page1: {
    id: 'magazine-cover',
    role: 'cover',
    belts: ['crown-ring', 'comic-insert', 'issue-footer']
  },
  page2: {
    id: 'live-world',
    role: 'activity-hub',
    belts: ['live-world-activity', 'discovery-belt', 'boost-belt']
  },
  page3: {
    id: 'editorial',
    role: 'magazine-content',
    belts: ['editorial-belt', 'discovery-curation-belt', 'platform-marketplace-belt']
  }
} as const;

export const BELT_SECTIONS = {
  'live-world-activity': {
    title: 'Live World (Activity Belt)',
    sections: ['main-preview-lobby', 'lobby-wall', 'join-random-room']
  },
  'discovery-belt': {
    title: 'Discovery Belt (Trends & Events)',
    sections: ['world-premieres', 'event-calendar']
  },
  'boost-belt': {
    title: 'Discovery Belt (Boost)',
    sections: ['undiscovered-boost', 'cypher-arena', 'stream-and-win']
  },
  'editorial-belt': {
    title: 'Editorial Belt (Content)',
    sections: ['article-feature', 'music-news', 'interviews', 'studio-recaps']
  },
  'discovery-curation-belt': {
    title: 'Discovery Belt (Curation)',
    sections: ['genre-cluster', 'top-10-charts', 'weekly-playlists', 'az-directory']
  },
  'platform-marketplace-belt': {
    title: 'Platform & Marketplace Belt',
    sections: ['store', 'booking-portal', 'achievements', 'sponsor-spotlight']
  }
} as const;

// ════════════════════════════════════════════════════════
// FILE: packages/hud-theme/src/motion.tokens.ts
// PURPOSE: All animation constants — one source of truth
// ════════════════════════════════════════════════════════

export const MOTION = {
  // Page transitions
  PAGE_FLIP_MS: 400,
  CORNER_PEEL_MS: 600,
  PAGE_STRIP_CLICK_MS: 300,

  // Card interactions
  CARD_HOVER_SCALE: 1.05,
  CARD_HOVER_ROTATE_DEG: 2,
  CARD_HOVER_MS: 150,
  CARD_SNAP_SPRING_STIFFNESS: 300,
  CARD_SNAP_SPRING_DAMPING: 20,

  // Crown system
  CROWN_PORTRAIT_SECONDS: 6,
  RING_PORTRAIT_SECONDS: 3,
  CROWN_TRANSFER_MS: 2500,
  CROWN_GLOW_PULSE_MS: 1800,

  // Tier transformation (rooms)
  TIER_UPGRADE_TOTAL_MS: 9000,
  TIER_COLOR_WAVE_MS: 2500,
  TIER_WALL_EXPAND_MS: 3500,
  TIER_CELEBRATION_MS: 2000,

  // Audience
  AVATAR_BOBBLE_SPRING_STIFFNESS: 200,
  AVATAR_BOBBLE_SPRING_DAMPING: 15,
  CROWD_WAVE_ROW_DELAY_MS: 300,

  // VHS/CRT
  VHS_SCANLINE_INTENSITY: 0.03,
  VHS_FLICKER_RATE: 0.02,
  VHS_CHROMATIC_ABERRATION: 0.002,

  // Broadcaster
  BROADCASTER_DUCK_MUSIC_DB: -20,

  // Haptics (mobile)
  HAPTIC_CARD_SNAP_MS: 10,
  HAPTIC_TIER_UPGRADE_MS: 200,
  HAPTIC_LOOT_DROP_MS: 100,
} as const;

// ════════════════════════════════════════════════════════
// FILE: apps/web/src/config/crown.config.ts
// PURPOSE: Crown system rules
// ════════════════════════════════════════════════════════

export const CROWN_CONFIG = {
  rotationWeekLimit: 8,           // Max consecutive weeks at #1
  cooldownWeeks: 4,               // Weeks before reclaiming #1
  updateSchedule: '0 0 * * SUN',  // Every Sunday midnight

  scoreWeights: {
    streams: 0.30,
    points: 0.25,
    cypherWins: 0.20,
    fanVotes: 0.15,
    watchTime: 0.10,
  },

  yearlyAwards: {
    bronze: { minWeeks: 1 },
    silver: { minWeeks: 3 },
    gold: { minWeeks: 5 },
    platinum: { minWeeks: 8 },
    artistOfYear: { mostWeeksInCalendarYear: true },
  },

  coverTagline: 'Who took the crown this week?',
  coverSection: 'Weekly Cyphers!',
} as const;

// ════════════════════════════════════════════════════════
// FILE: apps/web/src/config/discovery.config.ts
// PURPOSE: Discovery algorithm weights and rules
// ════════════════════════════════════════════════════════

export const DISCOVERY_CONFIG = {
  // Lobby wall sort order (discovery-first)
  sortOrder: 'viewers_ascending' as const, // NEVER change this default

  // Algorithm weights
  scoreWeights: {
    reverseRank: 0.30,
    freshness: 0.25,
    sessionEngagement: 0.20,
    genreDiversity: 0.15,
    newAccountBonus: 0.10,
  },

  // New account bonus duration
  newAccountBonusDays: 30,

  // Anti-repetition
  maxSameArtistInRow: 1, // Never show same artist twice in 10-card row

  // Lobby wall refresh
  refreshIntervalSeconds: 15,

  // Undiscovered boost
  boostArtistRefreshMinutes: 15,
} as const;

// ════════════════════════════════════════════════════════
// FILE: apps/web/src/config/sponsor-rules.config.ts
// PURPOSE: Sponsor placement rules — immutable
// ════════════════════════════════════════════════════════

export const SPONSOR_RULES = {
  // Timing
  minSecondsBetweenAds: 60,
  maxAdsPerHourLive: 2,
  maxAnimationSeconds: 8,
  maxLowerThirdSeconds: 10,

  // Banned moments (never show sponsor)
  bannedMoments: [
    'winner-reveal',
    'crown-transfer',
    'tier-upgrade-sequence',
    'emergency-broadcast',
  ] as const,

  // Banned placements
  bannedPlacements: [
    'over-artist-portrait',
    'over-stage',
    'over-crown-card',
  ] as const,

  // Allowed placements per page
  allowedPlacements: {
    homepage1: ['bottom-strip-only'],
    homepage2: ['side-card', 'bottom-strip'],
    homepage3: ['marketplace-belt-full-card'],
    liveEvent: ['lower-third', 'intermission-full'],
  },

  // Auto behavior
  noAutoplayAudio: true,
  fallbackToHouseAd: true,
} as const;

// ════════════════════════════════════════════════════════
// FILE: tmi-platform/bots/manifests/crown-bot.manifest.json
// PURPOSE: Crown bot configuration
// ════════════════════════════════════════════════════════
// (JSON below — save as .json file)

const CROWN_BOT_MANIFEST = {
  "id": "crown-bot",
  "version": "1.0.0",
  "description": "Calculates weekly rankings, enforces rotation rules, updates homepage",
  "schedule": "0 0 * * SUN",
  "owner": "big-ace",
  "permissions": {
    "reads": ["rankings", "artist-scores", "crown-history"],
    "writes": ["crown-state", "homepage-config", "notifications"],
    "cannot_touch": ["user-data", "design-system", "billing", "security"]
  },
  "fallback": {
    "on_failure": "hold-current-crown",
    "notify": "big-ace",
    "retry_after_minutes": 30
  },
  "logging": {
    "channel": "bot-logs:crown",
    "level": "info",
    "persist_days": 365
  },
  "big_ace_override": {
    "force_rotation": false,
    "forced_crown_artist_id": null,
    "skip_this_week": false
  }
};

// ════════════════════════════════════════════════════════
// FILE: apps/web/src/config/homepage-card-data.example.ts
// PURPOSE: Shows shape of homepage card data
// ════════════════════════════════════════════════════════

export const HOMEPAGE_CARD_DATA_EXAMPLE = {
  crownCard: {
    artistId: 'artist-123',
    artistName: 'Ricardo Parker',
    rankNumber: 1,
    weekNumber: 12,
    motionClipUrl: '/media/artists/artist-123/crown-clip.mp4',
    posterUrl: '/media/artists/artist-123/portrait.jpg',
    genre: 'Hip Hop',
    weeklyScore: 9840,
  },
  artistRingEntry: {
    artistId: 'artist-456',
    artistName: 'Maya Torres',
    rankNumber: 2,
    motionClipUrl: '/media/artists/artist-456/ring-clip.mp4',
    posterUrl: '/media/artists/artist-456/portrait.jpg',
    genre: 'R&B',
  },
  previewLobbyCard: {
    eventId: 'event-789',
    artistId: 'artist-789',
    artistName: 'DJ Frost',
    isLive: true,
    previewUrl: 'https://stream.tmi.live/preview/event-789',
    viewerCount: 0,         // ← 0 viewers = position 1 in lobby wall
    venue: 'The Loft',
    venueCode: 'ROOM_FREE_03',
  },
  comicInsert: {
    weekNumber: 12,
    type: 'crown-drama',
    headline: 'Who almost took #1? The story inside...',
    imageUrl: '/media/issues/w12-comic-insert.png',
    animationType: 'wobble',
  },
  issueSummary: {
    issueId: 'TMI-2026-W12',
    issueNumber: 12,
    weekOf: '2026-03-16',
    theme: 'Underground Rises',
    crownWinnerArtistId: 'artist-123',
    coverTagline: 'Who took the crown this week?',
    publishedAt: '2026-03-16T00:00:00Z',
  }
};

// ════════════════════════════════════════════════════════
// FILE: packages/platform-kernel/src/feature-flags.ts
// PURPOSE: Feature flag registry — runtime gates
// ════════════════════════════════════════════════════════

export const FEATURE_FLAGS = {
  // Phase 1 — Now
  ENABLE_HOMEPAGE_SYSTEM: true,
  ENABLE_MAGAZINE_NAV: true,
  ENABLE_CROWN_SYSTEM: true,
  ENABLE_DISCOVERY_SORT: true,
  ENABLE_STREAM_AND_WIN: true,
  ENABLE_DAILY_SPIN: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_FOLLOW_SYSTEM: true,

  // Phase 2 — After auth/economy
  ENABLE_SUBSCRIPTION_BILLING: false,
  ENABLE_PAYOUTS: false,
  ENABLE_FAN_CLUBS: false,
  ENABLE_WATCH_PARTIES: false,

  // Phase 3 — Rooms/live
  ENABLE_LIVE_ROOMS: false,
  ENABLE_AUDIENCE_3D: false,
  ENABLE_FACE_SCAN: false,
  ENABLE_TIER_TRANSFORMATION: false,

  // Phase 4 — Shows/games
  ENABLE_DEAL_OR_FEUD: false,
  ENABLE_MONTHLY_IDOL: false,
  ENABLE_BROADCASTER: false,
  ENABLE_JULIUS_ACTIVE: false,

  // Future
  ENABLE_WORLD_CONCERT: false,
  ENABLE_NFT_AVATARS: false,
  ENABLE_VOICE_CLONE: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
