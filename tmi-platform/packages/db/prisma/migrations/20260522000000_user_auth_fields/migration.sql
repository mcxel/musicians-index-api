-- Add standalone auth fields to User table
-- Safe to run on existing databases (all columns are nullable or have defaults)

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "display_name" TEXT,
  ADD COLUMN IF NOT EXISTS "user_ref" TEXT,
  ADD COLUMN IF NOT EXISTS "user_created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
