/**
 * World Dance Party playback gate.
 * Rotation already carries audioUrl. Origami canonical audio defaults
 * playbackAllowed/STREAMABLE to false until rights are granted.
 * This gate withholds playback instead of starting a second audio engine.
 */

export type WdpPlaybackStatus = "UNBOUND" | "BLOCKED_RIGHTS";

export type WdpPlaybackDecision =
  | { status: "UNBOUND"; audioUrl: null }
  | {
      status: "BLOCKED_RIGHTS";
      audioUrl: string;
      reason: "ORIGAMI_PLAYBACK_ALLOWED_FALSE_BY_DEFAULT";
    };

export function resolveWdpCanonicalPlayback(audioUrl: string | null | undefined): WdpPlaybackDecision {
  const url = typeof audioUrl === "string" ? audioUrl.trim() : "";
  if (!url) return { status: "UNBOUND", audioUrl: null };
  return {
    status: "BLOCKED_RIGHTS",
    audioUrl: url,
    reason: "ORIGAMI_PLAYBACK_ALLOWED_FALSE_BY_DEFAULT",
  };
}
