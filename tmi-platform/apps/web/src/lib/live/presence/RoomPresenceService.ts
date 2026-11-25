/**
 * Durable room presence authority (server). Table `live_room_presence`.
 *
 * Rules (documented, tested):
 *  - Identity is supplied by the caller from the verified session (or a validated guest id);
 *    this module never reads identity from a request.
 *  - ACTIVE = left_at IS NULL and last_seen_at within PRESENCE_TTL_MS. Clients heartbeat.
 *  - A participant who drops keeps their seat reserved for SEAT_RECLAIM_MS (reconnect gets it
 *    back). After that the seat is released for others.
 *  - Seats are assigned under a per-room transaction lock; a partial unique index makes a
 *    double-booked seat impossible even if a caller skipped the lock.
 *  - Every query is scoped to one room id (no cross-room leakage).
 */

import type { QueueDb, QueueSql } from "@/lib/live/backstage/ChallengerQueueService";

export const PRESENCE_TTL_MS = 30_000;
export const SEAT_RECLAIM_MS = 120_000;
export const PRESENCE_HEARTBEAT_MS = 10_000;
export const ROOM_SEAT_CAPACITY = 10_000;
/** Abuse guard: max NEW room joins per participant per minute. Reconnects never count. */
export const JOIN_RATE_LIMIT_PER_MINUTE = 20;

export class PresenceRateLimitedError extends Error {
  constructor() {
    super("PRESENCE_RATE_LIMITED");
  }
}

export type PresenceRole = "fan" | "artist" | "host";

export type PresenceIdentity = {
  participantId: string;
  isGuest: boolean;
  displayName: string;
  role: PresenceRole;
  avatarUrl?: string | null;
};

export type PresenceRow = {
  roomId: string;
  participantId: string;
  isGuest: boolean;
  displayName: string;
  role: PresenceRole;
  seatId: string | null;
  groupId: string | null;
  avatarUrl: string | null;
  joinedAtMs: number;
  lastSeenAtMs: number;
};

type Raw = {
  room_id: string;
  participant_id: string;
  is_guest: boolean;
  display_name: string;
  role: string;
  seat_id: string | null;
  group_id: string | null;
  avatar_url: string | null;
  joined_at_ms: string | number;
  last_seen_at_ms: string | number;
};

const COLS = `room_id, participant_id, is_guest, display_name, role, seat_id, group_id, avatar_url,
  (EXTRACT(EPOCH FROM joined_at) * 1000)::bigint AS joined_at_ms,
  (EXTRACT(EPOCH FROM last_seen_at) * 1000)::bigint AS last_seen_at_ms`;

function toRow(r: Raw): PresenceRow {
  return {
    roomId: r.room_id,
    participantId: r.participant_id,
    isGuest: Boolean(r.is_guest),
    displayName: r.display_name,
    role: r.role as PresenceRole,
    seatId: r.seat_id,
    groupId: r.group_id,
    avatarUrl: r.avatar_url,
    joinedAtMs: Number(r.joined_at_ms),
    lastSeenAtMs: Number(r.last_seen_at_ms),
  };
}

function seatNumber(seatId: string | null): number | null {
  if (!seatId) return null;
  const m = /^seat-(\d+)$/.exec(seatId);
  return m ? Number(m[1]) : null;
}

/** Lowest free seat; with a group, the nearest free seat to the group's anchor. */
export function pickSeat(taken: ReadonlySet<string>, groupSeats: number[], capacity = ROOM_SEAT_CAPACITY): string | null {
  if (groupSeats.length > 0) {
    const anchor = Math.min(...groupSeats);
    for (let off = 1; off <= capacity; off++) {
      const right = anchor + off;
      if (right <= capacity && !taken.has(`seat-${right}`)) return `seat-${right}`;
      const left = anchor - off;
      if (left >= 1 && !taken.has(`seat-${left}`)) return `seat-${left}`;
    }
  }
  for (let n = 1; n <= capacity; n++) if (!taken.has(`seat-${n}`)) return `seat-${n}`;
  return null;
}

export const ROOM_ID_PATTERN = /^[A-Za-z0-9:_\-.]{1,200}$/;

/**
 * Join or re-join (also used as heartbeat with keepSeat). Returns the participant's row and
 * the room's active members after the write.
 */
export async function joinPresence(
  db: QueueDb,
  input: { roomId: string; identity: PresenceIdentity; groupId?: string | null; nowMs: number },
): Promise<{ me: PresenceRow; reclaimed: boolean }> {
  const { roomId, identity, nowMs } = input;
  if (!ROOM_ID_PATTERN.test(roomId)) throw new Error("BAD_ROOM_ID");
  const groupId = input.groupId && /^[A-Za-z0-9_\-]{1,64}$/.test(input.groupId) ? input.groupId : null;

  return db.withRoomLock(roomId, async (q: QueueSql) => {
    // Release seats whose reconnect window has passed (keeps the unique index truthful).
    await q.query(
      `UPDATE live_room_presence SET seat_id = NULL, left_at = COALESCE(left_at, last_seen_at)
        WHERE room_id = $1 AND seat_id IS NOT NULL
          AND COALESCE(left_at, last_seen_at) < to_timestamp(($2::double precision - $3::double precision) / 1000)`,
      [roomId, nowMs, SEAT_RECLAIM_MS],
    );
    const mine = (await q.query<Raw>(`SELECT ${COLS} FROM live_room_presence WHERE room_id = $1 AND participant_id = $2`, [roomId, identity.participantId]))[0];
    let seatId = mine?.seat_id ?? null;
    const reclaimed = Boolean(mine && mine.seat_id);
    // Rate limit only NEW joins (a reconnect to a seat you still hold is always allowed).
    if (!reclaimed) {
      const recent = await q.query<{ n: string | number }>(
        `SELECT count(*) AS n FROM live_room_presence
          WHERE participant_id = $1 AND room_id <> $2
            AND joined_at >= to_timestamp(($3::double precision - 60000) / 1000)`,
        [identity.participantId, roomId, nowMs],
      );
      if (Number(recent[0]?.n ?? 0) >= JOIN_RATE_LIMIT_PER_MINUTE) throw new PresenceRateLimitedError();
    }
    if (!seatId) {
      const takenRows = await q.query<{ seat_id: string; group_id: string | null }>(
        `SELECT seat_id, group_id FROM live_room_presence WHERE room_id = $1 AND seat_id IS NOT NULL`,
        [roomId],
      );
      const taken = new Set(takenRows.map((r) => r.seat_id));
      const groupSeats = groupId
        ? takenRows.filter((r) => r.group_id === groupId).map((r) => seatNumber(r.seat_id)).filter((n): n is number => n !== null)
        : [];
      seatId = pickSeat(taken, groupSeats);
    }
    const row = (
      await q.query<Raw>(
        `INSERT INTO live_room_presence
           (room_id, participant_id, is_guest, display_name, role, seat_id, group_id, avatar_url, joined_at, last_seen_at, left_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9::double precision / 1000), to_timestamp($9::double precision / 1000), NULL)
         ON CONFLICT (room_id, participant_id) DO UPDATE SET
           is_guest = EXCLUDED.is_guest,
           display_name = EXCLUDED.display_name,
           role = EXCLUDED.role,
           seat_id = EXCLUDED.seat_id,
           group_id = COALESCE(EXCLUDED.group_id, live_room_presence.group_id),
           avatar_url = COALESCE(EXCLUDED.avatar_url, live_room_presence.avatar_url),
           joined_at = CASE WHEN live_room_presence.left_at IS NOT NULL THEN EXCLUDED.joined_at ELSE live_room_presence.joined_at END,
           last_seen_at = EXCLUDED.last_seen_at,
           left_at = NULL
         RETURNING ${COLS}`,
        [roomId, identity.participantId, identity.isGuest, identity.displayName.slice(0, 80), identity.role, seatId, groupId, identity.avatarUrl ?? null, nowMs],
      )
    )[0]!;
    return { me: toRow(row), reclaimed };
  });
}

/** Heartbeat: refresh last_seen_at. Returns false if the participant is not in the room (must re-join). */
export async function heartbeatPresence(db: QueueDb, input: { roomId: string; participantId: string; nowMs: number }): Promise<boolean> {
  const rows = await db.read.query<{ participant_id: string }>(
    `UPDATE live_room_presence SET last_seen_at = to_timestamp($3::double precision / 1000)
      WHERE room_id = $1 AND participant_id = $2 AND left_at IS NULL AND seat_id IS NOT NULL
      RETURNING participant_id`,
    [input.roomId, input.participantId, input.nowMs],
  );
  return rows.length > 0;
}

/** Explicit leave: the seat is released immediately (no reconnect reservation). */
export async function leavePresence(db: QueueDb, input: { roomId: string; participantId: string; nowMs: number }): Promise<PresenceRow | null> {
  return db.withRoomLock(input.roomId, async (q) => {
    const rows = await q.query<Raw>(
      `UPDATE live_room_presence SET seat_id = NULL, left_at = to_timestamp($3::double precision / 1000)
        WHERE room_id = $1 AND participant_id = $2 AND left_at IS NULL
        RETURNING ${COLS}`,
      [input.roomId, input.participantId, input.nowMs],
    );
    return rows[0] ? toRow(rows[0]) : null;
  });
}

/** Everyone currently in the room (heartbeat inside the TTL), seat order. */
export async function listActivePresence(read: QueueSql, input: { roomId: string; nowMs: number }): Promise<PresenceRow[]> {
  const rows = await read.query<Raw>(
    `SELECT ${COLS} FROM live_room_presence
      WHERE room_id = $1 AND left_at IS NULL AND seat_id IS NOT NULL
        AND last_seen_at >= to_timestamp(($2::double precision - $3::double precision) / 1000)
      ORDER BY joined_at ASC, participant_id ASC
      LIMIT 2000`,
    [input.roomId, input.nowMs, PRESENCE_TTL_MS],
  );
  return rows.map(toRow);
}

export async function isActiveParticipant(read: QueueSql, input: { roomId: string; participantId: string; nowMs: number }): Promise<boolean> {
  const rows = await read.query<{ one: number }>(
    `SELECT 1 AS one FROM live_room_presence
      WHERE room_id = $1 AND participant_id = $2 AND left_at IS NULL AND seat_id IS NOT NULL
        AND last_seen_at >= to_timestamp(($3::double precision - $4::double precision) / 1000)`,
    [input.roomId, input.participantId, input.nowMs, PRESENCE_TTL_MS],
  );
  return rows.length > 0;
}

/** Room shutdown: everyone leaves, every seat is released (idempotent). */
export async function closeRoomPresence(db: QueueDb, input: { roomId: string; nowMs: number }): Promise<number> {
  return db.withRoomLock(input.roomId, async (q) => {
    const rows = await q.query<{ participant_id: string }>(
      `UPDATE live_room_presence SET seat_id = NULL, left_at = COALESCE(left_at, to_timestamp($2::double precision / 1000))
        WHERE room_id = $1 AND (seat_id IS NOT NULL OR left_at IS NULL) RETURNING participant_id`,
      [input.roomId, input.nowMs],
    );
    return rows.length;
  });
}

/** Bounded history: delete rows that left long ago (keeps the table small; never touches active rows). */
export async function prunePresence(read: QueueSql, input: { nowMs: number; retainMs?: number }): Promise<number> {
  const rows = await read.query<{ room_id: string }>(
    `DELETE FROM live_room_presence
      WHERE left_at IS NOT NULL AND seat_id IS NULL
        AND left_at < to_timestamp(($1::double precision - $2::double precision) / 1000)
      RETURNING room_id`,
    [input.nowMs, input.retainMs ?? 24 * 60 * 60 * 1000],
  );
  return rows.length;
}

export function isPresenceTableMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /42P01|does not exist/i.test(msg) && /live_room_presence/i.test(msg);
}
