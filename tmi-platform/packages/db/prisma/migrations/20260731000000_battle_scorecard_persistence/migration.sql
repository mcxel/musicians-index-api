-- Real persistence for judge scorecards submitted via
-- POST /api/battles/[id]/judge — additive only. Previously scores were
-- computed in-memory and discarded (literal TODO in the route handler);
-- GET always returned an empty array. This gives judge scorecards a real
-- backing table so they survive past the request.

-- CreateTable
CREATE TABLE "battle_scorecards" (
    "id" TEXT NOT NULL,
    "battle_id" TEXT NOT NULL,
    "judge_id" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "totals" JSONB NOT NULL,
    "winner_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "battle_scorecards_battle_id_idx" ON "battle_scorecards"("battle_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_scorecards_battle_id_judge_id_key" ON "battle_scorecards"("battle_id", "judge_id");
