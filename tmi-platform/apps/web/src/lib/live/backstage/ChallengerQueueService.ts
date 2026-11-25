/**
 * Durable challenger queue — server authority. SERVER-ONLY.
 *
 * Table: live_challenger_queue_entries (migration 20261118100000, owner approval
 * required before it is applied). Every mutation runs inside one transaction
 * holding a per-room advisory lock, so JOIN / LEAVE / PASS / CALL_UP are
 * serialized per room and FIFO order cannot be corrupted by concurrent requests.
 *
 * Laws enforced here (matches Cursor's client contract in
 * lib/competition/challengerFreeRoamClient.ts):
 *  - SPECTATE / JUMP_OUT: membership kept (away=true). Never a withdrawal.
 *  - RESUME: only an ACTIVE entry resumes; a forfeited seat is never restored.
 *  - LEAVE: entry → FORFEITED. Others keep their relative order.
 *  - REJOIN / JOIN: new row at seq = max+1. A seq is never reused (unique index).
 *  - PASS: same entry moves to the tail (seq = max+1) and becomes NOT READY.
 *  - IM_READY: ready=true, position unchanged.
 *  - CALL_UP: only the server (round-end event) selects the front READY entry.
 *    The host / active performer can never choose or veto.
 *  - Nobody but staff sees the identity list (ACTIVE_PERFORMER_SEES_CHALLENGER_QUEUE_IDENTITY = 0).
 *  - Competition results are not stored here; ending a turn records end_reason only.
 */

import { randomUUID } from "crypto";
import {
  getTimingProfile,
  resolveRoundDurationSeconds,
  type CompetitionTimingMode,
} from "@/lib/competition/CompetitionTurnTimingProfilePolicy";
import {
  ADAPTIVE_PERFORMANCE_DIRECTOR_POLICY_ID,
  type AdaptiveDirectorMode,
} from "@/lib/competition/AdaptivePerformanceDirectorPolicy";

/**
 * Rooms with a durable turn line. Cypher is a collaborative rotation: same FIFO
 * turn model, but turns always end COMPLETED (never a winner/elimination).
 */
export const CHALLENGER_QUEUE_CATEGORIES = ["battle", "gauntlet", "challenge", "cypher"] as const;

const CATEGORY_TIMING: Record<string, CompetitionTimingMode> = {
  battle: "BEAT_DRIVEN_RAP",
  gauntlet: "BEAT_DRIVEN_RAP",
  challenge: "SONG_CHALLENGE",
  cypher: "CYPHER_ROTATION",
};

/** Baseline turn length from the canonical timing profiles (no second clock table). */
export function turnBaselineMsFor(category: string, cypherPickSeconds?: number | null): number {
  const mode = CATEGORY_TIMING[category] ?? "BEAT_DRIVEN_RAP";
  return resolveRoundDurationSeconds({ profile: getTimingProfile(mode), cypherPickSeconds }) * 1000;
}

export const CYPHER_TURN_CHOICES = [30, 45, 60] as const;

async function cypherTurnSeconds(q: QueueSql, ctx: QueueRoomContext): Promise<number | null> {
  if (ctx.category !== "cypher") return null;
  const rows = await q.query<{ s: unknown }>(
    `SELECT cypher_turn_seconds AS s FROM live_room_turn_config WHERE room_id = $1 AND session_key = $2`,
    [ctx.roomId, ctx.sessionKey],
  );
  return rows[0] ? Number(rows[0].s) : null;
}

/** Cypher is flexible; every scored format keeps equal limits. */
export function directorModeFor(category: string): AdaptiveDirectorMode {
  return category === "cypher" ? "FLEXIBLE_CYPHER_SHOWCASE" : "OFFICIAL_BATTLE_SCORED";
}
export const CALL_UP_WINDOW_MS = 10_000;
/** Live anti-stall enforcement is OFF until SFU physical certification. */
export const ANTI_STALL_ENFORCEMENT_ACTIVE = false as const;

export type QueueStatus = "QUEUED" | "CALLED" | "ON_STAGE" | "FORFEITED" | "ELIMINATED" | "COMPLETED";
export const ACTIVE_STATUSES: QueueStatus[] = ["QUEUED", "CALLED", "ON_STAGE"];

export type QueueError =
  | "NOT_LIVE"
  | "NOT_COMPETITION"
  | "HOST_CANNOT_QUEUE"
  | "ROLE_NOT_ELIGIBLE"
  | "NOT_MEMBER"
  | "INVALID_STATE"
  | "FORBIDDEN"
  | "MIGRATION_NOT_APPLIED"
  | "STALE_CALL"
  | "INVALID_SETTING";

export type QueueResult<T> = { ok: true; value: T } | { ok: false; error: QueueError };
const ok = <T>(value: T): QueueResult<T> => ({ ok: true, value });
const fail = <T = never>(error: QueueError): QueueResult<T> => ({ ok: false, error });

export type QueueEntryRow = {
  id: string;
  room_id: string;
  session_key: string;
  user_id: string;
  seq: number;
  status: QueueStatus;
  ready: boolean;
  away: boolean;
  camera_consent: boolean;
  call_deadline: Date | null;
  created_at: Date | null;
  turn_started_at: Date | null;
  turn_baseline_ms: number | null;
  turn_extension_ms: number;
  extensions_granted: number;
  called_at: Date | null;
  crowd_negative_since: Date | null;
};

/** What a performer is allowed to know about their own place. */
export type QueueSelfView = {
  entryId: string | null;
  status: QueueStatus | "NONE";
  /** 0-based among waiting (QUEUED/CALLED) entries; null when not waiting. */
  position: number | null;
  waitingCount: number;
  ready: boolean;
  away: boolean;
  cameraConsent: boolean;
  callDeadline: string | null;
  /** Identifies the current call-up; CALL_UP_ACK must echo it (stale acks are rejected). */
  callToken: string | null;
  /**
   * Cypher turn length the SERVER will actually use (seconds): the host's saved 30/45/60 for this
   * session, else the Cypher profile default (same source as turnBaselineMsFor, so UI and timer never
   * disagree). null for non-cypher rooms. Echoed on STATE, every action reply and reconnect.
   */
  cypherTurnSeconds: number | null;
  cypherTurnSource: "SAVED" | "DEFAULT" | null;
  serverConfirmed: true;
};

/** Minimal SQL executor: production = Prisma tx, tests = PGlite. Params are bound, never interpolated. */
export interface QueueSql {
  query<R = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<R[]>;
}
export interface QueueDb {
  /** Run fn in one transaction holding the per-room advisory lock. */
  withRoomLock<T>(roomId: string, fn: (q: QueueSql) => Promise<T>): Promise<T>;
  read: QueueSql;
}

export type QueueRoomContext = {
  roomId: string;
  hostUserId: string;
  /** Live session instance; a new session starts a fresh queue. */
  sessionKey: string;
  category: string;
  /** Live viewer count from the registry (crowd normalization). */
  audienceSize?: number | null;
};

const COLS = `id, room_id, session_key, user_id, seq, status, ready, away, camera_consent, call_deadline,
  created_at, turn_started_at, turn_baseline_ms, turn_extension_ms, extensions_granted, called_at, crowd_negative_since`;

const asDate = (v: unknown): Date | null => (v ? new Date(v as string) : null);

export function normalize(r: Record<string, unknown>): QueueEntryRow {
  return {
    id: String(r.id),
    room_id: String(r.room_id),
    session_key: String(r.session_key),
    user_id: String(r.user_id),
    seq: Number(r.seq),
    status: String(r.status) as QueueStatus,
    ready: Boolean(r.ready),
    away: Boolean(r.away),
    camera_consent: Boolean(r.camera_consent),
    call_deadline: asDate(r.call_deadline),
    created_at: asDate(r.created_at),
    turn_started_at: asDate(r.turn_started_at),
    turn_baseline_ms: r.turn_baseline_ms == null ? null : Number(r.turn_baseline_ms),
    turn_extension_ms: Number(r.turn_extension_ms ?? 0),
    extensions_granted: Number(r.extensions_granted ?? 0),
    called_at: asDate(r.called_at),
    crowd_negative_since: asDate(r.crowd_negative_since),
  };
}

export async function activeEntry(q: QueueSql, ctx: QueueRoomContext, userId: string) {
  const rows = await q.query(
    `SELECT ${COLS} FROM live_challenger_queue_entries
      WHERE room_id = $1 AND session_key = $2 AND user_id = $3 AND status IN ('QUEUED','CALLED','ON_STAGE')
      LIMIT 1`,
    [ctx.roomId, ctx.sessionKey, userId],
  );
  return rows[0] ? normalize(rows[0]) : null;
}

async function nextSeq(q: QueueSql, ctx: QueueRoomContext): Promise<number> {
  // Max over ALL rows (including forfeited) so a seq is never handed out twice.
  const rows = await q.query<{ m: unknown }>(
    `SELECT COALESCE(MAX(seq), 0) AS m FROM live_challenger_queue_entries WHERE room_id = $1 AND session_key = $2`,
    [ctx.roomId, ctx.sessionKey],
  );
  return Number(rows[0]?.m ?? 0) + 1;
}

async function selfView(q: QueueSql, ctx: QueueRoomContext, userId: string): Promise<QueueSelfView> {
  const saved = await cypherTurnSeconds(q, ctx);
  const turn = ctx.category !== "cypher"
    ? { cypherTurnSeconds: null, cypherTurnSource: null }
    : saved !== null
      ? { cypherTurnSeconds: saved, cypherTurnSource: "SAVED" as const }
      : { cypherTurnSeconds: Math.round(turnBaselineMsFor(ctx.category, null) / 1000), cypherTurnSource: "DEFAULT" as const };
  const entry = await activeEntry(q, ctx, userId);
  const waiting = await q.query<{ c: unknown }>(
    `SELECT COUNT(*) AS c FROM live_challenger_queue_entries
      WHERE room_id = $1 AND session_key = $2 AND status IN ('QUEUED','CALLED')`,
    [ctx.roomId, ctx.sessionKey],
  );
  const waitingCount = Number(waiting[0]?.c ?? 0);
  if (!entry) {
    return {
      entryId: null,
      status: "NONE",
      position: null,
      waitingCount,
      ready: false,
      away: false,
      cameraConsent: false,
      callDeadline: null,
      callToken: null,
      ...turn,
      serverConfirmed: true,
    };
  }
  let position: number | null = null;
  if (entry.status === "QUEUED" || entry.status === "CALLED") {
    const ahead = await q.query<{ c: unknown }>(
      `SELECT COUNT(*) AS c FROM live_challenger_queue_entries
        WHERE room_id = $1 AND session_key = $2 AND status IN ('QUEUED','CALLED') AND seq < $3`,
      [ctx.roomId, ctx.sessionKey, entry.seq],
    );
    position = Number(ahead[0]?.c ?? 0);
  }
  return {
    entryId: entry.id,
    status: entry.status,
    position,
    waitingCount,
    ready: entry.ready,
    away: entry.away,
    cameraConsent: entry.camera_consent,
    callDeadline: entry.call_deadline ? entry.call_deadline.toISOString() : null,
    callToken: entry.status === "CALLED" && entry.called_at ? `${entry.id}:${entry.called_at.getTime()}` : null,
    ...turn,
    serverConfirmed: true,
  };
}

export async function setFields(q: QueueSql, id: string, sets: string, params: unknown[]): Promise<void> {
  await q.query(`UPDATE live_challenger_queue_entries SET ${sets}, updated_at = NOW() WHERE id = $1`, [id, ...params]);
}

function contextError(ctx: QueueRoomContext | null): QueueError | null {
  if (!ctx) return "NOT_LIVE";
  if (!(CHALLENGER_QUEUE_CATEGORIES as readonly string[]).includes(ctx.category)) return "NOT_COMPETITION";
  return null;
}

export type QueueAction =
  | "STATE"
  | "JOIN"
  | "REJOIN"
  | "SPECTATE"
  | "JUMP_OUT"
  | "RESUME"
  | "LEAVE"
  | "PASS"
  | "IM_READY"
  | "CONSENT_CAMERA"
  | "CALL_UP_ACK"
  /** Host only, Cypher only: 30 | 45 | 60 s for turns that start after this. */
  | "SET_CYPHER_TURN";

export type QueueActionInput = {
  db: QueueDb;
  ctx: QueueRoomContext | null;
  userId: string;
  /** Prisma Role of the caller, from the verified session. */
  role: string;
  action: QueueAction;
  cameraConsent?: boolean;
  /** CALL_UP_ACK: the callToken from STATE. */
  callToken?: string;
  /** SET_CYPHER_TURN: 30 | 45 | 60. */
  cypherTurnSeconds?: number;
  now?: Date;
};

export type QueueActionOutput = QueueSelfView & {
  /** Side effects the route must apply AFTER commit (Daily ejects). */
  revoke?: { backstage?: boolean; stage?: boolean };
  /** True when this request changed nothing (replay / already in that state). */
  noop?: boolean;
};

const PERFORMER_ROLES = new Set(["PERFORMER", "ARTIST", "BAND"]);

export async function runQueueAction(input: QueueActionInput): Promise<QueueResult<QueueActionOutput>> {
  const ctxErr = contextError(input.ctx);
  if (ctxErr) return fail(ctxErr);
  const ctx = input.ctx as QueueRoomContext;
  const { db, userId } = input;
  const now = input.now ?? new Date();

  if (input.action === "STATE") return ok(await selfView(db.read, ctx, userId));

  return db.withRoomLock(ctx.roomId, async (q): Promise<QueueResult<QueueActionOutput>> => {
    const entry = await activeEntry(q, ctx, userId);
    const done = async (extra?: Partial<QueueActionOutput>) => ok({ ...(await selfView(q, ctx, userId)), ...extra });

    switch (input.action) {
      case "JOIN":
      case "REJOIN": {
        if (entry) return done({ noop: true }); // replay / already queued: never a second row
        if (userId === ctx.hostUserId) return fail("HOST_CANNOT_QUEUE");
        if (!PERFORMER_ROLES.has(input.role.toUpperCase())) return fail("ROLE_NOT_ELIGIBLE");
        await q.query(
          `INSERT INTO live_challenger_queue_entries (id, room_id, session_key, user_id, seq, status, ready, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'QUEUED', TRUE, $6, $6)`,
          [randomUUID(), ctx.roomId, ctx.sessionKey, userId, await nextSeq(q, ctx), now],
        );
        return done();
      }
      case "SPECTATE":
      case "JUMP_OUT": {
        if (!entry) return fail("NOT_MEMBER");
        if (entry.away) return done({ noop: true });
        await setFields(q, entry.id, "away = TRUE", []);
        return done();
      }
      case "RESUME": {
        // A forfeited/eliminated seat has no active row → cannot be restored.
        if (!entry) return fail("NOT_MEMBER");
        if (!entry.away) return done({ noop: true });
        await setFields(q, entry.id, "away = FALSE", []);
        return done();
      }
      case "LEAVE": {
        if (!entry) {
          // Replay of a confirmed leave: report the forfeited state, change nothing.
          return done({ noop: true });
        }
        const wasOnStage = entry.status === "ON_STAGE";
        if (wasOnStage) await recordOutcome(q, ctx, entry, "LEFT", now, null);
        await setFields(q, entry.id, "status = 'FORFEITED', end_reason = 'LEFT', ended_at = NOW(), ready = FALSE", []);
        return done({ revoke: { backstage: true, stage: wasOnStage } });
      }
      case "PASS": {
        if (!entry) return fail("NOT_MEMBER");
        if (entry.status === "ON_STAGE") return fail("INVALID_STATE");
        // Already passed and not ready again → replay; do not move twice.
        if (!entry.ready && entry.status === "QUEUED") return done({ noop: true });
        await setFields(
          q,
          entry.id,
          "seq = $2, ready = FALSE, status = 'QUEUED', called_at = NULL, call_deadline = NULL",
          [await nextSeq(q, ctx)],
        );
        return done();
      }
      case "IM_READY": {
        if (!entry) return fail("NOT_MEMBER");
        if (entry.ready) return done({ noop: true });
        await setFields(q, entry.id, "ready = TRUE", []);
        return done();
      }
      case "CONSENT_CAMERA": {
        if (!entry) return fail("NOT_MEMBER");
        const consent = input.cameraConsent === true;
        if (entry.camera_consent === consent) return done({ noop: true });
        await setFields(q, entry.id, "camera_consent = $2", [consent]);
        // Withdrawing consent must stop video now, not at next token refresh.
        return done(consent ? undefined : { revoke: { backstage: true } });
      }
      case "CALL_UP_ACK": {
        if (!entry) return fail("NOT_MEMBER");
        if (entry.status === "ON_STAGE") return done({ noop: true });
        if (entry.status !== "CALLED" || !entry.called_at) return fail("INVALID_STATE");
        // The ack must name THIS call. A token from a voided/earlier call (or a
        // replay after the call moved on) can never take the stage.
        const expected = `${entry.id}:${entry.called_at.getTime()}`;
        if (input.callToken !== expected) return fail("STALE_CALL");
        // Anti-stall is OFF: a late acknowledgement of the CURRENT call is honoured.
        const baseline = turnBaselineMsFor(ctx.category, await cypherTurnSeconds(q, ctx));
        // Atomic: only flips if the row is still this exact call.
        const flipped = await q.query<{ id: string }>(
          `UPDATE live_challenger_queue_entries
              SET status = 'ON_STAGE', away = FALSE, turn_started_at = $2, turn_baseline_ms = $3,
                  turn_extension_ms = 0, extensions_granted = 0, crowd_negative_since = NULL, updated_at = NOW()
            WHERE id = $1 AND status = 'CALLED' AND called_at = $4
            RETURNING id`,
          [entry.id, now, baseline, entry.called_at],
        );
        if (flipped.length !== 1) return fail("STALE_CALL");
        return done({ revoke: { backstage: true } });
      }
      case "SET_CYPHER_TURN": {
        if (userId !== ctx.hostUserId) return fail("FORBIDDEN");
        if (ctx.category !== "cypher") return fail("INVALID_SETTING");
        const sec = input.cypherTurnSeconds;
        if (!CYPHER_TURN_CHOICES.includes(sec as 30 | 45 | 60)) return fail("INVALID_SETTING");
        await q.query(
          `INSERT INTO live_room_turn_config (room_id, session_key, cypher_turn_seconds, set_by, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (room_id, session_key)
           DO UPDATE SET cypher_turn_seconds = EXCLUDED.cypher_turn_seconds, set_by = EXCLUDED.set_by, updated_at = EXCLUDED.updated_at`,
          [ctx.roomId, ctx.sessionKey, sec, userId, now],
        );
        return done();
      }
      default:
        return fail("INVALID_STATE");
    }
  });
}

// ── Round end (server-only; never callable by the host or a challenger) ─────

export type RoundEndSource =
  | "SCORING_AUTHORITY"
  | "MATCH_COMPLETE"
  | "OPERATOR"
  /** On-stage performer pressed FINISHED / END TURN (verified server-side). */
  | "PERFORMER_FINISHED"
  /** Host ended a turn — flexible (Cypher) rooms only; never in scored formats. */
  | "HOST_ENDED";

export type OutcomeEndKind =
  | "FINISHED"
  | "HOST_ENDED"
  | "OPERATOR_ROUND_END"
  | "SCORING_ROUND_END"
  | "LEFT"
  | "INTERRUPTED";

const END_KIND: Record<RoundEndSource, OutcomeEndKind> = {
  SCORING_AUTHORITY: "SCORING_ROUND_END",
  MATCH_COMPLETE: "SCORING_ROUND_END",
  OPERATOR: "OPERATOR_ROUND_END",
  PERFORMER_FINISHED: "FINISHED",
  HOST_ENDED: "HOST_ENDED",
};

/** Versioned learning observation. Records only — never changes live policy. */
export async function recordOutcome(
  q: QueueSql,
  ctx: QueueRoomContext,
  entry: QueueEntryRow,
  endKind: OutcomeEndKind,
  now: Date,
  nextWaitMs: number | null,
): Promise<void> {
  const actual = entry.turn_started_at ? Math.max(0, now.getTime() - entry.turn_started_at.getTime()) : null;
  await q.query(
    `INSERT INTO live_director_outcomes
       (id, room_id, entry_id, user_id, policy_version, director_mode, end_kind, technical,
        baseline_ms, actual_ms, extensions_granted, next_wait_ms, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      randomUUID(),
      ctx.roomId,
      entry.id,
      entry.user_id,
      ADAPTIVE_PERFORMANCE_DIRECTOR_POLICY_ID,
      directorModeFor(ctx.category),
      endKind,
      endKind === "INTERRUPTED",
      entry.turn_baseline_ms,
      actual,
      entry.extensions_granted,
      nextWaitMs,
      now,
    ],
  );
}

export type RoundEndInput = {
  db: QueueDb;
  ctx: QueueRoomContext | null;
  eventId: string;
  source: RoundEndSource;
  /** Outcome for the challenger currently on stage, if any. Results live elsewhere. */
  outgoingOutcome: "COMPLETED" | "ELIMINATED";
  now?: Date;
};

export type RoundEndOutput = {
  eventId: string;
  replayed: boolean;
  outgoingUserId: string | null;
  promotedUserId: string | null;
  callDeadline: string | null;
  entranceCue: "COMPETITION_CHALLENGER" | null;
  /** Route must eject outgoing from stage and promoted from backstage after commit. */
  revoke: { stageUserIds: string[]; backstageUserIds: string[] };
};

export async function processRoundEnd(input: RoundEndInput): Promise<QueueResult<RoundEndOutput>> {
  const ctxErr = contextError(input.ctx);
  if (ctxErr) return fail(ctxErr);
  const ctx = input.ctx as QueueRoomContext;
  const now = input.now ?? new Date();

  return input.db.withRoomLock(ctx.roomId, async (q): Promise<QueueResult<RoundEndOutput>> => {
    const prior = await q.query<{ outgoing_user_id: string | null; promoted_user_id: string | null }>(
      `SELECT outgoing_user_id, promoted_user_id FROM live_challenger_round_events WHERE event_id = $1`,
      [input.eventId],
    );
    if (prior[0]) {
      return ok({
        eventId: input.eventId,
        replayed: true,
        outgoingUserId: prior[0].outgoing_user_id,
        promotedUserId: prior[0].promoted_user_id,
        callDeadline: null,
        entranceCue: null,
        revoke: { stageUserIds: [], backstageUserIds: [] },
      });
    }

    const onStage = (
      await q.query(
        `SELECT ${COLS} FROM live_challenger_queue_entries
          WHERE room_id = $1 AND session_key = $2 AND status = 'ON_STAGE' ORDER BY seq LIMIT 1`,
        [ctx.roomId, ctx.sessionKey],
      )
    ).map(normalize)[0];
    if (onStage) {
      // Cypher is collaborative: a turn ends COMPLETED, never ELIMINATED.
      const outcome = ctx.category === "cypher" ? "COMPLETED" : input.outgoingOutcome;
      await setFields(q, onStage.id, "status = $2, end_reason = $3, ended_at = NOW()", [outcome, input.source]);
    }

    // Never promote twice: an outstanding call keeps the slot.
    const outstanding = (
      await q.query(
        `SELECT ${COLS} FROM live_challenger_queue_entries
          WHERE room_id = $1 AND session_key = $2 AND status = 'CALLED' LIMIT 1`,
        [ctx.roomId, ctx.sessionKey],
      )
    ).map(normalize)[0];

    let promoted: QueueEntryRow | undefined;
    let deadline: Date | null = null;
    if (!outstanding) {
      promoted = (
        await q.query(
          `SELECT ${COLS} FROM live_challenger_queue_entries
            WHERE room_id = $1 AND session_key = $2 AND status = 'QUEUED' AND ready = TRUE
            ORDER BY seq LIMIT 1`,
          [ctx.roomId, ctx.sessionKey],
        )
      ).map(normalize)[0];
      if (promoted) {
        deadline = new Date(now.getTime() + CALL_UP_WINDOW_MS);
        await setFields(q, promoted.id, "status = 'CALLED', called_at = $2, call_deadline = $3", [now, deadline]);
      }
    }

    if (onStage) {
      const nextWait = promoted?.created_at ? now.getTime() - promoted.created_at.getTime() : null;
      await recordOutcome(q, ctx, onStage, END_KIND[input.source], now, nextWait);
    }

    await q.query(
      `INSERT INTO live_challenger_round_events (event_id, room_id, source, outgoing_user_id, promoted_user_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.eventId, ctx.roomId, input.source, onStage?.user_id ?? null, promoted?.user_id ?? null],
    );

    return ok({
      eventId: input.eventId,
      replayed: false,
      outgoingUserId: onStage?.user_id ?? null,
      promotedUserId: promoted?.user_id ?? null,
      callDeadline: deadline ? deadline.toISOString() : null,
      entranceCue: promoted ? "COMPETITION_CHALLENGER" : null,
      revoke: {
        stageUserIds: onStage ? [onStage.user_id] : [],
        backstageUserIds: promoted ? [promoted.user_id] : [],
      },
    });
  });
}

// ── Media-rights lookups for BackstageTransportService ───────────────────────

/** Active waiting member (QUEUED/CALLED) → may use backstage; video only with consent. */
export async function backstageRightsFromQueue(
  read: QueueSql,
  ctx: QueueRoomContext,
  userId: string,
): Promise<{ member: boolean; cameraConsent: boolean }> {
  const e = await activeEntry(read, ctx, userId);
  if (!e || (e.status !== "QUEUED" && e.status !== "CALLED")) return { member: false, cameraConsent: false };
  return { member: true, cameraConsent: e.camera_consent };
}

export async function isOnStageFromQueue(read: QueueSql, ctx: QueueRoomContext, userId: string): Promise<boolean> {
  const e = await activeEntry(read, ctx, userId);
  return e?.status === "ON_STAGE";
}
