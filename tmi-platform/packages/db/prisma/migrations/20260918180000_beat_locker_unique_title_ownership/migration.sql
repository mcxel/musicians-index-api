-- Beat Locker unique ACTIVE title + Origami mediaAssetId linkage
-- SCHEMA_READY — NOT applied to production. DATABASE_APPLIED = false.
-- Runtime this pass: PROCESS_MEMORY (BeatLockerUniqueTitleOwnership).
-- Scope: GLOBAL_ACTIVE_BEAT_LOCKER only.

ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "normalizedTitle" TEXT;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "lifecycle" TEXT DEFAULT 'DRAFT';
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "sourceHash" TEXT;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "entitlementOrderId" TEXT;

CREATE INDEX IF NOT EXISTS "Beat_mediaAssetId_idx" ON "Beat"("mediaAssetId");
CREATE INDEX IF NOT EXISTS "Beat_normalizedTitle_idx" ON "Beat"("normalizedTitle");

-- Partial unique: only one ACTIVE listing may own a normalized title.
CREATE UNIQUE INDEX IF NOT EXISTS "Beat_normalizedTitle_active_uidx"
  ON "Beat"("normalizedTitle")
  WHERE "lifecycle" = 'ACTIVE';