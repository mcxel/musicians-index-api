/**
 * AudioContracts.ts — Program vs monitor, ducking, audio focus transactions
 */

export type CanonicalAudioChannelKind =
  | "MIC"
  | "GUEST_AUDIO"
  | "MUSIC"
  | "SCREEN_AUDIO"
  | "VENUE_AMBIENCE"
  | "AUDIENCE_SFX"
  | "REPLAY_AUDIO"
  | "EXTERNAL_MEDIA";

export type AudioChannelKind = CanonicalAudioChannelKind | (string & {});

export interface AudioChannelState {
  channelId: string;
  kind: AudioChannelKind;
  sourceId: string | null;
  gain: number;
  muted: boolean;
  solo: boolean;
  priority: number;
  duckingLevelDb: number;
  isDucked: boolean;
  isAudibleInProgram: boolean;
  isAudibleInMonitor: boolean;
  pan: number;
}

export interface AudioGraphSnapshot {
  sessionId: string;
  generation: number;
  revision: number;
  channels: Record<string, AudioChannelState>;
  masterProgramGain: number;
  masterMonitorGain: number;
  primaryAudioAuthoritySourceId: string | null;
  activeDuckingSources: string[];
  lastUpdateMs: number;
}

/** Audio focus is independent of frame visibility (visible ≠ audible). */
export interface AudioFocusTransaction {
  transactionId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  primaryOwnerSourceId: string | null;
  duckTargets: string[];
  duckLevelDb: number;
  programAudibleSourceIds: string[];
  monitorAudibleSourceIds: string[];
  issuedAtMs: number;
}

export interface AudioFocusResult {
  transactionId: string;
  success: boolean;
  appliedRevision: number;
  error?: string;
}
