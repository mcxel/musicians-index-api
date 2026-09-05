/**
 * LiveSessionContracts.ts — Lifecycle, epochs, command idempotency, disconnect, snapshot
 *
 * Marcel addenda: sessionId + generation + revision; command idempotency;
 * disconnect semantics; host succession; SessionSnapshot + reconcile.
 */

import { FABRIC_CONTRACT_VERSIONS } from "./ContractVersions";

export type LiveSessionState =
  | "IDLE"
  | "PREFLIGHT"
  | "READY"
  | "CONNECTING"
  | "PUBLISHING"
  | "LIVE"
  | "RECONNECTING"
  | "ENDING"
  | "ENDED"
  | "ERROR";

export type SessionHostRole =
  | "fan"
  | "performer"
  | "producer"
  | "admin"
  | "guest"
  | "bot"
  | "judge"
  | "dj"
  | "band";

export type ParticipantDisconnectReason =
  | "TEMPORARILY_DISCONNECTED"
  | "LEFT"
  | "REMOVED"
  | "BANNED"
  | "DEVICE_SWITCH"
  | "NETWORK_HANDOFF";

export type HostSuccessionPolicy =
  | "END_SESSION"
  | "GRACE_PERIOD"
  | "TRANSFER_TO_COHOST"
  | "TRANSFER_TO_SYSTEM_HOST";

export interface SessionErrorRecord {
  code: string;
  message: string;
  timestampMs: number;
  fatal: boolean;
  recoveryAttempted?: boolean;
}

/** Idempotent command envelope — gen N events never mutate gen N+1. */
export interface SessionCommand<T = unknown> {
  commandId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  issuedAtMs: number;
  type: string;
  payload: T;
  issuerId: string;
  issuerRole: SessionHostRole;
}

export interface CommandExecutionResult {
  commandId: string;
  success: boolean;
  appliedRevision: number;
  appliedGeneration: number;
  executedAtMs: number;
  error?: string;
  idempotentSkip?: boolean;
  revisionMismatch?: boolean;
  generationMismatch?: boolean;
}

export interface ParticipantRecord {
  userId: string;
  role: SessionHostRole;
  displayName: string;
  avatarUrl?: string;
  joinedAtMs: number;
  disconnectState?: {
    reason: ParticipantDisconnectReason;
    disconnectedAtMs: number;
    gracePeriodExpiresAtMs: number;
  };
}

export interface SessionSnapshot {
  sessionId: string;
  roomId: string;
  hostUserId: string;
  hostRole: SessionHostRole;
  experienceType: string;
  state: LiveSessionState;
  generation: number;
  revision: number;
  startedAtMs: number;
  liveAtMs: number | null;
  endedAtMs: number | null;
  lastHeartbeatMs: number;
  reconnectCount: number;
  participants: ParticipantRecord[];
  activeSources: string[];
  programFrames: Record<string, string | null>;
  previewFrames: Record<string, string | null>;
  currentLayout: string;
  activeAudioFocus: string | null;
  lastError: SessionErrorRecord | null;
  contractVersion: string;
  createdAtMs: number;
  hostSuccessionPolicy: HostSuccessionPolicy;
  mediaClockMs: number;
}

export interface SessionReconcileResult {
  accepted: boolean;
  /** Alias of accepted — cert suite compatibility. */
  success: boolean;
  reason?: string;
  localGeneration: number;
  remoteGeneration: number;
  localRevision: number;
  remoteRevision: number;
  applied?: boolean;
}

export const LIVE_SESSION_CONTRACT_VERSION =
  FABRIC_CONTRACT_VERSIONS.LIVE_SESSION_KERNEL;
