-- Add is_qa flag to User table for QA Certification Fleet isolation.
-- Safe to run on existing databases: column is non-nullable with a default of false
-- so all existing rows are automatically marked as non-QA accounts.
--
-- This flag is the authoritative source for QA isolation. Email domain
-- (@themusiciansindex.test) is the secondary guard. Discovery, rankings,
-- leaderboards, search, and analytics must filter WHERE is_qa = false.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "is_qa" BOOLEAN NOT NULL DEFAULT false;

-- Index for fast exclusion in discovery/ranking queries
CREATE INDEX IF NOT EXISTS "User_is_qa_idx" ON "User" ("is_qa");
