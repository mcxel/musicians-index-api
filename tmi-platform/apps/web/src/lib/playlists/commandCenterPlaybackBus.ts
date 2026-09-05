/**
 * Command Center playback bus — one canonical session for mini + full playlist UI.
 * PlaylistCanister owns the <audio> element; REMOTE / dock send commands here.
 */

import {
  publishPlaylistNowPlaying,
  subscribePlaylistNowPlaying,
  type PlaylistNowPlayingPayload,
} from "@/lib/playlists/PlaylistMonitorCast";

export const PLAYBACK_COMMAND_EVENT = "tmi:playlist:playback-command";
export const PLAYLIST_QUEUE_SYNC_EVENT = "tmi:playlist:queue-sync";

export type PlaybackCommand =
  | "toggle"
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "open-full"
  | "seek"
  | "rewind"
  | "forward"
  | "volume"
  | "mute"
  | "unmute"
  | "select-playlist"
  | "select-track"
  | "search-play";

export interface PlaybackCommandPayload {
  command: PlaybackCommand;
  playlistId?: string;
  trackIndex?: number;
  trackId?: string;
  /** 0–1 progress ratio for seek bar. */
  seekRatio?: number;
  /** Seconds delta for rewind/forward. */
  seekDeltaSec?: number;
  /** 0–1 volume level. */
  volume?: number;
  query?: string;
}

export interface PlaylistQueueSyncPayload {
  playlists: { id: string; name: string; trackCount: number }[];
  selectedPlaylistId: string | null;
  tracks: { id: string; title: string; artist?: string }[];
  currentTrackIndex: number;
  isPlaying: boolean;
}

export function sendPlaybackCommand(
  command: PlaybackCommand,
  extras?: Omit<PlaybackCommandPayload, "command">,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PLAYBACK_COMMAND_EVENT, {
      detail: { command, ...extras } satisfies PlaybackCommandPayload,
    }),
  );
}

export function subscribePlaybackCommands(
  handler: (payload: PlaybackCommandPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<PlaybackCommandPayload>).detail;
    if (detail?.command) handler(detail);
  };
  window.addEventListener(PLAYBACK_COMMAND_EVENT, listener);
  return () => window.removeEventListener(PLAYBACK_COMMAND_EVENT, listener);
}
export function syncPlaylistQueue(payload: PlaylistQueueSyncPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLAYLIST_QUEUE_SYNC_EVENT, { detail: payload }));
}

export function subscribePlaylistQueue(
  handler: (payload: PlaylistQueueSyncPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<PlaylistQueueSyncPayload>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(PLAYLIST_QUEUE_SYNC_EVENT, listener);
  return () => window.removeEventListener(PLAYLIST_QUEUE_SYNC_EVENT, listener);
}

export function syncNowPlaying(payload: PlaylistNowPlayingPayload): void {
  publishPlaylistNowPlaying(payload);
}

export { subscribePlaylistNowPlaying, type PlaylistNowPlayingPayload };
