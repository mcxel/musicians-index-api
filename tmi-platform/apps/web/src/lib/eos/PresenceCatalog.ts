/**
 * EOS Layer 6 — PresenceCatalog (thin read helpers).
 *
 * EosPresenceState schema lives in relationshipContracts.
 * This module READS existing presence sources when available and otherwise
 * returns honest OFFLINE defaults (Rule 20 — never fake online friends).
 *
 * Existing sources bridged (not duplicated):
 *   - lib/social/PresenceEngine.ts          → online | away | offline
 *   - lib/live/AudiencePresenceEngine.ts    → current user's seat entity
 *   - lib/rooms/RoomSessionBridge.ts        → room presence list (when roomId known)
 */

import type {
  EosPresenceSnapshot,
  EosPresenceState,
} from "@/core/eos/relationshipContracts";
import { getPresence } from "@/lib/social/PresenceEngine";
import { getAudienceEntity } from "@/lib/live/AudiencePresenceEngine";
import { getPresenceInRoom } from "@/lib/rooms/RoomSessionBridge";

export const EOS_PRESENCE_STATES: readonly EosPresenceState[] = [
  "ONLINE",
  "BUSY",
  "WATCHING",
  "PERFORMING",
  "IN_LOBBY",
  "IN_BATTLE",
  "IN_LISTENING_PARTY",
  "IN_WDP",
  "OFFLINE",
] as const;

export function isEosPresenceState(value: string): value is EosPresenceState {
  return (EOS_PRESENCE_STATES as readonly string[]).includes(value);
}

function offlineSnapshot(userId: string): EosPresenceSnapshot {
  return {
    userId,
    state: "OFFLINE",
    source: "default_offline",
  };
}

function mapSocialStatus(
  status: "online" | "away" | "offline",
): EosPresenceState {
  if (status === "online") return "ONLINE";
  if (status === "away") return "BUSY";
  return "OFFLINE";
}

/**
 * Infer a richer EOS state from roomId heuristics when only a coarse
 * social presence is known. Never invents viewers — only maps strings.
 */
export function inferPresenceFromRoomId(
  roomId: string | undefined,
  fallback: EosPresenceState = "ONLINE",
): EosPresenceState {
  if (!roomId) return fallback;
  const id = roomId.toLowerCase();
  if (id.includes("battle") || id.includes("fight")) return "IN_BATTLE";
  if (id.includes("wdp") || id.includes("dance")) return "IN_WDP";
  if (id.includes("listen") || id.includes("radio")) return "IN_LISTENING_PARTY";
  if (id.includes("lobby")) return "IN_LOBBY";
  if (id.includes("live") || id.includes("watch")) return "WATCHING";
  return fallback;
}

/**
 * Resolve presence for one userId.
 * Prefer social PresenceEngine → audience entity (self only) → OFFLINE.
 */
export function getEosPresence(userId: string): EosPresenceSnapshot {
  if (!userId.trim()) return offlineSnapshot("");

  const social = getPresence(userId);
  if (social) {
    const mapped = mapSocialStatus(social.status);
    const state =
      mapped === "ONLINE"
        ? inferPresenceFromRoomId(social.roomId, "ONLINE")
        : mapped;
    return {
      userId,
      state,
      roomId: social.roomId,
      updatedAtMs: Date.parse(social.updatedAt) || undefined,
      source: "social_presence",
    };
  }

  const audience = getAudienceEntity();
  if (audience && audience.userId === userId && audience.isActive) {
    return {
      userId,
      state: inferPresenceFromRoomId(audience.roomId, "WATCHING"),
      roomId: audience.roomId,
      updatedAtMs: audience.joinedAt,
      source: "audience_entity",
    };
  }

  return offlineSnapshot(userId);
}

/**
 * Presence list for a room from RoomSessionBridge.
 * Returns [] when the room has no real presence rows (honest empty).
 */
export function listEosPresenceInRoom(roomId: string): EosPresenceSnapshot[] {
  if (!roomId.trim()) return [];
  const rows = getPresenceInRoom(roomId);
  if (!rows.length) return [];

  return rows.map((row) => {
    const roleHint =
      row.role === "performer"
        ? ("PERFORMING" as const)
        : inferPresenceFromRoomId(roomId, "WATCHING");
    return {
      userId: row.userId,
      state: roleHint,
      roomId,
      source: "room_session" as const,
    };
  });
}

/**
 * Batch lookup — never pads missing ids with fabricated ONLINE users.
 * Missing / unknown → OFFLINE snapshot per id.
 */
export function getEosPresenceMany(userIds: readonly string[]): EosPresenceSnapshot[] {
  return userIds.filter((id) => id.trim()).map((id) => getEosPresence(id));
}

/** Honest empty friend-online list helper — always [] until a real friend graph + presence feed exists. */
export function listOnlineFriends(_viewerUserId: string): EosPresenceSnapshot[] {
  return [];
}
