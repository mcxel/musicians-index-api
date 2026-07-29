// Shared memory types — Memory & Collectibles Engine + Pro Legacy + Writer Wall
//
// PRODUCT LOCK (Marcel): Memory Wall = personal photo/media library + collectibles
// (interactive scrapbook). NOT a social feed, stats board, playlist, tip ledger,
// or achievement timeline. Competition history → Achievement Engine (see
// core/eos/achievementBridge.ts + achievementCollectibleContracts.ts). Playlists → Playlist Engine.
//
// LOCKED three-area model:
//   1. Collections (MEDIA) — collectiblesContracts + collectionsContracts
//   2. Achievements (PROGRESSION) — belts/trophies — NOT this photo wall
//   3. Analytics (STATS) — roleAnalyticsContracts
//
// Collectible contracts live in lib/memory/collectiblesContracts.ts (Phase 7.3+7.4).
// Collections Engine terminology: lib/memory/collectionsContracts.ts
// Phase 7.4 Motion Wall reads MemoryCollectible via /api/memory/collectibles —
// never MemoryLedger competition events as the gallery feed.

export type MemoryItemKind =
  | "polaroid"
  | "ticket"
  | "nft"
  | "prize"
  | "video-clip"
  | "badge"
  | "event-poster";

export interface MemoryItem {
  id: string;
  kind: MemoryItemKind;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  eventId?: string;
  eventTitle?: string;
  venueName?: string;
  date?: string;
  /** Only public memories can be shown in room broadcasts */
  visibility: "public" | "friends" | "private";
  capturedAt: string;
}

// Re-export Phase 7.3/7.4 collectibles contracts for callers that import from types/memory
export type {
  MemoryCollectibleKind,
  MemoryViewMode,
  MemoryCaptureQuality,
  MemoryCaptureDestination,
  MemoryAlbumPresetKey,
  CollectibleMemoryRecord,
  CollectibleTicketFields,
  CreateCollectibleInput,
  ListCollectiblesQuery,
  MemoryAlbumRecord,
  CreateAlbumInput,
  MediaVariantRole,
  MediaVariantMap,
  MotionSourceFormat,
  MotionPair,
  MemoryAnimationPreset,
} from "@/lib/memory/collectiblesContracts";

export {
  MEMORY_COLLECTIBLE_KINDS,
  MEMORY_VIEW_MODES,
  MEDIA_VARIANT_ROLES,
  MOTION_SOURCE_FORMATS,
  MEMORY_ANIMATION_PRESETS,
  resolveCollectibleStillUrl,
  resolveCollectibleMotionUrl,
} from "@/lib/memory/collectiblesContracts";

// Collections Engine (media) — Collection / MediaAsset terminology
export type {
  Collection,
  MediaAsset,
  CollectionItem,
  FrameSkin,
  MediaEditInstruction,
  CollectionUnlockAccess,
  CollectionPresetKey,
} from "@/lib/memory/collectionsContracts";

export {
  DEFAULT_COLLECTION_TITLE,
  DEFAULT_COLLECTION_PRESET,
  albumToCollection,
  collectibleToMediaAsset,
  resolveMediaAssetStillUrl,
  resolveMediaAssetMotionUrl,
} from "@/lib/memory/collectionsContracts";

// ─── Pro Legacy Ledger — business side only ───────────────────────────────────
// Items are ONLY created by system events (Stripe, ticketing, analytics).
// Manual creation is not permitted.

export type ProLegacyKind =
  | "sponsor-gift"
  | "advertiser-milestone"
  | "promoter-win"
  | "crowd-favorite";

export interface MetricImpact {
  totalPaidOut?: number;
  audienceReached?: number;
  engagementRate?: number;
  conversionRate?: number;
  ticketsSold?: number;
  prizesAwarded?: number;
}

export interface ProLegacyItem {
  id: string;
  userId: string;
  kind: ProLegacyKind;
  title: string;
  eventId?: string;
  eventTitle?: string;
  metricImpact: MetricImpact;
  visualProof?: string;
  /** true only when created by a verified system event (Stripe/ticketing/analytics) */
  verified: boolean;
  /** when true the item appears on the user's public profile hub */
  showcaseMode: boolean;
  displayMode: "holographic-card" | "verified-badge";
  createdAt: string;
}

// ─── Writer Wall — published works, portfolio, assignments ───────────────────
// Separate from MemoryWall (fan/performer). Same modal system, different card.

export type WriterWorkKind =
  | "article"
  | "interview"
  | "review"
  | "feature"
  | "past-work"
  | "image"
  | "draft"
  | "assignment";

export interface WriterWorkMetrics {
  views?: number;
  readTimeMinutes?: number;
  engagementRate?: number;
  sponsorLinked?: boolean;
  paidAmount?: number;
}

export interface WriterWorkItem {
  id: string;
  writerId: string;
  kind: WriterWorkKind;
  title: string;
  description?: string;
  mediaUrl?: string;
  /** Slug of the live TMI article this links to */
  articleSlug?: string;
  publication?: string;
  status: "draft" | "published" | "archived";
  visibility: "private" | "editorial" | "public";
  metrics?: WriterWorkMetrics;
  /** Badges earned from editorial system */
  badges?: string[];
  /** Set true only by admin/editorial approval */
  verified?: boolean;
  createdAt: string;
}

// ─── Union for the fullscreen modal ──────────────────────────────────────────

export type AnyMemoryItem =
  | { itemType: "memory"; item: MemoryItem }
  | { itemType: "pro-legacy"; item: ProLegacyItem }
  | { itemType: "writer-work"; item: WriterWorkItem };
