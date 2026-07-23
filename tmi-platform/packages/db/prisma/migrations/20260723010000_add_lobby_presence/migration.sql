-- Durable backing store for Fan Lobby position/prop sync — additive only.
-- Hand-written from a reviewed `prisma migrate diff` output with the
-- unrelated destructive statements (drift from already-applied, not-yet-
-- reconciled migrations touching Submission/VenueTicketRecord/
-- VenueTicketScan/Subscription) stripped out.

-- CreateTable
CREATE TABLE "lobby_presences" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "prop_trigger" TEXT NOT NULL DEFAULT 'none',
    "active_theme" TEXT NOT NULL DEFAULT 'MEDIA_LOUNGE',
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lobby_presences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lobby_presences_room_id_last_seen_at_idx" ON "lobby_presences"("room_id", "last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "lobby_presences_room_id_user_id_key" ON "lobby_presences"("room_id", "user_id");
