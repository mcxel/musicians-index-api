-- Room action events: append-only, per-room ordered log of everything people do in a live
-- room (held props, emotes, wrist FX, host stage effects, host moments, fan participation,
-- consent-checked spotlight picks). Shared by every app instance; replaces the
-- single-process SpatialPropSyncEngine Map for held props.
-- OWNER APPROVAL REQUIRED BEFORE APPLYING. Additive only; rollback at bottom.

CREATE TABLE IF NOT EXISTS "live_room_prop_events" (
  "room_id"     TEXT        NOT NULL,
  -- Per-room order. max(seq)+1 under a per-room advisory transaction lock.
  "seq"         BIGINT      NOT NULL,
  -- Client-generated id. A retry with the same id returns the stored event (idempotent).
  "event_id"    TEXT        NOT NULL,
  "actor_id"    TEXT        NOT NULL,
  "prop_id"     TEXT        NOT NULL,
  "asset_id"    TEXT        NOT NULL,
  -- ACTIVATE | STOP
  "action"      TEXT        NOT NULL,
  "start_at"    TIMESTAMPTZ NOT NULL,
  "duration_ms" INTEGER     NOT NULL,
  "seed"        INTEGER     NOT NULL,
  -- HOST_SELECT only (spotlight / dance cam): the consenting fan picked. NULL otherwise.
  "target_id"   TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "live_room_prop_events_pkey" PRIMARY KEY ("room_id", "seq"),
  CONSTRAINT "live_room_prop_events_action_check" CHECK ("action" IN ('ACTIVATE', 'STOP'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "live_room_prop_events_event_id" ON "live_room_prop_events" ("event_id");
CREATE INDEX IF NOT EXISTS "live_room_prop_events_actor" ON "live_room_prop_events" ("room_id", "actor_id", "prop_id", "seq" DESC);
CREATE INDEX IF NOT EXISTS "live_room_prop_events_time" ON "live_room_prop_events" ("room_id", "start_at");

-- ROLLBACK:
--   DROP TABLE IF EXISTS "live_room_prop_events";
