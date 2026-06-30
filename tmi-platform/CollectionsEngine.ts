/**
 * TMI Platform — Collections Engine
 * Manages user-created collections of media references. This is the parent
 * system for playlists, albums, and other curated lists.
 * @see User request on 2026-06-26
 */

import { Collection, CollectionItem, MediaItem } from "./media";
import { MediaEngine } from "./MediaEngine";

/**
 * In a real implementation, these would be database tables.
 * We use Maps to simulate this for now, per Rule #20.
 */
const CollectionRegistry: Map<string, Collection> = new Map();
const CollectionItemRegistry: Map<string, CollectionItem> = new Map();

export class CollectionsEngine {
  /**
   * Creates a new, empty collection for a user.
   */
  static async createCollection(
    userId: string,
    name: string,
    description?: string
  ): Promise<Collection> {
    const newId = `col_${Math.random().toString(36).substr(2, 9)}`;
    const newCollection: Collection = {
      id: newId,
      userId,
      name,
      description,
    };
    CollectionRegistry.set(newId, newCollection);
    console.log(`[CollectionsEngine] Created collection: ${name} (${newId})`);
    return newCollection;
  }

  /**
   * Adds a media item to a collection by creating a CollectionItem reference.
   */
  static async addMediaToCollection(
    collectionId: string,
    mediaId: string
  ): Promise<CollectionItem | null> {
    const collection = CollectionRegistry.get(collectionId);
    const mediaItem = await MediaEngine.getById(mediaId);

    if (!collection || !mediaItem) {
      console.error("[CollectionsEngine] Collection or MediaItem not found.");
      return null;
    }

    // For simplicity, we'll just add to the end. A real implementation
    // would need to query the existing items to determine the position.
    const position =
      Array.from(CollectionItemRegistry.values()).filter(
        (item) => item.collectionId === collectionId
      ).length;

    const newId = `ci_${Math.random().toString(36).substr(2, 9)}`;
    const newCollectionItem: CollectionItem = {
      id: newId,
      collectionId,
      mediaId,
      position,
      addedAt: new Date().toISOString(),
    };

    CollectionItemRegistry.set(newId, newCollectionItem);
    console.log(
      `[CollectionsEngine] Added media ${mediaId} to collection ${collectionId}`
    );
    return newCollectionItem;
  }

  /**
   * Retrieves all collections for a given user.
   */
  static async getCollectionsForUser(userId: string): Promise<Collection[]> {
    return Array.from(CollectionRegistry.values()).filter(
      (col) => col.userId === userId
    );
  }

  // ... other methods like removeMediaFromCollection, getCollectionWithMedia, etc.
}