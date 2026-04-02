-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('POINTS', 'AVATAR_ITEM', 'SPONSOR_ITEM', 'DISCOUNT_CODE', 'FREE_TICKET', 'BACKSTAGE_PASS', 'MERCH_ITEM', 'DIGITAL_COLLECTIBLE', 'BADGE', 'TITLE', 'RANK_BOOST', 'SHOUTOUT', 'SKIP_QUEUE', 'PRIORITY_ENTRY', 'BONUS_VOTE', 'MYSTERY_BOX', 'WALLET_CREDIT');

-- CreateEnum
CREATE TYPE "RewardTrigger" AS ENUM ('RANDOM_AUDIENCE_DROP', 'RANDOM_CONTESTANT_DROP', 'FIRST_TO_REACT', 'FIRST_CORRECT_ANSWER', 'FIRST_TO_JOIN_ROOM', 'FIRST_TICKET_BUYER', 'FASTEST_RESPONSE', 'MODERATOR_MANUAL_GIFT', 'HOST_MANUAL_GIFT', 'SPONSOR_TRIGGERED', 'BOT_TRIGGERED', 'STREAK_REWARD', 'ATTENDANCE_REWARD', 'PARTICIPATION_REWARD', 'LOYALTY_REWARD', 'SURPRISE_LIVE_DROP', 'MILESTONE_REWARD', 'LEADERBOARD_REWARD', 'CONTEST_WINNER', 'AUDIENCE_VOTE_WINNER', 'CHALLENGE_COMPLETION', 'REFERRAL_REWARD');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'FULFILLED', 'FAILED', 'FRAUD_REVIEW', 'REQUIRES_BIG_ACE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('TRIVIA', 'REACTION', 'FASTEST_TAP', 'FILL_BLANK', 'PICK_WINNER', 'SHOUTOUT_REQUEST');

-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorLogs" TEXT,
    "metrics" JSONB,

    CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJobLog" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER NOT NULL,
    "details" TEXT,

    CONSTRAINT "CronJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "triggerType" "RewardTrigger" NOT NULL,
    "pointsAmount" INTEGER,
    "itemId" TEXT,
    "discountPct" INTEGER,
    "walletCreditCents" INTEGER,
    "eligibleRoles" TEXT[],
    "eligibleRoomTypes" TEXT[],
    "minimumWatchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "minimumParticipationActions" INTEGER NOT NULL DEFAULT 0,
    "requiresTicket" BOOLEAN NOT NULL DEFAULT false,
    "requiresVerifiedAccount" BOOLEAN NOT NULL DEFAULT false,
    "dropOddsPct" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "maxClaimsPerUser" INTEGER NOT NULL DEFAULT 1,
    "maxClaimsPerEvent" INTEGER NOT NULL DEFAULT 0,
    "maxClaimsPerSession" INTEGER NOT NULL DEFAULT 0,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 0,
    "minAccountAgeDays" INTEGER NOT NULL DEFAULT 0,
    "maxVelocityPerMinute" INTEGER NOT NULL DEFAULT 10,
    "requiresRoomPresence" BOOLEAN NOT NULL DEFAULT true,
    "requiresBigAceApproval" BOOLEAN NOT NULL DEFAULT false,
    "sponsorId" TEXT,
    "campaignId" TEXT,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claims" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "sessionId" TEXT,
    "eventId" TEXT,
    "roomId" TEXT,
    "rewardType" "RewardType" NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "pointsGranted" INTEGER,
    "itemGrantedId" TEXT,
    "discountCode" TEXT,
    "walletCreditCents" INTEGER,
    "requiresBigAce" BOOLEAN NOT NULL DEFAULT false,
    "requiresFraudReview" BOOLEAN NOT NULL DEFAULT false,
    "fraudReviewNote" TEXT,
    "fulfilledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_prompts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "promptType" "PromptType" NOT NULL,
    "question" TEXT,
    "correctAnswer" TEXT,
    "windowSeconds" INTEGER NOT NULL DEFAULT 15,
    "maxWinners" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "winners" TEXT[],
    "firedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audience_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_prompt_entries" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "response" TEXT,
    "responseTimeMs" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audience_prompt_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_tables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sponsorId" TEXT,
    "eventId" TEXT,
    "guaranteedAfterNDraws" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drop_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_table_entries" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "itemId" TEXT,
    "pointsAmount" INTEGER,
    "weight" INTEGER NOT NULL DEFAULT 100,
    "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON',
    "maxTotal" INTEGER,
    "droppedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "drop_table_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_cooldowns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_cooldowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_fraud_flags" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "patternData" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_fraud_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_prize_catalog" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "totalQty" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsor_prize_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "templateEmailSubject" TEXT,
    "templateEmailBody" TEXT,
    "templateSms" TEXT,
    "templatePushTitle" TEXT,
    "templatePushBody" TEXT,
    "templateInAppTitle" TEXT,
    "templateInAppBody" TEXT,
    "templateInAppHref" TEXT,
    "requiredVariables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outgoing_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,
    "data" JSONB,
    "sentContentSubject" TEXT,
    "sentContentBody" TEXT,
    "inAppNotificationId" TEXT,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "providerError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "outgoing_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "in_app_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineRun_name_status_idx" ON "PipelineRun"("name", "status");

-- CreateIndex
CREATE INDEX "CronJobLog_jobName_executedAt_idx" ON "CronJobLog"("jobName", "executedAt");

-- CreateIndex
CREATE INDEX "reward_rules_isActive_idx" ON "reward_rules"("isActive");

-- CreateIndex
CREATE INDEX "reward_rules_triggerType_idx" ON "reward_rules"("triggerType");

-- CreateIndex
CREATE INDEX "reward_claims_userId_idx" ON "reward_claims"("userId");

-- CreateIndex
CREATE INDEX "reward_claims_status_idx" ON "reward_claims"("status");

-- CreateIndex
CREATE INDEX "reward_claims_claimedAt_idx" ON "reward_claims"("claimedAt");

-- CreateIndex
CREATE INDEX "audience_prompts_sessionId_idx" ON "audience_prompts"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "audience_prompt_entries_promptId_userId_key" ON "audience_prompt_entries"("promptId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "reward_cooldowns_userId_ruleId_key" ON "reward_cooldowns"("userId", "ruleId");

-- CreateIndex
CREATE UNIQUE INDEX "reward_fraud_flags_claimId_key" ON "reward_fraud_flags"("claimId");

-- CreateIndex
CREATE INDEX "reward_fraud_flags_userId_idx" ON "reward_fraud_flags"("userId");

-- CreateIndex
CREATE INDEX "reward_fraud_flags_isResolved_idx" ON "reward_fraud_flags"("isResolved");

-- CreateIndex
CREATE INDEX "sponsor_prize_catalog_sponsorId_idx" ON "sponsor_prize_catalog"("sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_type_key" ON "notification_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "outgoing_notifications_inAppNotificationId_key" ON "outgoing_notifications"("inAppNotificationId");

-- CreateIndex
CREATE INDEX "outgoing_notifications_userId_status_createdAt_idx" ON "outgoing_notifications"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "in_app_notifications_userId_isRead_createdAt_idx" ON "in_app_notifications"("userId", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "reward_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_prompts" ADD CONSTRAINT "audience_prompts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "reward_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_prompt_entries" ADD CONSTRAINT "audience_prompt_entries_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "audience_prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_table_entries" ADD CONSTRAINT "drop_table_entries_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "drop_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_notifications" ADD CONSTRAINT "outgoing_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_notifications" ADD CONSTRAINT "outgoing_notifications_inAppNotificationId_fkey" FOREIGN KEY ("inAppNotificationId") REFERENCES "in_app_notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
