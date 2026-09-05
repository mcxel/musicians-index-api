/**
 * MediaSourceContracts.ts — Typed sources, health SM, rights (fail-closed)
 */

import { FABRIC_CONTRACT_VERSIONS } from "./ContractVersions";

export type CanonicalMediaSourceKind =
  | "CAMERA"
  | "MIC"
  | "WEBRTC_REMOTE"
  | "SCREEN_SHARE"
  | "HLS"
  | "RTMP_INGEST"
  | "RECORDED_MEDIA"
  | "VENUE_RENDERER"
  | "AUDIENCE_RENDERER"
  | "PERFORMER"
  | "FAN_AVATAR"
  | "GUEST"
  | "JUDGE"
  | "DJ"
  | "OPPONENT"
  | "BAND"
  | "REPLAY"
  | "YOPHO"
  | "SNIP"
  | "SPONSOR_MEDIA"
  | "GAME_CAPTURE";

/** Extensible — string & {} allows future kinds without hard-cap. */
export type MediaSourceKind = CanonicalMediaSourceKind | (string & {});

export type SourceHealthState =
  | "CONNECTING"
  | "HEALTHY"
  | "DEGRADED"
  | "STALLED"
  | "RECOVERING"
  | "FAILED"
  | "ENDED";

export interface SourceRightsPolicy {
  /** When unknown / omitted at register time → fail-closed (do not publish). */
  known: boolean;
  externalAllowed: boolean;
  recordingAllowed: boolean;
  commercialAllowed: boolean;
  replayAllowed: boolean;
  castAllowed: boolean;
  ageRestricted: boolean;
  privacyClass: "PUBLIC" | "FRIENDS" | "PRIVATE" | "UNKNOWN";
  licenseHolder?: string;
  territoryRestrictions?: string[];
  expiresAtMs?: number;
}

export interface SourcePrivacyPolicy {
  /** Fail-closed: UNKNOWN blocks publish. */
  visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" | "UNKNOWN";
  faceBlurRequired: boolean;
  piiRedactionRequired: boolean;
  consentVerified: boolean;
}

export interface SourceAudioPolicy {
  hasAudio: boolean;
  channels: number;
  sampleRate: number;
  isMuted: boolean;
  gain: number;
  priority: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

export interface SourceVideoPolicy {
  hasVideo: boolean;
  width: number;
  height: number;
  fps: number;
  bitrateKbps: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "custom";
}

export interface MediaSourceRecord {
  sourceId: string;
  sessionId: string;
  generation: number;
  ownerId: string;
  ownerRole: string;
  mediaKind: MediaSourceKind;
  health: SourceHealthState;
  latencyMs: number;
  droppedFrames: number;
  audioPolicy: SourceAudioPolicy;
  videoPolicy: SourceVideoPolicy;
  rightsPolicy: SourceRightsPolicy;
  privacyPolicy: SourcePrivacyPolicy;
  availability: "AVAILABLE" | "PAUSED" | "REVOKED" | "DISCONNECTED";
  registeredAtMs: number;
  lastHealthUpdateMs: number;
  publishEligible: boolean;
}

/** Fail-closed defaults — unknown rights MUST NOT publish. */
export const DEFAULT_FAIL_CLOSED_RIGHTS: SourceRightsPolicy = {
  known: false,
  externalAllowed: false,
  recordingAllowed: false,
  commercialAllowed: false,
  replayAllowed: false,
  castAllowed: false,
  ageRestricted: false,
  privacyClass: "UNKNOWN",
};

export const DEFAULT_FAIL_CLOSED_PRIVACY: SourcePrivacyPolicy = {
  visibility: "UNKNOWN",
  faceBlurRequired: false,
  piiRedactionRequired: false,
  consentVerified: false,
};

export const DEFAULT_PUBLIC_SOURCE_RIGHTS: SourceRightsPolicy = {
  known: true,
  externalAllowed: true,
  recordingAllowed: true,
  commercialAllowed: true,
  replayAllowed: true,
  castAllowed: true,
  ageRestricted: false,
  privacyClass: "PUBLIC",
};

export const DEFAULT_PUBLIC_PRIVACY: SourcePrivacyPolicy = {
  visibility: "PUBLIC",
  faceBlurRequired: false,
  piiRedactionRequired: false,
  consentVerified: true,
};

export function isSourcePublishEligible(
  rights: SourceRightsPolicy,
  privacy: SourcePrivacyPolicy
): boolean {
  if (!rights.known) return false;
  if (rights.privacyClass === "UNKNOWN") return false;
  if (privacy.visibility === "UNKNOWN") return false;
  if (!privacy.consentVerified && privacy.visibility !== "PUBLIC") return false;
  if (rights.expiresAtMs != null && Date.now() > rights.expiresAtMs) return false;
  return true;
}

export const MEDIA_SOURCE_CONTRACT_VERSION =
  FABRIC_CONTRACT_VERSIONS.SESSION_MEDIA_GRAPH;
