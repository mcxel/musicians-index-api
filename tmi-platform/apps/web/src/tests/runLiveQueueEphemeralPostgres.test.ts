/**
 * @jest-environment node
 *
 * Separate-connection certification against a REAL PostgreSQL server.
 * Runs only when TMI_EPHEMERAL_PG_URL points at a localhost database named tmi_*
 * (a disposable cluster). Never production: the guard below refuses anything else.
 *
 *   TMI_EPHEMERAL_PG_URL=postgres://tmi_ephemeral@localhost:55439/tmi_queue_cert npx jest <this file>
 */

import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import {
  backstageRightsFromQueue,
  processRoundEnd,
  runQueueAction,
  type QueueAction,
  type QueueDb,
  type QueueRoomContext,
} from "@/lib/live/backstage/ChallengerQueueService";
import { getTurnClock, runCheckpoint } from "@/lib/live/backstage/AdaptiveDirectorService";
import { aggregateCrowd, judgeCrowd, recordCrowdReaction } from "@/lib/live/backstage/CrowdJudgmentService";

const URL_ = process.env.TMI_EPHEMERAL_PG_URL ?? "";
const parsed = URL_ ? new URL(URL_) : null;
const SAFE =
  Boolean(parsed) &&
  ["localhost", "127.0.0.1"].includes(parsed!.hostname) &&
  /^\/tmi_[a-z0-9_]+$/.test(parsed!.pathname);
const d = SAFE ? describe : describe.skip;

const MIGRATION_PATH = join(
  __dirname,
  "../../../../packages/db/prisma/migrations/20261118100000_live_challenger_queue/migration.sql",
);
const MIGRATION = readFileSync(MIGRATION_PATH, "utf8");
const ROLLBACK = MIGRATION.split("-- ROLLBACK:")[1]
  .split("\n")
  .map((l) => l.replace(/^--\s*/, "").trim())
  .filter((l) => l.startsWith("DROP"))
  .join("\n");

function queueDb(pool: Pool): QueueDb {
  return {
    read: { query: async (sql, params) => (await pool.query(sql, params ?? [])).rows },
    async withRoomLock(roomId, fn) {
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`tmi-challenger-queue:${roomId}`]);
        const out = await fn({ query: async (sql, params) => (await c.query(sql, params ?? [])).rows });
        await c.query("COMMIT");
        return out;
      } catch (e) {
        await c.query("ROLLBACK").catch(() => undefined);
        throw e;
      } finally {
        c.release();
      }
    },
  };
}

// Two pools = two independent "app instances", 10 connections each.
let poolA: Pool;
let poolB: Pool;
let A: QueueDb;
let B: QueueDb;

const ctx: QueueRoomContext = { roomId: "eph-battle", hostUserId: "host", sessionKey: "s1", category: "battle" };
const cy: QueueRoomContext = { roomId: "eph-cypher", hostUserId: "host", sessionKey: "s1", category: "cypher", audienceSize: 10 };

async function act(db: QueueDb, c: QueueRoomContext, userId: string, action: QueueAction, extra: Record<string, unknown> = {}) {
  let callToken = extra.callToken as string | undefined;
  if (action === "CALL_UP_ACK" && callToken === undefined) {
    const s = await runQueueAction({ db, ctx: c, userId, role: "PERFORMER", action: "STATE" });
    callToken = s.ok ? (s.value.callToken ?? undefined) : undefined;
  }
  return runQueueAction({ db, ctx: c, userId, role: "PERFORMER", action, callToken, ...extra });
}

d("ephemeral PostgreSQL 16 — migration + separate-connection concurrency", () => {
  jest.setTimeout(30_000);
  beforeAll(async () => {
    poolA = new Pool({ connectionString: URL_, max: 10 });
    poolB = new Pool({ connectionString: URL_, max: 10 });
    A = queueDb(poolA);
    B = queueDb(poolB);
    await poolA.query(ROLLBACK); // start clean
    await poolA.query(MIGRATION);
  }, 60_000);

  afterAll(async () => {
    await poolA?.end();
    await poolB?.end();
  });

  beforeEach(async () => {
    await poolA.query(
      `TRUNCATE live_challenger_queue_entries, live_challenger_round_events, live_director_outcomes,
                live_guest_media_consent, live_room_turn_config, live_reaction_events`,
    );
  });

  it("migration is idempotent (re-apply is a no-op) and rollback → re-apply works", async () => {
    await poolA.query(MIGRATION); // IF NOT EXISTS everywhere
    await poolA.query(ROLLBACK);
    const gone = await poolA.query(`SELECT to_regclass('live_challenger_queue_entries') AS t`);
    expect(gone.rows[0].t).toBeNull();
    await poolA.query(MIGRATION);
    const back = await poolA.query(`SELECT to_regclass('live_challenger_queue_entries') AS t`);
    expect(back.rows[0].t).toBe("live_challenger_queue_entries");
  });

  it("40 concurrent JOINs from two instances / 20 connections → 40 rows, unique seqs, strict 0..39", async () => {
    const users = Array.from({ length: 40 }, (_, i) => `u${i}`);
    await Promise.all(users.map((u, i) => act(i % 2 ? A : B, ctx, u, "JOIN")));
    const rows = (await poolA.query(`SELECT user_id, seq FROM live_challenger_queue_entries ORDER BY seq`)).rows;
    expect(rows).toHaveLength(40);
    expect(new Set(rows.map((r) => String(r.seq))).size).toBe(40);
    const positions = await Promise.all(
      rows.map(async (r) => {
        const s = await act(A, ctx, r.user_id, "STATE");
        return s.ok ? s.value.position : -1;
      }),
    );
    expect(positions).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it("same user JOINs 12× concurrently across instances → exactly one active row", async () => {
    await Promise.all(Array.from({ length: 12 }, (_, i) => act(i % 2 ? A : B, ctx, "dup", "JOIN")));
    const n = (await poolA.query(`SELECT COUNT(*)::int AS c FROM live_challenger_queue_entries WHERE user_id='dup'`)).rows[0].c;
    expect(n).toBe(1);
  });

  it("concurrent JOIN/LEAVE/PASS mix keeps FIFO and never reuses a seq", async () => {
    const users = Array.from({ length: 20 }, (_, i) => `m${i}`);
    for (const u of users) await act(A, ctx, u, "JOIN");
    await Promise.all([
      ...["m2", "m5", "m9"].map((u) => act(B, ctx, u, "LEAVE")),
      ...["m0", "m1", "m3"].map((u) => act(A, ctx, u, "PASS")),
      ...["n1", "n2", "n3"].map((u) => act(B, ctx, u, "JOIN")),
    ]);
    const all = (await poolA.query(`SELECT seq FROM live_challenger_queue_entries`)).rows.map((r) => String(r.seq));
    expect(new Set(all).size).toBe(all.length);
    const waiting = (
      await poolA.query(`SELECT user_id FROM live_challenger_queue_entries WHERE status='QUEUED' ORDER BY seq`)
    ).rows.map((r) => r.user_id);
    expect(waiting).toHaveLength(20);
    expect(waiting.slice(0, 14)).toEqual(users.filter((u) => !["m0", "m1", "m2", "m3", "m5", "m9"].includes(u)));
  });

  it("concurrent identical round-end events (two instances) promote exactly once", async () => {
    for (const u of ["a", "b", "c"]) await act(A, ctx, u, "JOIN");
    const rs = await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        processRoundEnd({ db: i % 2 ? A : B, ctx, eventId: "ev-same", source: "OPERATOR", outgoingOutcome: "COMPLETED" }).catch(
          (e) => ({ ok: false, error: String(e) }),
        ),
      ),
    );
    const called = (await poolA.query(`SELECT user_id FROM live_challenger_queue_entries WHERE status='CALLED'`)).rows;
    expect(called).toEqual([{ user_id: "a" }]);
    expect(rs.filter((r) => "value" in r && r.ok && !r.value.replayed)).toHaveLength(1);
  });

  it("stale call-up acceptance can never take the stage", async () => {
    for (const u of ["a", "b"]) await act(A, ctx, u, "JOIN");
    await processRoundEnd({ db: A, ctx, eventId: "e1", source: "OPERATOR", outgoingOutcome: "COMPLETED" });
    const s1 = await act(A, ctx, "a", "STATE");
    const oldToken = s1.ok ? s1.value.callToken : null;
    expect(oldToken).toBeTruthy();
    expect(await act(A, ctx, "a", "CALL_UP_ACK", { callToken: "forged" })).toEqual({ ok: false, error: "STALE_CALL" });
    // a passes (voids the call), is re-called later with a NEW call: old token must fail.
    await act(A, ctx, "a", "PASS");
    await act(A, ctx, "a", "IM_READY");
    await processRoundEnd({ db: A, ctx, eventId: "e2", source: "OPERATOR", outgoingOutcome: "COMPLETED" }); // calls b
    await act(B, ctx, "b", "CALL_UP_ACK");
    await processRoundEnd({ db: A, ctx, eventId: "e3", source: "OPERATOR", outgoingOutcome: "COMPLETED" }); // calls a again
    expect(await act(A, ctx, "a", "CALL_UP_ACK", { callToken: oldToken })).toEqual({ ok: false, error: "STALE_CALL" });
    const ok = await act(B, ctx, "a", "CALL_UP_ACK");
    expect(ok).toMatchObject({ ok: true, value: { status: "ON_STAGE" } });
  });

  it("STATE echoes the authoritative Cypher turn length: default 60, host's saved value everywhere, null for battles", async () => {
    const c2: QueueRoomContext = { ...cy, roomId: "eph-cypher-echo" };
    const bt: QueueRoomContext = { ...cy, roomId: "eph-battle-echo", category: "battle" };
    expect(await act(A, c2, "a", "STATE")).toMatchObject({ ok: true, value: { cypherTurnSeconds: 60, cypherTurnSource: "DEFAULT" } });
    expect(await act(A, bt, "a", "STATE")).toMatchObject({ ok: true, value: { cypherTurnSeconds: null, cypherTurnSource: null } });
    // Host sets 45 on instance A; any user on instance B (a reconnect) sees 45 in STATE and in action replies.
    expect(await act(A, c2, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 45 })).toMatchObject({ ok: true, value: { cypherTurnSeconds: 45, cypherTurnSource: "SAVED" } });
    expect(await act(B, c2, "a", "STATE")).toMatchObject({ ok: true, value: { cypherTurnSeconds: 45, cypherTurnSource: "SAVED" } });
    expect(await act(B, c2, "b", "JOIN")).toMatchObject({ ok: true, value: { cypherTurnSeconds: 45 } });
    // Rejected changes never alter the echoed value.
    await act(A, c2, "a", "SET_CYPHER_TURN", { cypherTurnSeconds: 30 });
    await act(A, c2, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 50 });
    expect(await act(B, c2, "a", "STATE")).toMatchObject({ ok: true, value: { cypherTurnSeconds: 45 } });
    // Concurrent host changes from two instances: the echo always equals the single stored row.
    await Promise.all([act(A, c2, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 30 }), act(B, c2, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 60 })]);
    const row = await poolA.query(`SELECT cypher_turn_seconds AS s FROM live_room_turn_config WHERE room_id = 'eph-cypher-echo'`);
    expect(await act(A, c2, "a", "STATE")).toMatchObject({ ok: true, value: { cypherTurnSeconds: Number(row.rows[0].s) } });
  });

  it("Cypher 30/45/60 persists in the DB and survives an 'app restart' (new pool)", async () => {
    expect(await act(A, cy, "a", "SET_CYPHER_TURN", { cypherTurnSeconds: 45 })).toEqual({ ok: false, error: "FORBIDDEN" });
    expect(await act(A, cy, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 50 })).toEqual({ ok: false, error: "INVALID_SETTING" });
    expect((await act(A, cy, "host", "SET_CYPHER_TURN", { cypherTurnSeconds: 45 })).ok).toBe(true);
    await expect(
      poolA.query(`UPDATE live_room_turn_config SET cypher_turn_seconds = 50`),
    ).rejects.toThrow(); // DB CHECK constraint
    const restarted = new Pool({ connectionString: URL_, max: 2 });
    try {
      const R = queueDb(restarted);
      for (const u of ["a", "b"]) await act(R, cy, u, "JOIN");
      await processRoundEnd({ db: R, ctx: cy, eventId: "c1", source: "OPERATOR", outgoingOutcome: "COMPLETED" });
      await act(R, cy, "a", "CALL_UP_ACK");
      const clock = await getTurnClock({ db: R, ctx: cy, callerId: "x", callerRole: "FAN" });
      expect(clock.ok && clock.value.baselineSeconds).toBe(45);
    } finally {
      await restarted.end();
    }
  });

  it("5 concurrent checkpoints across instances grant exactly one extension", async () => {
    for (const u of ["a", "b"]) await act(A, cy, u, "JOIN");
    await processRoundEnd({ db: A, ctx: cy, eventId: "x1", source: "OPERATOR", outgoingOutcome: "COMPLETED" });
    await act(A, cy, "a", "CALL_UP_ACK");
    const startedAt = new Date((await poolA.query(`SELECT turn_started_at FROM live_challenger_queue_entries WHERE user_id='a'`)).rows[0].turn_started_at);
    const near = new Date(startedAt.getTime() + 56_000);
    const rs = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        runCheckpoint({
          db: i % 2 ? A : B,
          ctx: cy,
          callerId: "a",
          callerRole: "PERFORMER",
          now: near,
          reportedContinuity: "ACTIVE",
          loveBand: () => "STRONG",
        }),
      ),
    );
    expect(rs.filter((r) => r.ok && r.value.extensionApplied > 0)).toHaveLength(1);
  });

  it("queue camera consent is durable and gates backstage video", async () => {
    await act(A, ctx, "a", "JOIN");
    expect(await backstageRightsFromQueue(B.read, ctx, "a")).toEqual({ member: true, cameraConsent: false });
    await act(A, ctx, "a", "CONSENT_CAMERA", { cameraConsent: true });
    expect(await backstageRightsFromQueue(B.read, ctx, "a")).toEqual({ member: true, cameraConsent: true });
  });
});

d("ephemeral PostgreSQL 16 — shared crowd judgment", () => {
  jest.setTimeout(30_000);
  beforeAll(async () => {
    poolA = new Pool({ connectionString: URL_, max: 10 });
    poolB = new Pool({ connectionString: URL_, max: 10 });
    A = queueDb(poolA);
    B = queueDb(poolB);
  });
  afterAll(async () => {
    await poolA?.end().catch(() => undefined);
    await poolB?.end().catch(() => undefined);
  });
  beforeEach(async () => {
    await poolA.query(`TRUNCATE live_reaction_events`);
  });

  const NOW = new Date("2026-11-18T21:00:00.000Z");
  const ago = (s: number) => new Date(NOW.getTime() - s * 1000);
  const room = "crowd-room";

  it("cross-instance: instance A writes, instance B sees the same aggregate", async () => {
    for (const u of ["f1", "f2", "f3", "f4"]) await recordCrowdReaction(A.read, { roomId: room, userId: u, kind: "heart", now: ago(3) });
    const agg = await aggregateCrowd(B.read, { roomId: room, now: NOW, audienceSize: 10, excludeUserIds: ["perf"] });
    expect(agg.recent.positiveUsers).toBe(4);
    expect(agg.loveBand).toBe("STRONG");
  });

  it("boo spam: one account × 50 boos counts as one person, not a negative crowd", async () => {
    for (let i = 0; i < 50; i++) {
      await recordCrowdReaction(A.read, { roomId: room, userId: "troll", kind: "boo", now: new Date(ago(10).getTime() + i * 100) });
    }
    const rows = (await poolA.query(`SELECT COUNT(*)::int AS c FROM live_reaction_events WHERE user_id='troll'`)).rows[0].c;
    expect(rows).toBeLessThanOrEqual(3); // collapsed per 2 s
    const agg = await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 20, excludeUserIds: [] });
    expect(agg.recent.negativeUsers).toBe(1);
    expect(agg.state).not.toBe("NEGATIVE_SUSTAINED");
  });

  it("audience-size normalization: 3 hearts is STRONG in a room of 10, WEAK in a room of 1,000", async () => {
    for (const u of ["f1", "f2", "f3"]) await recordCrowdReaction(A.read, { roomId: room, userId: u, kind: "fire", now: ago(2) });
    expect((await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 10, excludeUserIds: [] })).loveBand).toBe("STRONG");
    expect((await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 1000, excludeUserIds: [] })).loveBand).toBe("WEAK");
  });

  it("early boos then a genuine comeback → RECOVERING, and the negative clock is cleared", async () => {
    for (const u of ["f1", "f2", "f3", "f4"]) await recordCrowdReaction(A.read, { roomId: room, userId: u, kind: "boo", now: ago(30) });
    for (const u of ["f1", "f2", "f3", "f5"]) await recordCrowdReaction(A.read, { roomId: room, userId: u, kind: "applause", now: ago(4) });
    const agg = await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 10, excludeUserIds: [] });
    expect(agg.state).toBe("RECOVERING");
    const j = judgeCrowd({ aggregate: agg, mode: "FLEXIBLE_CYPHER_SHOWCASE", negativeSince: ago(25), now: NOW });
    expect(j.nextNegativeSince).toBeNull();
    expect(j.judgment.earlyEndEligible).toBe(false);
  });

  it("a fan who booed then cheered counts by their latest reaction", async () => {
    await recordCrowdReaction(A.read, { roomId: room, userId: "f1", kind: "boo", now: ago(10) });
    await recordCrowdReaction(A.read, { roomId: room, userId: "f1", kind: "heart", now: ago(5) });
    const agg = await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 10, excludeUserIds: [] });
    expect(agg.recent).toMatchObject({ positiveUsers: 1, negativeUsers: 0 });
  });

  it("sustained negativity → recovery window opens; no event allows a crowd ending today", async () => {
    for (const u of ["f1", "f2", "f3", "f4", "f5"]) await recordCrowdReaction(A.read, { roomId: room, userId: u, kind: "boo", now: ago(3) });
    const agg = await aggregateCrowd(A.read, { roomId: room, now: NOW, audienceSize: 10, excludeUserIds: [] });
    expect(agg.state).toBe("NEGATIVE_SUSTAINED");
    const first = judgeCrowd({ aggregate: agg, mode: "FLEXIBLE_CYPHER_SHOWCASE", negativeSince: null, now: NOW });
    expect(first.judgment.recoveryEndsAt).toBe(new Date(NOW.getTime() + 20_000).toISOString());
    const later = judgeCrowd({ aggregate: agg, mode: "FLEXIBLE_CYPHER_SHOWCASE", negativeSince: ago(60), now: NOW });
    expect(later.judgment).toMatchObject({ eventAllowsCrowdEnd: false, earlyEndEligible: false });
  });
});
