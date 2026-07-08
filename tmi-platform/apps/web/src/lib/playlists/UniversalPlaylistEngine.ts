/**
 * UniversalPlaylistEngine
 * 
 * Upgrades playlists from "just music" to "universal collections".
 * Users can save Songs, Performers, Rooms, Articles, Events, Battles, Venues, and Sponsors.
 * Acts as Spotify + YouTube Watch Later + Netflix My List + TikTok Favorites.
 */

export type UniversalItemType = 
  | 'SONG' 
  | 'PERFORMER' 
  | 'ROOM' 
  | 'ARTICLE' 
  | 'EVENT' 
  | 'BATTLE' 
  | 'VENUE' 
  | 'SPONSOR';

export interface UniversalPlaylistItem {
  id: string;
  itemType: UniversalItemType;
  targetId: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  route: string;
  addedAt: number;
}

export interface UniversalPlaylist {
  id: string;
  userId: string;
  title: string; // e.g., "Watch Later", "Upcoming Battles", "Artists to Book"
  isSystem: boolean; // System playlists (Favorites, Watch Later) cannot be deleted
  items: UniversalPlaylistItem[];
}

class UniversalPlaylistEngineImpl {
  /**
   * Adds any platform entity to a user's universal playlist.
   */
  public async addItem(userId: string, playlistId: string, item: Omit<UniversalPlaylistItem, 'id' | 'addedAt'>): Promise<UniversalPlaylistItem> {
    console.log(`[UniversalPlaylist] Adding ${item.itemType} (${item.targetId}) to playlist ${playlistId} for user ${userId}`);
    // TODO: Wire to polymorphic Prisma PlaylistItem model in next DB pass
    return {
      ...item,
      id: `upi-${Date.now()}`,
      addedAt: Date.now()
    };
  }

  /**
   * Retrieves all system playlists for a user
   */
  public async getSystemPlaylists(userId: string): Promise<UniversalPlaylist[]> {
    return [
      { id: 'sys-fav-songs', userId, title: 'Favorite Songs', isSystem: true, items: [] },
      { id: 'sys-fav-performers', userId, title: 'Favorite Performers', isSystem: true, items: [] },
      { id: 'sys-watch-later', userId, title: 'Watch Later (Rooms & Battles)', isSystem: true, items: [] },
      { id: 'sys-saved-events', userId, title: 'Events To Attend', isSystem: true, items: [] },
    ];
  }

  /**
   * Generates a context-aware smart playlist (e.g., "Trending Battles" or "Sponsors for You")
   */
  public async generateSmartPlaylist(userId: string, context: string): Promise<UniversalPlaylist> {
    return {
      id: `smart-${Date.now()}`,
      userId,
      title: `Recommended: ${context}`,
      isSystem: false,
      items: []
    };
  }
}

export const universalPlaylistEngine = new UniversalPlaylistEngineImpl();