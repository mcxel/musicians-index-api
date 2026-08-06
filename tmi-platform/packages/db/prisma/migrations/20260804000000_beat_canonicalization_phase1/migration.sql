-- Living OS Beat Ecosystem Phase 1 — additive only. Fixes real production
-- breakage reported 2026-08-04 ("beats disappearing when trying to save"):
-- apps/web/src/app/api/beats/submit/route.ts (and sibling beats routes)
-- already write/read canonicalId, royaltySplits, provenanceEvents, etc.,
-- but none of these columns/tables existed on Beat, so every save failed.
-- All new Beat columns are nullable or defaulted since this table already
-- has legacy rows.

-- AlterTable
ALTER TABLE "Beat"
  ADD COLUMN "canonicalId" TEXT,
  ADD COLUMN "audioAssetUrl" TEXT,
  ADD COLUMN "audioFilename" TEXT,
  ADD COLUMN "audioFileHash" TEXT,
  ADD COLUMN "audioFileSizeBytes" INTEGER,
  ADD COLUMN "genreJson" TEXT,
  ADD COLUMN "moodJson" TEXT,
  ADD COLUMN "energyLevel" TEXT,
  ADD COLUMN "eligiblePoolsJson" TEXT,
  ADD COLUMN "competitionEligible" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "licenseType" TEXT NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "batchIngestSession" TEXT,
  ADD COLUMN "rightsDeclarationAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "certifiedAt" TIMESTAMP(3),
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "durationSeconds" INTEGER,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Beat_canonicalId_key" ON "Beat"("canonicalId");

-- CreateIndex
CREATE INDEX "Beat_audioFileHash_idx" ON "Beat"("audioFileHash");

-- CreateTable
CREATE TABLE "BeatRoyaltySplit" (
    "id" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "accountId" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeatRoyaltySplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatProvenanceEvent" (
    "id" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "contextJson" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeatProvenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatCertificationResult" (
    "id" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "loudnessMeasuredLufs" DOUBLE PRECISION,
    "failureReasonsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeatCertificationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatReviewRecord" (
    "id" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeatReviewRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeatRoyaltySplit_beatId_idx" ON "BeatRoyaltySplit"("beatId");

-- CreateIndex
CREATE INDEX "BeatProvenanceEvent_beatId_idx" ON "BeatProvenanceEvent"("beatId");

-- CreateIndex
CREATE INDEX "BeatCertificationResult_beatId_idx" ON "BeatCertificationResult"("beatId");

-- CreateIndex
CREATE INDEX "BeatReviewRecord_beatId_idx" ON "BeatReviewRecord"("beatId");

-- AddForeignKey
ALTER TABLE "BeatRoyaltySplit" ADD CONSTRAINT "BeatRoyaltySplit_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatProvenanceEvent" ADD CONSTRAINT "BeatProvenanceEvent_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatCertificationResult" ADD CONSTRAINT "BeatCertificationResult_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatReviewRecord" ADD CONSTRAINT "BeatReviewRecord_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
