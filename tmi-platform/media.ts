/**
 * TMI Platform — Canonical Media Types
 * Defines the core structures for all media items, memories, and playlist entries.
 * @see CLAUDE.md — Rule #8 (Registry First), Rule #20 (Reality Rule)
 */

export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "article"
  | "ticket"
  | "trophy";

/**
 * A raw media item, registered once in the MediaItemRegistry.
 * This is the single source of truth for a piece of content.
 */
export interface MediaItem {
  id: string; // Unique ID, e.g., "media_123"
  ownerId: string;
  type: MediaType;
  sourceUrl: string; // URL to the actual content (S3, YouTube, etc.)
  thumbnailUrl?: string;
  title: string;
  artist?: string;
  durationMs?: number;
  createdAt: string;
}

/**
 * An entry in a user's Memory Wall.
 * It references a MediaItem and adds personal context.
 */
export interface MemoryWallItem {
  id: string; // Unique ID for this memory, e.g., "mem_abc"
  mediaId: string; // Reference to the MediaItem
  userId: string;
  albumId?: string;
  caption?: string;
  tags: string[];
  location?: string;
  visibility: "private" | "friends" | "public";
  pinned: boolean;
  createdAt: string;
}

/**
 * An entry in a user's Playlist. It is a REFERENCE to a MediaItem.
 */
export interface PlaylistItem {
  id: string; // Unique ID for this playlist entry, e.g., "pli_xyz"
  playlistId: string;
  mediaId: string; // Reference to the MediaItem
  position: number; // Order in the playlist
  addedBy: string; // userId
  addedAt: string;
}

/**
 * A user-defined collection of media.
 */
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverMediaId?: string;
}

/**
 * A reference to a MediaItem within a Collection.
 */
export interface CollectionItem {
  id: string;
  collectionId: string;
  mediaId: string;
  position: number;
  addedAt: string;
}