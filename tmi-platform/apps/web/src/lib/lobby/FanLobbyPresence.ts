/**
 * Phase A.5 — Fan Lobby Presence Certification (Rule 20 / Rule 8).
 *
 * Single authoritative presence shape for Fan Lobby participants.
 * WebRTC (Phase B) must *consume* this — never invent a parallel presence model.
 *
 * Source of truth at runtime: `/api/rooms/lobby-sync` + `useLobbyPresenceSync`.
 * This module is the typed contract + thin lookup over that sync snapshot.
 * Do NOT create a separate Presence Registry engine.
 */

import type { LobbyAvatarLocomotion } from "./FanLobbySeatAssigner";

/** Locomotion / navigation — already used by FanLobbySeatAssigner. */
export type FanLobbyNavigationState = LobbyAvatarLocomotion;

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
