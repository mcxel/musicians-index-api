/**
 * Shared primary session strip — identical geometry for Fan + Performer (QP-10).
 * Primary control strip: MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | LOBBIES | GO LIVE
 */

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

/** Locked primary row — 7 buttons, single horizontal touch-scroll row on mobile. */
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
