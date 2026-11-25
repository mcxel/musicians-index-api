/**
 * Adaptive Performance Director — server authority. SERVER-ONLY.
 *
 * Not a second clock: the turn clock is the durable ON_STAGE queue entry
 * (turn_started_at + turn_baseline_ms + turn_extension_ms). Not a second policy:
 * decisions come from Cursor's evaluateAdaptivePerformanceCheckpoint, but every
 * signal it receives is built HERE from server data — a client can never claim
 * "strong love" or "time left" to extend its own turn.
 *
 * What this module may do while ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED is false:
 *  - apply bounded extensions (adds time only; never cuts anyone off)
 *  - end a turn on an explicit human act: performer FINISHED, or host end in a
 *    flexible (Cypher) room. Both hand off through processRoundEnd.
 *  - record versioned learning outcomes
 * What it never does: end a turn on its own (silence, low love, timeout).
 *
 * Three moments are recorded separately so learning is not poisoned:
 *  ENDING (advisory PREPARE_NEXT) · FINISHED (human-confirmed) · INTERRUPTED
 *  (technical — stored with technical=true, never a performance signal).
 */

import {
  ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
  DEFAULT_FLEXIBLE_EXTENSION_SECONDS,
  DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
  DEFAULT_MAX_QUEUE_WAIT_MS,
  evaluateAdaptivePerformanceCheckpoint,
  type AdaptiveDirectorDecision,
  type AdaptiveDirectorMode,
  type AudienceLoveBand,
  type ContinuityBand,
} from "@/lib/competition/AdaptivePerformanceDirectorPolicy";
import {
  directorModeFor,
  normalize,
  processRoundEnd,
  recordOutcome,
  type QueueDb,
  type QueueEntryRow,
  type QueueRoomContext,
  type QueueSql,
  type RoundEndOutput,
} from "./ChallengerQueueService";
import { aggregateCrowd, judgeCrowd, type CrowdJudgment } from "./CrowdJudgmentService";

export type DirectorError =
  | "NOT_LIVE"
  | "NOT_COMPETITION"
  | "FORBIDDEN"
  | "NO_ACTIVE_TURN"
  | "NOT_ON_STAGE"
  | "SCORED_FORMAT_HOST_CANNOT_END"
  | "STALE";

export type DirectorResult<T> = { ok: true; value: T } | { ok: false; error: DirectorError };
const ok = <T>(value: T): DirectorResult<T> => ({ ok: true, value });
const fail = <T = never>(error: DirectorError): DirectorResult<T> => ({ ok: false, error });

export type TurnClockView = {
  active: boolean;
  mode: AdaptiveDirectorMode | null;
  turnStartedAt: string | null;
  baselineSeconds: number | null;
  extensionSeconds: number;
  extensionsGranted: number;
  maxExtensions: number;
  /** Absolute end so every HUD renders the same clock from one source. */
  turnEndsAt: string | null;
  remainingSeconds: number | null;
  nextPerformerReady: boolean;
  enforcementActivated: boolean;
};

const POSITIVE = new Set(["heart", "fire", "applause", "hype", "crown", "100"]);
const LOVE_WINDOW_MS = 20_000;

/**
 * Genuine audience love from server-recorded reactions (authenticated route,
 * one event per user counted). Excludes the performer themselves. Boos never add.
 * Thresholds are absolute distinct-user counts (not normalized by audience size).
 */
export function computeAudienceLoveBand(
  events: Array<{ userId: string; reaction: string; timestamp: number }>,
  now: number,
  excludeUserIds: string[],
): AudienceLoveBand {
  const exclude = new Set(excludeUserIds);
  const lovers = new Set<string>();
  for (const e of events) {
    if (now - e.timestamp > LOVE_WINDOW_MS) continue;
    if (!POSITIVE.has(e.reaction) || exclude.has(e.userId)) continue;
    lovers.add(e.userId);
  }
  if (lovers.size >= 5) return "STRONG";
  if (lovers.size >= 2) return "MODERATE";
  return "WEAK";
}

const CONTINUITY: ContinuityBand[] = ["IDLE_UNCERTAIN", "ACTIVE", "WINDING_DOWN", "FINISHED_SIGNAL"];

async function onStageEntry(q: QueueSql, ctx: QueueRoomContext): Promise<QueueEntryRow | null> {
  const rows = await q.query(
    `SELECT id, room_id, session_key, user_id, seq, status, ready, away, camera_consent, call_deadline,
            created_at, turn_started_at, turn_baseline_ms, turn_extension_ms, extensions_granted,
            called_at, crowd_negative_since
       FROM live_challenger_queue_entries
      WHERE room_id = $1 AND session_key = $2 AND status = 'ON_STAGE'
      ORDER BY seq LIMIT 1`,
    [ctx.roomId, ctx.sessionKey],
  );
  return rows[0] ? normalize(rows[0]) : null;
}

async function nextUp(q: QueueSql, ctx: QueueRoomContext, now: number) {
  const rows = await q.query<{ created_at: unknown }>(
    `SELECT created_at FROM live_challenger_queue_entries
      WHERE room_id = $1 AND session_key = $2 AND status = 'QUEUED' AND ready = TRUE
      ORDER BY seq LIMIT 1`,
    [ctx.roomId, ctx.sessionKey],
  );
  if (!rows[0]) return { ready: false, waitMs: 0 };
  return { ready: true, waitMs: Math.max(0, now - new Date(rows[0].created_at as string).getTime()) };
}

function clock(entry: QueueEntryRow | null, mode: AdaptiveDirectorMode, now: number, nextReady: boolean): TurnClockView {
  if (!entry || !entry.turn_started_at || entry.turn_baseline_ms == null) {
    return {
      active: false,
      mode,
      turnStartedAt: null,
      baselineSeconds: null,
      extensionSeconds: 0,
      extensionsGranted: 0,
      maxExtensions: mode === "OFFICIAL_BATTLE_SCORED" ? 0 : DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
      turnEndsAt: null,
      remainingSeconds: null,
      nextPerformerReady: nextReady,
      enforcementActivated: ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
    };
  }
  const end = entry.turn_started_at.getTime() + entry.turn_baseline_ms + entry.turn_extension_ms;
  return {
    active: true,
    mode,
    turnStartedAt: entry.turn_started_at.toISOString(),
    baselineSeconds: Math.round(entry.turn_baseline_ms / 1000),
    extensionSeconds: Math.round(entry.turn_extension_ms / 1000),
    extensionsGranted: entry.extensions_granted,
    maxExtensions: mode === "OFFICIAL_BATTLE_SCORED" ? 0 : DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
    turnEndsAt: new Date(end).toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((end - now) / 1000)),
    nextPerformerReady: nextReady,
    enforcementActivated: ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
  };
}

function ctxError(ctx: QueueRoomContext | null): DirectorError | null {
  if (!ctx) return "NOT_LIVE";
  if (!["battle", "gauntlet", "challenge", "cypher"].includes(ctx.category)) return "NOT_COMPETITION";
  return null;
}

const isStaff = (role: string) => ["ADMIN", "STAFF"].includes(role.toUpperCase());

export type DirectorBase = {
  db: QueueDb;
  ctx: QueueRoomContext | null;
  callerId: string;
  callerRole: string;
  now?: Date;
};

/** Public turn clock — no identities, no backstage data. */
export async function getTurnClock(input: DirectorBase): Promise<DirectorResult<TurnClockView>> {
  const e = ctxError(input.ctx);
  if (e) return fail(e);
  const ctx = input.ctx as QueueRoomContext;
  const now = (input.now ?? new Date()).getTime();
  const entry = await onStageEntry(input.db.read, ctx);
  const next = await nextUp(input.db.read, ctx, now);
  return ok(clock(entry, directorModeFor(ctx.category), now, next.ready));
}

export type CheckpointOutput = TurnClockView & {
  decision: AdaptiveDirectorDecision;
  reason: string;
  /** Seconds actually added by this request (0 when advisory or replay). */
  extensionApplied: number;
  /** The server-built signals the decision used (for HUD transparency). */
  signals: { audienceLove: AudienceLoveBand; continuity: ContinuityBand; nextWaitMs: number };
  /** Shared crowd sentiment + recovery state (counts only, no identities). Advisory. */
  crowd: CrowdJudgment & {
    audience: number;
    recentPositiveUsers: number;
    recentNegativeUsers: number;
    trend: number;
  };
};

export async function runCheckpoint(
  input: DirectorBase & {
    /** Only honoured from the on-stage performer's own client. */
    reportedContinuity?: string;
    /** Extension count the caller last saw. Mismatch = stale request. */
    expectedExtensions?: number;
    /** Test override. Production uses the shared live_reaction_events aggregate. */
    loveBand?: (performerId: string) => AudienceLoveBand;
  },
): Promise<DirectorResult<CheckpointOutput>> {
  const e = ctxError(input.ctx);
  if (e) return fail(e);
  const ctx = input.ctx as QueueRoomContext;
  const nowDate = input.now ?? new Date();
  const now = nowDate.getTime();
  const mode = directorModeFor(ctx.category);

  return input.db.withRoomLock(ctx.roomId, async (q): Promise<DirectorResult<CheckpointOutput>> => {
    const entry = await onStageEntry(q, ctx);
    if (!entry || !entry.turn_started_at) return fail("NO_ACTIVE_TURN");
    const isPerformer = entry.user_id === input.callerId;
    if (!isPerformer && input.callerId !== ctx.hostUserId && !isStaff(input.callerRole)) return fail("FORBIDDEN");
    if (typeof input.expectedExtensions === "number" && input.expectedExtensions !== entry.extensions_granted) {
      return fail("STALE");
    }

    const next = await nextUp(q, ctx, now);
    const view = clock(entry, mode, now, next.ready);
    const continuity: ContinuityBand =
      isPerformer && CONTINUITY.includes(input.reportedContinuity as ContinuityBand)
        ? (input.reportedContinuity as ContinuityBand)
        : "IDLE_UNCERTAIN";
    const aggregate = await aggregateCrowd(q, {
      roomId: ctx.roomId,
      now: nowDate,
      audienceSize: ctx.audienceSize,
      excludeUserIds: [entry.user_id],
    });
    const audienceLove = input.loveBand ? input.loveBand(entry.user_id) : aggregate.loveBand;
    const { judgment, nextNegativeSince } = judgeCrowd({
      aggregate,
      mode,
      negativeSince: entry.crowd_negative_since,
      now: nowDate,
    });
    const prevSince = entry.crowd_negative_since?.getTime() ?? null;
    if ((nextNegativeSince?.getTime() ?? null) !== prevSince) {
      await q.query(
        `UPDATE live_challenger_queue_entries SET crowd_negative_since = $2, updated_at = NOW() WHERE id = $1`,
        [entry.id, nextNegativeSince],
      );
    }

    const plan = evaluateAdaptivePerformanceCheckpoint({
      mode,
      roundRemainingSeconds: view.remainingSeconds ?? 0,
      extensionsGranted: entry.extensions_granted,
      maxExtensionsAllowed: DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
      extensionSeconds: DEFAULT_FLEXIBLE_EXTENSION_SECONDS,
      audienceLove,
      continuity,
      // No server-side musical analysis: never claim a safe boundary → confirm, don't cut.
      atSafeMusicalBoundary: false,
      nextPerformerReady: next.ready,
      nextWaitMs: next.waitMs,
      maxQueueWaitMs: DEFAULT_MAX_QUEUE_WAIT_MS,
      performerFinished: false,
      hostForceEnd: false,
      pastHardStop: false,
    });

    let extensionApplied = 0;
    if (plan.decision === "GRANT_EXTENSION" && mode !== "OFFICIAL_BATTLE_SCORED" && plan.extensionSeconds > 0) {
      const addMs = plan.extensionSeconds * 1000;
      // Compare-and-set on the durable count: a concurrent/replayed grant cannot double up.
      const updated = await q.query<{ id: string }>(
        `UPDATE live_challenger_queue_entries
            SET turn_extension_ms = turn_extension_ms + $2, extensions_granted = extensions_granted + 1, updated_at = NOW()
          WHERE id = $1 AND extensions_granted = $3 AND status = 'ON_STAGE'
          RETURNING id`,
        [entry.id, addMs, entry.extensions_granted],
      );
      if (updated.length === 1) {
        extensionApplied = plan.extensionSeconds;
        entry.turn_extension_ms += addMs;
        entry.extensions_granted += 1;
      }
    }

    return ok({
      ...clock(entry, mode, now, next.ready),
      decision: plan.decision,
      reason: plan.reason,
      extensionApplied,
      signals: { audienceLove, continuity, nextWaitMs: next.waitMs },
      crowd: {
        ...judgment,
        audience: aggregate.audience,
        recentPositiveUsers: aggregate.recent.positiveUsers,
        recentNegativeUsers: aggregate.recent.negativeUsers,
        trend: Number(aggregate.trend.toFixed(3)),
      },
    });
  });
}

/** On-stage performer ends their own turn. Hands off through the durable queue. */
export async function performerFinished(input: DirectorBase): Promise<DirectorResult<RoundEndOutput>> {
  const e = ctxError(input.ctx);
  if (e) return fail(e);
  const ctx = input.ctx as QueueRoomContext;
  const entry = await onStageEntry(input.db.read, ctx);
  if (!entry || entry.user_id !== input.callerId) {
    // Replay after a confirmed finish: report it instead of erroring.
    const prior = await input.db.read.query<{ event_id: string; promoted_user_id: string | null }>(
      `SELECT event_id, promoted_user_id FROM live_challenger_round_events
        WHERE room_id = $1 AND outgoing_user_id = $2 AND source = 'PERFORMER_FINISHED'
        ORDER BY created_at DESC LIMIT 1`,
      [ctx.roomId, input.callerId],
    );
    if (prior[0]) {
      return ok({
        eventId: prior[0].event_id,
        replayed: true,
        outgoingUserId: input.callerId,
        promotedUserId: prior[0].promoted_user_id,
        callDeadline: null,
        entranceCue: null,
        revoke: { stageUserIds: [], backstageUserIds: [] },
      });
    }
    return fail("NOT_ON_STAGE");
  }
  const r = await processRoundEnd({
    db: input.db,
    ctx,
    eventId: `finished:${entry.id}`,
    source: "PERFORMER_FINISHED",
    outgoingOutcome: "COMPLETED",
    now: input.now,
  });
  return r.ok ? ok(r.value) : fail(r.error === "NOT_LIVE" ? "NOT_LIVE" : "NOT_COMPETITION");
}

/** Host ends the current turn — flexible (Cypher) only; scored formats refuse. */
export async function hostEndTurn(input: DirectorBase): Promise<DirectorResult<RoundEndOutput>> {
  const e = ctxError(input.ctx);
  if (e) return fail(e);
  const ctx = input.ctx as QueueRoomContext;
  const staff = isStaff(input.callerRole);
  if (input.callerId !== ctx.hostUserId && !staff) return fail("FORBIDDEN");
  if (directorModeFor(ctx.category) === "OFFICIAL_BATTLE_SCORED" && !staff) return fail("SCORED_FORMAT_HOST_CANNOT_END");
  const entry = await onStageEntry(input.db.read, ctx);
  if (!entry) return fail("NO_ACTIVE_TURN");
  const r = await processRoundEnd({
    db: input.db,
    ctx,
    eventId: `hostend:${entry.id}`,
    source: staff && input.callerId !== ctx.hostUserId ? "OPERATOR" : "HOST_ENDED",
    outgoingOutcome: "COMPLETED",
    now: input.now,
  });
  return r.ok ? ok(r.value) : fail("NOT_LIVE");
}

/**
 * Technical interruption (connection drop, audio failure). Recorded with
 * technical=true and does NOT end the turn — recovery, not judgement.
 * Deduped: one record per turn per 10 s.
 */
export async function reportInterruption(input: DirectorBase): Promise<DirectorResult<{ recorded: boolean }>> {
  const e = ctxError(input.ctx);
  if (e) return fail(e);
  const ctx = input.ctx as QueueRoomContext;
  const nowDate = input.now ?? new Date();
  return input.db.withRoomLock(ctx.roomId, async (q): Promise<DirectorResult<{ recorded: boolean }>> => {
    const entry = await onStageEntry(q, ctx);
    if (!entry) return fail("NO_ACTIVE_TURN");
    if (entry.user_id !== input.callerId && input.callerId !== ctx.hostUserId && !isStaff(input.callerRole)) {
      return fail("FORBIDDEN");
    }
    const recent = await q.query(
      `SELECT 1 FROM live_director_outcomes
        WHERE entry_id = $1 AND end_kind = 'INTERRUPTED' AND created_at > $2 LIMIT 1`,
      [entry.id, new Date(nowDate.getTime() - 10_000)],
    );
    if (recent.length) return ok({ recorded: false });
    await recordOutcome(q, ctx, entry, "INTERRUPTED", nowDate, null);
    return ok({ recorded: true });
  });
}
