/**
 * Collections Engine — media library contracts (evolved from Phase 7.3/7.4)
 *
 * LOCKED three-area product model (do not collapse):
 *   1. Memory Wall / Collections (MEDIA) — THIS FILE
 *   2. Achievements / Showcase Collectibles (PROGRESSION) — achievementCollectibleContracts
 *   3. Analytics (STATS) — roleAnalyticsContracts
 *
 * Photo Collections ≠ Achievement Collectibles.
 * Profile "Collections hub" may tab/link to Achievements + Analytics — never stuff
 * belts/wins into the photo MotionGrid.
 *
 * Physical Prisma SoT remains MemoryCollectible / MemoryAlbum (compat with 7.4 UI).
 * This layer exposes Collection / MediaAsset / CollectionItem / FrameSkin / MediaEdit.
 *
 * UnlockMethod: no Prisma UnlockMethod model exists yet — unlockAccess is soft FUTURE.
 * EOS AssetRegistry = venue materials only — does NOT own user photo assets.
 */

import type {
  CollectibleMemoryRecord,
  CreateCollectibleInput,
  MediaVariantMap,
  MemoryAlbumPresetKey,
  MemoryAlbumRecord,
  MemoryAnimationPreset,
  MemoryCollectibleKind,
  MemoryVisibility,
  MotionPair,
} from "./collectiblesContracts";
import {
  MEDIA_VARIANT_ROLES,
  resolveCollectibleMotionUrl,
  resolveCollectibleStillUrl,
} from "./collectiblesContracts";

// ─── Soft entitlement (FUTURE — no UnlockMethod hard coupling) ────────────────

export type CollectionUnlockAccess = "FREE" | "MEMBERSHIP" | "SPONSOR_GIFT";

export const COLLECTION_UNLOCK_ACCESS: readonly CollectionUnlockAccess[] = [
  "FREE",
  "MEMBERSHIP",
  "SPONSOR_GIFT",
] as const;

// ─── Canonical media variant roles (Collection Engine) ────────────────────────

export type CollectionMediaVariantRole =
  | "MASTER"
  | "MOTION_PREVIEW"
  | "THUMBNAIL"
  | "EDITED_VERSION"
  /** Legacy 7.4 aliases — still accepted in MediaVariantMap */
  | "ORIGINAL_MASTER"
  | "VIEWING"
  | "PREVIEW";

export const COLLECTION_MEDIA_VARIANT_ROLES: readonly CollectionMediaVariantRole[] = [
  "MASTER",
  "MOTION_PREVIEW",
  "THUMBNAIL",
  "EDITED_VERSION",
  "ORIGINAL_MASTER",
  "VIEWING",
  "PREVIEW",
] as const;

/** Prefer Collection roles; fall back to legacy 7.4 keys. */
export type CollectionMediaVariantMap = Partial<
  Record<CollectionMediaVariantRole, string>
>;

// ─── FrameSkin — presentation only (never baked into master) ──────────────────

export interface FrameSkin {
  rimStyleId?: string;
  bezelStyleId?: string;
  glowColor?: string;
  glowIntensity?: number;
  animationPreset?: MemoryAnimationPreset;
}

// ─── MediaEdit — non-destructive instruction JSON pointing at master ──────────

export interface MediaEditInstruction {
  /** MemoryCollectible / MediaAsset id of the untouched master */
  masterAssetId: string;
  ops?: Array<{
    type: "crop" | "rotate" | "filter" | "sticker" | "caption";
    params?: Record<string, unknown>;
  }>;
  /** Derived EDITED_VERSION URL when generated — never overwrites MASTER */
  editedVersionUrl?: string;
}

// ─── Collection presets ───────────────────────────────────────────────────────

export type CollectionPresetKey = MemoryAlbumPresetKey | "ALL_MEMORIES";

export const DEFAULT_COLLECTION_TITLE = "All Memories";
export const DEFAULT_COLLECTION_PRESET: CollectionPresetKey = "ALL_MEMORIES";

// ─── MediaAsset (master HD still/video SoT) ───────────────────────────────────

export type MediaAssetKind = MemoryCollectibleKind;

export interface MediaAsset {
  id: string;
  ownerId: string;
  kind: MediaAssetKind;
  title: string;
  subtitle?: string;
  /** Primary still / video URL (MASTER) */
  mediaUrl?: string;
  thumbnailUrl?: string;
  artworkUrl?: string;
  /** Primary Collection id (MemoryAlbum) */
  collectionId?: string;
  isFavorite: boolean;
  trashedAt?: string | null;
  visibility: MemoryVisibility;
  mediaVariants?: CollectionMediaVariantMap;
  motionPair?: MotionPair;
  frameSkin?: FrameSkin;
  mediaEdit?: MediaEditInstruction;
  unlockAccess?: CollectionUnlockAccess;
  burstGroupId?: string;
  eventId?: string;
  venueId?: string;
  ticketId?: string;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Collection (user group) ──────────────────────────────────────────────────

export interface Collection {
  id: string;
  ownerId: string;
  title: string;
  presetKey?: CollectionPresetKey | string;
  coverUrl?: string;
  animatedBorder?: string;
  isDefault: boolean;
  unlockAccess?: CollectionUnlockAccess;
  createdAt: string;
  updatedAt: string;
}

// ─── CollectionItem (asset ↔ collection join) ─────────────────────────────────

export interface CollectionItem {
  id: string;
  collectionId: string;
  mediaAssetId: string;
  addedAt: string;
}

export interface CreateCollectionInput {
  ownerId: string;
  title: string;
  presetKey?: CollectionPresetKey | string;
  coverUrl?: string;
  animatedBorder?: string;
  isDefault?: boolean;
  unlockAccess?: CollectionUnlockAccess;
}

export interface SaveMediaAssetInput
  extends Omit<CreateCollectibleInput, "albumId"> {
  /** When omitted, persistence files into default “All Memories” Collection */
  collectionId?: string;
  frameSkin?: FrameSkin;
  mediaEdit?: MediaEditInstruction;
  unlockAccess?: CollectionUnlockAccess;
  /** Also write CollectionItem join row (default true when collection resolved) */
  dualWriteJoin?: boolean;
}

export interface ListCollectionsQuery {
  ownerId: string;
  collectionId?: string;
  kind?: MediaAssetKind;
  favoritesOnly?: boolean;
  trashOnly?: boolean;
  includeTrash?: boolean;
  take?: number;
}

// ─── Adapters: Collectible ↔ MediaAsset / Album ↔ Collection ──────────────────

export function albumToCollection(album: MemoryAlbumRecord & { isDefault?: boolean; unlockAccess?: string | null }): Collection {
  return {
    id: album.id,
    ownerId: album.ownerId,
    title: album.title,
    presetKey: album.presetKey,
    coverUrl: album.coverUrl,
    animatedBorder: album.animatedBorder,
    isDefault: Boolean(album.isDefault),
    unlockAccess: isUnlockAccess(album.unlockAccess) ? album.unlockAccess : undefined,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  };
}

export function collectibleToMediaAsset(
  row: CollectibleMemoryRecord & {
    frameSkin?: FrameSkin | null;
    mediaEdit?: MediaEditInstruction | null;
    unlockAccess?: string | null;
  },
): MediaAsset {
  const variants = normalizeVariantMap(row.mediaVariants);
  return {
    id: row.id,
    ownerId: row.ownerId,
    kind: row.kind,
    title: row.title,
    subtitle: row.subtitle,
    mediaUrl: row.mediaUrl,
    thumbnailUrl: row.thumbnailUrl,
    artworkUrl: row.artworkUrl,
    collectionId: row.albumId,
    isFavorite: row.isFavorite,
    trashedAt: row.trashedAt,
    visibility: row.visibility,
    mediaVariants: variants,
    motionPair: row.motionPair,
    frameSkin: row.frameSkin ?? frameSkinFromLegacy(row),
    mediaEdit: row.mediaEdit ?? undefined,
    unlockAccess: isUnlockAccess(row.unlockAccess) ? row.unlockAccess : undefined,
    burstGroupId: row.burstGroupId,
    eventId: row.eventId,
    venueId: row.venueId,
    ticketId: row.ticketId,
    capturedAt: row.capturedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function isUnlockAccess(value: unknown): value is CollectionUnlockAccess {
  return (
    typeof value === "string" &&
    (COLLECTION_UNLOCK_ACCESS as readonly string[]).includes(value)
  );
}

function frameSkinFromLegacy(
  row: Pick<CollectibleMemoryRecord, "rimStyleId" | "animationPreset">,
): FrameSkin | undefined {
  if (!row.rimStyleId && !row.animationPreset) return undefined;
  return {
    rimStyleId: row.rimStyleId,
    animationPreset: row.animationPreset,
  };
}

/** Map legacy ORIGINAL_MASTER/VIEWING/PREVIEW → Collection roles where missing. */
export function normalizeVariantMap(
  map?: MediaVariantMap | CollectionMediaVariantMap | null,
): CollectionMediaVariantMap | undefined {
  if (!map || typeof map !== "object") return undefined;
  const out: CollectionMediaVariantMap = { ...map };
  if (!out.MASTER && out.ORIGINAL_MASTER) out.MASTER = out.ORIGINAL_MASTER;
  if (!out.ORIGINAL_MASTER && out.MASTER) out.ORIGINAL_MASTER = out.MASTER;
  if (!out.THUMBNAIL && out.PREVIEW) out.THUMBNAIL = out.PREVIEW;
  if (!out.MOTION_PREVIEW && out.VIEWING) out.MOTION_PREVIEW = out.VIEWING;
  return Object.keys(out).length > 0 ? out : undefined;
}

export function resolveMediaAssetStillUrl(
  asset: Pick<MediaAsset, "mediaUrl" | "thumbnailUrl" | "artworkUrl" | "mediaVariants" | "motionPair">,
): string | undefined {
  return (
    asset.motionPair?.stillUrl ||
    asset.mediaVariants?.MASTER ||
    asset.mediaVariants?.ORIGINAL_MASTER ||
    asset.mediaVariants?.VIEWING ||
    asset.mediaVariants?.MOTION_PREVIEW ||
    asset.mediaVariants?.THUMBNAIL ||
    asset.mediaVariants?.PREVIEW ||
    asset.thumbnailUrl ||
    asset.mediaUrl ||
    asset.artworkUrl
  );
}

export function resolveMediaAssetMotionUrl(
  asset: Pick<MediaAsset, "motionPair" | "kind" | "mediaUrl" | "mediaVariants">,
): string | undefined {
  if (asset.motionPair?.motionUrl) return asset.motionPair.motionUrl;
  if (asset.mediaVariants?.MOTION_PREVIEW) return asset.mediaVariants.MOTION_PREVIEW;
  if (asset.kind === "VIDEO" && asset.mediaUrl) return asset.mediaUrl;
  return undefined;
}

/** Re-export legacy resolvers for 7.4 UI that still speaks Collectible. */
export {
  MEDIA_VARIANT_ROLES,
  resolveCollectibleStillUrl,
  resolveCollectibleMotionUrl,
};
