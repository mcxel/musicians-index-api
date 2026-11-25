/**
 * JukeboxRoomBroadcastPolicy — §12208–§12248
 *
 * Jukebox = room MEDIA SOURCE on the existing canonicalMediaPlayerRuntime.
 * NEW_BROADCAST_ENGINE_CREATED = NO.
 *
 * Connects:
 * - MediaSource "JUKEBOX"
 * - Lounge proximity JUKEBOX → LOUNGE_JUKEBOX
 * - LobbyPropRegistry jukebox prop
 * - Existing room permission / source priority concepts
 */

import { create } from "zustand";
import type { FrameId, MediaSource } from "@/lib/media/canonicalMediaPlayerRuntime";
// Client module: the server-only authority must never be imported here (it pulls Prisma).
import { formatJukeboxNumber } from "@/lib/jukebox/JukeboxNumberFormat";
import { useCanonicalAudioMixerStore } from "@/lib/audio/CanonicalAudioBusDirector";
import { monitorMixController } from "@/lib/audio/mixer/MonitorMixGraph";

export const JUKEBOX_ROOM_BROADCAST_POLICY_ID =
  "JUKEBOX_ROOM_BROADCAST_POLICY_v1" as const;

export const NEW_BROADCAST_ENGINE_CREATED = false as const;
export const JUKEBOX_MEDIA_SOURCE: Extract<MediaSource, "JUKEBOX"> = "JUKEBOX";

export type JukeboxRoomKind =
  | "LOUNGE"
  | "FAN_AVATAR_SPACE"
  | "PRIVATE_ROOM"
  | "PUBLIC_ROOM"
  | "VENUE_PERFORMANCE"
  | "WORLD_CONCERT"
  | "UNKNOWN";

export type JukeboxBroadcastRole =
  | "OWNER"
  | "HOST"
  | "ADMIN"
  | "AUTHORIZED_DJ"
  | "GUEST";

export type JukeboxRoomCompatibility = {
  roomKind: JukeboxRoomKind;
  placementAllowed: boolean;
  broadcastAllowed: boolean;
  performanceSourceProtected: boolean;
  notes: string;
};

export const JUKEBOX_ROOM_COMPATIBILITY: readonly JukeboxRoomCompatibility[] = [
  {
    roomKind: "LOUNGE",
    placementAllowed: true,
    broadcastAllowed: true,
    performanceSourceProtected: false,
    notes: "Primary social jukebox broadcast surface",
  },
  {
    roomKind: "FAN_AVATAR_SPACE",
    placementAllowed: true,
    broadcastAllowed: true,
    performanceSourceProtected: false,
    notes: "Physical prop + shared source; avatar walk-up interact",
  },
  {
    roomKind: "PRIVATE_ROOM",
    placementAllowed: true,
    broadcastAllowed: true,
    performanceSourceProtected: false,
    notes: "Owner/host controlled",
  },
  {
    roomKind: "PUBLIC_ROOM",
    placementAllowed: true,
    broadcastAllowed: true,
    performanceSourceProtected: false,
    notes: "Subject to room host permissions",
  },
  {
    roomKind: "VENUE_PERFORMANCE",
    placementAllowed: false,
    broadcastAllowed: false,
    performanceSourceProtected: true,
    notes: "Audience jukebox must not override stage/performer source",
  },
  {
    roomKind: "WORLD_CONCERT",
    placementAllowed: false,
    broadcastAllowed: false,
    performanceSourceProtected: true,
    notes: "Performance source protection (§12240)",
  },
] as const;

/** Contextual priority — do not hardcode over an existing router if one defines differently. */
export const JUKEBOX_SOURCE_PRIORITY_HINT = [
  "ACTIVE_SHOW_PERFORMANCE",
  "HOST_SOURCE",
  "AUTHORIZED_SCREEN_SHARE",
  "JUKEBOX",
  "OTHER",
] as const;

export function getJukeboxCompatibility(
  roomKind: JukeboxRoomKind,
): JukeboxRoomCompatibility {
  return (
    JUKEBOX_ROOM_COMPATIBILITY.find((r) => r.roomKind === roomKind) ?? {
      roomKind: "UNKNOWN",
      placementAllowed: false,
      broadcastAllowed: false,
      performanceSourceProtected: true,
      notes: "Fail-closed until room kind proven",
    }
  );
}

export function canControlJukeboxBroadcast(role: JukeboxBroadcastRole): boolean {
  return (
    role === "OWNER" ||
    role === "HOST" ||
    role === "ADMIN" ||
    role === "AUTHORIZED_DJ"
  );
}

export type JukeboxNowPlaying = {
  mediaId: string;
  title: string | null;
  creator: string | null;
  artworkUrl: string | null;
  positionMs: number;
  playing: boolean;
};

export type JukeboxRoomBroadcastState = {
  source: typeof JUKEBOX_MEDIA_SOURCE;
  active: boolean;
  assignedFrameId: FrameId | null;
  nowPlaying: JukeboxNowPlaying | null;
  /** Must equal room broadcast when jukebox is the active source (§12222). */
  roomBroadcastMediaId: string | null;
};

export function createIdleJukeboxBroadcastState(): JukeboxRoomBroadcastState {
  return {
    source: JUKEBOX_MEDIA_SOURCE,
    active: false,
    assignedFrameId: null,
    nowPlaying: null,
    roomBroadcastMediaId: null,
  };
}

/**
 * Activate jukebox as a frame source — routing only; does not create WebRTC.
 * Caller must use useCanonicalMediaPlayerRuntime.assignSource(frameId, "JUKEBOX").
 */
export function planJukeboxBroadcast(input: {
  roomKind: JukeboxRoomKind;
  role: JukeboxBroadcastRole;
  frameId: FrameId;
  media: JukeboxNowPlaying;
  livePerformanceProtected?: boolean;
}): {
  allowed: boolean;
  reason?: string;
  mediaSource: typeof JUKEBOX_MEDIA_SOURCE;
  frameId: FrameId;
  nextState: JukeboxRoomBroadcastState;
  ROOM_REMOUNT: false;
  NEW_BROADCAST_ENGINE_CREATED: false;
} {
  const compat = getJukeboxCompatibility(input.roomKind);
  if (!compat.broadcastAllowed || input.livePerformanceProtected) {
    return {
      allowed: false,
      reason: compat.performanceSourceProtected
        ? "PERFORMANCE_SOURCE_PROTECTED"
        : "ROOM_BROADCAST_NOT_ALLOWED",
      mediaSource: JUKEBOX_MEDIA_SOURCE,
      frameId: input.frameId,
      nextState: createIdleJukeboxBroadcastState(),
      ROOM_REMOUNT: false,
      NEW_BROADCAST_ENGINE_CREATED: false,
    };
  }
  if (!canControlJukeboxBroadcast(input.role)) {
    return {
      allowed: false,
      reason: "UNAUTHORIZED_JUKEBOX_CONTROL",
      mediaSource: JUKEBOX_MEDIA_SOURCE,
      frameId: input.frameId,
      nextState: createIdleJukeboxBroadcastState(),
      ROOM_REMOUNT: false,
      NEW_BROADCAST_ENGINE_CREATED: false,
    };
  }
  return {
    allowed: true,
    mediaSource: JUKEBOX_MEDIA_SOURCE,
    frameId: input.frameId,
    nextState: {
      source: JUKEBOX_MEDIA_SOURCE,
      active: true,
      assignedFrameId: input.frameId,
      nowPlaying: input.media,
      roomBroadcastMediaId: input.media.mediaId,
    },
    ROOM_REMOUNT: false,
    NEW_BROADCAST_ENGINE_CREATED: false,
  };
}

/** Truth check: physical jukebox UI vs room broadcast must not drift. */
export function jukeboxNowPlayingSyncsWithRoom(
  state: JukeboxRoomBroadcastState,
): boolean {
  if (!state.active) return true;
  if (!state.nowPlaying) return state.roomBroadcastMediaId === null;
  return state.nowPlaying.mediaId === state.roomBroadcastMediaId;
}

/**
 * Late join attaches to current room jukebox state — does not restart track (§12228).
 */
export function attachLateJoinerToJukebox(
  roomState: JukeboxRoomBroadcastState,
): JukeboxRoomBroadcastState {
  return { ...roomState };
}

export function switchAwayFromJukebox(
  state: JukeboxRoomBroadcastState,
  _nextSource: Exclude<MediaSource, "JUKEBOX" | null>,
): JukeboxRoomBroadcastState {
  // Preserve nowPlaying metadata so switch-back restores truthful state (§12218)
  return {
    ...state,
    active: false,
    assignedFrameId: null,
    roomBroadcastMediaId: state.active ? state.roomBroadcastMediaId : null,
  };
}

/** Skins change appearance only — never broadcast authority (§12231). */
export function jukeboxSkinGrantsBroadcastAuthority(_skinId: string): false {
  return false;
}

// ============================================================================
// TMI — FINAL JUKEBOX NETWORK AUDIO SCOPE LAW (PRIVATE CALLS, LOBBIES, LOUNGES)
// ============================================================================

export type JukeboxAudioScope =
  | "PRIVATE_CALL_AUDIO"
  | "PRIVATE_GROUP_MEDIA"
  | "LOBBY_JUKEBOX_AUDIO"
  | "LOUNGE_JUKEBOX_AUDIO"
  | "LIVE_PERFORMANCE_AUDIO";

export type JukeboxControlEntryPoint =
  | "IN_CALL_JUKEBOX_TOOLBAR"
  | "PHYSICAL_3D_JUKEBOX_PROP"
  | "LOUNGE_DESIGNATED_JUKEBOX_CONTROL";

export type JukeboxDeliveryMode =
  | "SYNCHRONIZED_LOCAL_PLAYBACK"
  | "AUTHORIZED_SERVER_STREAM"
  | "LICENSED_SHARED_AUDIO_TRACK";

export type JukeboxMediaOrigin =
  | "TMI_OWNED_CATALOG"
  | "AUTHORIZED_PERFORMER_UPLOAD"
  | "PERMITTED_EXTERNAL_EMBED"
  | "THIRD_PARTY_UNLICENSED_RESTREAM";

export type JukeboxDjPermissionMode =
  | "HOST_ONLY"
  | "COLLABORATIVE_QUEUE"
  | "ROTATING_DJ"
  | "VOTE_NEXT";

export type ConcertJukeboxPriorityBehavior = "PAUSE" | "DUCK";

export interface JukeboxQueueTrack {
  mediaId: string;
  jukeboxNumber: number;
  jukeboxCode: string; // e.g. "#001"
  title: string;
  creator: string;
  mediaType: "SONG" | "PLAYLIST" | "ALBUM" | "VIDEO";
  durationSec: number;
  origin: JukeboxMediaOrigin;
  deliveryMode: JukeboxDeliveryMode;
  addedByUserId: string;
  addedByName: string;
  votes: number;
}

export interface ScopedJukeboxAuthorizationDecision {
  allowed: boolean;
  reason?: string;
  targetScope: JukeboxAudioScope;
  entryPoint: JukeboxControlEntryPoint;
  deliveryMode: JukeboxDeliveryMode;
  leaksToPublicRoom: false;
  altersRoomJukeboxState: boolean;
  entersPerformerBroadcast: false;
  physicalJukeboxRequired: boolean;
  NEW_BROADCAST_ENGINE_CREATED: false;
}

/**
 * Selects the safe delivery mode for a media item (§10–12):
 * Never assumes YouTube, Spotify, or third-party media can be restreamed over Daily.
 */
export function resolveSafeJukeboxDeliveryMode(input: {
  origin: JukeboxMediaOrigin;
  explicitRestreamLicenseVerified?: boolean;
}): JukeboxDeliveryMode {
  if (input.origin === "THIRD_PARTY_UNLICENSED_RESTREAM" || input.origin === "PERMITTED_EXTERNAL_EMBED") {
    return "SYNCHRONIZED_LOCAL_PLAYBACK";
  }
  if (input.origin === "TMI_OWNED_CATALOG" && input.explicitRestreamLicenseVerified) {
    return "LICENSED_SHARED_AUDIO_TRACK";
  }
  if (input.origin === "TMI_OWNED_CATALOG" || input.origin === "AUTHORIZED_PERFORMER_UPLOAD") {
    return "AUTHORIZED_SERVER_STREAM";
  }
  return "SYNCHRONIZED_LOCAL_PLAYBACK";
}

/**
 * Service-level enforcement of TMI Final Jukebox Network Audio Scope Law:
 * - Private calls (`IN_CALL_JUKEBOX_TOOLBAR`) can freely control `PRIVATE_GROUP_MEDIA`
 *   without a physical jukebox, even while inside a Lobby or Lounge, and NEVER leak to
 *   or alter `LOBBY_JUKEBOX_AUDIO`, `LOUNGE_JUKEBOX_AUDIO`, or `LIVE_PERFORMANCE_AUDIO`.
 * - Fan Avatar Lobbies (`LOBBY_JUKEBOX_AUDIO`) REQUIRE `PHYSICAL_3D_JUKEBOX_PROP` + role check.
 * - Lounges (`LOUNGE_JUKEBOX_AUDIO`) REQUIRE `LOUNGE_DESIGNATED_JUKEBOX_CONTROL` + role check
 *   (no 3D avatar required because Lounges use video-panel presence).
 * - Concerts (`LIVE_PERFORMANCE_AUDIO`) protect the performer's broadcast.
 */
export function authorizeScopedJukeboxAction(input: {
  targetScope: JukeboxAudioScope;
  entryPoint: JukeboxControlEntryPoint;
  roomKind: JukeboxRoomKind;
  role: JukeboxBroadcastRole;
  isCallParticipant: boolean;
  origin?: JukeboxMediaOrigin;
  explicitRestreamLicenseVerified?: boolean;
}): ScopedJukeboxAuthorizationDecision {
  const deliveryMode = resolveSafeJukeboxDeliveryMode({
    origin: input.origin ?? "TMI_OWNED_CATALOG",
    explicitRestreamLicenseVerified: input.explicitRestreamLicenseVerified,
  });

  // 1. Private Call / Group Chat Shared Listening (`PRIVATE_GROUP_MEDIA`)
  if (input.targetScope === "PRIVATE_GROUP_MEDIA") {
    if (!input.isCallParticipant) {
      return {
        allowed: false,
        reason: "NOT_IN_PRIVATE_CALL_SESSION",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: false,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    return {
      allowed: true,
      targetScope: "PRIVATE_GROUP_MEDIA",
      entryPoint: input.entryPoint,
      deliveryMode,
      leaksToPublicRoom: false,
      altersRoomJukeboxState: false,
      entersPerformerBroadcast: false,
      physicalJukeboxRequired: false,
      NEW_BROADCAST_ENGINE_CREATED: false,
    };
  }

  // 2. Public Fan Avatar Lobby Jukebox (`LOBBY_JUKEBOX_AUDIO`)
  if (input.targetScope === "LOBBY_JUKEBOX_AUDIO") {
    if (input.entryPoint === "IN_CALL_JUKEBOX_TOOLBAR") {
      return {
        allowed: false,
        reason: "PRIVATE_CALL_CANNOT_ALTER_PUBLIC_ROOM_JUKEBOX",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: true,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    if (input.entryPoint !== "PHYSICAL_3D_JUKEBOX_PROP") {
      return {
        allowed: false,
        reason: "PHYSICAL_3D_JUKEBOX_REQUIRED_FOR_LOBBY",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: true,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    const compat = getJukeboxCompatibility(input.roomKind);
    if (!compat.broadcastAllowed || compat.performanceSourceProtected) {
      return {
        allowed: false,
        reason: compat.performanceSourceProtected
          ? "PERFORMANCE_SOURCE_PROTECTED"
          : "ROOM_BROADCAST_NOT_ALLOWED",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: true,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    if (!canControlJukeboxBroadcast(input.role)) {
      return {
        allowed: false,
        reason: "UNAUTHORIZED_JUKEBOX_CONTROL",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: true,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    return {
      allowed: true,
      targetScope: "LOBBY_JUKEBOX_AUDIO",
      entryPoint: "PHYSICAL_3D_JUKEBOX_PROP",
      deliveryMode,
      leaksToPublicRoom: false,
      altersRoomJukeboxState: true,
      entersPerformerBroadcast: false,
      physicalJukeboxRequired: true,
      NEW_BROADCAST_ENGINE_CREATED: false,
    };
  }

  // 3. Public Lounge Jukebox (`LOUNGE_JUKEBOX_AUDIO`) — Video-panel presence, designated Lounge control
  if (input.targetScope === "LOUNGE_JUKEBOX_AUDIO") {
    if (input.entryPoint === "IN_CALL_JUKEBOX_TOOLBAR") {
      return {
        allowed: false,
        reason: "PRIVATE_CALL_CANNOT_ALTER_PUBLIC_ROOM_JUKEBOX",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: false,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    if (input.entryPoint !== "LOUNGE_DESIGNATED_JUKEBOX_CONTROL") {
      return {
        allowed: false,
        reason: "LOUNGE_JUKEBOX_CONTROL_REQUIRED",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: false,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    const compat = getJukeboxCompatibility(input.roomKind);
    if (!compat.broadcastAllowed || compat.performanceSourceProtected) {
      return {
        allowed: false,
        reason: compat.performanceSourceProtected
          ? "PERFORMANCE_SOURCE_PROTECTED"
          : "ROOM_BROADCAST_NOT_ALLOWED",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: false,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    if (!canControlJukeboxBroadcast(input.role)) {
      return {
        allowed: false,
        reason: "UNAUTHORIZED_JUKEBOX_CONTROL",
        targetScope: input.targetScope,
        entryPoint: input.entryPoint,
        deliveryMode,
        leaksToPublicRoom: false,
        altersRoomJukeboxState: false,
        entersPerformerBroadcast: false,
        physicalJukeboxRequired: false,
        NEW_BROADCAST_ENGINE_CREATED: false,
      };
    }
    return {
      allowed: true,
      targetScope: "LOUNGE_JUKEBOX_AUDIO",
      entryPoint: "LOUNGE_DESIGNATED_JUKEBOX_CONTROL",
      deliveryMode,
      leaksToPublicRoom: false,
      altersRoomJukeboxState: true,
      entersPerformerBroadcast: false,
      physicalJukeboxRequired: false,
      NEW_BROADCAST_ENGINE_CREATED: false,
    };
  }

  // 4. Live Performance / Concert (`LIVE_PERFORMANCE_AUDIO`) — Always protected from jukebox override
  return {
    allowed: false,
    reason: "PERFORMANCE_SOURCE_PROTECTED",
    targetScope: input.targetScope,
    entryPoint: input.entryPoint,
    deliveryMode,
    leaksToPublicRoom: false,
    altersRoomJukeboxState: false,
    entersPerformerBroadcast: false,
    physicalJukeboxRequired: false,
    NEW_BROADCAST_ENGINE_CREATED: false,
  };
}

export interface JukeboxCrossAccountSyncFrame {
  sessionId: string;
  senderAccountId: string;
  targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">;
  entryPoint: JukeboxControlEntryPoint;
  roomKind: JukeboxRoomKind;
  role: JukeboxBroadcastRole;
  isCallParticipant: boolean;
  activeTrackIndex: number;
  playing: boolean;
  positionSec: number;
  serverClockMs: number;
  queue?: JukeboxQueueTrack[];
  djPermissionMode?: JukeboxDjPermissionMode;
  /**
   * Authoritative server sync metadata (Claude transport contract):
   * - messageId: unique frame id for duplicate-message suppression
   * - sequenceRevision: monotonic playback sequence number per scope
   * - queueRevision: monotonic queue revision number per scope
   * - serverVerified: true when senderAccountId / role / isCallParticipant were derived by server auth
   * - requireServerVerified: when true, rejects frames that were not verified by server auth
   */
  messageId?: string;
  sequenceRevision?: number;
  queueRevision?: number;
  serverVerified?: boolean;
  requireServerVerified?: boolean;
}

export interface ScopedTrackPlaybackSlice {
  scope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">;
  activeTrackIndex: number;
  playing: boolean;
  positionSec: number;
  lastSyncedAtMs: number;
  sequenceRevision: number;
  queueRevision: number;
  queue: JukeboxQueueTrack[];
  djPermissionMode: JukeboxDjPermissionMode;
  activeDjUserId: string;
}

const DEFAULT_AUTHORIZED_QUEUE: JukeboxQueueTrack[] = [
  {
    mediaId: "tmi-jb-track-001",
    jukeboxNumber: 1,
    jukeboxCode: `#${formatJukeboxNumber(1)}`,
    title: "Neon Skyline (TMI Original)",
    creator: "Record Ralph & The Foundry Crew",
    mediaType: "SONG",
    durationSec: 212,
    origin: "TMI_OWNED_CATALOG",
    deliveryMode: "AUTHORIZED_SERVER_STREAM",
    addedByUserId: "host",
    addedByName: "Host",
    votes: 4,
  },
  {
    mediaId: "tmi-jb-track-002",
    jukeboxNumber: 2,
    jukeboxCode: `#${formatJukeboxNumber(2)}`,
    title: "Midnight Cypher Session",
    creator: "Berntout Collective",
    mediaType: "PLAYLIST",
    durationSec: 196,
    origin: "TMI_OWNED_CATALOG",
    deliveryMode: "SYNCHRONIZED_LOCAL_PLAYBACK",
    addedByUserId: "host",
    addedByName: "Host",
    votes: 2,
  },
  {
    mediaId: "tmi-jb-track-003",
    jukeboxNumber: 3,
    jukeboxCode: `#${formatJukeboxNumber(3)}`,
    title: "Velvet Concourse Live Visual",
    creator: "TMI Premiere Studio",
    mediaType: "VIDEO",
    durationSec: 245,
    origin: "AUTHORIZED_PERFORMER_UPLOAD",
    deliveryMode: "SYNCHRONIZED_LOCAL_PLAYBACK",
    addedByUserId: "host",
    addedByName: "Host",
    votes: 1,
  },
];

function createInitialSlice(
  scope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">,
): ScopedTrackPlaybackSlice {
  return {
    scope,
    activeTrackIndex: 0,
    playing: false,
    positionSec: 0,
    lastSyncedAtMs: Date.now(),
    sequenceRevision: 0,
    queueRevision: 0,
    queue: DEFAULT_AUTHORIZED_QUEUE.map((t) => ({ ...t })),
    djPermissionMode: "COLLABORATIVE_QUEUE",
    activeDjUserId: "self",
  };
}

const seenSyncMessageIds = new Set<string>();

// ============================================================================
// SERVER-SIDE IDENTITY & MEMBERSHIP VALIDATION (NO CLIENT SPOOFING)
// ============================================================================

export interface JukeboxServerSessionMembership {
  sessionId: string;
  roomKind: JukeboxRoomKind;
  /** Map of authenticated accountId -> authoritative server role in this room/call */
  memberRoles: Record<string, JukeboxBroadcastRole>;
  /** Set of authenticated accountIds actively connected to the private call session */
  activeCallParticipantIds: string[];
  /** Set of authenticated accountIds verified by server spatial state as standing near the 3D jukebox prop */
  verifiedNearPhysical3DJukeboxIds?: string[];
}

export interface ServerJukeboxFrameValidationResult {
  allowed: boolean;
  reason?: string;
  verifiedFrame: JukeboxCrossAccountSyncFrame | null;
}

/**
 * Authoritative server-side gate before broadcasting any cross-account Jukebox sync frame.
 * Derives `senderAccountId`, `role`, `roomKind`, `isCallParticipant`, and 3D physical jukebox
 * proximity strictly from authenticated server session state — never trusting client-supplied
 * role or participation claims.
 */
export function validateAndMintServerVerifiedJukeboxFrame(input: {
  authenticatedAccountId: string | null | undefined;
  membership: JukeboxServerSessionMembership;
  clientPayload: {
    claimedSenderAccountId?: string;
    claimedRole?: JukeboxBroadcastRole;
    claimedIsCallParticipant?: boolean;
    targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">;
    entryPoint: JukeboxControlEntryPoint;
    activeTrackIndex: number;
    playing: boolean;
    positionSec: number;
    queue?: JukeboxQueueTrack[];
    djPermissionMode?: JukeboxDjPermissionMode;
    messageId: string;
    sequenceRevision: number;
    queueRevision: number;
  };
  serverNowMs?: number;
}): ServerJukeboxFrameValidationResult {
  if (!input.authenticatedAccountId) {
    return {
      allowed: false,
      reason: "UNAUTHENTICATED_SESSION",
      verifiedFrame: null,
    };
  }

  // Reject explicit sender spoofing attempts
  if (
    input.clientPayload.claimedSenderAccountId &&
    input.clientPayload.claimedSenderAccountId !== input.authenticatedAccountId
  ) {
    return {
      allowed: false,
      reason: "CLIENT_SENDER_SPOOF_REJECTED",
      verifiedFrame: null,
    };
  }

  const serverRole = input.membership.memberRoles[input.authenticatedAccountId];
  if (!serverRole) {
    return {
      allowed: false,
      reason: "NOT_A_SESSION_MEMBER",
      verifiedFrame: null,
    };
  }

  const serverIsCallParticipant = input.membership.activeCallParticipantIds.includes(
    input.authenticatedAccountId,
  );

  // If targeting LOBBY_JUKEBOX_AUDIO, server must also verify 3D jukebox proximity if tracked
  if (
    input.clientPayload.targetScope === "LOBBY_JUKEBOX_AUDIO" &&
    Array.isArray(input.membership.verifiedNearPhysical3DJukeboxIds) &&
    !input.membership.verifiedNearPhysical3DJukeboxIds.includes(input.authenticatedAccountId)
  ) {
    return {
      allowed: false,
      reason: "SERVER_PHYSICAL_JUKEBOX_PROXIMITY_FAILED",
      verifiedFrame: null,
    };
  }

  // Run scope + role authorization using SERVER-DERIVED role, roomKind, and call participation
  const authDecision = authorizeScopedJukeboxAction({
    targetScope: input.clientPayload.targetScope,
    entryPoint: input.clientPayload.entryPoint,
    roomKind: input.membership.roomKind,
    role: serverRole,
    isCallParticipant: serverIsCallParticipant,
  });

  if (!authDecision.allowed) {
    return {
      allowed: false,
      reason: authDecision.reason ?? "UNAUTHORIZED_JUKEBOX_CONTROL",
      verifiedFrame: null,
    };
  }

  const verifiedFrame: JukeboxCrossAccountSyncFrame = {
    sessionId: input.membership.sessionId,
    senderAccountId: input.authenticatedAccountId,
    targetScope: input.clientPayload.targetScope,
    entryPoint: input.clientPayload.entryPoint,
    roomKind: input.membership.roomKind,
    role: serverRole,
    isCallParticipant: serverIsCallParticipant,
    activeTrackIndex: input.clientPayload.activeTrackIndex,
    playing: input.clientPayload.playing,
    positionSec: input.clientPayload.positionSec,
    serverClockMs: input.serverNowMs ?? Date.now(),
    queue: input.clientPayload.queue,
    djPermissionMode: input.clientPayload.djPermissionMode,
    messageId: input.clientPayload.messageId,
    sequenceRevision: input.clientPayload.sequenceRevision,
    queueRevision: input.clientPayload.queueRevision,
    serverVerified: true,
    requireServerVerified: true,
  };

  return {
    allowed: true,
    verifiedFrame,
  };
}

export interface ScopedJukeboxNetworkState {
  /** Isolated playback slices per scope so private call music never alters lobby/lounge music */
  privateGroupMedia: ScopedTrackPlaybackSlice;
  lobbyJukeboxAudio: ScopedTrackPlaybackSlice;
  loungeJukeboxAudio: ScopedTrackPlaybackSlice;

  /** Individual listener choices (local to this participant — never disconnects from call) */
  joinedPrivateListening: boolean;
  localPrivateMusicMuted: boolean;
  localRoomJukeboxMuted: boolean;

  /** Independent 4-scope + mic monitor volumes (0..1) */
  voiceVolume: number; // PRIVATE_CALL_AUDIO
  privateMusicVolume: number; // PRIVATE_GROUP_MEDIA
  roomJukeboxVolume: number; // LOBBY_JUKEBOX_AUDIO / LOUNGE_JUKEBOX_AUDIO
  livePerformanceVolume: number; // LIVE_PERFORMANCE_AUDIO
  micMonitorVolume: number;

  /** Intercom & Concert priority behavior */
  voiceDuckingEnabled: boolean;
  concertPriorityBehavior: ConcertJukeboxPriorityBehavior;
  inLiveConcert: boolean;
  lastAuthDecision: ScopedJukeboxAuthorizationDecision | null;

  // Actions
  triggerScopedPlaybackAction: (input: {
    targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">;
    entryPoint: JukeboxControlEntryPoint;
    roomKind: JukeboxRoomKind;
    role: JukeboxBroadcastRole;
    isCallParticipant: boolean;
    action: "PLAY" | "PAUSE" | "TOGGLE" | "NEXT" | "PREV" | "SEEK";
    seekSec?: number;
    selectIndex?: number;
  }) => ScopedJukeboxAuthorizationDecision;
  enqueueAuthorizedTrack: (input: {
    targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">;
    entryPoint: JukeboxControlEntryPoint;
    roomKind: JukeboxRoomKind;
    role: JukeboxBroadcastRole;
    isCallParticipant: boolean;
    title: string;
    creator: string;
    mediaType?: "SONG" | "PLAYLIST" | "ALBUM" | "VIDEO";
    origin?: JukeboxMediaOrigin;
    addedByUserId?: string;
    addedByName?: string;
  }) => ScopedJukeboxAuthorizationDecision;
  voteQueueTrack: (
    targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">,
    mediaId: string,
  ) => void;
  setDjPermissionMode: (
    targetScope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">,
    mode: JukeboxDjPermissionMode,
  ) => void;
  setJoinedPrivateListening: (joined: boolean) => void;
  setLocalPrivateMusicMuted: (muted: boolean) => void;
  setLocalRoomJukeboxMuted: (muted: boolean) => void;
  setScopeVolume: (
    scope:
      | "PRIVATE_CALL_AUDIO"
      | "PRIVATE_GROUP_MEDIA"
      | "LOBBY_JUKEBOX_AUDIO"
      | "LOUNGE_JUKEBOX_AUDIO"
      | "LIVE_PERFORMANCE_AUDIO"
      | "MIC_MONITOR",
    volume: number,
  ) => void;
  setVoiceDuckingEnabled: (enabled: boolean) => void;
  setConcertPriorityBehavior: (behavior: ConcertJukeboxPriorityBehavior) => void;
  enterOrLeaveLiveConcert: (inConcert: boolean) => void;
  /**
   * Claude Cross-Account Sync Receiver:
   * Validates scope + entry-point authorization on inbound remote sync frames
   * (Daily app-message / room WebSocket) before mutating the target scope slice.
   */
  applyRemoteScopedSyncFrame: (frame: JukeboxCrossAccountSyncFrame) => ScopedJukeboxAuthorizationDecision;
  resetScopedJukeboxForTests: () => void;
}

function sliceKeyForScope(
  scope: Extract<JukeboxAudioScope, "PRIVATE_GROUP_MEDIA" | "LOBBY_JUKEBOX_AUDIO" | "LOUNGE_JUKEBOX_AUDIO">,
): "privateGroupMedia" | "lobbyJukeboxAudio" | "loungeJukeboxAudio" {
  if (scope === "PRIVATE_GROUP_MEDIA") return "privateGroupMedia";
  if (scope === "LOBBY_JUKEBOX_AUDIO") return "lobbyJukeboxAudio";
  return "loungeJukeboxAudio";
}

export const useScopedJukeboxNetworkStore = create<ScopedJukeboxNetworkState>((set, get) => ({
  privateGroupMedia: createInitialSlice("PRIVATE_GROUP_MEDIA"),
  lobbyJukeboxAudio: createInitialSlice("LOBBY_JUKEBOX_AUDIO"),
  loungeJukeboxAudio: createInitialSlice("LOUNGE_JUKEBOX_AUDIO"),

  joinedPrivateListening: true,
  localPrivateMusicMuted: false,
  localRoomJukeboxMuted: false,

  voiceVolume: 0.9,
  privateMusicVolume: 0.75,
  roomJukeboxVolume: 0.7,
  livePerformanceVolume: 0.9,
  micMonitorVolume: 0.0,

  voiceDuckingEnabled: true,
  concertPriorityBehavior: "DUCK",
  inLiveConcert: false,
  lastAuthDecision: null,

  triggerScopedPlaybackAction: (input) => {
    const decision = authorizeScopedJukeboxAction({
      targetScope: input.targetScope,
      entryPoint: input.entryPoint,
      roomKind: input.roomKind,
      role: input.role,
      isCallParticipant: input.isCallParticipant,
    });
    if (!decision.allowed) {
      set({ lastAuthDecision: decision });
      return decision;
    }

    const key = sliceKeyForScope(input.targetScope);
    const current = get()[key];
    const queueLen = Math.max(1, current.queue.length);
    let nextIndex =
      typeof input.selectIndex === "number"
        ? Math.max(0, Math.min(queueLen - 1, input.selectIndex))
        : current.activeTrackIndex;
    let nextPlaying = current.playing;
    let nextPos = current.positionSec;

    if (input.action === "PLAY") nextPlaying = true;
    else if (input.action === "PAUSE") nextPlaying = false;
    else if (input.action === "TOGGLE") nextPlaying = !current.playing;
    else if (input.action === "NEXT") {
      nextIndex = (current.activeTrackIndex + 1) % queueLen;
      nextPos = 0;
      nextPlaying = true;
    } else if (input.action === "PREV") {
      nextIndex = (current.activeTrackIndex - 1 + queueLen) % queueLen;
      nextPos = 0;
      nextPlaying = true;
    } else if (input.action === "SEEK" && typeof input.seekSec === "number") {
      nextPos = Math.max(0, input.seekSec);
    }

    set({
      [key]: {
        ...current,
        activeTrackIndex: nextIndex,
        playing: nextPlaying,
        positionSec: nextPos,
        lastSyncedAtMs: Date.now(),
      },
      lastAuthDecision: decision,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:jukebox-scoped-sync", {
          detail: {
            scope: input.targetScope,
            entryPoint: input.entryPoint,
            action: input.action,
            activeTrackIndex: nextIndex,
            playing: nextPlaying,
            positionSec: nextPos,
          },
        }),
      );
    }

    return decision;
  },

  enqueueAuthorizedTrack: (input) => {
    const decision = authorizeScopedJukeboxAction({
      targetScope: input.targetScope,
      entryPoint: input.entryPoint,
      roomKind: input.roomKind,
      role: input.role,
      isCallParticipant: input.isCallParticipant,
      origin: input.origin ?? "TMI_OWNED_CATALOG",
    });
    if (!decision.allowed) {
      set({ lastAuthDecision: decision });
      return decision;
    }

    const key = sliceKeyForScope(input.targetScope);
    const current = get()[key];
    const nextNumber = current.queue.length + 1;
    const newTrack: JukeboxQueueTrack = {
      mediaId: `tmi-jb-track-${formatJukeboxNumber(nextNumber)}-${Date.now()}`,
      jukeboxNumber: nextNumber,
      jukeboxCode: `#${formatJukeboxNumber(nextNumber)}`,
      title: input.title,
      creator: input.creator,
      mediaType: input.mediaType ?? "SONG",
      durationSec: 200,
      origin: input.origin ?? "TMI_OWNED_CATALOG",
      deliveryMode: decision.deliveryMode,
      addedByUserId: input.addedByUserId ?? "self",
      addedByName: input.addedByName ?? "You",
      votes: 1,
    };

    set({
      [key]: {
        ...current,
        queue: [...current.queue, newTrack],
        lastSyncedAtMs: Date.now(),
      },
      lastAuthDecision: decision,
    });

    return decision;
  },

  voteQueueTrack: (targetScope, mediaId) => {
    const key = sliceKeyForScope(targetScope);
    const current = get()[key];
    const updated = current.queue
      .map((t) => (t.mediaId === mediaId ? { ...t, votes: t.votes + 1 } : t))
      .sort((a, b) => b.votes - a.votes);
    set({
      [key]: {
        ...current,
        queue: updated,
      },
    });
  },

  setDjPermissionMode: (targetScope, mode) => {
    const key = sliceKeyForScope(targetScope);
    const current = get()[key];
    set({
      [key]: {
        ...current,
        djPermissionMode: mode,
      },
    });
  },

  setJoinedPrivateListening: (joined) => set({ joinedPrivateListening: joined }),

  setLocalPrivateMusicMuted: (muted) => {
    set({ localPrivateMusicMuted: muted });
    useCanonicalAudioMixerStore.getState().setBusMute("SHARE", muted);
  },

  setLocalRoomJukeboxMuted: (muted) => set({ localRoomJukeboxMuted: muted }),

  setScopeVolume: (scope, rawVolume) => {
    const v = Math.max(0, Math.min(1, rawVolume));
    if (scope === "PRIVATE_CALL_AUDIO") {
      set({ voiceVolume: v });
      useCanonicalAudioMixerStore.getState().setBusVolume("VOICE", v);
      monitorMixController.setMonitorGain("MONITOR_2", v);
    } else if (scope === "PRIVATE_GROUP_MEDIA") {
      set({ privateMusicVolume: v });
      useCanonicalAudioMixerStore.getState().setBusVolume("SHARE", v);
    } else if (scope === "LOBBY_JUKEBOX_AUDIO" || scope === "LOUNGE_JUKEBOX_AUDIO") {
      set({ roomJukeboxVolume: v });
    } else if (scope === "LIVE_PERFORMANCE_AUDIO") {
      set({ livePerformanceVolume: v });
      useCanonicalAudioMixerStore.getState().setBusVolume("PROGRAM", v);
      monitorMixController.setMonitorGain("MONITOR_1", v);
    } else if (scope === "MIC_MONITOR") {
      set({ micMonitorVolume: v });
    }
  },

  setVoiceDuckingEnabled: (enabled) => set({ voiceDuckingEnabled: enabled }),

  setConcertPriorityBehavior: (behavior) => set({ concertPriorityBehavior: behavior }),

  enterOrLeaveLiveConcert: (inConcert) => {
    const state = get();
    if (inConcert) {
      if (state.concertPriorityBehavior === "PAUSE") {
        set({
          inLiveConcert: true,
          privateGroupMedia: {
            ...state.privateGroupMedia,
            playing: false,
          },
        });
      } else {
        const duckedVol = Math.min(state.privateMusicVolume, 0.25);
        useCanonicalAudioMixerStore.getState().setBusVolume("SHARE", duckedVol);
        set({
          inLiveConcert: true,
          privateMusicVolume: duckedVol,
        });
      }
    } else {
      set({ inLiveConcert: false });
    }
  },

  applyRemoteScopedSyncFrame: (frame) => {
    const decision = authorizeScopedJukeboxAction({
      targetScope: frame.targetScope,
      entryPoint: frame.entryPoint,
      roomKind: frame.roomKind,
      role: frame.role,
      isCallParticipant: frame.isCallParticipant,
    });
    if (!decision.allowed) {
      set({ lastAuthDecision: decision });
      return decision;
    }

    // Security guard: when requireServerVerified is true, reject frames lacking serverVerified=true
    if (frame.requireServerVerified && frame.serverVerified !== true) {
      const rejected: ScopedJukeboxAuthorizationDecision = {
        ...decision,
        allowed: false,
        reason: "UNVERIFIED_CLIENT_FRAME_REJECTED",
      };
      set({ lastAuthDecision: rejected });
      return rejected;
    }

    // Duplicate messageId suppression
    if (frame.messageId) {
      if (seenSyncMessageIds.has(frame.messageId)) {
        const dup: ScopedJukeboxAuthorizationDecision = {
          ...decision,
          allowed: false,
          reason: "DUPLICATE_SYNC_MESSAGE_ID",
        };
        set({ lastAuthDecision: dup });
        return dup;
      }
      seenSyncMessageIds.add(frame.messageId);
    }

    const key = sliceKeyForScope(frame.targetScope);
    const current = get()[key];

    // Stale sequenceRevision rejection
    if (
      typeof frame.sequenceRevision === "number" &&
      frame.sequenceRevision <= current.sequenceRevision
    ) {
      const staleSeq: ScopedJukeboxAuthorizationDecision = {
        ...decision,
        allowed: false,
        reason: "STALE_SEQUENCE_REVISION",
      };
      set({ lastAuthDecision: staleSeq });
      return staleSeq;
    }

    // Stale queueRevision rejection
    if (
      typeof frame.queueRevision === "number" &&
      frame.queueRevision < current.queueRevision
    ) {
      const staleQueue: ScopedJukeboxAuthorizationDecision = {
        ...decision,
        allowed: false,
        reason: "STALE_QUEUE_REVISION",
      };
      set({ lastAuthDecision: staleQueue });
      return staleQueue;
    }

    const nextQueue = Array.isArray(frame.queue) && frame.queue.length > 0 ? frame.queue : current.queue;
    const clampedIdx = Math.max(0, Math.min(nextQueue.length - 1, frame.activeTrackIndex));

    set({
      [key]: {
        ...current,
        activeTrackIndex: clampedIdx,
        playing: frame.playing,
        positionSec: Math.max(0, frame.positionSec),
        lastSyncedAtMs: frame.serverClockMs || Date.now(),
        sequenceRevision:
          typeof frame.sequenceRevision === "number"
            ? frame.sequenceRevision
            : current.sequenceRevision + 1,
        queueRevision:
          typeof frame.queueRevision === "number"
            ? frame.queueRevision
            : current.queueRevision,
        queue: nextQueue,
        djPermissionMode: frame.djPermissionMode ?? current.djPermissionMode,
      },
      lastAuthDecision: decision,
    });

    return decision;
  },

  resetScopedJukeboxForTests: () => {
    seenSyncMessageIds.clear();
    set({
      privateGroupMedia: createInitialSlice("PRIVATE_GROUP_MEDIA"),
      lobbyJukeboxAudio: createInitialSlice("LOBBY_JUKEBOX_AUDIO"),
      loungeJukeboxAudio: createInitialSlice("LOUNGE_JUKEBOX_AUDIO"),
      joinedPrivateListening: true,
      localPrivateMusicMuted: false,
      localRoomJukeboxMuted: false,
      voiceVolume: 0.9,
      privateMusicVolume: 0.75,
      roomJukeboxVolume: 0.7,
      livePerformanceVolume: 0.9,
      micMonitorVolume: 0.0,
      voiceDuckingEnabled: true,
      concertPriorityBehavior: "DUCK",
      inLiveConcert: false,
      lastAuthDecision: null,
    });
  },
}));

