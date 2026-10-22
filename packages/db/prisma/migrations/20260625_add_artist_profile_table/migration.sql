-- ArtistProfile is already created by 20260326225501_profiles
-- (ON DELETE RESTRICT ON UPDATE CASCADE). This folder repeats that table.
-- Replaying the original CREATE fails with 42P07 once profiles has run.
-- The foreign key below omits ON UPDATE CASCADE, so an existing constraint
-- must be left untouched. When the table is already present this file is a no-op.

CREATE TABLE IF NOT EXISTS "ArtistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stageName" TEXT,
    "slug" TEXT,
    "genres" TEXT[],
    "skills" TEXT[],
    "label" TEXT,
    "manager" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArtistProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ArtistProfile_userId_key" ON "ArtistProfile"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "ArtistProfile_slug_key" ON "ArtistProfile"("slug");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ArtistProfile_userId_fkey'
      AND conrelid = 'public."ArtistProfile"'::regclass
  ) THEN
    ALTER TABLE "ArtistProfile"
      ADD CONSTRAINT "ArtistProfile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;
  END IF;
END $$;
