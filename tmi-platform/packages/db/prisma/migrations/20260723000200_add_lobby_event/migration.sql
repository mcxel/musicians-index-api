-- CreateTable
CREATE TABLE "lobby_events" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "show_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "format" TEXT NOT NULL DEFAULT 'solo-1v1',
    "genre_id" TEXT NOT NULL DEFAULT 'hip-hop',
    "genre_name" TEXT NOT NULL DEFAULT 'Hip Hop',
    "main_host_id" TEXT,
    "main_host_name" TEXT,
    "co_host_ids" TEXT,
    "judge_ids" TEXT,
    "pa_announcer_id" TEXT,
    "prize_host_id" TEXT,
    "countdown_seconds" INTEGER NOT NULL DEFAULT 0,
    "absolute_start_time" TIMESTAMP(3) NOT NULL,
    "viewer_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lobby_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lobby_events_room_id_key" ON "lobby_events"("room_id");
