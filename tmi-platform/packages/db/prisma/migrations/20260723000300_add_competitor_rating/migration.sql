-- CreateTable
CREATE TABLE "competitor_ratings" (
    "user_id" TEXT NOT NULL,
    "skill_rating" INTEGER NOT NULL DEFAULT 1200,
    "integrity_rating" INTEGER NOT NULL DEFAULT 100,
    "reputation_rating" INTEGER NOT NULL DEFAULT 90,
    "activity_rating" INTEGER NOT NULL DEFAULT 50,
    "weekly_matches_played" INTEGER NOT NULL DEFAULT 0,
    "consecutive_shows_completed" INTEGER NOT NULL DEFAULT 0,
    "cooldown_until" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_ratings_pkey" PRIMARY KEY ("user_id")
);
