-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContributorLevel" AS ENUM ('NEW_CONTRIBUTOR', 'VERIFIED_CONTRIBUTOR', 'TRUSTED_EDITOR', 'STAFF_EDITOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EditorialSubmissionCategory" AS ENUM ('NEWS', 'ARTIST', 'PERFORMER', 'SPONSOR', 'ADVERTISER', 'INTERVIEW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EditorialSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "contributor_accounts" (
    "id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "level" "ContributorLevel" NOT NULL DEFAULT 'NEW_CONTRIBUTOR',
    "trust_score" INTEGER NOT NULL DEFAULT 25,
    "payout_cap_usd" INTEGER NOT NULL DEFAULT 1000,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "editorial_submissions" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "EditorialSubmissionCategory" NOT NULL,
    "source_urls" TEXT[],
    "artist_slug" TEXT,
    "sponsor_slug" TEXT,
    "status" "EditorialSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "editor_notes" TEXT,
    "published_article_slug" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "editorial_performance" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "verified_unique_readers" INTEGER NOT NULL DEFAULT 0,
    "read_completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "artist_profile_conversions" INTEGER NOT NULL DEFAULT 0,
    "follows_generated" INTEGER NOT NULL DEFAULT 0,
    "tips_generated_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sponsor_revenue_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suspicious_traffic_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "contributor_accounts_contributor_id_key" ON "contributor_accounts"("contributor_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "editorial_submissions_submission_id_key" ON "editorial_submissions"("submission_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "editorial_submissions_contributor_id_idx" ON "editorial_submissions"("contributor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "editorial_submissions_status_idx" ON "editorial_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "editorial_performance_submission_id_key" ON "editorial_performance"("submission_id");
