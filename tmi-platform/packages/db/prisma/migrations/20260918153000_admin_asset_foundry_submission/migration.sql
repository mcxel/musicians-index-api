-- Admin Asset Foundry durable submissions
-- Runtime authority: ensureAdminAssetFoundrySchema() (CREATE TABLE IF NOT EXISTS).
-- NO PROD DB mutation from this lane. Formal migrate optional later.

CREATE TABLE IF NOT EXISTS "AdminAssetFoundrySubmission" (
  id TEXT PRIMARY KEY,
  "actorUserId" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL,
  family TEXT NOT NULL,
  "ingestTimestamp" BIGINT NOT NULL,
  "contentHash" TEXT,
  "sizeBytes" INTEGER NOT NULL,
  "quarantineStatus" TEXT NOT NULL,
  "rightsStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "analysisStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "manufacturingStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "approvalStatus" TEXT NOT NULL DEFAULT 'NONE',
  "replacementStatus" TEXT NOT NULL DEFAULT 'NONE',
  lifecycle TEXT NOT NULL DEFAULT 'QUARANTINED',
  "derivedAssetsJson" TEXT NOT NULL DEFAULT '[]',
  "sourceLineageJson" TEXT NOT NULL DEFAULT '{}',
  "qaEvidenceJson" TEXT NOT NULL DEFAULT '[]',
  "failureReason" TEXT,
  "commerceEligibility" TEXT NOT NULL DEFAULT 'NOT_ELIGIBLE',
  "worldHarvestCandidateId" TEXT,
  "duplicateOfSubmissionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AdminAssetFoundrySubmission_contentHash_idx"
  ON "AdminAssetFoundrySubmission"("contentHash");
CREATE INDEX IF NOT EXISTS "AdminAssetFoundrySubmission_lifecycle_idx"
  ON "AdminAssetFoundrySubmission"(lifecycle);
