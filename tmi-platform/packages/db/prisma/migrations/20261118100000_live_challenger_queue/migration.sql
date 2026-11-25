-- Live challenger queue (durable FIFO) + idempotent round-end events.
-- OWNER APPROVAL REQUIRED BEFORE APPLYING. Additive only; rollback at bottom.
--
-- Why not room_invites: FIFO needs a mutable order key (PASS-to-tail), readiness,
-- camera consent and call-up deadline columns, plus a partial unique index for
-- "one active entry per performer per room" — none of which room_invites has.

CREATE TABLE IF NOT EXISTS "live_challenger_queue_entries" (
  "id"              TEXT        NOT NULL,
  "room_id"         TEXT        NOT NULL,
  -- Live session instance (registry startedAt, ms). A new session = a new queue.
  "session_key"     TEXT        NOT NULL,
  "user_id"         TEXT        NOT NULL,
  -- FIFO order key. JOIN/REJOIN/PASS take max(seq)+1 under a per-room advisory lock.
  "seq"             BIGINT      NOT NULL,
  -- QUEUED | CALLED | ON_STAGE | FORFEITED | ELIMINATED | COMPLETED
  "status"          TEXT        NOT NULL,
  "ready"           BOOLEAN     NOT NULL DEFAULT TRUE,
  "away"            BOOLEAN     NOT NULL DEFAULT FALSE,
  "camera_consent"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "called_at"       TIMESTAMPTZ,
  "call_deadline"   TIMESTAMPTZ,
  "end_reason"      TEXT,
  -- Turn clock (one durable clock per ON_STAGE turn; Adaptive Director only adds time).
  "turn_started_at"    TIMESTAMPTZ,
  "turn_baseline_ms"   INTEGER,
  "turn_extension_ms"  INTEGER     NOT NULL DEFAULT 0,
  "extensions_granted" INTEGER     NOT NULL DEFAULT 0,
  -- Crowd judgment: when sustained negative sentiment began (cleared on recovery).
  "crowd_negative_since" TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ended_at"        TIMESTAMPTZ,
  CONSTRAINT "live_challenger_queue_entries_pkey" PRIMARY KEY ("id")
);

-- One active entry per performer per room (forfeited/ended rows never block a rejoin).
-- NOTE: partial index is not expressible in schema.prisma; `prisma migrate dev` will
-- report drift on it. Production uses `migrate deploy` (applies SQL as written).
CREATE UNIQUE INDEX IF NOT EXISTS "live_challenger_queue_one_active"
  ON "live_challenger_queue_entries" ("room_id", "user_id")
  WHERE "status" IN ('QUEUED', 'CALLED', 'ON_STAGE');

-- Seq is never reused within a room+session (forfeited positions cannot come back).
CREATE UNIQUE INDEX IF NOT EXISTS "live_challenger_queue_seq_unique"
  ON "live_challenger_queue_entries" ("room_id", "session_key", "seq");

CREATE INDEX IF NOT EXISTS "live_challenger_queue_room_order"
  ON "live_challenger_queue_entries" ("room_id", "session_key", "status", "seq");

CREATE TABLE IF NOT EXISTS "live_challenger_round_events" (
  "event_id"          TEXT        NOT NULL,
  "room_id"           TEXT        NOT NULL,
  "source"            TEXT        NOT NULL,
  "outgoing_user_id"  TEXT,
  "promoted_user_id"  TEXT,
  "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "live_challenger_round_events_pkey" PRIMARY KEY ("event_id")
);

-- Adaptive Performance Director learning ledger (versioned observations only;
-- nothing here changes live policy — policy changes need review + approval).
CREATE TABLE IF NOT EXISTS "live_director_outcomes" (
  "id"                  TEXT        NOT NULL,
  "room_id"             TEXT        NOT NULL,
  "entry_id"            TEXT        NOT NULL,
  "user_id"             TEXT        NOT NULL,
  "policy_version"      TEXT        NOT NULL,
  "director_mode"       TEXT        NOT NULL,
  -- FINISHED | HOST_ENDED | OPERATOR_ROUND_END | SCORING_ROUND_END | LEFT | INTERRUPTED
  "end_kind"            TEXT        NOT NULL,
  -- TRUE for technical failures: never a performance-quality signal.
  "technical"           BOOLEAN     NOT NULL DEFAULT FALSE,
  "baseline_ms"         INTEGER,
  "actual_ms"           INTEGER,
  "extensions_granted"  INTEGER     NOT NULL DEFAULT 0,
  "next_wait_ms"        INTEGER,
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "live_director_outcomes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "live_director_outcomes_room" ON "live_director_outcomes" ("room_id", "created_at");

-- Guest (room_invites) camera consent, server-side. Separate table so room_invites is untouched.
CREATE TABLE IF NOT EXISTS "live_guest_media_consent" (
  "invite_id"       TEXT        NOT NULL,
  "user_id"         TEXT        NOT NULL,
  "camera_consent"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "live_guest_media_consent_pkey" PRIMARY KEY ("invite_id")
);

-- Host-selected Cypher turn length, fixed per live session (survives refresh/restart).
CREATE TABLE IF NOT EXISTS "live_room_turn_config" (
  "room_id"              TEXT        NOT NULL,
  "session_key"          TEXT        NOT NULL,
  "cypher_turn_seconds"  INTEGER     NOT NULL,
  "set_by"               TEXT        NOT NULL,
  "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "live_room_turn_config_pkey" PRIMARY KEY ("room_id", "session_key"),
  CONSTRAINT "live_room_turn_config_seconds_check" CHECK ("cypher_turn_seconds" IN (30, 45, 60))
);

-- Shared audience reactions (all app instances read the same stream).
-- polarity: 1 = positive (heart/fire/applause/cheer/…), -1 = negative (boo/dislike).
CREATE TABLE IF NOT EXISTS "live_reaction_events" (
  "id"          TEXT        NOT NULL,
  "room_id"     TEXT        NOT NULL,
  "user_id"     TEXT        NOT NULL,
  "kind"        TEXT        NOT NULL,
  "polarity"    SMALLINT    NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "live_reaction_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "live_reaction_events_polarity_check" CHECK ("polarity" IN (-1, 1))
);
CREATE INDEX IF NOT EXISTS "live_reaction_events_room_time" ON "live_reaction_events" ("room_id", "created_at");

-- ROLLBACK:
--   DROP TABLE IF EXISTS "live_reaction_events";
--   DROP TABLE IF EXISTS "live_room_turn_config";
--   DROP TABLE IF EXISTS "live_guest_media_consent";
--   DROP TABLE IF EXISTS "live_director_outcomes";
--   DROP TABLE IF EXISTS "live_challenger_round_events";
--   DROP TABLE IF EXISTS "live_challenger_queue_entries";
