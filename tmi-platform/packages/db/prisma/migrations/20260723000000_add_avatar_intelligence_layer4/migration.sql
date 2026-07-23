-- Avatar Intelligence & Evolution System (LAYER 4) — additive only.
-- Hand-written from a reviewed `prisma migrate diff` output with the
-- unrelated destructive statements (drift from already-applied,
-- not-yet-reconciled migrations touching Submission/VenueTicketRecord/
-- VenueTicketScan/Subscription) stripped out. Only CREATE statements
-- for the 8 new avatar_* / experience_journals tables remain.

-- CreateTable
CREATE TABLE "avatar_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatar_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_dnas" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "dance_style" TEXT NOT NULL DEFAULT 'pop_shaker',
    "reaction_speed" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "introvert_extrovert" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "idle_style" TEXT NOT NULL DEFAULT 'idle_breath',
    "favorite_genres" TEXT[],
    "movement_intensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "eye_contact_tendency" DOUBLE PRECISION NOT NULL DEFAULT 0.75,

    CONSTRAINT "avatar_dnas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_progresses" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "concerts_attended" INTEGER NOT NULL DEFAULT 0,
    "battles_watched" INTEGER NOT NULL DEFAULT 0,
    "battles_entered" INTEGER NOT NULL DEFAULT 0,
    "cyphers_joined" INTEGER NOT NULL DEFAULT 0,
    "challenges_completed" INTEGER NOT NULL DEFAULT 0,
    "performances_given" INTEGER NOT NULL DEFAULT 0,
    "hours_in_venue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "supporter_level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "avatar_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_preferences" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "preferred_seat_row" INTEGER,
    "preferred_seat_col" INTEGER,
    "primary_color" TEXT NOT NULL DEFAULT '#FF2DAA',
    "glow_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "avatar_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_unlocks" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "unlock_key" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avatar_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_memories" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "top_performers" TEXT[],
    "top_venues" TEXT[],
    "frequent_reactions" TEXT[],

    CONSTRAINT "avatar_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_behavior_weights" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "comedy_affinity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "dance_affinity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "competition_intensity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "social_participation" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "music_responsiveness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "calmness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "avatar_behavior_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_journals" (
    "id" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "milestone_key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "achieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatar_identities_user_id_key" ON "avatar_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_dnas_avatar_id_key" ON "avatar_dnas"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_progresses_avatar_id_key" ON "avatar_progresses"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_preferences_avatar_id_key" ON "avatar_preferences"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_unlocks_avatar_id_unlock_key_key" ON "avatar_unlocks"("avatar_id", "unlock_key");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_memories_avatar_id_key" ON "avatar_memories"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_behavior_weights_avatar_id_key" ON "avatar_behavior_weights"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "experience_journals_avatar_id_milestone_key_key" ON "experience_journals"("avatar_id", "milestone_key");

-- AddForeignKey
ALTER TABLE "avatar_identities" ADD CONSTRAINT "avatar_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_dnas" ADD CONSTRAINT "avatar_dnas_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_progresses" ADD CONSTRAINT "avatar_progresses_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_preferences" ADD CONSTRAINT "avatar_preferences_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_unlocks" ADD CONSTRAINT "avatar_unlocks_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_memories" ADD CONSTRAINT "avatar_memories_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_behavior_weights" ADD CONSTRAINT "avatar_behavior_weights_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_journals" ADD CONSTRAINT "experience_journals_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar_identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
