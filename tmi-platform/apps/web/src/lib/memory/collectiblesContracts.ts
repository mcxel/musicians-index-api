/**
 * Memory & Collectibles Engine — contracts (EOS Phase 7.3)
 *
 * Memory Wall = personal photo/media library + collectibles (scrapbook / Photos-app).
 * Interactive cinematic gallery UX is FUTURE APPROVED for Phase 7.4+ — contracts only here.
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

// ─── View modes (7.4 gallery UI — enum locked now, no fake motion stubs) ──────

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
