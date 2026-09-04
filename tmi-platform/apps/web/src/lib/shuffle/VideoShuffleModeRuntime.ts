/**
 * VideoShuffleModeRuntime — passive randomized video watching (instant mode).
 * Pool: approved video submissions (MediaRegistry) + performer intro/motion +
 * MediaEngine + VenueAssetRegistry ambient loops (canonical room videos).
 * Lifecycle: empty → RESET → SHUFFLE → keep casting. Honest idle when no URLs.
 */

import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import { getAllVenueTypes, getVenueAsset } from "@/lib/venues/VenueAssetRegistry";
import {
  castPlaylistToMonitor,
  publishPlaylistNowPlaying,
} from "@/lib/playlists/PlaylistMonitorCast";

export interface ShuffleVideoItem {
  id: string;
  title: string;
  artist: string;
  videoUrl: string;
  genre: string;
  performerSlug?: string;
  coverUrl?: string;
}

const SHUFFLE_EVENT = "tmi:video-shuffle:state";

export type VideoShuffleState = "idle" | "recruiting" | "active" | "paused";

function emitState(state: VideoShuffleState, item?: ShuffleVideoItem | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SHUFFLE_EVENT, { detail: { state, item: item ?? null } }),
  );
}

function buildPerformerPool(): ShuffleVideoItem[] {
  return PERFORMER_REGISTRY.filter((p) => Boolean(p.introVideoUrl || p.motionPosterUrl)).map(
    (p) => ({
      id: `shuffle-${p.slug}`,
      title: p.name,
      artist: p.category,
      videoUrl: (p.introVideoUrl ?? p.motionPosterUrl)!,
      genre: p.category,
      performerSlug: p.slug,
      coverUrl: p.profileImageUrl,
    }),
  );
}

function buildMediaEnginePool(): ShuffleVideoItem[] {
  return MediaEngine.getByType("video").map((m) => ({
    id: `shuffle-media-${m.id}`,
    title: m.title,
    artist: m.ownerName,
    videoUrl: m.url,
    genre: m.genre ?? "Media",
    coverUrl: m.thumbnailUrl,
  }));
}

/** Canonical venue ambient loops — always available for QP retest when user uploads are empty. */
function buildVenueAmbientPool(): ShuffleVideoItem[] {
  const seen = new Set<string>();
  const out: ShuffleVideoItem[] = [];
  for (const type of getAllVenueTypes()) {
    const asset = getVenueAsset(type);
    const url = asset.ambientVideoUrl?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      id: `shuffle-venue-${type}`,
      title: asset.label ?? type,
      artist: "TMI Venue",
      videoUrl: url,
      genre: type,
      coverUrl: asset.bannerUrl,
    });
  }
  return out;
}

async function fetchApprovedBroadcastPool(): Promise<ShuffleVideoItem[]> {
  try {
    const res = await fetch("/api/media/approved-broadcast", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      videos?: Array<{
        id: string;
        title: string;
        ownerId: string;
        videoUrl: string;
        thumbnailUrl: string | null;
      }>;
    };
    return (data.videos ?? [])
      .filter((v) => Boolean(v.videoUrl))
      .map((v) => ({
        id: `approved-${v.id}`,
        title: v.title,
        artist: v.ownerId,
        videoUrl: v.videoUrl,
        genre: "Approved",
        coverUrl: v.thumbnailUrl ?? undefined,
      }));
  } catch {
    return [];
  }
}

function shufflePool(items: ShuffleVideoItem[], recentIds: string[]): ShuffleVideoItem[] {
  const recent = new Set(recentIds.slice(-6));
  const fresh = items.filter((i) => !recent.has(i.id));
  const pool = (fresh.length >= 2 ? fresh : items).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

async function buildPool(recentIds: string[]): Promise<ShuffleVideoItem[]> {
  const approved = await fetchApprovedBroadcastPool();
  const performerItems = buildPerformerPool();
  const mediaItems = buildMediaEnginePool();
  const venueItems = buildVenueAmbientPool();
  // Prefer real uploads; venue ambient is last-resort inventory so QP never dead-ends.
  const merged = [...approved, ...performerItems, ...mediaItems, ...venueItems];
  const seen = new Set<string>();
  const unique = merged.filter((item) => {
    if (!item.videoUrl?.trim()) return false;
    if (seen.has(item.id) || seen.has(item.videoUrl)) return false;
    seen.add(item.id);
    seen.add(item.videoUrl);
    return true;
  });
  return shufflePool(unique, recentIds);
}

function castItem(item: ShuffleVideoItem): void {
  const payload = {
    playlistId: "video-shuffle",
    trackId: item.id,
    title: item.title,
    artist: item.artist,
    coverUrl: item.coverUrl ?? null,
    videoUrl: item.videoUrl,
    targetMonitorId: "mon-a" as const,
  };
  castPlaylistToMonitor(payload);
  publishPlaylistNowPlaying({ ...payload, isPlaying: true });
}

let active = false;
let recentIds: string[] = [];
let current: ShuffleVideoItem | null = null;

/** RESET → SHUFFLE → recruiting cast (honest empty when no approved inventory). */
export async function restartVideoShuffle(): Promise<ShuffleVideoItem | null> {
  recentIds = [];
  current = null;
  active = true;
  emitState("recruiting", null);
  const pool = await buildPool([]);
  if (pool.length === 0) {
    active = false;
    emitState("idle", null);
    return null;
  }
  current = pool[0]!;
  recentIds = [current.id];
  castItem(current);
  emitState("active", current);
  return current;
}

export async function startVideoShuffle(): Promise<ShuffleVideoItem | null> {
  const pool = await buildPool(recentIds);
  if (pool.length === 0) {
    active = false;
    current = null;
    emitState("recruiting", null);
    return null;
  }
  current = pool[0]!;
  recentIds = [...recentIds, current.id].slice(-10);
  active = true;
  castItem(current);
  emitState("active", current);
  return current;
}

export async function shuffleNextVideo(): Promise<ShuffleVideoItem | null> {
  if (!active) return startVideoShuffle();
  const pool = await buildPool(recentIds);
  if (pool.length === 0) {
    emitState("recruiting", null);
    return null;
  }
  current = pool[0]!;
  recentIds = [...recentIds, current.id].slice(-10);
  castItem(current);
  emitState("active", current);
  return current;
}

export function pauseVideoShuffle(): void {
  active = false;
  emitState("paused", current);
}

export async function resumeVideoShuffle(): Promise<ShuffleVideoItem | null> {
  if (current) {
    active = true;
    castItem(current);
    emitState("active", current);
    return current;
  }
  return startVideoShuffle();
}

export function exitVideoShuffle(): void {
  active = false;
  current = null;
  emitState("idle", null);
}

export function isVideoShuffleActive(): boolean {
  return active;
}

export function subscribeVideoShuffleState(
  handler: (detail: { state: VideoShuffleState; item: ShuffleVideoItem | null }) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{ state: VideoShuffleState; item: ShuffleVideoItem | null }>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(SHUFFLE_EVENT, listener);
  return () => window.removeEventListener(SHUFFLE_EVENT, listener);
}
