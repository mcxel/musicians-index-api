/**
 * Shared primary session strip — identical geometry for Fan + Performer (QP-10).
 * Canonical Command Bed: MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | LOBBIES | GO LIVE
 * Stream & Win (listen) → LOBBIES → Lounges → Stream & Win panel (not a Command Bed control).
 * Submissions → GPS Rail only (not Command Bed).
 * (VENUE TOOLS lives in media-stack toolbar on desktop + mobile quick panel bar — not here)
 */

import type { VenueToolsPolicyContext } from "@/lib/venue/VenueToolsRegistry";

export type SessionControlButtonId =
  | "mic"
  | "cam"
  | "camera"
  | "snips"
  | "video-shuffle"
  | "lobbies"
  | "go-live";

export interface SessionControlButtonDef {
  id: SessionControlButtonId;
  label: string;
}

/** Locked primary row — MIC | CAM | CAMERA | SNIPS | VIDEO SHUFFLE | LOBBIES | GO LIVE */
export const PRIMARY_SESSION_STRIP: SessionControlButtonDef[] = [
  { id: "mic", label: "🎙️ MIC ON" },
  { id: "cam", label: "📹 CAM ON" },
  { id: "camera", label: "📷 CAMERA" },
  { id: "snips", label: "📱 SNIPS" },
  { id: "video-shuffle", label: "🔀 VIDEO SHUFFLE" },
  { id: "lobbies", label: "🏟️ LOBBIES" },
  { id: "go-live", label: "🔴 GO LIVE" },
];

export function getPrimarySessionStrip(): SessionControlButtonDef[] {
  return PRIMARY_SESSION_STRIP;
}

export function getPrimarySessionStripForRole(
  _ctx?: VenueToolsPolicyContext,
): SessionControlButtonDef[] {
  return PRIMARY_SESSION_STRIP;
}
