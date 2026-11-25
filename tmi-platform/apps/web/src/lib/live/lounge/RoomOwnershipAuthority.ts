/**
 * RoomOwnershipAuthority — who owns a room, and who may broadcast in it (owner directive 2026-11-19).
 *
 * Ownership classes (durable, `room_registry` + the existing `rooms.ownerId`):
 *   OFFICIAL             platform-owned TMI room (e.g. orchestrator-seeded). No user owner, no bot owner;
 *                        staff administer. A broadcaster never becomes its owner.
 *   USER                 Fan- or Performer-created; the creator is the permanent owner.
 *   LEGACY_UNCLASSIFIED  an existing rooms row with no owner and no classification: quarantined —
 *                        nobody can claim it until staff classify or assign it.
 *   NEW                  no record yet: the first live session creates it as a USER room.
 *
 * Separate authorities, never merged: ROOM OWNER (this module) ≠ EVENT HOST (the live session's
 * broadcaster — controls their show) ≠ MODERATORS/DJs (lounge roles) ≠ STAFF.
 * Fixes 2026-11-19: /api/live/go took a client roomId and persistence rewrote rooms.ownerId to the caller.
 */

export type RegistryClass = "OFFICIAL" | "USER" | "LEGACY_UNCLASSIFIED";
export type OwnershipClass = RegistryClass | "NEW";
export type RoomRecord = { exists: boolean; ownerId: string | null; registryClass: RegistryClass | null };

export function classifyRoom(rec: RoomRecord): OwnershipClass {
  if (rec.registryClass) return rec.registryClass;
  if (!rec.exists) return "NEW";
  return rec.ownerId ? "USER" : "LEGACY_UNCLASSIFIED";
}

export type ResolvedOwnership = { cls: OwnershipClass; ownerId: string | null; platformOwned: boolean; eventHostId: string | null };

/** Owner of record. Only a NEW (not yet persisted) room borrows its live broadcaster as owner. */
export function resolveOwnership(rec: RoomRecord, liveOwnerId: string | null): ResolvedOwnership {
  const cls = classifyRoom(rec);
  const ownerId = cls === "USER" ? rec.ownerId : cls === "NEW" ? liveOwnerId : null;
  return { cls, ownerId, platformOwned: cls === "OFFICIAL", eventHostId: liveOwnerId };
}

export type ClaimRefusal = "ROOM_OWNED_BY_ANOTHER_USER" | "ROOM_LIVE_BY_ANOTHER_USER" | "ROOM_IS_OFFICIAL" | "ROOM_UNCLASSIFIED";

/** May `requesterId` start a live session on this room id? Staff may host in official rooms. */
export function canClaimRoomForLive(input: { requesterId: string; isStaff: boolean; rec: RoomRecord; liveOwnerId: string | null }): { ok: true } | { ok: false; reason: ClaimRefusal } {
  const cls = classifyRoom(input.rec);
  if (input.liveOwnerId && input.liveOwnerId !== input.requesterId) return { ok: false, reason: "ROOM_LIVE_BY_ANOTHER_USER" };
  if (cls === "OFFICIAL") return input.isStaff ? { ok: true } : { ok: false, reason: "ROOM_IS_OFFICIAL" };
  if (cls === "LEGACY_UNCLASSIFIED") return input.isStaff ? { ok: true } : { ok: false, reason: "ROOM_UNCLASSIFIED" };
  if (cls === "USER" && input.rec.ownerId !== input.requesterId) return { ok: false, reason: "ROOM_OWNED_BY_ANOTHER_USER" };
  return { ok: true };
}

/** What persistence may write to rooms.ownerId: never for OFFICIAL/LEGACY, never replacing another owner. */
export function ownerIdToPersist(rec: RoomRecord, sessionUserId: string): string | null {
  const cls = classifyRoom(rec);
  if (cls === "OFFICIAL" || cls === "LEGACY_UNCLASSIFIED") return null;
  if (cls === "USER") return rec.ownerId;
  return sessionUserId;
}

/** Back-compat for callers that only know owner ids (durable first, live fallback). */
export function resolveRoomOwner(s: { durableOwnerId: string | null; liveOwnerId: string | null }): string | null {
  return s.durableOwnerId ?? s.liveOwnerId ?? null;
}
