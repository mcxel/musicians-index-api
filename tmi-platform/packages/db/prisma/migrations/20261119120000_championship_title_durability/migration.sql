-- Durable championship titles: current holder per title, an append-only title ledger with
-- idempotent result processing, and a server-side challenge queue (replaces in-memory
-- CrownTransferEngine state and the browser-localStorage challenge queue).
-- Trophies continue to use the EXISTING "trophies" table (written in the same transaction).
-- OWNER APPROVAL REQUIRED BEFORE APPLYING. Additive only; rollback at bottom.

CREATE TABLE IF NOT EXISTS "championship_title_holders" (
  "title_id"     TEXT        NOT NULL,
  -- CROWN (live, challenge-transferable) | BELT (yearly championship only)
  "asset_type"   TEXT        NOT NULL,
  -- NULL = vacant. One row per title: two simultaneous holders are impossible.
  "holder_id"    TEXT,
  "since_at"     TIMESTAMPTZ,
  "last_result_id" TEXT,
  "version"      INTEGER     NOT NULL DEFAULT 0,
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "championship_title_holders_pkey" PRIMARY KEY ("title_id"),
  CONSTRAINT "championship_title_holders_type_check" CHECK ("asset_type" IN ('CROWN', 'BELT'))
);

CREATE TABLE IF NOT EXISTS "championship_title_events" (
  "id"             TEXT        NOT NULL,
  "title_id"       TEXT        NOT NULL,
  -- AWARDED | DEFENDED | VACATED | TROPHY_AWARDED
  "kind"           TEXT        NOT NULL,
  "from_holder_id" TEXT,
  "to_holder_id"   TEXT,
  "competition_id" TEXT,
  -- The verified result this event came from. Unique per title → idempotent processing.
  "result_id"      TEXT        NOT NULL,
  "format"         TEXT        NOT NULL,
  -- JUDGES | VOTES | OPERATOR | CONCESSION (loser conceded to the opponent; never a purchase,
  -- never a self-declaration)
  "verified_by"    TEXT        NOT NULL,
  -- Title lineage order: equals the holder row's version after this event (0 for trophies).
  -- Unique per title → a forked lineage (two events claiming the same step) is impossible.
  "title_seq"      BIGINT      NOT NULL DEFAULT 0,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "championship_title_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "championship_title_events_kind_check" CHECK ("kind" IN ('AWARDED', 'DEFENDED', 'VACATED', 'TROPHY_AWARDED')),
  CONSTRAINT "championship_title_events_verified_check" CHECK ("verified_by" IN ('JUDGES', 'VOTES', 'OPERATOR', 'CONCESSION'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "championship_title_events_result" ON "championship_title_events" ("title_id", "result_id");
CREATE UNIQUE INDEX IF NOT EXISTS "championship_title_events_lineage" ON "championship_title_events" ("title_id", "title_seq") WHERE "title_seq" > 0;

CREATE TABLE IF NOT EXISTS "championship_challenges" (
  "id"            TEXT        NOT NULL,
  "title_id"      TEXT        NOT NULL,
  "challenger_id" TEXT        NOT NULL,
  -- Order within the title's queue (max+1 under the per-title lock).
  "position"      BIGINT      NOT NULL,
  -- QUEUED | RESOLVED | CANCELLED
  "status"        TEXT        NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "resolved_at"   TIMESTAMPTZ,
  CONSTRAINT "championship_challenges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "championship_challenges_status_check" CHECK ("status" IN ('QUEUED', 'RESOLVED', 'CANCELLED'))
);
-- A challenger can hold only one active place per title.
CREATE UNIQUE INDEX IF NOT EXISTS "championship_challenges_active" ON "championship_challenges" ("title_id", "challenger_id") WHERE "status" = 'QUEUED';
CREATE INDEX IF NOT EXISTS "championship_challenges_queue" ON "championship_challenges" ("title_id", "status", "position");

-- ROLLBACK:
--   DROP TABLE IF EXISTS "championship_challenges";
--   DROP TABLE IF EXISTS "championship_title_events";
--   DROP TABLE IF EXISTS "championship_title_holders";
