/**
 * Phase A.5 — Fan Lobby Presence Certification (Rule 20 / Rule 8).
 *
 * Single authoritative presence shape for Fan Lobby participants.
 * Social rooms (Fan Lobby / Playlist Lounge / Rehearsal) share this model via
 * SocialRoomPresence — same seat anchors, sit/stand, free-roam. No second seating engine.
 * WebRTC (Phase B) must *consume* this — never invent a parallel presence model.
 *
 * Source of truth at runtime: `/api/rooms/lobby-sync` + `useLobbyPresenceSync`.
 * This module is the typed contract + thin lookup over that sync snapshot.
 * Do NOT create a separate Presence Registry engine.
 */

import type { LobbyAvatarLocomotion } from "./FanLobbySeatAssigner";

/** Locomotion / navigation — already used by FanLobbySeatAssigner. */
export type FanLobbyNavigationState = LobbyAvatarLocomotion;

/** Social room modes that reuse Fan Lobby seating / free-roam. */
export type SocialRoomType = "FAN_LOBBY" | "PLAYLIST_LOUNGE" | "REHEARSAL_ROOM";

/**
 * RoomAuthority — who controls skins / locked playlist / host tools.
 * Tier alone ≠ control in someone else's HUMAN_HOSTED room (Gold+ may host their own).
 */
export type RoomAuthorityMode = "BOT_AUTOMATED" | "HUMAN_HOSTED";

export interface RoomAuthority {
  mode: RoomAuthorityMode;
  /** Required when mode === HUMAN_HOSTED */
  hostUserId?: string | null;
  /** Locked skin id when BOT_AUTOMATED (or host-locked). */
  lockedSkinId?: string | null;
  /** Locked playlist id when BOT_AUTOMATED. */
  lockedPlaylistId?: string | null;
  /** Minimum host tier hint — eligibility to CREATE/host, not to seize another's room. */
  hostMinTier?: "GOLD" | "PLATINUM" | "DIAMOND";
}

export function canControlRoom(
  authority: RoomAuthority,
  actorUserId: string,
  opts?: { isStaff?: boolean },
): boolean {
  if (opts?.isStaff) return true;
  if (authority.mode === "BOT_AUTOMATED") return false;
  // Provisional host: HUMAN_HOSTED with no hostUserId yet → first local actor may control (stub).
  if (!authority.hostUserId) return true;
  return authority.hostUserId === actorUserId;
}

/**
 * PartyMigrationIntent — consent-based group migrate.
 * Do NOT package inventory or WebRTC streams; destination re-resolves presence/media.
 * "Everybody take a seat" is gather UX — seating is not a security gate.
 */
export type PartyMigrationConsentState = "pending" | "accepted" | "declined" | "expired";

export interface PartyMigrationMember {
  userId: string;
  consent: PartyMigrationConsentState;
}

export interface PartyMigrationIntent {
  intentId: string;
  fromRoomId: string;
  toRoomId: string;
  toRoomType: SocialRoomType;
  initiatedBy: string;
  /** Consent list — migrate only accepted members. */
  members: PartyMigrationMember[];
  createdAt: number;
  expiresAt: number;
  /**
   * Gather UX flag — destination may prompt "everybody take a seat".
   * Not an access-control gate.
   */
  gatherAtDestination: boolean;
  /** Explicitly empty — inventory / media tracks must re-resolve at destination. */
  packagedInventoryIds: never[];
  packagedMediaTrackIds: never[];
}

export function createPartyMigrationIntent(input: {
  fromRoomId: string;
  toRoomId: string;
  toRoomType: SocialRoomType;
  initiatedBy: string;
  memberIds: string[];
  gatherAtDestination?: boolean;
  ttlMs?: number;
}): PartyMigrationIntent {
  const now = Date.now();
  return {
    intentId: `pmi-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    fromRoomId: input.fromRoomId,
    toRoomId: input.toRoomId,
    toRoomType: input.toRoomType,
    initiatedBy: input.initiatedBy,
    members: input.memberIds.map((userId) => ({
      userId,
      consent: userId === input.initiatedBy ? "accepted" : "pending",
    })),
    createdAt: now,
    expiresAt: now + (input.ttlMs ?? 60_000),
    gatherAtDestination: input.gatherAtDestination ?? true,
    packagedInventoryIds: [],
    packagedMediaTrackIds: [],
  };
}

export function defaultRoomAuthority(roomType: SocialRoomType, hostUserId?: string | null): RoomAuthority {
  if (hostUserId) {
    return {
      mode: "HUMAN_HOSTED",
      hostUserId,
      hostMinTier: "GOLD",
      lockedSkinId: null,
      lockedPlaylistId: null,
    };
  }
  // Bot-automated default for official lounges without a human host claim.
  return {
    mode: "BOT_AUTOMATED",
    hostUserId: null,
    lockedSkinId: roomType === "PLAYLIST_LOUNGE" ? "lobby-chill" : "lobby-cinema",
    lockedPlaylistId: null,
    hostMinTier: "GOLD",
  };
}

/**
 * Certified Fan Lobby presence record.
 * Maps 1:1 to lobby-sync payload fields (plus seatAnchor codec packing).
 */
export interface FanLobbyPresence {
  venueId: string;
  roomId: string;
  userId: string;
  /** Avatar identity — same as userId until a real avatar bind exists. */
  avatarId: string;
  userName: string;
  emoji: string;
  x: number;
  y: number;
  /** Skin id (unpacked from activeTheme codec). */
  activeTheme: string;
  propTrigger: string;
  /** Chair claim — packed into activeTheme via lobbySeatCodec. */
  seatAnchorId: string | null;
  navigationState: FanLobbyNavigationState;
  /** Derived from SeatAnchor.conversationGroupId when seated; else null. */
  conversationGroupId: string | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  isSpeaking: boolean;
  /** Same signal as isSpeaking until room-level speaker arbitration exists. */
  activeSpeaker: boolean;
  /** Optional inventory bind — omit/null until loadout wiring exists. */
  loadoutId?: string | null;
}

/**
 * SocialRoomPresence — FanLobbyPresence + roomType / authority.
 * Playlist Lounges and Rehearsal Rooms reuse the same seat/roam runtime.
 *
 * Phase B media binding point: head panels / SFU tracks bind TO this record
 * (userId + mic/camera/isSpeaking). Do not invent presence from WebRTC.
 */
export interface SocialRoomPresence extends FanLobbyPresence {
  roomType: SocialRoomType;
  authority: RoomAuthority;
  /** Phase B: Daily session_id when bound via useLobbyPeerMediaSession (not a second presence store). */
  mediaParticipantId?: string | null;
}

export function toSocialRoomPresence(
  presence: FanLobbyPresence,
  roomType: SocialRoomType = "FAN_LOBBY",
  authority?: RoomAuthority,
): SocialRoomPresence {
  return {
    ...presence,
    roomType,
    authority: authority ?? defaultRoomAuthority(roomType),
    mediaParticipantId: null,
  };
}

/**
 * Sync/UI participant — certified presence plus legacy aliases still read by
 * LobbyFreeRoamAvatars / FanLobbyVenue (seatId, isSeated, locomotion, hasCameraOn).
 */
export interface LobbyParticipant extends FanLobbyPresence {
  /** @deprecated use seatAnchorId */
  seatId: string | null;
  /** @deprecated use navigationState === "SEATED" */
  isSeated: boolean;
  /** @deprecated use navigationState */
  locomotion: FanLobbyNavigationState;
  /** @deprecated use cameraEnabled */
  hasCameraOn: boolean;
}

/** Wire / API body fragment (incoming or row-shaped). */
export type FanLobbyPresenceWire = Partial<FanLobbyPresence> & {
  userId: string;
  roomId?: string;
  venueId?: string;
  seatId?: string | null;
  isSeated?: boolean;
  locomotion?: FanLobbyNavigationState;
  hasCameraOn?: boolean;
  activeTheme?: string;
};

/** In-memory snapshot filled by useLobbyPresenceSync — not a registry engine. */
const presenceSnapshot = new Map<string, LobbyParticipant>();

export function publishFanLobbyPresence(presence: LobbyParticipant): void {
  presenceSnapshot.set(presence.userId, presence);
}

export function publishFanLobbyPresenceBatch(list: LobbyParticipant[]): void {
  for (const p of list) {
    presenceSnapshot.set(p.userId, p);
  }
}

export function clearFanLobbyPresence(userId: string): void {
  presenceSnapshot.delete(userId);
}

/**
 * Thin accessor for UI / future WebRTC consumers.
 * Returns the latest sync-published presence for userId, or null.
 */
export function getFanLobbyPresence(userId: string): LobbyParticipant | null {
  return presenceSnapshot.get(userId) ?? null;
}

export function listFanLobbyPresence(roomId?: string): LobbyParticipant[] {
  const all = Array.from(presenceSnapshot.values());
  if (!roomId) return all;
  return all.filter((p) => p.roomId === roomId);
}

export function withLegacyAliases(p: FanLobbyPresence): LobbyParticipant {
  const seated = p.navigationState === "SEATED" && Boolean(p.seatAnchorId);
  return {
    ...p,
    seatId: p.seatAnchorId,
    isSeated: seated,
    locomotion: p.navigationState,
    hasCameraOn: p.cameraEnabled,
  };
}

/**
 * Normalize a lobby-sync participant row / request body into certified shape.
 * Prefers explicit certified fields; falls back to legacy aliases + codec unpack.
 */
export function normalizeFanLobbyPresence(
  raw: FanLobbyPresenceWire,
  defaults: { roomId: string; venueId?: string },
): LobbyParticipant {
  const roomId = raw.roomId ?? defaults.roomId;
  const venueId = raw.venueId ?? defaults.venueId ?? roomId;
  const seatAnchorId =
    raw.seatAnchorId !== undefined
      ? raw.seatAnchorId
      : raw.seatId !== undefined
        ? raw.seatId
        : null;
  const cameraEnabled = Boolean(
    raw.cameraEnabled !== undefined ? raw.cameraEnabled : raw.hasCameraOn,
  );
  const micEnabled = Boolean(raw.micEnabled);
  const isSpeaking = Boolean(raw.isSpeaking);
  const navigationState: FanLobbyNavigationState =
    raw.navigationState ??
    raw.locomotion ??
    (seatAnchorId && (raw.isSeated ?? true) ? "SEATED" : "STANDING");
  const seated = navigationState === "SEATED" && Boolean(seatAnchorId);

  const base: FanLobbyPresence = {
    venueId,
    roomId,
    userId: raw.userId,
    avatarId: raw.avatarId ?? raw.userId,
    userName: raw.userName ?? "Anonymous Fan",
    emoji: raw.emoji ?? "👤",
    x: typeof raw.x === "number" ? raw.x : 50,
    y: typeof raw.y === "number" ? raw.y : 70,
    activeTheme: raw.activeTheme ?? "lobby-cinema",
    propTrigger: raw.propTrigger ?? "none",
    seatAnchorId: seated ? seatAnchorId : null,
    navigationState,
    conversationGroupId: seated ? (raw.conversationGroupId ?? null) : null,
    micEnabled,
    cameraEnabled,
    isSpeaking,
    activeSpeaker: raw.activeSpeaker !== undefined ? Boolean(raw.activeSpeaker) : isSpeaking,
    loadoutId: raw.loadoutId ?? null,
  };

  return withLegacyAliases(base);
}
