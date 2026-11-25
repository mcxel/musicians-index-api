-- Creator Expression Content Spine (2026-09-16).
-- REVIEWABLE ARTIFACT ONLY — not applied to production this session.
-- Certification used equivalent additive-only DDL against a separate,
-- non-production test database (ep-muddy-morning-aim5jrn4), never against
-- apps/web/.env.local's production DATABASE_URL (ep-misty-paper-ai08hmy9).
-- Replaces the non-durable personalWritings JSON path — that field was
-- structurally proven (client serializer + server whitelist + missing
-- PublicProfileConfig column, three independent layers) to have no
-- persistence destination.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentType" AS ENUM ('PAGE_WRITING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "creator_content" (
    "id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "period_key" TEXT,
    "current_revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "creator_content_revisions" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "editor_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "creator_content_author_user_id_content_type_idx" ON "creator_content"("author_user_id", "content_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "creator_content_author_user_id_content_type_visibility_stat_idx" ON "creator_content"("author_user_id", "content_type", "visibility", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "creator_content_revisions_content_id_revision_key" ON "creator_content_revisions"("content_id", "revision");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "creator_content_revisions_content_id_idx" ON "creator_content_revisions"("content_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "creator_content_revisions" ADD CONSTRAINT "creator_content_revisions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "creator_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
