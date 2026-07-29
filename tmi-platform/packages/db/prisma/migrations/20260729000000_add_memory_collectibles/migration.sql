-- EOS Phase 7.3 — Memory & Collectibles Engine
-- Personal media library + keepsakes. Not competition ledger / playlists / tips.
-- Schema includes 7.4-ready album/edit/tag fields; cinematic UI is FUTURE APPROVED.

CREATE TABLE IF NOT EXISTS "memory_albums" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "presetKey" TEXT,
    "coverUrl" TEXT,
    "animatedBorder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_albums_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "memory_albums_ownerId_idx" ON "memory_albums"("ownerId");

DO $$ BEGIN
  ALTER TABLE "memory_albums"
    ADD CONSTRAINT "memory_albums_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "memory_collectibles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "artworkUrl" TEXT,
    "albumId" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" TIMESTAMP(3),
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "eventId" TEXT,
    "venueId" TEXT,
    "ticketId" TEXT,
    "ticketCollectibleId" TEXT,
    "rarity" TEXT,
    "attendedAt" TIMESTAMP(3),
    "locationLabel" TEXT,
    "taggedUserIds" JSONB,
    "yophoPageId" TEXT,
    "editOriginalMediaId" TEXT,
    "captureQuality" TEXT,
    "captureDestination" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_collectibles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "memory_collectibles_ownerId_trashedAt_createdAt_idx"
  ON "memory_collectibles"("ownerId", "trashedAt", "createdAt");

CREATE INDEX IF NOT EXISTS "memory_collectibles_ownerId_kind_idx"
  ON "memory_collectibles"("ownerId", "kind");

CREATE INDEX IF NOT EXISTS "memory_collectibles_ownerId_isFavorite_idx"
  ON "memory_collectibles"("ownerId", "isFavorite");

CREATE INDEX IF NOT EXISTS "memory_collectibles_ticketId_idx"
  ON "memory_collectibles"("ticketId");

CREATE INDEX IF NOT EXISTS "memory_collectibles_albumId_idx"
  ON "memory_collectibles"("albumId");

CREATE INDEX IF NOT EXISTS "memory_collectibles_editOriginalMediaId_idx"
  ON "memory_collectibles"("editOriginalMediaId");

DO $$ BEGIN
  ALTER TABLE "memory_collectibles"
    ADD CONSTRAINT "memory_collectibles_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "memory_collectibles"
    ADD CONSTRAINT "memory_collectibles_albumId_fkey"
    FOREIGN KEY ("albumId") REFERENCES "memory_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
