/**
 * TMI Platform — Memory Wall Engine
 * Manages a user's collection of permanent memories (MemoryWallItem references).
 * This is the canonical engine for all Memory Wall operations.
 * @see User request on 2026-06-26
 */

import { MediaItem, MemoryWallItem } from "./media";
import { MediaEngine } from "./MediaEngine";

export interface MemoryAlbum {
  id: string;
  userId: string;
  name: string;
  itemIds: string[];
}

/**
 * In a real implementation, these would be database tables.
 * We use Maps to simulate this for now, per Rule #20.
 */
const MemoryWallItemRegistry: Map<string, MemoryWallItem> = new Map();
const AlbumRegistry: Map<string, MemoryAlbum> = new Map();

export class MemoryWallEngine {
  /**
   * Adds a media item to a user's memory wall by creating a MemoryWallItem reference.
   */
  static async addMediaToMemoryWall(
    userId: string,
    mediaId: string,
    caption: string = ""
  ): Promise<MemoryWallItem | null> {
    const mediaItem = await MediaEngine.getById(mediaId);
    if (!mediaItem) {
      console.error("[MemoryWallEngine] MediaItem not found.");
      return null;
    }

    const newId = `mem_${Math.random().toString(36).substr(2, 9)}`;
    const newMemory: MemoryWallItem = {
      id: newId,
      mediaId,
      userId,
      caption,
      tags: [], // Tags can be added later
      visibility: "private",
      pinned: false,
      createdAt: new Date().toISOString(),
    };

    MemoryWallItemRegistry.set(newId, newMemory);
    console.log(
      `[MemoryWallEngine] Added media ${mediaId} to user ${userId}'s Memory Wall.`
    );
    return newMemory;
  }

  /**
   * Retrieves all memory items for a user, populated with their media data.
   */
  static async getMemoryWallForUser(
    userId: string
  ): Promise<(MemoryWallItem & { media: MediaItem })[]> {
    const userMemories = Array.from(MemoryWallItemRegistry.values()).filter(
      (mem) => mem.userId === userId
    );

    const populatedMemories = await Promise.all(
      userMemories.map(async (memory) => {
        const media = await MediaEngine.getById(memory.mediaId);
        if (!media) return null;
        return { ...memory, media };
      })
    );

    return populatedMemories
      .filter((item): item is MemoryWallItem & { media: MediaItem } => !!item)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ... other methods like createAlbum, addItemToAlbum, deleteMemory, etc.
}