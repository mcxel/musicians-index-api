-- Durable AvatarProfile + AvatarLoadout for lib/avatar/avatarPersistence.ts.
-- Additive only. Complements avatar_inventory_items (20260730000000) and
-- avatar_saved_looks (20261118120000). globalThis Maps remain a warm-instance
-- read-through cache; these tables survive serverless cold starts.
-- Do NOT deploy until PRODUCTION_DB_MUTATIONS is unlocked by owner.

-- CreateTable
CREATE TABLE "avatar_profile_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "skin_tone" TEXT NOT NULL,
    "hair_style" TEXT NOT NULL,
    "eye_style" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatar_profile_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatar_profile_records_user_id_key" ON "avatar_profile_records"("user_id");

-- CreateTable
CREATE TABLE "avatar_loadout_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatar_loadout_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatar_loadout_records_user_id_key" ON "avatar_loadout_records"("user_id");

-- Billing grace & cancellation archival columns on User (P0-A4 dunning & cancellation hygiene)
-- Plus live_genre and live_started_at parity with schema.prisma for fresh migration replay
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_genre" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_started_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billing_status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billing_grace_ends_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "last_canceled_stripe_subscription_id" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "last_canceled_at" TIMESTAMP(3);
