-- AlterTable
ALTER TABLE "lobby_events" ADD COLUMN     "creator_user_id" TEXT,
ADD COLUMN     "is_mini" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "lobby_events_is_mini_status_idx" ON "lobby_events"("is_mini", "status");
