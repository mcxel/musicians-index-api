-- CreateTable
CREATE TABLE "match_histories" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "venue_type" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "competition_type" TEXT NOT NULL,
    "challenger_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "challenger_score" DOUBLE PRECISION NOT NULL,
    "opponent_score" DOUBLE PRECISION NOT NULL,
    "winner_id" TEXT,
    "result_type" TEXT NOT NULL DEFAULT 'decisive',
    "rating_before_challenger" INTEGER NOT NULL,
    "rating_after_challenger" INTEGER NOT NULL,
    "rating_before_opponent" INTEGER NOT NULL,
    "rating_after_opponent" INTEGER NOT NULL,
    "integrity_before_challenger" INTEGER NOT NULL,
    "integrity_after_challenger" INTEGER NOT NULL,
    "integrity_before_opponent" INTEGER NOT NULL,
    "integrity_after_opponent" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_histories_match_id_key" ON "match_histories"("match_id");

-- CreateIndex
CREATE INDEX "match_histories_challenger_id_idx" ON "match_histories"("challenger_id");

-- CreateIndex
CREATE INDEX "match_histories_opponent_id_idx" ON "match_histories"("opponent_id");

-- CreateIndex
CREATE INDEX "match_histories_venue_id_idx" ON "match_histories"("venue_id");

