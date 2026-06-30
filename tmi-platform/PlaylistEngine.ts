/**
 * TMI Platform — Playlist Engine
 * Manages playlists and the reference-based PlaylistItem model.
 * This is the canonical engine for all playlist operations.
 * @see User request on 2026-06-26
 */

import { MediaItem, PlaylistItem } from "./media";
import { MediaEngine } from "./MediaEngine";

export interface Playlist {
  id: string;
  ownerId: string;
  name: string;
  itemIds: string[];
  coverMediaId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * In a real implementation, these would be database tables.
 * We use Maps to simulate this for now, per Rule #20.
 */
const PlaylistRegistry: Map<string, Playlist> = new Map();
const PlaylistItemRegistry: Map<string, PlaylistItem> = new Map();

export class PlaylistEngine {
  /**
   * Creates a new, empty playlist for a user.
   */
  static async createPlaylist(
    ownerId: string,
    name: string
  ): Promise<Playlist> {
    const newId = `pl_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newPlaylist: Playlist = {
      id: newId,
      ownerId,
      name,
      itemIds: [],
      createdAt: now,
      updatedAt: now,
    };
    PlaylistRegistry.set(newId, newPlaylist);
    console.log(`[PlaylistEngine] Created playlist: ${name} (${newId})`);
    return newPlaylist;
  }

  /**
   * Adds a media item to a playlist by creating a PlaylistItem reference.
   */
  static async addMediaToPlaylist(
    playlistId: string,
    mediaId: string,
    addedBy: string
  ): Promise<PlaylistItem | null> {
    const playlist = PlaylistRegistry.get(playlistId);
    const mediaItem = await MediaEngine.getById(mediaId);

    if (!playlist || !mediaItem) {
      console.error("[PlaylistEngine] Playlist or MediaItem not found.");
      return null;
    }

    const newId = `pli_${Math.random().toString(36).substr(2, 9)}`;
    const newPlaylistItem: PlaylistItem = {
      id: newId,
      playlistId,
      mediaId,
      position: playlist.itemIds.length,
      addedBy,
      addedAt: new Date().toISOString(),
    };

    PlaylistItemRegistry.set(newId, newPlaylistItem);
    playlist.itemIds.push(newId);
    playlist.updatedAt = new Date().toISOString();

    console.log(
      `[PlaylistEngine] Added media ${mediaId} to playlist ${playlistId}`
    );
    return newPlaylistItem;
  }

  /**
   * Retrieves a playlist and all its associated media items, ready for playback.
   */
  static async getPlaylistWithMedia(
    playlistId: string
  ): Promise<(Playlist & { items: MediaItem[] }) | null> {
    const playlist = PlaylistRegistry.get(playlistId);
    if (!playlist) return null;

    const playlistItems = playlist.itemIds
      .map((id) => PlaylistItemRegistry.get(id))
      .filter((item): item is PlaylistItem => !!item)
      .sort((a, b) => a.position - b.position);

    const mediaItems = (
      await Promise.all(
        playlistItems.map((item) => MediaEngine.getById(item.mediaId))
      )
    ).filter((item): item is MediaItem => !!item);

    return {
      ...playlist,
      items: mediaItems,
    };
  }

  // ... other methods like removeMediaFromPlaylist, reorderPlaylist, etc.
}