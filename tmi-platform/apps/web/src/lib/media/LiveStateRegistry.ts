/**
 * LiveStateRegistry — single source of truth for who is live on TMI.
 *
 * All surfaces that need to know live state (homepage widgets, billboard,
 * lobby router) must read from here. Never derive "is live" from local prop
 * state in isolation — that causes desync across surfaces.
 *
 * Stream limit: browsers reliably handle ~8 concurrent video streams.
 * After that, tiles fall back to motion poster automatically.
 */

export const MAX_ACTIVE_STREAMS = 8;

interface LiveEntry {
  roomId: string;
  startedAt: number;
  genre?: string;
  viewerCount?: number;
}

/** performerId → live state */
const liveMap = new Map<string, LiveEntry>();

/** performerIds with an active video stream loaded in the browser */
const activeStreamSet = new Set<string>();

// ─── Live state ───────────────────────────────────────────────────────────────

export function setLive(
  performerId: string,
  roomId: string,
  meta?: { genre?: string; viewerCount?: number }
): void {
  liveMap.set(performerId, {
    roomId,
    startedAt: Date.now(),
    genre: meta?.genre,
    viewerCount: meta?.viewerCount,
  });
}

export function clearLive(performerId: string): void {
  liveMap.delete(performerId);
  activeStreamSet.delete(performerId);
}

export function isLive(performerId: string): boolean {
  return liveMap.has(performerId);
}

export function getRoom(performerId: string): LiveEntry | undefined {
  return liveMap.get(performerId);
}

export function getAllLive(): Map<string, LiveEntry> {
  return liveMap;
}

export function getLiveCount(): number {
  return liveMap.size;
}

// ─── Active stream budget ─────────────────────────────────────────────────────

export function getActiveStreamCount(): number {
  return activeStreamSet.size;
}

export function canActivateStream(): boolean {
  return activeStreamSet.size < MAX_ACTIVE_STREAMS;
}

/** Returns true if the stream was registered (under limit), false if at cap. */
export function registerActiveStream(performerId: string): boolean {
  if (activeStreamSet.size >= MAX_ACTIVE_STREAMS) return false;
  activeStreamSet.add(performerId);
  return true;
}

export function releaseActiveStream(performerId: string): void {
  activeStreamSet.delete(performerId);
}

// ─── Bulk update (call from socket/polling) ───────────────────────────────────

export interface LiveFeedUpdate {
  performerId: string;
  roomId: string;
  genre?: string;
  viewerCount?: number;
}

/**
 * Replace the entire live registry with a fresh snapshot.
 * Preserves active stream registrations for performers still in the feed.
 */
export function syncLiveRegistry(updates: LiveFeedUpdate[]): void {
  const incoming = new Set(updates.map((u) => u.performerId));

  // Remove performers who went offline
  for (const id of liveMap.keys()) {
    if (!incoming.has(id)) {
      liveMap.delete(id);
      activeStreamSet.delete(id);
    }
  }

  // Add or update performers who are live
  for (const u of updates) {
    liveMap.set(u.performerId, {
      roomId: u.roomId,
      startedAt: liveMap.get(u.performerId)?.startedAt ?? Date.now(),
      genre: u.genre,
      viewerCount: u.viewerCount,
    });
  }
}
