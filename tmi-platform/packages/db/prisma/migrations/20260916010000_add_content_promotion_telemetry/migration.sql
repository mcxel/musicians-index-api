-- Content Promotion + Telemetry foundation (Writer Phase A, 2026-09-16).
-- REVIEWABLE ARTIFACT ONLY — not applied to production this session.
-- Certification used equivalent additive-only DDL against a separate,
-- non-production test database (ep-muddy-morning-aim5jrn4), never against
-- apps/web/.env.local's production DATABASE_URL (ep-misty-paper-ai08hmy9).
-- Deliberately generic (ContentPromotion/ContentTelemetryEvent, not
-- Writer-specific) so any canonical Content type can reuse this later.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentPromotionFundingType" AS ENUM ('POINTS', 'MONEY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentPromotionStatus" AS ENUM ('CREATED', 'FUNDING_PENDING', 'FUNDED', 'ELIGIBLE', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'INELIGIBLE', 'PAYMENT_FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentTelemetryEventType" AS ENUM ('DISCOVERY_IMPRESSION', 'CONTENT_OPEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_promotions" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "promotion_type" TEXT NOT NULL,
    "funding_type" "ContentPromotionFundingType" NOT NULL,
    "funding_reference" TEXT,
    "cash_amount_cents" INTEGER,
    "points_amount" INTEGER,
    "status" "ContentPromotionStatus" NOT NULL DEFAULT 'CREATED',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "delivery_policy" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_telemetry_events" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "event_type" "ContentTelemetryEventType" NOT NULL,
    "viewer_user_id" TEXT,
    "surface" TEXT NOT NULL,
    "is_self_view" BOOLEAN NOT NULL DEFAULT false,
    "promotion_id" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_telemetry_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_promotions_owner_user_id_idx" ON "content_promotions"("owner_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_promotions_content_id_idx" ON "content_promotions"("content_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_promotions_status_idx" ON "content_promotions"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "content_telemetry_events_dedupe_key_key" ON "content_telemetry_events"("dedupe_key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_telemetry_events_content_id_event_type_idx" ON "content_telemetry_events"("content_id", "event_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_telemetry_events_content_id_created_at_idx" ON "content_telemetry_events"("content_id", "created_at");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "content_promotions" ADD CONSTRAINT "content_promotions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "creator_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "content_telemetry_events" ADD CONSTRAINT "content_telemetry_events_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "creator_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "content_telemetry_events" ADD CONSTRAINT "content_telemetry_events_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "content_promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
