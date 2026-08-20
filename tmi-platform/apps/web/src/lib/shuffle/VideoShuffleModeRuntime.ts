/**
 * VideoShuffleModeRuntime — passive randomized video watching (instant mode).
 * Uses public performer intro/motion videos when available; otherwise falls
 * back to in-memory public video assets (soft launch) — one canonical player cast.
 */

import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";

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

export type VideoShuffleState = "idle" | "active" | "paused";

function buildPool(recentIds: string[]): ShuffleVideoItem[] {
  const performerItems = PERFORMER_REGISTRY.filter(
    (p) => (p.introVideoUrl || p.motionPosterUrl) && p.lineupType !== undefined,
  ).map((p) => ({
    id: `shuffle-${p.slug}`,
    title: p.name,
    artist: p.category,
    videoUrl: (p.introVideoUrl ?? p.motionPosterUrl)!,
    genre: p.category,
    performerSlug: p.slug,
    coverUrl: p.profileImageUrl,
  }));

  // Soft-launch fallback: use ready in-memory videos when performer intro/motion data isn't present.
  const mediaItems = MediaEngine.getByType("video").map((m) => ({
    id: `shuffle-media-${m.id}`,
    title: m.title,
    artist: m.ownerName,
    videoUrl: m.url,
    genre: m.genre ?? "Media",
    coverUrl: m.thumbnailUrl,
  }));

  const items = [...performerItems, ...mediaItems];

  const recent = new Set(recentIds.slice(-6));
  const fresh = items.filter((i) => !recent.has(i.id));
  const pool = (fresh.length >= 2 ? fresh : items).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

function emitState(state: VideoShuffleState, item?: ShuffleVideoItem | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SHUFFLE_EVENT, { detail: { state, item: item ?? null } }),
  );
}

let active = false;
let recentIds: string[] = [];
let current: ShuffleVideoItem | null = null;

export function startVideoShuffle(): ShuffleVideoItem | null {
  const pool = buildPool(recentIds);
  if (pool.length === 0) {
    emitState("idle", null);
    return null;
  }
  current = pool[0]!;
  recentIds = [...recentIds, current.id].slice(-10);
  active = true;
  castPlaylistToMonitor({
    playlistId: "video-shuffle",
    trackId: current.id,
    title: current.title,
    artist: current.artist,
    coverUrl: current.coverUrl ?? null,
    videoUrl: current.videoUrl,
    targetMonitorId: "mon-a",
  });
  emitState("active", current);
  return current;
}

export function shuffleNextVideo(): ShuffleVideoItem | null {
  if (!active) return startVideoShuffle();
  const pool = buildPool(recentIds);
  if (pool.length === 0) return null;
  current = pool[0]!;
  recentIds = [...recentIds, current.id].slice(-10);
  castPlaylistToMonitor({
    playlistId: "video-shuffle",
    trackId: current.id,
    title: current.title,
    artist: current.artist,
    coverUrl: current.coverUrl ?? null,
    videoUrl: current.videoUrl,
    targetMonitorId: "mon-a",
  });
  emitState("active", current);
  return current;
}

export function pauseVideoShuffle(): void {
  active = false;
  emitState("paused", current);
}

export function resumeVideoShuffle(): ShuffleVideoItem | null {
  if (current) {
    active = true;
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
