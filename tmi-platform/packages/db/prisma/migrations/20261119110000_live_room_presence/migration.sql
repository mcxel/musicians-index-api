-- Durable room presence: the single source of truth for who is in a live room and
-- which seat they hold, shared by every app instance. The in-memory
-- audienceRuntimeEngine becomes a per-instance cache reconciled from this table.
-- OWNER APPROVAL REQUIRED BEFORE APPLYING. Additive only; rollback at bottom.

CREATE TABLE IF NOT EXISTS "live_room_presence" (
  "room_id"      TEXT        NOT NULL,
  -- Verified session user id, or a server-validated "guest-…" id for signed-out viewers.
  "participant_id" TEXT      NOT NULL,
  "is_guest"     BOOLEAN     NOT NULL DEFAULT FALSE,
  "display_name" TEXT        NOT NULL,
  -- fan | artist | host — resolved on the server, never from the request body.
  "role"         TEXT        NOT NULL,
  -- seat-N. NULL once the seat is released (left, or reclaim window passed).
  "seat_id"      TEXT,
  "group_id"     TEXT,
  "avatar_url"   TEXT,
  "joined_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "left_at"      TIMESTAMPTZ,
  CONSTRAINT "live_room_presence_pkey" PRIMARY KEY ("room_id", "participant_id"),
  CONSTRAINT "live_room_presence_role_check" CHECK ("role" IN ('fan', 'artist', 'host'))
);
-- No two people can hold the same seat in the same room.
CREATE UNIQUE INDEX IF NOT EXISTS "live_room_presence_seat_unique"
  ON "live_room_presence" ("room_id", "seat_id") WHERE "seat_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "live_room_presence_active"
  ON "live_room_presence" ("room_id", "last_seen_at") WHERE "left_at" IS NULL;

-- ROLLBACK:
--   DROP TABLE IF EXISTS "live_room_presence";
