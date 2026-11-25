-- Origami Audio identity + derivative registry
-- SCHEMA_READY — NOT applied to production. DATABASE_APPLIED = false.
-- Runtime this pass: PROCESS_MEMORY (OrigamiAudioFabric).

CREATE TABLE IF NOT EXISTS "OrigamiMediaAsset" (
  "mediaAssetId" TEXT PRIMARY KEY,
  "sourceHash" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "rightsholderId" TEXT NOT NULL,
  "rightsStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "sourceFormat" TEXT NOT NULL,
  "sourceDurationSec" DOUBLE PRECISION,
  "sourceBytes" INTEGER NOT NULL,
  "ingestProvenance" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "OrigamiMediaAsset_sourceHash_idx" ON "OrigamiMediaAsset"("sourceHash");

CREATE TABLE IF NOT EXISTS "OrigamiAudioDerivative" (
  "derivedAssetId" TEXT PRIMARY KEY,
  "parentMediaAssetId" TEXT NOT NULL,
  kind TEXT NOT NULL,
  transformation TEXT NOT NULL,
  "qaState" TEXT NOT NULL,
  "transformVersion" TEXT NOT NULL,
  "bytesGenerated" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
