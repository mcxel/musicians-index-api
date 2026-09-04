/**
 * DisplayTargetContracts.ts — Logical Multi-Display Targets & ISO Recording Contracts
 *
 * Laws 8, 10
 */

import type { FrameSlot } from "./SurfaceFrameContracts";

export type LogicalDisplayTarget =
  | "LOCAL_PRIMARY"
  | "LOCAL_SECONDARY"
  | "CAST"
  | "REMOTE_DIRECTOR"
  | "OBSERVATORY"
  | "RECORDING_PROGRAM"
  | "RECORDING_ISO";

export interface DisplayBinding {
  target: LogicalDisplayTarget;
  assignedFrames: FrameSlot[];
  resolution: { width: number; height: number };
  fps: number;
  isAttached: boolean;
  externalSinkUrl?: string;
}

export interface IsoRecordingConfig {
  sourceId: string;
  channelName: string;
  format: "mp4" | "webm" | "mkv";
  resolution: { width: number; height: number };
  fps: number;
  isRecording: boolean;
  startedAtMs: number | null;
}
