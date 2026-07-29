/**
 * Memory & Collectibles Engine — contracts (EOS Phase 7.3 + 7.4 motion surface)
 *
 * Memory Wall = personal photo/media library + collectibles (scrapbook / Photos-app).
 * Gallery UI (Phase 7.4) reads FROM MemoryCollectible — never from MemoryLedger.
 *
 * MemoryLedger may optionally emit MEDIA_CAPTURED / MEDIA_SAVED / TICKET_COLLECTED
 * as an event-log side-effect after a real save. It is NEVER the gallery feed source.
 * Do NOT subscribe the wall to WINNER_DECLARED / MATCH_COMPLETED to populate cards.
 *
 * OUT OF SCOPE (never dump into these tables or Memory Wall UI):
 * - Playlists / music / BandLab / SoundCloud → Playlist Engine
 * - Tips received → revenue/tip systems
 * - Competition wins, rankings, reputation, milestones → Achievement / Profile Engine
 * - Relationship edges → Layer 6 Relationship Graph
 * - EOS MemoryLedger MATCH_COMPLETED / WINNER_DECLARED → achievementBridge (not photo wall)
 */

// ─── Collectible kinds (scrapbook inventory) ──────────────────────────────────

export type MemoryCollectibleKind =
  | "PHOTO"
  | "VIDEO"
  | "YOPHO"
  | "TICKET"
  | "POSTER"
  | "KEEPSAKE";

export const MEMORY_COLLECTIBLE_KINDS: readonly MemoryCollectibleKind[] = [
  "PHOTO",
  "VIDEO",
  "YOPHO",
  "TICKET",
  "POSTER",
  "KEEPSAKE",
] as const;

// ─── View modes (7.4 gallery UI) ──────────────────────────────────────────────

export type MemoryViewMode =
  | "GRID"
  | "TIMELINE"
  | "GALLERY"
  | "SLIDESHOW"
  | "COLLECTIONS";

export const MEMORY_VIEW_MODES: readonly MemoryViewMode[] = [
  "GRID",
  "TIMELINE",
  "GALLERY",
  "SLIDESHOW",
  "COLLECTIONS",
] as const;

// ─── Media variants (non-destructive; masters untouched) ─────────────────────

export type MediaVariantRole =
  | "ORIGINAL_MASTER"
  | "VIEWING"
  | "PREVIEW"
  | "THUMBNAIL";

export const MEDIA_VARIANT_ROLES: readonly MediaVariantRole[] = [
  "ORIGINAL_MASTER",
  "VIEWING",
  "PREVIEW",
  "THUMBNAIL",
] as const;

/** URL map by role — prefer VIEWING/PREVIEW for gallery; keep ORIGINAL_MASTER. */
export type MediaVariantMap = Partial<Record<MediaVariantRole, string>>;

// ─── Motion memory (first-class combined item) ────────────────────────────────

export type MotionSourceFormat =
  | "LIVE_PHOTO"
  | "MOTION_PHOTO"
  | "TMI_6S"
  | "TMI_7S"
  | "SHORT_CLIP";

export const MOTION_SOURCE_FORMATS: readonly MotionSourceFormat[] = [
  "LIVE_PHOTO",
  "MOTION_PHOTO",
  "TMI_6S",
  "TMI_7S",
  "SHORT_CLIP",
] as const;

/**
 * One motion memory = HD still + short motion asset + metadata.
 * Gallery shows sharp still by default; hover/press/open plays motion in-frame.
 * Masters stay in mediaVariants.ORIGINAL_MASTER / stillUrl — never rim-baked.
 */
export interface MotionPair {
  stillUrl: string;
  motionUrl: string;
  durationMs: number;
  hasAudio?: boolean;
  /** Still-frame timestamp within motion asset (ms). */
  posterFrameMs?: number;
  sourceFormat: MotionSourceFormat;
}

// ─── Presentation-only (CSS/overlay — never burned into master media) ─────────

export type MemoryAnimationPreset = "FLOAT" | "GLOW" | "SCALE_ON_HOVER";

export const MEMORY_ANIMATION_PRESETS: readonly MemoryAnimationPreset[] = [
  "FLOAT",
  "GLOW",
  "SCALE_ON_HOVER",
] as const;

// ─── Capture quality + post-capture destinations ──────────────────────────────

export type MemoryCaptureQuality =
  | "DEVICE_MAX"
  | "HIGH"
  | "STANDARD"
  | "DATA_SAVER";

/** Where a capture may be filed after snap — thin bridge uses MEMORY_WALL today. */
export type MemoryCaptureDestination =
  | "MEMORY_WALL"
  | "ALBUM"
  | "YOPHO"
  | "SHARE_FRIENDS"
  | "SNIP"
  | "PROFILE"
  | "PRIVATE";

export type MemoryVisibility = "public" | "friends" | "private";

/** Album preset keys — schema/cover polish in 7.4; do not invent fake album rows. */
export type MemoryAlbumPresetKey =
  | "FAMILY"
  | "STUDIO"
  | "CONCERTS"
  | "MONTHLY_IDOL"
  | "WDP"
  | "BATTLES"
  | "VIP"
  | "ROAD_TRIPS"
  | "CUSTOM";

// ─── Collectible record (Prisma-shaped DTO) ───────────────────────────────────

export interface CollectibleTicketFields {
  eventId?: string;
  venueId?: string;
  ticketId?: string;
  /** Linked MemoryCollectible id of kind TICKET (memorabilia graph). */
  ticketCollectibleId?: string;
  artworkUrl?: string;
  rarity?: string;
  attendedAt?: string;
}

export interface CollectibleMemoryRecord extends CollectibleTicketFields {
  id: string;
  ownerId: string;
  kind: MemoryCollectibleKind;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  albumId?: string;
  isFavorite: boolean;
  /** ISO timestamp when soft-deleted; omit/null = active */
  trashedAt?: string | null;
  visibility: MemoryVisibility;
  locationLabel?: string;
  taggedUserIds?: string[];
  yophoPageId?: string;
  /**
   * Non-destructive edit pointer — edited derivatives reference the original
   * media row id; originals are always retained.
   */
  editOriginalMediaId?: string;
  captureQuality?: MemoryCaptureQuality;
  captureDestination?: MemoryCaptureDestination;
  /** Derived / master URL map — ORIGINAL_MASTER never overwritten by rims. */
  mediaVariants?: MediaVariantMap;
  /** Combined still + motion item when present. */
  motionPair?: MotionPair;
  /** CSS rim key only — presentation layer. */
  rimStyleId?: string;
  animationPreset?: MemoryAnimationPreset;
  /** Lite burst grouping — sibling frames share this id. */
  burstGroupId?: string;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectibleInput {
  ownerId: string;
  kind: MemoryCollectibleKind;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  artworkUrl?: string;
  albumId?: string;
  isFavorite?: boolean;
  visibility?: MemoryVisibility;
  eventId?: string;
  venueId?: string;
  ticketId?: string;
  ticketCollectibleId?: string;
  rarity?: string;
  attendedAt?: string | Date;
  locationLabel?: string;
  taggedUserIds?: string[];
  yophoPageId?: string;
  editOriginalMediaId?: string;
  captureQuality?: MemoryCaptureQuality;
  captureDestination?: MemoryCaptureDestination;
  mediaVariants?: MediaVariantMap;
  motionPair?: MotionPair;
  rimStyleId?: string;
  animationPreset?: MemoryAnimationPreset;
  burstGroupId?: string;
  capturedAt?: string | Date;
}

export interface ListCollectiblesQuery {
  ownerId: string;
  kind?: MemoryCollectibleKind;
  albumId?: string;
  favoritesOnly?: boolean;
  /** When true, return only trashed items; default lists active (trashedAt null). */
  includeTrash?: boolean;
  trashOnly?: boolean;
  take?: number;
}

export interface MemoryAlbumRecord {
  id: string;
  ownerId: string;
  title: string;
  presetKey?: MemoryAlbumPresetKey | string;
  coverUrl?: string;
  animatedBorder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumInput {
  ownerId: string;
  title: string;
  presetKey?: MemoryAlbumPresetKey | string;
  coverUrl?: string;
  animatedBorder?: string;
}

/** Resolve best still URL for gallery card (never invents). */
export function resolveCollectibleStillUrl(
  item: Pick<
    CollectibleMemoryRecord,
    "mediaUrl" | "thumbnailUrl" | "artworkUrl" | "mediaVariants" | "motionPair"
  >,
): string | undefined {
  return (
    item.motionPair?.stillUrl ||
    item.mediaVariants?.VIEWING ||
    item.mediaVariants?.PREVIEW ||
    item.mediaVariants?.THUMBNAIL ||
    item.thumbnailUrl ||
    item.mediaUrl ||
    item.artworkUrl ||
    item.mediaVariants?.ORIGINAL_MASTER
  );
}

/** Resolve motion URL when this is a motion memory. */
export function resolveCollectibleMotionUrl(
  item: Pick<CollectibleMemoryRecord, "motionPair" | "kind" | "mediaUrl">,
): string | undefined {
  if (item.motionPair?.motionUrl) return item.motionPair.motionUrl;
  if (item.kind === "VIDEO" && item.mediaUrl) return item.mediaUrl;
  return undefined;
}
