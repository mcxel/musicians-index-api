/**
 * ModerationContracts.ts — Feed-level moderation (mute/hide panel without killing session)
 */

export type ModerationFeedAction =
  | "MUTE_AUDIO"
  | "HIDE_VIDEO"
  | "BLUR_VIDEO"
  | "PARK_SOURCE"
  | "BLOCK_SOURCE"
  | "CLEAR_MODERATION";

export interface ModerationFeedCommand {
  commandId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  sourceId: string;
  frameSlot?: string;
  action: ModerationFeedAction;
  reason: string;
  issuerId: string;
  issuedAtMs: number;
  expiresAtMs?: number;
}

export interface ModerationFeedState {
  sourceId: string;
  audioMuted: boolean;
  videoHidden: boolean;
  videoBlurred: boolean;
  parked: boolean;
  blocked: boolean;
  reason: string | null;
  appliedAtMs: number | null;
  expiresAtMs: number | null;
}

export interface ModerationGraphSnapshot {
  sessionId: string;
  generation: number;
  feeds: Record<string, ModerationFeedState>;
}
