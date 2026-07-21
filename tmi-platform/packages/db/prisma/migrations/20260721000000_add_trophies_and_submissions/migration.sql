-- CreateTable
CREATE TABLE IF NOT EXISTS "trophies" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awardedBy" TEXT NOT NULL DEFAULT 'system',
    "seasonId" TEXT,
    "battleId" TEXT,
    "eventId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferable" BOOLEAN NOT NULL DEFAULT false,
    "mintedAsNFT" BOOLEAN NOT NULL DEFAULT false,
    "nftTokenId" TEXT,

    CONSTRAINT "trophies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "show_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "showType" TEXT NOT NULL DEFAULT 'monday-stage',
    "actTitle" TEXT NOT NULL,
    "talentCategory" TEXT NOT NULL DEFAULT 'SINGING_MUSIC',
    "bpm" INTEGER DEFAULT 95,
    "genre" TEXT DEFAULT 'Hip-Hop / R&B',
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "rightsAttested" BOOLEAN NOT NULL DEFAULT true,
    "sampleClearanceDeclared" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'APPROVED_IN_ROTATION',
    "queuedForDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "show_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "trophies_userId_idx" ON "trophies"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "show_submissions_userId_idx" ON "show_submissions"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "show_submissions_showType_status_idx" ON "show_submissions"("showType", "status");

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_submissions" ADD CONSTRAINT "show_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
