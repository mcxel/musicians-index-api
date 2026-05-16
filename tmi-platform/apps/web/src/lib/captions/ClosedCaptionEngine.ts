export type CaptionStatus = "off" | "on" | "translating";

export interface CaptionTrack {
  streamId: string;
  language: string;
  status: CaptionStatus;
  segments: CaptionEntry[];
}

export interface CaptionEntry {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  speaker?: string;
  confidence: number;
}

const tracks = new Map<string, CaptionTrack>();
let seq = 0;

export function initCaptionTrack(streamId: string, language = "en"): CaptionTrack {
  const track: CaptionTrack = { streamId, language, status: "off", segments: [] };
  tracks.set(streamId, track);
  return track;
}

export function enableCaptions(streamId: string): CaptionTrack {
  const track = tracks.get(streamId) ?? initCaptionTrack(streamId);
  track.status = "on";
  tracks.set(streamId, track);
  return track;
}

export function disableCaptions(streamId: string): void {
  const track = tracks.get(streamId);
  if (track) { track.status = "off"; tracks.set(streamId, track); }
}

export function addCaption(streamId: string, text: string, startMs: number, endMs: number, speaker?: string): CaptionEntry {
  const track = tracks.get(streamId) ?? initCaptionTrack(streamId);
  const entry: CaptionEntry = { id: `cc_${++seq}`, text, startMs, endMs, speaker, confidence: 0.92 };
  track.segments.push(entry);
  tracks.set(streamId, track);
  return entry;
}

export function getCaptionTrack(streamId: string): CaptionTrack | null {
  return tracks.get(streamId) ?? null;
}

export function getCurrentCaption(streamId: string, currentMs: number): CaptionEntry | null {
  const track = tracks.get(streamId);
  if (!track || track.status === "off") return null;
  return track.segments.find(s => currentMs >= s.startMs && currentMs <= s.endMs) ?? null;
}

export function getCaptionStatus(streamId: string): CaptionStatus {
  return tracks.get(streamId)?.status ?? "off";
}
