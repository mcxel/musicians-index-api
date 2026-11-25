-- Article Submission Form / first-article interview onboarding (2026-10-29).
-- SOURCE-PREPARED ONLY. Do NOT apply to any database. PRODUCTION_DB_MIGRATION=NO.
-- Extends the EXISTING `articles` table (reused authority — not a duplicate model).

BEGIN;

-- New workflow statuses on the existing enum.
ALTER TYPE "ArticleStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "ArticleStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';

-- Interview / subject / composition / photo columns.
ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "subjectUserId"   TEXT,
  ADD COLUMN IF NOT EXISTS "writerUserId"    TEXT,
  ADD COLUMN IF NOT EXISTS "compositionId"   TEXT,
  ADD COLUMN IF NOT EXISTS "interviewData"   JSONB,
  ADD COLUMN IF NOT EXISTS "photoCount"      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "articleCategory" TEXT    NOT NULL DEFAULT 'feature';

CREATE INDEX IF NOT EXISTS "articles_subjectUserId_idx"        ON "articles" ("subjectUserId");
CREATE INDEX IF NOT EXISTS "articles_status_publishedAt_idx"   ON "articles" ("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "articles_writerUserId_idx"         ON "articles" ("writerUserId");

COMMIT;
