/**
 * PublicLiveFeedEngine
 * Manages the public live feed discovery layer.
 * Public performers appear on public billboards.
 * Private performers stay hidden.
 *
 * Integrates with:
 *   - BillboardPortalEngine (surface the feed)
 *   - LiveIdentitySurfaceEngine (resolve what to show)
 *   - VenuePresenceEngine (room occupancy data)
 */

export interface PublicFeedEntry {
  entryId: string;
  roomId: string;
  userId: string;
  displayName: string;
  profileImageUrl: string;
  streamThumbnailUrl?: string;  // live snapshot
  genre: string;
  roomTitle: string;
  isLive: boolean;
  isPublic: boolean;
  viewers: number;
  tipsThisSession: number;
  startedAt: number;
  feedTags: string[];
}

class PublicLiveFeedEngine {
  private entries = new Map<string, PublicFeedEntry>();

  publishFeed(entry: PublicFeedEntry): void {
    this.entries.set(entry.entryId, entry);
  }

  unpublishFeed(entryId: string): void {
    this.entries.delete(entryId);
  }

  setPrivate(entryId: string): void {
    const e = this.entries.get(entryId);
    if (e) e.isPublic = false;
  }

  setPublic(entryId: string): void {
    const e = this.entries.get(entryId);
    if (e) e.isPublic = true;
  }

  updateThumbnail(entryId: string, url: string): void {
    const e = this.entries.get(entryId);
    if (e) e.streamThumbnailUrl = url;
  }

  updateViewers(entryId: string, count: number): void {
    const e = this.entries.get(entryId);
    if (e) e.viewers = count;
  }

  /**
   * Returns all live public feeds, sorted by viewers descending.
   */
  getLiveFeed(limit?: number): PublicFeedEntry[] {
    const live = [...this.entries.values()]
      .filter((e) => e.isPublic && e.isLive)
      .sort((a, b) => b.viewers - a.viewers);
    return limit ? live.slice(0, limit) : live;
  }

  getFeedByGenre(genre: string, limit?: number): PublicFeedEntry[] {
    const g = genre.toLowerCase();
    const results = [...this.entries.values()]
      .filter((e) => e.isPublic && e.genre.toLowerCase() === g)
      .sort((a, b) => b.viewers - a.viewers);
    return limit ? results.slice(0, limit) : results;
  }

  getFeedEntry(entryId: string): PublicFeedEntry | undefined {
    return this.entries.get(entryId);
  }
}

export const publicLiveFeedEngine = new PublicLiveFeedEngine();
