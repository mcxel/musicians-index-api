/**
 * RoomRegistryService — durable room classification + venue layout (table `room_registry`, pending
 * migration 20261119130000) next to the existing `rooms` row (Prisma model Room, "ownerId").
 * Every function takes a QueueSql so it runs on Prisma (prod) or a disposable pg pool (tests).
 * A missing room_registry table (migration not applied) degrades to "no classification", never a crash.
 */

import type { QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import type { RegistryClass, RoomRecord } from "./RoomOwnershipAuthority";
import { classifyRoom } from "./RoomOwnershipAuthority";
import { AVATAR_VENUES } from "@/lib/world/AvatarMovementService";
import { isCanonicalSystemRoomId } from "./SystemRoomIds";

const missingTable = (e: unknown) => /room_registry/.test(String((e as Error)?.message ?? e)) && /does not exist/.test(String((e as Error)?.message ?? e));

/**
 * Room record = existing rooms row + registry row. A canonical system room (SystemRoomIds) with no
 * registry row is OFFICIAL by code provenance — unless a rooms row already names a user owner, in which
 * case it is DISPUTED and quarantined as LEGACY_UNCLASSIFIED for staff (never silently overridden).
 */
export async function loadRoomRecord(sql: QueueSql, roomId: string, isSystemRoom: (id: string) => boolean = isCanonicalSystemRoomId): Promise<RoomRecord & { venueBlueprintId: string | null; systemRoom: boolean; disputed: boolean }> {
  const room = (await sql.query<{ ownerId: string | null }>(`SELECT "ownerId" FROM rooms WHERE id = $1`, [roomId]))[0];
  let reg: { ownership_class: RegistryClass; venue_blueprint_id: string | null } | undefined;
  try {
    reg = (await sql.query<{ ownership_class: RegistryClass; venue_blueprint_id: string | null }>(`SELECT ownership_class, venue_blueprint_id FROM room_registry WHERE room_id = $1`, [roomId]))[0];
  } catch (e) {
    if (!missingTable(e)) throw e;
  }
  const systemRoom = isSystemRoom(roomId);
  const disputed = systemRoom && !reg && Boolean(room?.ownerId);
  const registryClass: RegistryClass | null = reg?.ownership_class ?? (systemRoom ? (disputed ? "LEGACY_UNCLASSIFIED" : "OFFICIAL") : null);
  return { exists: Boolean(room), ownerId: room?.ownerId ?? null, registryClass, venueBlueprintId: reg?.venue_blueprint_id ?? null, systemRoom, disputed };
}

/** Register a room's class once (never reclassifies — that is staff-only `classifyRoomAsStaff`). */
export async function registerRoom(sql: QueueSql, input: { roomId: string; cls: RegistryClass; by: string; venueBlueprintId?: string | null }): Promise<boolean> {
  try {
    const rows = await sql.query<{ room_id: string }>(
      `INSERT INTO room_registry (room_id, ownership_class, venue_blueprint_id, classified_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (room_id) DO NOTHING RETURNING room_id`, [input.roomId, input.cls, input.venueBlueprintId ?? null, input.by]);
    return rows.length > 0;
  } catch (e) {
    if (missingTable(e)) return false;
    throw e;
  }
}

/** Staff-only: classify a legacy/quarantined room, or assign a USER owner explicitly. */
export async function classifyRoomAsStaff(sql: QueueSql, input: { roomId: string; isStaff: boolean; cls: RegistryClass; assignOwnerId?: string | null; by: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!input.isStaff) return { ok: false, reason: "STAFF_ONLY" };
  if (input.cls === "USER" && !input.assignOwnerId) return { ok: false, reason: "OWNER_REQUIRED_FOR_USER_ROOM" };
  await sql.query(
    `INSERT INTO room_registry (room_id, ownership_class, classified_by) VALUES ($1, $2, $3)
     ON CONFLICT (room_id) DO UPDATE SET ownership_class = $2, classified_by = $3, updated_at = now()`, [input.roomId, input.cls, input.by]);
  await sql.query(`UPDATE rooms SET "ownerId" = $2 WHERE id = $1`, [input.roomId, input.cls === "USER" ? input.assignOwnerId : null]);
  return { ok: true };
}

/**
 * Store the venue layout for avatar movement. Only a mapped blueprint (AVATAR_VENUES), only on an
 * avatar-compatible room (never a lounge), and only by the room's owner (USER) or staff (OFFICIAL).
 */
export async function setVenueBlueprint(sql: QueueSql, input: { roomId: string; blueprintId: string; actorId: string; isStaff: boolean; roomType: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!AVATAR_VENUES[input.blueprintId]) return { ok: false, reason: "UNKNOWN_LAYOUT" };
  if (/lounge|performer[_-]?lobby/i.test(input.roomType)) return { ok: false, reason: "LAYOUT_NOT_COMPATIBLE_WITH_VIDEO_PANEL_ROOM" };
  const rec = await loadRoomRecord(sql, input.roomId);
  const cls = classifyRoom(rec);
  const allowed = (cls === "USER" && rec.ownerId === input.actorId) || (cls !== "USER" && cls !== "NEW" && input.isStaff);
  if (!allowed) return { ok: false, reason: "NOT_ROOM_OWNER" };
  try {
    await sql.query(
      `INSERT INTO room_registry (room_id, ownership_class, venue_blueprint_id, classified_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (room_id) DO UPDATE SET venue_blueprint_id = $3, updated_at = now()`, [input.roomId, cls, input.blueprintId, input.actorId]);
  } catch (e) {
    if (missingTable(e)) return { ok: false, reason: "REGISTRY_UNAVAILABLE" };
    throw e;
  }
  return { ok: true };
}

/**
 * Classification manifest for the verified system rooms (read-only; for the owner-approved backfill).
 * Each entry says what the backfill WOULD write; disputed rooms are listed for staff, never written.
 */
export async function systemRoomClassificationManifest(sql: QueueSql, ids: readonly string[]): Promise<Array<{ roomId: string; action: "REGISTER_OFFICIAL" | "ALREADY_CLASSIFIED" | "DISPUTED_STAFF_REVIEW"; currentOwnerId: string | null }>> {
  const out: Array<{ roomId: string; action: "REGISTER_OFFICIAL" | "ALREADY_CLASSIFIED" | "DISPUTED_STAFF_REVIEW"; currentOwnerId: string | null }> = [];
  for (const roomId of ids) {
    const room = (await sql.query<{ ownerId: string | null }>(`SELECT "ownerId" FROM rooms WHERE id = $1`, [roomId]))[0];
    let reg: unknown = undefined;
    try { reg = (await sql.query(`SELECT 1 FROM room_registry WHERE room_id = $1`, [roomId]))[0]; } catch (e) { if (!missingTable(e)) throw e; }
    out.push({ roomId, currentOwnerId: room?.ownerId ?? null, action: reg ? "ALREADY_CLASSIFIED" : room?.ownerId ? "DISPUTED_STAFF_REVIEW" : "REGISTER_OFFICIAL" });
  }
  return out;
}
