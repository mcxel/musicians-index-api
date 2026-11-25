/**
 * PlaylistMonitorCast — cast a playlist/track onto Command Center monitors.
 *
 * Projects selected media into CanonicalDualMonitorStack cells (via
 * CommandCenterMediaStack), not a separate orphan player.
 * Client-only event bus — no fabricated listener/spectrum data.
 */

export const PLAYLIST_CAST_EVENT = "tmi:playlist:cast";
export const PLAYLIST_NOW_PLAYING_EVENT = "tmi:playlist:now-playing";

export type PlaylistCastTargetMonitor = "mon-a" | "mon-b" | string;

export interface PlaylistCastPayload {
  playlistId: string;
  trackId?: string;
  title: string;
  artist?: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  /** Defaults to Monitor A (stage). */
  targetMonitorId?: PlaylistCastTargetMonitor;
  /**
   * Real canonical Song.id/Video.id, when the caller has proven one exists
   * (owner's Video Shuffle media-identity trace, 2026-10-29) — distinct from
   * trackId, which is often a presentation-layer/prefixed/synthetic id (e.g.
   * VideoShuffleModeRuntime's `approved-${v.id}`). Omitted (never fabricated)
   * when the cast item has no canonical media backing it (performer intro
   * clips, in-memory MediaEngine assets, venue ambient loops). A future
   * qualified-play receipt integration must read THIS field, never trackId,
   * as mediaId.
   */
  canonicalMediaId?: string;
  /** Real creatorId (uploaderId) backing canonicalMediaId, when known. */
  creatorId?: string;
}

export type PlaylistNowPlayingPayload = PlaylistCastPayload & {
  isPlaying: boolean;
  /** 0–1 when known from real audio element; omit when unknown. */
  progress?: number;
};

function dispatch(name: string, detail: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    /* ignore */
  }
}

/** Project playlist/track onto a Command Center monitor cell. */
export function castPlaylistToMonitor(payload: PlaylistCastPayload): void {
  dispatch(PLAYLIST_CAST_EVENT, {
    ...payload,
    targetMonitorId: payload.targetMonitorId ?? "mon-a",
  });
}

/** Optional now-playing updates for the cast surface (real playback only). */
export function publishPlaylistNowPlaying(payload: PlaylistNowPlayingPayload): void {
  dispatch(PLAYLIST_NOW_PLAYING_EVENT, payload);
}

export function subscribePlaylistCast(
  handler: (payload: PlaylistCastPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<PlaylistCastPayload>).detail;
    if (detail?.playlistId && detail.title) handler(detail);
  };
  window.addEventListener(PLAYLIST_CAST_EVENT, listener);
  return () => window.removeEventListener(PLAYLIST_CAST_EVENT, listener);
}

export function subscribePlaylistNowPlaying(
  handler: (payload: PlaylistNowPlayingPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<PlaylistNowPlayingPayload>).detail;
    if (detail?.playlistId) handler(detail);
  };
  window.addEventListener(PLAYLIST_NOW_PLAYING_EVENT, listener);
  return () => window.removeEventListener(PLAYLIST_NOW_PLAYING_EVENT, listener);
}
