-- EOS Phase 7.4 — Motion memory + presentation fields on MemoryCollectible
-- Rims/animation are presentation-only (CSS). Masters stay in mediaVariants.ORIGINAL_MASTER.
-- MotionPair is still+motion as one gallery item. Never competition ledger feed.

ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "mediaVariants" JSONB;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "motionPair" JSONB;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "rimStyleId" TEXT;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "animationPreset" TEXT;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "burstGroupId" TEXT;

CREATE INDEX IF NOT EXISTS "memory_collectibles_burstGroupId_idx"
  ON "memory_collectibles"("burstGroupId");
