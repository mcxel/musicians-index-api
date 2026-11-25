/**
 * AvatarMovementService — server-authoritative Fan avatar movement in avatar-enabled venues
 * (owner Update 5, 2026-11-19). Reuses MovementAuthority.validateMovementUpdate (speed, rate, ordering,
 * legal transitions, sit only at the server-reserved seat) + SpatialZoneAuthority (no stage/backstage
 * without access) and RoomPresenceService (membership + the reserved seat). Stored in
 * `room_avatar_states` (migration 20261119130000, disposable DBs only).
 *
 * Laws:
 *  - Only people whose presence mode is AVATAR here may move an avatar: never in Lounges / Performer
 *    Lobbies (video panels), never a Performer/Band (real video, Rule 26).
 *  - First state is always the venue spawn (no client-chosen entry point).
 *  - A venue without a server-known map refuses movement (fail closed — no guessed geometry).
 *  - Rejections return the last authoritative state; the client reconciles to it.
 *  - Camera mode (first/third person) is client presentation only and is not stored here.
 */

import type { QueueDb, QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import { isActiveParticipant } from "@/lib/live/presence/RoomPresenceService";
import { MNS_V2_ZONES, type RoomMembership, type VenueZoneMap } from "@/lib/venue/SpatialZoneAuthority";
import { validateMovementUpdate, type AvatarNetState, type LocomotionState } from "@/lib/world/MovementAuthority";
import { presenceModeFor, type RoomKind } from "@/lib/world/VideoPanelSpatialContract";

export type AvatarVenue = { blueprintId: string; roomKind: RoomKind; zoneMap: VenueZoneMap; bounds: { min: [number, number]; max: [number, number] }; spawn: [number, number, number] };

/** Avatar venues with server-measured geometry. Monday Night Stage v2 floor ±12.85 × −16.85…18.5 (GLB), inset 0.45. */
export const AVATAR_VENUES: Readonly<Record<string, AvatarVenue>> = {
  [MNS_V2_ZONES.blueprintId]: { blueprintId: MNS_V2_ZONES.blueprintId, roomKind: "AUDITORIUM", zoneMap: MNS_V2_ZONES, bounds: { min: [-12.4, -16.4], max: [12.4, 18.05] }, spawn: [0, 2.24, 15] },
};

export type AvatarMoveResult =
  | { ok: true; state: AvatarNetState }
  | { ok: false; status: 403 | 409 | 422; reason: string; corrected: AvatarNetState | null };

type Raw = { participant_id: string; x: number; y: number; z: number; yaw: number; state: LocomotionState; speed: number; seat_id: string | null; active_emote: string | null; active_prop: string | null; seq: string | number; t_ms: string | number };
const toState = (r: Raw): AvatarNetState => ({
  participantId: r.participant_id, seq: Number(r.seq), tMs: Number(r.t_ms), pos: [Number(r.x), Number(r.y), Number(r.z)], yaw: Number(r.yaw),
  state: r.state, speed: Number(r.speed), isGrounded: r.state !== "JUMP", seatId: r.seat_id, activeEmote: r.active_emote, activeProp: r.active_prop, mood: null, talking: false,
});

export async function getAvatarState(sql: QueueSql, roomId: string, participantId: string): Promise<AvatarNetState | null> {
  const rows = await sql.query<Raw>(`SELECT participant_id, x, y, z, yaw, state, speed, seat_id, active_emote, active_prop, seq, t_ms FROM room_avatar_states WHERE room_id = $1 AND participant_id = $2`, [roomId, participantId]);
  return rows[0] ? toState(rows[0]) : null;
}

export async function listAvatarStates(sql: QueueSql, roomId: string, nowMs: number): Promise<AvatarNetState[]> {
  const rows = await sql.query<Raw>(
    `SELECT a.participant_id, a.x, a.y, a.z, a.yaw, a.state, a.speed, a.seat_id, a.active_emote, a.active_prop, a.seq, a.t_ms
       FROM room_avatar_states a JOIN live_room_presence r ON r.room_id = a.room_id AND r.participant_id = a.participant_id
      WHERE a.room_id = $1 AND r.left_at IS NULL AND r.seat_id IS NOT NULL
        AND r.last_seen_at >= to_timestamp(($2::double precision - 30000) / 1000)
      ORDER BY a.participant_id LIMIT 2000`, [roomId, nowMs]);
  return rows.map(toState);
}

export async function moveAvatar(db: QueueDb, input: {
  roomId: string; actorId: string; platformRole: string; venue: AvatarVenue | null; membership: RoomMembership;
  next: Omit<AvatarNetState, "participantId" | "isGrounded" | "speed" | "mood" | "talking">; nowMs: number;
}): Promise<AvatarMoveResult> {
  const v = input.venue;
  if (!v) return { ok: false, status: 409, reason: "VENUE_NOT_MAPPED", corrected: null };
  if (presenceModeFor(v.roomKind, input.platformRole) !== "AVATAR") return { ok: false, status: 403, reason: "NOT_AN_AVATAR_PARTICIPANT", corrected: null };
  const n = input.next;
  if (![...n.pos, n.yaw, n.seq, n.tMs].every(Number.isFinite)) return { ok: false, status: 422, reason: "INVALID", corrected: null };
  return db.withRoomLock(input.roomId, async (sql) => {
    if (!(await isActiveParticipant(sql, { roomId: input.roomId, participantId: input.actorId, nowMs: input.nowMs }))) return { ok: false, status: 403, reason: "NOT_IN_ROOM", corrected: null };
    const seatRow = await sql.query<{ seat_id: string | null }>(`SELECT seat_id FROM live_room_presence WHERE room_id = $1 AND participant_id = $2`, [input.roomId, input.actorId]);
    const reservedSeatId = seatRow[0]?.seat_id ?? null;
    const prev = await getAvatarState(sql, input.roomId, input.actorId);
    let state: AvatarNetState;
    if (!prev) {
      state = { participantId: input.actorId, seq: Math.max(0, n.seq), tMs: n.tMs, pos: [...v.spawn], yaw: n.yaw, state: "IDLE", speed: 0, isGrounded: true, seatId: null, activeEmote: null, activeProp: null, mood: null, talking: false };
    } else {
      // Emotes/props are authoritative in the room-action log (/api/live/prop-events), never in a move packet.
      const proposed: AvatarNetState = { ...n, participantId: input.actorId, speed: 0, isGrounded: true, mood: null, talking: false, activeEmote: null, activeProp: null };
      const verdict = validateMovementUpdate({ actorId: input.actorId, prev, next: proposed, zoneMap: v.zoneMap, membership: input.membership, reservedSeatId });
      if (!verdict.ok) return { ok: false, status: verdict.reason === "ZONE_DENIED" || verdict.reason === "SEAT_REQUIRED" || verdict.reason === "NOT_SELF" ? 403 : 409, reason: verdict.reason, corrected: prev };
      const p = verdict.state.pos;
      if (p[0] < v.bounds.min[0] || p[0] > v.bounds.max[0] || p[2] < v.bounds.min[1] || p[2] > v.bounds.max[1]) return { ok: false, status: 422, reason: "OUT_OF_BOUNDS", corrected: prev };
      state = verdict.state;
    }
    await sql.query(
      `INSERT INTO room_avatar_states (room_id, participant_id, x, y, z, yaw, state, speed, seat_id, active_emote, active_prop, seq, t_ms, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())
       ON CONFLICT (room_id, participant_id) DO UPDATE SET x=$3, y=$4, z=$5, yaw=$6, state=$7, speed=$8, seat_id=$9, active_emote=$10, active_prop=$11, seq=$12, t_ms=$13, updated_at=now()`,
      [input.roomId, input.actorId, state.pos[0], state.pos[1], state.pos[2], state.yaw, state.state, state.speed, state.seatId, state.activeEmote, state.activeProp, state.seq, state.tMs]);
    return { ok: true, state };
  });
}
