-- Collections Engine (media) + Achievement Collectibles scaffold
-- Evolves MemoryAlbum / MemoryCollectible toward Collection terminology.
-- Photo Collections ≠ Achievement Collectibles (parallel progression table).
-- UnlockMethod hard coupling deferred — unlockAccess is soft FUTURE only.

-- MemoryAlbum → Collection fields
ALTER TABLE "memory_albums" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "memory_albums" ADD COLUMN IF NOT EXISTS "unlockAccess" TEXT;

CREATE INDEX IF NOT EXISTS "memory_albums_ownerId_isDefault_idx"
  ON "memory_albums"("ownerId", "isDefault");

-- MemoryCollectible → MediaAsset presentation / edit / soft entitlement
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "frameSkin" JSONB;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "mediaEdit" JSONB;
ALTER TABLE "memory_collectibles" ADD COLUMN IF NOT EXISTS "unlockAccess" TEXT;

-- Multi-collection membership join (scaffold; dual-write with albumId OK)
CREATE TABLE IF NOT EXISTS "collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "collection_items_collectionId_mediaAssetId_key"
  ON "collection_items"("collectionId", "mediaAssetId");

CREATE INDEX IF NOT EXISTS "collection_items_collectionId_idx"
  ON "collection_items"("collectionId");

CREATE INDEX IF NOT EXISTS "collection_items_mediaAssetId_idx"
  ON "collection_items"("mediaAssetId");

DO $$ BEGIN
  ALTER TABLE "collection_items"
    ADD CONSTRAINT "collection_items_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "memory_albums"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "collection_items"
    ADD CONSTRAINT "collection_items_mediaAssetId_fkey"
    FOREIGN KEY ("mediaAssetId") REFERENCES "memory_collectibles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Achievement Collectibles (PROGRESSION) — Fan + Performer parallel
-- No seed grants — rows only when real Achievement path awards them (Rule 20).
CREATE TABLE IF NOT EXISTS "user_achievement_collectibles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "rolePath" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seasonKey" TEXT,
    "sourceLedgerEntryId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievement_collectibles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_achievement_collectibles_userId_definitionId_key"
  ON "user_achievement_collectibles"("userId", "definitionId");

CREATE INDEX IF NOT EXISTS "user_achievement_collectibles_userId_rolePath_idx"
  ON "user_achievement_collectibles"("userId", "rolePath");

CREATE INDEX IF NOT EXISTS "user_achievement_collectibles_userId_featured_idx"
  ON "user_achievement_collectibles"("userId", "featured");

DO $$ BEGIN
  ALTER TABLE "user_achievement_collectibles"
    ADD CONSTRAINT "user_achievement_collectibles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
