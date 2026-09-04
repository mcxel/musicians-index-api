/**
 * Shared primary session strip — identical geometry for Fan + Performer (QP-10).
 * Primary control strip: MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | STREAM & WIN | GO LIVE
 * (VENUE TOOLS lives in media-stack toolbar on desktop + mobile quick panel bar — not here)
 */

import type { VenueToolsPolicyContext } from "@/lib/venue/VenueToolsRegistry";

export type SessionControlButtonId =
  | "mic"
  | "cam"
  | "camera"
  | "snips"
  | "video-shuffle"
  | "stream-win"
  | "go-live";

export interface SessionControlButtonDef {
  id: SessionControlButtonId;
  label: string;
}

/** Locked primary row — MIC | CAM | CAMERA | SNIPS | VIDEO SHUFFLE | STREAM & WIN | GO LIVE */
export const PRIMARY_SESSION_STRIP: SessionControlButtonDef[] = [
  { id: "mic", label: "🎙️ MIC ON" },
  { id: "cam", label: "📹 CAM ON" },
  { id: "camera", label: "📷 CAMERA" },
  { id: "snips", label: "📱 SNIPS" },
  { id: "video-shuffle", label: "🔀 VIDEO SHUFFLE" },
  { id: "stream-win", label: "📻 STREAM & WIN" },
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
