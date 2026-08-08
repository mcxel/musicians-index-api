/**
 * Command Center playback bus — one canonical session for mini + full playlist UI.
 * PlaylistCanister owns the <audio> element; the persistent dock sends commands and
 * mirrors state via PlaylistMonitorCast now-playing events.
 */

import {
  publishPlaylistNowPlaying,
  subscribePlaylistNowPlaying,
  type PlaylistNowPlayingPayload,
} from "@/lib/playlists/PlaylistMonitorCast";

export const PLAYBACK_COMMAND_EVENT = "tmi:playlist:playback-command";

export type PlaybackCommand = "toggle" | "play" | "pause" | "prev" | "next" | "open-full";

export function sendPlaybackCommand(command: PlaybackCommand): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLAYBACK_COMMAND_EVENT, { detail: { command } }));
}

export function subscribePlaybackCommands(
  handler: (command: PlaybackCommand) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const cmd = (e as CustomEvent<{ command?: PlaybackCommand }>).detail?.command;
    if (cmd) handler(cmd);
  };
  window.addEventListener(PLAYBACK_COMMAND_EVENT, listener);
  return () => window.removeEventListener(PLAYBACK_COMMAND_EVENT, listener);
}

export function syncNowPlaying(payload: PlaylistNowPlayingPayload): void {
  publishPlaylistNowPlaying(payload);
}

export { subscribePlaylistNowPlaying, type PlaylistNowPlayingPayload };
