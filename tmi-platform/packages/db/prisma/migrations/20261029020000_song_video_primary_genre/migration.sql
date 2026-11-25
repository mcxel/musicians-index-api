-- UNVERIFIED / NOT APPLIED — hand-authored to match schema.prisma, same
-- treatment as 20261028000000_video_shuffle_station and
-- 20261029000000_play_receipts: no safe non-production DATABASE_URL was
-- available while building this (genre-ingestion-closure unit, 2026-10-29).
-- PRODUCTION_DB_MIGRATION = NO. Do not apply without independently
-- verifying against a real database first.

ALTER TABLE "songs" ADD COLUMN "primaryGenre" TEXT;
CREATE INDEX "songs_primaryGenre_idx" ON "songs"("primaryGenre");

ALTER TABLE "videos" ADD COLUMN "primaryGenre" TEXT;
CREATE INDEX "videos_primaryGenre_idx" ON "videos"("primaryGenre");
