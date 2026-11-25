-- Show-to-Beat-Store verified performance use attribution
-- SCHEMA_READY — NOT applied. DATABASE_APPLIED = false.
-- Runtime: PROCESS_MEMORY (ShowToBeatStoreAttributionAuthority).

CREATE TABLE IF NOT EXISTS "BeatPerformanceUse" (
  "performanceUseId" TEXT PRIMARY KEY,
  "canonicalEventId" TEXT NOT NULL UNIQUE,
  "mediaAssetId" TEXT NOT NULL,
  "listingId" TEXT,
  "performerId" TEXT NOT NULL,
  "showId" TEXT,
  "sessionId" TEXT NOT NULL,
  "roomId" TEXT,
  "experienceType" TEXT NOT NULL,
  "playedAt" TIMESTAMP(3) NOT NULL,
  "verificationStatus" TEXT NOT NULL,
  "verificationSource" TEXT NOT NULL,
  "rightsSnapshot" TEXT,
  "storeConversion" TEXT NOT NULL,
  "sellerRightsholderId" TEXT,
  "displayTitle" TEXT,
  "invalidatedAt" TIMESTAMP(3),
  "invalidationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BeatPerformanceUse_mediaAssetId_idx" ON "BeatPerformanceUse"("mediaAssetId");
CREATE INDEX IF NOT EXISTS "BeatPerformanceUse_listingId_idx" ON "BeatPerformanceUse"("listingId");