-- CreateEnum
CREATE TYPE "BotTeamCategory" AS ENUM ('BUILD_ENGINEERING', 'DESIGN_CREATIVE', 'ARCHITECTURE_SYSTEM', 'MAGAZINE_EDITORIAL', 'LIVE_GAME', 'ECONOMY_REVENUE', 'SECURITY_SUPPORT', 'AI_ASSET', 'NFT_CREATION', 'BEAT_PRODUCTION', 'ANIMATION_CINEMA', 'SOCIAL_COMMUNITY', 'ANALYTICS_REPORTING');

-- CreateEnum
CREATE TYPE "BotStatus" AS ENUM ('ACTIVE', 'IDLE', 'ASSIGNED', 'PAUSED', 'ERROR', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('P0_CRITICAL', 'P1_HIGH', 'P2_MEDIUM', 'P3_LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EscalationLevel" AS ENUM ('BOT_TEAM_LEAD', 'MICHAEL_CHARLIE', 'BIG_ACE');

-- CreateEnum
CREATE TYPE "CheckpointFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "QualityGateResult" AS ENUM ('PASS', 'PARTIAL', 'FAIL');

-- CreateEnum
CREATE TYPE "BookingOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('OPEN', 'MATCHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LOCAL', 'REGIONAL', 'INTERNATIONAL', 'ONLINE', 'LIVESTREAM', 'CYPHER', 'DANCE_PARTY', 'COMPETITION', 'OPEN_MIC', 'FESTIVAL');

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN     "maxResaleMarkupPct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resaleAllowed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canUseVoiceChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faceVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ticket_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmountCents" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_scans" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "scannerUserId" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "platformFeePct" INTEGER NOT NULL DEFAULT 10,
    "totalInventory" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pass_purchases" (
    "id" TEXT NOT NULL,
    "passId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pass_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'credit',
    "status" TEXT NOT NULL DEFAULT 'posted',
    "referenceId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "xpAmount" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "roomId" TEXT,
    "articleId" TEXT,
    "sponsorClickId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "windowDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_click_rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "campaignId" TEXT,
    "pointsGranted" INTEGER NOT NULL DEFAULT 0,
    "walletCreditCents" INTEGER NOT NULL DEFAULT 0,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,

    CONSTRAINT "sponsor_click_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_reconciliations" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletBalance" INTEGER NOT NULL,
    "ledgerCreditSum" INTEGER NOT NULL,
    "ledgerDebitSum" INTEGER NOT NULL,
    "computedBalance" INTEGER NOT NULL,
    "discrepancyCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "reconciledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLOSED',
    "ownerId" TEXT,
    "maxCapacity" INTEGER NOT NULL DEFAULT 10000,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "memberIds" TEXT[],

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_sessions" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "room_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lobbies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "theme" TEXT NOT NULL DEFAULT 'default_theater',
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "lobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lobby_themes" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assetUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lobby_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lobby_display_items" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "position" JSONB,

    CONSTRAINT "lobby_display_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_memories" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromArtistId" TEXT NOT NULL,
    "videoUrl" TEXT,
    "message" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fan_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "julius_variants" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "assetUrl" TEXT NOT NULL,

    CONSTRAINT "julius_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "julius_user_unlocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,

    CONSTRAINT "julius_user_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "julius_effects" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',

    CONSTRAINT "julius_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_members" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "actedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_invites" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_invites" (
    "id" TEXT NOT NULL,
    "partyId" TEXT,
    "lobbyId" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inviteType" TEXT NOT NULL DEFAULT 'party',
    "acceptedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_blocks" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_invites" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "roomId" TEXT,
    "eventId" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "role" TEXT NOT NULL DEFAULT 'performer',
    "acceptedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketTypeId" TEXT,

    CONSTRAINT "artist_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "verb" TEXT NOT NULL,
    "objectType" TEXT,
    "objectId" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_slugs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_slugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BotTeamCategory" NOT NULL,
    "mission" TEXT NOT NULL,
    "permissions" TEXT[],
    "dailyGoals" TEXT[],
    "weeklyGoals" TEXT[],
    "yearlyGoals" TEXT[],
    "failureFallback" TEXT,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ownerId" TEXT NOT NULL DEFAULT 'michael-charlie',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_agents" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "BotStatus" NOT NULL DEFAULT 'IDLE',
    "capabilities" TEXT[],
    "lastHeartbeat" TIMESTAMP(3),
    "assignedTaskId" TEXT,
    "totalTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalTasksFailed" INTEGER NOT NULL DEFAULT 0,
    "driftDetected" BOOLEAN NOT NULL DEFAULT false,
    "driftReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductor_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'P2_MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "teamId" TEXT,
    "agentId" TEXT,
    "subsystem" TEXT,
    "proofFiles" TEXT[],
    "proofRoutes" TEXT[],
    "buildStatus" TEXT,
    "runtimeStatus" TEXT,
    "blockerNote" TEXT,
    "ownerNote" TEXT,
    "directedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conductor_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_checkpoints" (
    "id" TEXT NOT NULL,
    "frequency" "CheckpointFrequency" NOT NULL,
    "teamId" TEXT,
    "agentId" TEXT,
    "taskId" TEXT,
    "result" "QualityGateResult" NOT NULL DEFAULT 'FAIL',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "evidence" TEXT[],
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_escalations" (
    "id" TEXT NOT NULL,
    "level" "EscalationLevel" NOT NULL DEFAULT 'MICHAEL_CHARLIE',
    "taskId" TEXT,
    "agentId" TEXT,
    "subsystem" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'P1_HIGH',
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_audit_logs" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "agentId" TEXT,
    "taskId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "actor" TEXT NOT NULL DEFAULT 'michael-charlie',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_reports" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "subsystem" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "details" JSONB,
    "issues" TEXT[],
    "recommendations" TEXT[],
    "generatedBy" TEXT NOT NULL DEFAULT 'michael-charlie',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductor_directives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL DEFAULT 'michael-charlie',
    "targetTeams" TEXT[],
    "priority" "TaskPriority" NOT NULL DEFAULT 'P2_MEDIUM',
    "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conductor_directives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_recommendations" (
    "id" TEXT NOT NULL,
    "subsystem" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_gates" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "subsystem" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "result" "QualityGateResult" NOT NULL DEFAULT 'FAIL',
    "proof" TEXT,
    "checkedBy" TEXT NOT NULL DEFAULT 'michael-charlie',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "quality_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_timelines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subsystem" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerBot" TEXT,
    "decisionMadeAt" TIMESTAMP(3),
    "proofSubmittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "escalatedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" "TaskPriority" NOT NULL DEFAULT 'P1_HIGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kill_switches" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "disabledBy" TEXT,
    "disabledAt" TIMESTAMP(3),
    "reason" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kill_switches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_reconciliations" (
    "id" TEXT NOT NULL,
    "reconcileDate" TIMESTAMP(3) NOT NULL,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardsIssued" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardsClaimed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ticketRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sponsorRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discrepancies" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reconciledBy" TEXT NOT NULL DEFAULT 'michael-charlie',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3),
    "reportedReason" TEXT,
    "mutedByPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "blockedPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_chat_messages" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3),
    "reportedReason" TEXT,
    "mutedByPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "blockedPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_mapping_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profile" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_mapping_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_members" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueType" TEXT NOT NULL DEFAULT 'CLUB',
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_locations" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "venue_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_availability" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,

    CONSTRAINT "venue_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_territories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeLatitude" DOUBLE PRECISION,
    "homeLongitude" DOUBLE PRECISION,
    "homeCity" TEXT,
    "homeCountry" TEXT NOT NULL DEFAULT 'US',
    "travelRadiusKm" INTEGER NOT NULL DEFAULT 100,
    "willingToTravelNational" BOOLEAN NOT NULL DEFAULT false,
    "willingToTravelIntl" BOOLEAN NOT NULL DEFAULT false,
    "onlineAvailable" BOOLEAN NOT NULL DEFAULT true,
    "budgetMin" INTEGER NOT NULL DEFAULT 0,
    "budgetMax" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_availability" (
    "id" TEXT NOT NULL,
    "artistTerritoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,

    CONSTRAINT "artist_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_exposure_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalShows" INTEGER NOT NULL DEFAULT 0,
    "underservedScore" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "lastBookedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_exposure_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_requests" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "venueUserId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusKm" INTEGER NOT NULL DEFAULT 100,
    "genres" TEXT[],
    "eventDate" TIMESTAMP(3) NOT NULL,
    "budgetMin" INTEGER NOT NULL DEFAULT 0,
    "budgetMax" INTEGER NOT NULL DEFAULT 0,
    "eventType" "EventType" NOT NULL DEFAULT 'LOCAL',
    "status" "BookingRequestStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_matches" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "artistProfileId" TEXT,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "distanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "genreScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exposureBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participationBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subscriptionBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repeatPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recentBookingPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "isFirstTimeForVenue" BOOLEAN NOT NULL DEFAULT true,
    "isCooldownBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_offers" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "venueUserId" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "budgetCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "status" "BookingOfferStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_history" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "budgetCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "eventType" "EventType" NOT NULL DEFAULT 'LOCAL',
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "booking_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_artist_history" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "bookedAt" TIMESTAMP(3) NOT NULL,
    "cooldownUntil" TIMESTAMP(3) NOT NULL,
    "cooldownDays" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "venue_artist_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_booking_scores" (
    "id" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "distanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "genreScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exposureBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participationBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subscriptionBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_booking_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_rules" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "cooldownDays" INTEGER NOT NULL DEFAULT 30,
    "maxCooldownDays" INTEGER NOT NULL DEFAULT 90,
    "minPoolSize" INTEGER NOT NULL DEFAULT 5,
    "exposureBoostThreshold" INTEGER NOT NULL DEFAULT 100,
    "repeatPenaltyPoints" INTEGER NOT NULL DEFAULT 20,
    "recentBookingPenalty" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "participant1" TEXT NOT NULL,
    "participant2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL DEFAULT 'sent',
    "deliveredAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_votes" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "votedFor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assetType" TEXT NOT NULL,
    "assetRef" TEXT,
    "sellerId" TEXT NOT NULL,
    "reservePrice" INTEGER NOT NULL,
    "buyoutPrice" INTEGER,
    "currentBid" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_bids" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "isWinning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_download_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_download_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSec" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_variants" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSec" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_access_logs" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT,
    "tokenId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_orders_userId_createdAt_idx" ON "ticket_orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_orders_eventId_status_idx" ON "ticket_orders"("eventId", "status");

-- CreateIndex
CREATE INDEX "ticket_scans_ticketId_scannedAt_idx" ON "ticket_scans"("ticketId", "scannedAt");

-- CreateIndex
CREATE INDEX "ticket_scans_scannerUserId_scannedAt_idx" ON "ticket_scans"("scannerUserId", "scannedAt");

-- CreateIndex
CREATE UNIQUE INDEX "passes_slug_key" ON "passes"("slug");

-- CreateIndex
CREATE INDEX "passes_isActive_soldCount_idx" ON "passes"("isActive", "soldCount");

-- CreateIndex
CREATE INDEX "pass_purchases_userId_purchasedAt_idx" ON "pass_purchases"("userId", "purchasedAt");

-- CreateIndex
CREATE INDEX "pass_purchases_passId_purchasedAt_idx" ON "pass_purchases"("passId", "purchasedAt");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_createdAt_idx" ON "wallet_transactions"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "wallet_transactions_category_createdAt_idx" ON "wallet_transactions"("category", "createdAt");

-- CreateIndex
CREATE INDEX "xp_events_userId_createdAt_idx" ON "xp_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "xp_events_source_createdAt_idx" ON "xp_events"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reward_idempotency_keys_key_key" ON "reward_idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "reward_idempotency_keys_userId_trigger_idx" ON "reward_idempotency_keys"("userId", "trigger");

-- CreateIndex
CREATE INDEX "reward_idempotency_keys_key_idx" ON "reward_idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "sponsor_click_rewards_userId_clickedAt_idx" ON "sponsor_click_rewards"("userId", "clickedAt");

-- CreateIndex
CREATE INDEX "sponsor_click_rewards_sponsorId_clickedAt_idx" ON "sponsor_click_rewards"("sponsorId", "clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_click_rewards_userId_sponsorId_campaignId_key" ON "sponsor_click_rewards"("userId", "sponsorId", "campaignId");

-- CreateIndex
CREATE INDEX "wallet_reconciliations_userId_reconciledAt_idx" ON "wallet_reconciliations"("userId", "reconciledAt");

-- CreateIndex
CREATE INDEX "wallet_reconciliations_status_idx" ON "wallet_reconciliations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lobbies_userId_key" ON "lobbies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lobby_themes_key_key" ON "lobby_themes"("key");

-- CreateIndex
CREATE UNIQUE INDEX "julius_variants_key_key" ON "julius_variants"("key");

-- CreateIndex
CREATE UNIQUE INDEX "julius_user_unlocks_userId_variantId_key" ON "julius_user_unlocks"("userId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "julius_effects_key_key" ON "julius_effects"("key");

-- CreateIndex
CREATE UNIQUE INDEX "party_members_partyId_userId_key" ON "party_members"("partyId", "userId");

-- CreateIndex
CREATE INDEX "friendships_addresseeId_status_idx" ON "friendships"("addresseeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_requesterId_addresseeId_key" ON "friendships"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "follows_targetId_createdAt_idx" ON "follows"("targetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_targetId_key" ON "follows"("followerId", "targetId");

-- CreateIndex
CREATE INDEX "room_invites_recipientId_status_idx" ON "room_invites"("recipientId", "status");

-- CreateIndex
CREATE INDEX "room_invites_roomId_createdAt_idx" ON "room_invites"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "party_invites_recipientId_status_idx" ON "party_invites"("recipientId", "status");

-- CreateIndex
CREATE INDEX "party_invites_createdAt_idx" ON "party_invites"("createdAt");

-- CreateIndex
CREATE INDEX "friend_blocks_blockerId_createdAt_idx" ON "friend_blocks"("blockerId", "createdAt");

-- CreateIndex
CREATE INDEX "friend_blocks_blockedId_idx" ON "friend_blocks"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "friend_blocks_blockerId_blockedId_key" ON "friend_blocks"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "artist_invites_recipientId_status_idx" ON "artist_invites"("recipientId", "status");

-- CreateIndex
CREATE INDEX "artist_invites_senderId_createdAt_idx" ON "artist_invites"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "artist_invites_roomId_status_idx" ON "artist_invites"("roomId", "status");

-- CreateIndex
CREATE INDEX "activity_events_actorId_createdAt_idx" ON "activity_events"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_events_targetId_createdAt_idx" ON "activity_events"("targetId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_events_verb_createdAt_idx" ON "activity_events"("verb", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "room_slugs_slug_key" ON "room_slugs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "room_slugs_roomId_key" ON "room_slugs"("roomId");

-- CreateIndex
CREATE INDEX "room_slugs_slug_idx" ON "room_slugs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "bot_teams_name_key" ON "bot_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bot_agents_handle_key" ON "bot_agents"("handle");

-- CreateIndex
CREATE INDEX "bot_agents_teamId_status_idx" ON "bot_agents"("teamId", "status");

-- CreateIndex
CREATE INDEX "conductor_tasks_status_priority_idx" ON "conductor_tasks"("status", "priority");

-- CreateIndex
CREATE INDEX "conductor_tasks_teamId_status_idx" ON "conductor_tasks"("teamId", "status");

-- CreateIndex
CREATE INDEX "conductor_tasks_subsystem_status_idx" ON "conductor_tasks"("subsystem", "status");

-- CreateIndex
CREATE INDEX "bot_checkpoints_frequency_result_idx" ON "bot_checkpoints"("frequency", "result");

-- CreateIndex
CREATE INDEX "bot_checkpoints_teamId_frequency_idx" ON "bot_checkpoints"("teamId", "frequency");

-- CreateIndex
CREATE INDEX "bot_escalations_level_resolvedAt_idx" ON "bot_escalations"("level", "resolvedAt");

-- CreateIndex
CREATE INDEX "bot_escalations_priority_createdAt_idx" ON "bot_escalations"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "bot_audit_logs_agentId_createdAt_idx" ON "bot_audit_logs"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "bot_audit_logs_teamId_createdAt_idx" ON "bot_audit_logs"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "bot_audit_logs_action_createdAt_idx" ON "bot_audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "system_health_reports_subsystem_reportType_idx" ON "system_health_reports"("subsystem", "reportType");

-- CreateIndex
CREATE INDEX "system_health_reports_createdAt_idx" ON "system_health_reports"("createdAt");

-- CreateIndex
CREATE INDEX "conductor_directives_isActive_priority_idx" ON "conductor_directives"("isActive", "priority");

-- CreateIndex
CREATE INDEX "conductor_directives_issuedBy_createdAt_idx" ON "conductor_directives"("issuedBy", "createdAt");

-- CreateIndex
CREATE INDEX "growth_recommendations_subsystem_status_idx" ON "growth_recommendations"("subsystem", "status");

-- CreateIndex
CREATE INDEX "quality_gates_subsystem_result_idx" ON "quality_gates"("subsystem", "result");

-- CreateIndex
CREATE INDEX "quality_gates_taskId_checkName_idx" ON "quality_gates"("taskId", "checkName");

-- CreateIndex
CREATE INDEX "incident_timelines_status_priority_idx" ON "incident_timelines"("status", "priority");

-- CreateIndex
CREATE INDEX "incident_timelines_subsystem_createdAt_idx" ON "incident_timelines"("subsystem", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "kill_switches_key_key" ON "kill_switches"("key");

-- CreateIndex
CREATE INDEX "approval_requests_status_actionType_idx" ON "approval_requests"("status", "actionType");

-- CreateIndex
CREATE INDEX "approval_requests_requestedBy_createdAt_idx" ON "approval_requests"("requestedBy", "createdAt");

-- CreateIndex
CREATE INDEX "ledger_reconciliations_reconcileDate_idx" ON "ledger_reconciliations"("reconcileDate");

-- CreateIndex
CREATE INDEX "room_chat_messages_roomId_createdAt_idx" ON "room_chat_messages"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "room_chat_messages_userId_createdAt_idx" ON "room_chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "party_chat_messages_partyId_createdAt_idx" ON "party_chat_messages"("partyId", "createdAt");

-- CreateIndex
CREATE INDEX "party_chat_messages_userId_createdAt_idx" ON "party_chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "control_mapping_profiles_userId_key" ON "control_mapping_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "room_members_roomId_userId_key" ON "room_members"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "venue_profiles_userId_key" ON "venue_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "venue_locations_venueProfileId_key" ON "venue_locations"("venueProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "venue_availability_venueProfileId_date_key" ON "venue_availability"("venueProfileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "artist_territories_userId_key" ON "artist_territories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "artist_availability_artistTerritoryId_date_key" ON "artist_availability"("artistTerritoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "artist_exposure_stats_userId_key" ON "artist_exposure_stats"("userId");

-- CreateIndex
CREATE INDEX "booking_requests_venueProfileId_status_idx" ON "booking_requests"("venueProfileId", "status");

-- CreateIndex
CREATE INDEX "booking_requests_eventDate_idx" ON "booking_requests"("eventDate");

-- CreateIndex
CREATE INDEX "booking_matches_requestId_score_idx" ON "booking_matches"("requestId", "score");

-- CreateIndex
CREATE INDEX "booking_offers_artistUserId_status_idx" ON "booking_offers"("artistUserId", "status");

-- CreateIndex
CREATE INDEX "booking_offers_venueUserId_status_idx" ON "booking_offers"("venueUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "booking_history_offerId_key" ON "booking_history"("offerId");

-- CreateIndex
CREATE INDEX "booking_history_venueProfileId_eventDate_idx" ON "booking_history"("venueProfileId", "eventDate");

-- CreateIndex
CREATE INDEX "booking_history_artistUserId_eventDate_idx" ON "booking_history"("artistUserId", "eventDate");

-- CreateIndex
CREATE INDEX "venue_artist_history_venueProfileId_artistUserId_idx" ON "venue_artist_history"("venueProfileId", "artistUserId");

-- CreateIndex
CREATE INDEX "venue_artist_history_venueProfileId_cooldownUntil_idx" ON "venue_artist_history"("venueProfileId", "cooldownUntil");

-- CreateIndex
CREATE UNIQUE INDEX "artist_booking_scores_artistUserId_key" ON "artist_booking_scores"("artistUserId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_rules_venueProfileId_key" ON "booking_rules"("venueProfileId");

-- CreateIndex
CREATE INDEX "conversations_participant1_idx" ON "conversations"("participant1");

-- CreateIndex
CREATE INDEX "conversations_participant2_idx" ON "conversations"("participant2");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_participant1_participant2_key" ON "conversations"("participant1", "participant2");

-- CreateIndex
CREATE INDEX "direct_messages_conversationId_createdAt_idx" ON "direct_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "direct_messages_senderId_idx" ON "direct_messages"("senderId");

-- CreateIndex
CREATE INDEX "direct_messages_deliveryState_createdAt_idx" ON "direct_messages"("deliveryState", "createdAt");

-- CreateIndex
CREATE INDEX "battle_votes_battleId_idx" ON "battle_votes"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "battle_votes_battleId_voterId_key" ON "battle_votes"("battleId", "voterId");

-- CreateIndex
CREATE INDEX "auctions_status_endsAt_idx" ON "auctions"("status", "endsAt");

-- CreateIndex
CREATE INDEX "auctions_sellerId_idx" ON "auctions"("sellerId");

-- CreateIndex
CREATE INDEX "auction_bids_auctionId_amountCents_idx" ON "auction_bids"("auctionId", "amountCents");

-- CreateIndex
CREATE INDEX "auction_bids_bidderId_idx" ON "auction_bids"("bidderId");

-- CreateIndex
CREATE INDEX "vault_download_tokens_userId_assetType_idx" ON "vault_download_tokens"("userId", "assetType");

-- CreateIndex
CREATE INDEX "vault_download_tokens_expiresAt_idx" ON "vault_download_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "media_assets_ownerId_createdAt_idx" ON "media_assets"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "media_assets_category_createdAt_idx" ON "media_assets"("category", "createdAt");

-- CreateIndex
CREATE INDEX "media_assets_mediaType_idx" ON "media_assets"("mediaType");

-- CreateIndex
CREATE INDEX "media_variants_assetId_kind_idx" ON "media_variants"("assetId", "kind");

-- CreateIndex
CREATE INDEX "media_access_logs_assetId_createdAt_idx" ON "media_access_logs"("assetId", "createdAt");

-- CreateIndex
CREATE INDEX "media_access_logs_userId_createdAt_idx" ON "media_access_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "media_access_logs_action_createdAt_idx" ON "media_access_logs"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scans" ADD CONSTRAINT "ticket_scans_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scans" ADD CONSTRAINT "ticket_scans_scannerUserId_fkey" FOREIGN KEY ("scannerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pass_purchases" ADD CONSTRAINT "pass_purchases_passId_fkey" FOREIGN KEY ("passId") REFERENCES "passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pass_purchases" ADD CONSTRAINT "pass_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_sessions" ADD CONSTRAINT "room_sessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobbies" ADD CONSTRAINT "lobbies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobby_display_items" ADD CONSTRAINT "lobby_display_items_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "lobbies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_memories" ADD CONSTRAINT "fan_memories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_memories" ADD CONSTRAINT "fan_memories_fromArtistId_fkey" FOREIGN KEY ("fromArtistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "julius_user_unlocks" ADD CONSTRAINT "julius_user_unlocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "julius_user_unlocks" ADD CONSTRAINT "julius_user_unlocks_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "julius_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_invites" ADD CONSTRAINT "room_invites_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_invites" ADD CONSTRAINT "room_invites_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_invites" ADD CONSTRAINT "room_invites_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "lobbies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_blocks" ADD CONSTRAINT "friend_blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_blocks" ADD CONSTRAINT "friend_blocks_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_invites" ADD CONSTRAINT "artist_invites_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_invites" ADD CONSTRAINT "artist_invites_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_invites" ADD CONSTRAINT "artist_invites_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_invites" ADD CONSTRAINT "artist_invites_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_invites" ADD CONSTRAINT "artist_invites_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_slugs" ADD CONSTRAINT "room_slugs_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_agents" ADD CONSTRAINT "bot_agents_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "bot_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conductor_tasks" ADD CONSTRAINT "conductor_tasks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "bot_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conductor_tasks" ADD CONSTRAINT "conductor_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "bot_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_checkpoints" ADD CONSTRAINT "bot_checkpoints_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "bot_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_checkpoints" ADD CONSTRAINT "bot_checkpoints_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "bot_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_checkpoints" ADD CONSTRAINT "bot_checkpoints_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "conductor_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_escalations" ADD CONSTRAINT "bot_escalations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "conductor_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_escalations" ADD CONSTRAINT "bot_escalations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "bot_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_audit_logs" ADD CONSTRAINT "bot_audit_logs_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "bot_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_audit_logs" ADD CONSTRAINT "bot_audit_logs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "bot_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_audit_logs" ADD CONSTRAINT "bot_audit_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "conductor_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_gates" ADD CONSTRAINT "quality_gates_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "conductor_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_chat_messages" ADD CONSTRAINT "room_chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_chat_messages" ADD CONSTRAINT "room_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_chat_messages" ADD CONSTRAINT "party_chat_messages_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_chat_messages" ADD CONSTRAINT "party_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_mapping_profiles" ADD CONSTRAINT "control_mapping_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_profiles" ADD CONSTRAINT "venue_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_locations" ADD CONSTRAINT "venue_locations_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_availability" ADD CONSTRAINT "venue_availability_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_territories" ADD CONSTRAINT "artist_territories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_availability" ADD CONSTRAINT "artist_availability_artistTerritoryId_fkey" FOREIGN KEY ("artistTerritoryId") REFERENCES "artist_territories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_exposure_stats" ADD CONSTRAINT "artist_exposure_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_venueUserId_fkey" FOREIGN KEY ("venueUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_matches" ADD CONSTRAINT "booking_matches_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_offers" ADD CONSTRAINT "booking_offers_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "booking_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_offers" ADD CONSTRAINT "booking_offers_venueUserId_fkey" FOREIGN KEY ("venueUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_offers" ADD CONSTRAINT "booking_offers_artistUserId_fkey" FOREIGN KEY ("artistUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_history" ADD CONSTRAINT "booking_history_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "booking_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_history" ADD CONSTRAINT "booking_history_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_artist_history" ADD CONSTRAINT "venue_artist_history_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_rules" ADD CONSTRAINT "booking_rules_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "venue_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_votes" ADD CONSTRAINT "battle_votes_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_download_tokens" ADD CONSTRAINT "vault_download_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_access_logs" ADD CONSTRAINT "media_access_logs_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_access_logs" ADD CONSTRAINT "media_access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
