// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/homepage.ts
// PURPOSE: All shared types for homepage system
// ════════════════════════════════════════════════════════

export type CardVariant =
  | 'crown' | 'artist-ring' | 'comic-insert' | 'preview-lobby'
  | 'lobby-wall' | 'countdown' | 'undiscovered-boost' | 'cypher-arena'
  | 'stream-and-win' | 'article-feature' | 'news-ticker' | 'genre-cluster'
  | 'top-charts' | 'weekly-playlist' | 'store' | 'booking' | 'achievements'
  | 'sponsor-spotlight' | 'join-random-room' | 'event-calendar';

export interface XY { x: number; y: number }

export interface CanvasCardConfig {
  id: string;
  variant: CardVariant;
  initialPos?: XY;
  savedPos?: XY;
  draggable: boolean;
  visible: boolean;
  zIndex?: number;
  adminLocked?: boolean;       // Big Ace can lock position
}

export interface HomepageBeltConfig {
  id: string;
  title: string;
  page: 1 | 2 | 3;
  sections: string[];
  visible: boolean;
  featureFlag?: string;
}

export interface HomepageLayoutPersistence {
  userId: string;
  page: 1 | 2 | 3;
  cardPositions: Record<string, XY>;
  savedAt: Date;
  isDefault: boolean;
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/crown.ts
// PURPOSE: Crown system types
// ════════════════════════════════════════════════════════

export interface CrownState {
  currentCrownArtistId: string;
  weekNumber: number;
  weekStartDate: Date;
  consecutiveWeeks: number;        // How many weeks this artist has held #1
  nextRotationDate: Date;          // When forced rotation happens (if at limit)
  forceRotationApplied: boolean;   // Was this week a forced rotation?
}

export interface ArtistRankEntry {
  artistId: string;
  artistName: string;
  rankNumber: number;              // 1 = #1, etc.
  score: number;
  genre: string[];
  motionClipUrl?: string;
  posterUrl: string;
  weeklyStreams: number;
  weeklyPoints: number;
  cypherWins: number;
  fanVotes: number;
  watchTimeMinutes: number;
}

export interface CrownHistory {
  artistId: string;
  artistName: string;
  weeksHeld: number;
  startDate: Date;
  endDate?: Date;
  rotationType: 'natural' | 'forced';  // forced = 8-week rule
  yearlyAward?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'artist-of-year';
}

export interface ComicInsert {
  weekNumber: number;
  type: 'funny-moment' | 'meme' | 'cypher-recap' | 'quote'
    | 'behind-scenes' | 'challenge' | 'bot-commentary'
    | 'crown-drama' | 'fan-poll' | 'issue-teaser' | 'rivalry-teaser';
  headline: string;
  imageUrl?: string;
  animationType: 'wobble' | 'bounce' | 'static';
  approvedBy: string;    // Big Ace ID
  approvedAt: Date;
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/live.ts
// PURPOSE: Live event and lobby types
// ════════════════════════════════════════════════════════

export interface PreviewLobbyEntry {
  eventId: string;
  artistId: string;
  artistName: string;
  isLive: boolean;
  isUpcoming: boolean;
  viewerCount: number;             // DISCOVERY SORT: ascending by this
  previewUrl?: string;
  posterUrl: string;
  venue: string;
  venueCode: string;
  scheduledAt?: Date;
  tags: string[];
}

export interface LobbyWallSort {
  entries: PreviewLobbyEntry[];
  sortedBy: 'viewers_ascending';   // IMMUTABLE — always discovery-first
  refreshedAt: Date;
}

export interface WorldPremiereEvent {
  eventId: string;
  title: string;
  artistId: string;
  scheduledAt: Date;
  albumArtUrl?: string;
  type: 'music-video' | 'album' | 'track' | 'concert' | 'episode';
  isLive: boolean;
  isExpired: boolean;
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/issue.ts
// PURPOSE: Magazine issue types
// ════════════════════════════════════════════════════════

export interface IssueSummary {
  issueId: string;
  issueNumber: number;
  weekOf: Date;
  theme: string;
  crownWinner: Pick<ArtistRankEntry, 'artistId' | 'artistName' | 'genre'>;
  topTenArtists: ArtistRankEntry[];
  featuredArticleSlug?: string;
  featuredPlaylistId?: string;
  comicInsert?: ComicInsert;
  publishedAt: Date;
  archivedAt?: Date;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  subtitle?: string;
  authorPortraitUrl: string;
  authorName: string;
  type: 'feature' | 'interview' | 'recap' | 'news' | 'review';
  publishedAt: Date;
  readTimeMinutes: number;
  issueId?: string;
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/sponsor.ts  (extends Pack 9)
// PURPOSE: Sponsor presentation types
// ════════════════════════════════════════════════════════

export type SponsorPlacementSurface =
  | 'homepage1-bottom-strip'
  | 'homepage2-side-card'
  | 'homepage3-marketplace'
  | 'live-lower-third'
  | 'live-intermission';

export interface SponsorPresentation {
  campaignId: string;
  surface: SponsorPlacementSurface;
  assetUrl: string;
  ctaUrl?: string;
  durationSeconds: number;          // Max 8 for animations
  hasAudio: false;                  // ALWAYS FALSE — no audio autoplay
  fallback: 'house-ad' | 'platform-brand' | 'empty-branded';
  bannedMoments: string[];          // See SPONSOR_RULES.bannedMoments
  approvedBy: string;               // Big Ace ID
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/fan.ts  (extends Pack 9)
// PURPOSE: Fan and supporter types
// ════════════════════════════════════════════════════════

export type FanTierLevel = 'fan' | 'supporter' | 'superfan' | 'vip' | 'founding';

export interface FanTierStatus {
  userId: string;
  artistId: string;
  tier: FanTierLevel;
  joinedAt: Date;
  totalPointsEarned: number;
  totalTipsSent: number;
  eventsAttended: number;
  isFoundingMember: boolean;
}

export interface ArtistFanStats {
  artistId: string;
  totalFans: number;
  tierBreakdown: Record<FanTierLevel, number>;
  newFansToday: number;
  newFansThisWeek: number;
  topTippers: Array<{ userId: string; totalTips: number }>;
  retentionRate: number;           // % who returned for 2nd event
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/bots.ts
// PURPOSE: Bot system types
// ════════════════════════════════════════════════════════

export interface BotManifest {
  id: string;
  version: string;
  description: string;
  schedule: string;               // Cron expression
  owner: 'big-ace' | 'framework' | 'algorithm' | 'mainframe';
  permissions: {
    reads: string[];
    writes: string[];
    cannot_touch: string[];
  };
  fallback: {
    on_failure: string;
    notify: 'big-ace' | 'framework' | 'silent';
    retry_after_minutes: number;
  };
  logging: {
    channel: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    persist_days: number;
  };
  big_ace_override?: Record<string, unknown>;
}

export interface BotRunLog {
  botId: string;
  runId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'failed' | 'fallback';
  errorMessage?: string;
  fallbackUsed?: string;
  triggeredBy: 'schedule' | 'big-ace' | 'event' | 'manual';
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/experiments.ts
// PURPOSE: A/B test and experiment types
// ════════════════════════════════════════════════════════

export interface ExperimentRecord {
  experimentId: string;
  name: string;
  type: 'card-layout' | 'headline' | 'lobby-sort' | 'sponsor-timing' | 'crown-style';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'rolled-back';
  startedAt: Date;
  endedAt?: Date;
  userPercentage: number;          // Max per type (see EXPERIMENT_RULES)
  successMetric: string;
  controlValue: unknown;
  variantValue: unknown;
  result?: {
    winner: 'control' | 'variant' | 'no-difference';
    confidenceLevel: number;
    metricDelta: number;
    promoted: boolean;
  };
  approvedBy: string;
  rollbackIn5Minutes: true;        // All experiments must be reversible
}

// ════════════════════════════════════════════════════════
// FILE: packages/contracts/src/layout-persistence.ts
// PURPOSE: Card position persistence
// ════════════════════════════════════════════════════════

export interface LayoutPersistencePayload {
  userId: string;
  page: 1 | 2 | 3;
  cardId: string;
  position: XY;
  timestamp: number;
}

export interface UserHomepageLayout {
  userId: string;
  page1Positions: Record<string, XY>;
  page2Positions: Record<string, XY>;
  page3Positions: Record<string, XY>;
  lastUpdated: Date;
  isDefault: boolean;
}
