/**
 * StreamWinModeRuntime — passive Stream & Win radio cast (mirrors VideoShuffleModeRuntime).
 * Reads approved rotation inventory from /api/stream-win/songs; casts audio to Command Center monitors.
 * No fabricated listener counts or queue data (Rule 20).
 */

import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";

export interface StreamWinTrackItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  audioUrl: string;
}

const STREAM_WIN_EVENT = "tmi:stream-win:state";

export type StreamWinModeState = "idle" | "active" | "paused";

function emitState(state: StreamWinModeState, item?: StreamWinTrackItem | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(STREAM_WIN_EVENT, { detail: { state, item: item ?? null } }),
  );
}

let active = false;
let recentIds: string[] = [];
let current: StreamWinTrackItem | null = null;

async function fetchRotationPool(): Promise<StreamWinTrackItem[]> {
  try {
    const res = await fetch("/api/stream-win/songs", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      songs?: Array<{
        id: string;
        artistId: string;
        title: string;
        genre: string;
        audioUrl: string;
      }>;
    };
    return (data.songs ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artistId,
      genre: s.genre,
      audioUrl: s.audioUrl,
    }));
  } catch {
    return [];
  }
}

function pickNext(pool: StreamWinTrackItem[]): StreamWinTrackItem | null {
  if (pool.length === 0) return null;
  const recent = new Set(recentIds.slice(-6));
  const fresh = pool.filter((i) => !recent.has(i.id));
  const candidates = fresh.length >= 1 ? fresh : pool;
  const item = candidates[0]!;
  recentIds = [...recentIds, item.id].slice(-10);
  return item;
}

function castTrack(item: StreamWinTrackItem): void {
  castPlaylistToMonitor({
    playlistId: "stream-win",
    trackId: item.id,
    title: item.title,
    artist: item.artist,
    audioUrl: item.audioUrl,
    targetMonitorId: "mon-a",
  });
}

export async function startStreamWin(): Promise<StreamWinTrackItem | null> {
  const pool = await fetchRotationPool();
  const next = pickNext(pool);
  if (!next) {
    active = false;
    current = null;
    emitState("idle", null);
    return null;
  }
  current = next;
  active = true;
  castTrack(next);
  emitState("active", next);
  return next;
}

export async function streamWinNextTrack(): Promise<StreamWinTrackItem | null> {
  if (!active) return startStreamWin();
  const pool = await fetchRotationPool();
  const next = pickNext(pool);
  if (!next) return null;
  current = next;
  castTrack(next);
  emitState("active", next);
  return next;
}

export function pauseStreamWin(): void {
  active = false;
  emitState("paused", current);
}

export async function resumeStreamWin(): Promise<StreamWinTrackItem | null> {
  if (current) {
    active = true;
    castTrack(current);
    emitState("active", current);
    return current;
  }
  return startStreamWin();
}

export function exitStreamWin(): void {
  active = false;
  current = null;
  emitState("idle", null);
}

export function isStreamWinActive(): boolean {
  return active;
}

export function subscribeStreamWinState(
  handler: (detail: { state: StreamWinModeState; item: StreamWinTrackItem | null }) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{ state: StreamWinModeState; item: StreamWinTrackItem | null }>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(STREAM_WIN_EVENT, listener);
  return () => window.removeEventListener(STREAM_WIN_EVENT, listener);
}
