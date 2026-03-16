-- CreateEnum
CREATE TYPE "OnboardingState" AS ENUM ('NO_ROLE_SELECTED', 'INCOMPLETE', 'COMPLETE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canSubmitOfficialPlatformLinks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingState" "OnboardingState" NOT NULL DEFAULT 'NO_ROLE_SELECTED';

-- CreateTable
CREATE TABLE "contest_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "startDate" TIMESTAMP(3) NOT NULL,
    "registrationOpen" TIMESTAMP(3) NOT NULL,
    "registrationClose" TIMESTAMP(3) NOT NULL,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "sponsorCollectionEndDate" TIMESTAMP(3) NOT NULL,
    "regionalsStartDate" TIMESTAMP(3) NOT NULL,
    "regionalsEndDate" TIMESTAMP(3) NOT NULL,
    "semiFinalsStartDate" TIMESTAMP(3) NOT NULL,
    "semiFinalsEndDate" TIMESTAMP(3) NOT NULL,
    "finalsDate" TIMESTAMP(3) NOT NULL,
    "prizePool" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_entries" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stageName" TEXT,
    "performanceDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "localSponsorCount" INTEGER NOT NULL DEFAULT 0,
    "majorSponsorCount" INTEGER NOT NULL DEFAULT 0,
    "roundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_contributions" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageLabel" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "adminNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "paymentReference" TEXT,
    "paymentVerifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsor_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_packages" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "benefits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sponsor_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_rounds" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_votes" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_prizes" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prizeType" TEXT NOT NULL,
    "cashValue" DOUBLE PRECISION,
    "otherValue" TEXT,
    "placement" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_fulfillments" (
    "id" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prize_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ray_journey_scripts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "emotion" TEXT NOT NULL DEFAULT 'neutral',
    "variables" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ray_journey_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_cues" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "host_cues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_entries_artistId_seasonId_key" ON "contest_entries"("artistId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_contributions_entryId_sponsorId_key" ON "sponsor_contributions"("entryId", "sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "contest_votes_entryId_voterId_roundId_key" ON "contest_votes"("entryId", "voterId", "roundId");

-- AddForeignKey
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "contest_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "contest_rounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_contributions" ADD CONSTRAINT "sponsor_contributions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "contest_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_rounds" ADD CONSTRAINT "contest_rounds_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "contest_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_votes_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "contest_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_prizes" ADD CONSTRAINT "contest_prizes_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "contest_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_fulfillments" ADD CONSTRAINT "prize_fulfillments_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "contest_prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
