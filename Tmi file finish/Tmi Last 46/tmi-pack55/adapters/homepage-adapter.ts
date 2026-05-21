// apps/web/src/adapters/homepage.adapter.ts
// Belt-level partial hydration adapter.
// Each belt loads independently: fallback immediately, replaces with live data.
// Platform rule (locked): use polling (15-30s), never full-page block.

import type { ArtistGridItem, LobbyRoom, HomepageEditorialData } from "@tmi/contracts";

// ── FALLBACK DATA (always available, never blank) ─────────────────
export const FALLBACK_ARTIST_GRID: ArtistGridItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: `seed-${i}`,
  slug: `seed-artist-${i}`,
  stageName: ["Nova Wave","Sky Keys","Blaze Corp","Static FM","Crown Holder","Verse Kings","Deep Roots","Ruby Daze","Neon Prophet"][i],
  genre: ["Hip Hop","R&B","Electronic","Pop","Cypher","Rap","Jazz","Soul","Rap"][i],
  city: "Chico",
  viewerCount: [0, 2, 4, 6, 0, 9, 12, 17, 22][i],  // 0 = discovery-first
  isLive: [true,true,false,true,true,false,false,true,true][i],
  isCrownHolder: i === 4,
  weeklyVotes: [0, 5, 12, 8, 847, 19, 3, 31, 17][i],
  tier: ["FREE","PRO","STARTER","GOLD","DIAMOND","PRO","FREE","PRO","STARTER"][i],
  stationSlug: `seed-artist-${i}-station`,
}));

export const FALLBACK_LOBBY_ROOMS: LobbyRoom[] = Array.from({ length: 8 }, (_, i) => ({
  id: `seed-room-${i}`,
  roomId: `seed-room-${i}`,
  hostName: FALLBACK_ARTIST_GRID[i]?.stageName || "Artist",
  viewerCount: [0, 2, 4, 6, 9, 12, 17, 23][i],  // sorted ASC — Platform Law #1
  isLive: true,
  scene: "live-stage",
  genre: FALLBACK_ARTIST_GRID[i]?.genre,
  gameActive: false,
}));

// ── BELT LOADER (polls independently, swaps on success) ───────────
export interface BeltState<T> {
  data: T;
  isLive: boolean;      // false = using fallback
  lastFetched?: Date;
  error?: string;
}

export async function loadBelt<T>(
  fallback: T,
  fetchFn: () => Promise<T>,
  onUpdate: (state: BeltState<T>) => void,
  pollIntervalMs: number = 15000
): Promise<void> {
  // 1. Show fallback immediately (never blank)
  onUpdate({ data: fallback, isLive: false });

  // 2. Attempt live fetch
  try {
    const live = await fetchFn();
    onUpdate({ data: live, isLive: true, lastFetched: new Date() });
  } catch (err) {
    onUpdate({ data: fallback, isLive: false, error: String(err) });
  }

  // 3. Poll for updates (15-30s per platform lock)
  setInterval(async () => {
    try {
      const live = await fetchFn();
      onUpdate({ data: live, isLive: true, lastFetched: new Date() });
    } catch {
      // Keep existing data on error — never blank
    }
  }, pollIntervalMs);
}

// ── LOBBY SORT HELPER (always discovery-first) ─────────────────────
export function sortLobbyDiscoveryFirst(rooms: LobbyRoom[]): LobbyRoom[] {
  return [...rooms].sort((a, b) => {
    if (a.viewerCount === 0 && b.viewerCount > 0) return -1;  // Platform Law #1
    if (b.viewerCount === 0 && a.viewerCount > 0) return 1;
    return a.viewerCount - b.viewerCount;
  });
}
