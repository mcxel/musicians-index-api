/**
 * RecordingContracts.ts — PROGRAM vs ISO recording / replay metadata
 */

export type RecordingTrackKind = "PROGRAM" | "ISO";

export interface RecordingTrackMetadata {
  trackId: string;
  kind: RecordingTrackKind;
  sessionId: string;
  generation: number;
  sourceId?: string;
  /** ISO tracks bind to a single source; PROGRAM is the composed bus. */
  composedFromSourceIds: string[];
  startedAtMediaClockMs: number;
  endedAtMediaClockMs: number | null;
  rightsSnapshotId: string;
  layoutAtStart: string;
  displayTarget: "RECORDING_PROGRAM" | "RECORDING_ISO";
}

export interface RecordingSessionPlan {
  planId: string;
  sessionId: string;
  generation: number;
  programEnabled: boolean;
  isoSourceIds: string[];
  retentionDays: number;
  replayAllowed: boolean;
}

export interface ReplayCue {
  cueId: string;
  mediaClockMs: number;
  label: string;
  frameSlot?: string;
  sourceId?: string;
}
