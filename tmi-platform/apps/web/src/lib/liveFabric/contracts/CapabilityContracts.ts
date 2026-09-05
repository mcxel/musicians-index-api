/**
 * CapabilityContracts.ts + TransportContracts — Fan/Performer + abstract transports
 */

export type AccountCapabilityRole = "FAN" | "PERFORMER" | "BAND" | "ADMIN" | "GUEST";

export interface LiveCapabilitySet {
  role: AccountCapabilityRole;
  canPublishCamera: boolean;
  canPublishMic: boolean;
  canScreenShare: boolean;
  canGoLivePerformer: boolean;
  canGoLiveFanSocial: boolean;
  canHostBattle: boolean;
  canJoinAsGuest: boolean;
  canCast: boolean;
  canRecordProgram: boolean;
  canModerateFeeds: boolean;
  canDirectPresentation: boolean;
  canOwnAvatar: boolean;
}

export type TransportKind =
  | "WEBRTC"
  | "HLS"
  | "RTMP"
  | "LOCAL_LOOPBACK"
  | "VENUE_RENDER"
  | "DATA_CHANNEL";

export interface TransportEndpointPolicy {
  transportKind: TransportKind;
  /** Never hardcode localhost ports — resolve via policy/env. */
  resolveUrl: (sessionId: string, roomId: string) => string | null;
  requiresAuth: boolean;
  maxBitrateKbps: number;
  iceServersEnvKey?: string;
  ingestEnvKey?: string;
}

export interface TransportRouteDecision {
  transportKind: TransportKind;
  endpoint: string | null;
  reason: string;
  allowed: boolean;
}
