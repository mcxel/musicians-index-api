-- Live broadcast state on User — columns already declared in schema.prisma
-- (isLive / liveRoomId / liveGenre / liveStartedAt) but never shipped in a
-- migration. Prisma Client SELECT/INSERT at register+session time expects
-- these physical columns; missing them breaks E2E (no tmi_session_id cookie).
-- Additive only. Safe on existing DBs via IF NOT EXISTS.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "is_live" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "live_room_id" TEXT;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "live_genre" TEXT;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "live_started_at" TIMESTAMP(3);
