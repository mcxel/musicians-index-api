-- CreateTable: RoomPresence
CREATE TABLE "RoomPresence" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connected" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoomPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomPresence_roomId_userId_key" ON "RoomPresence"("roomId", "userId");
CREATE INDEX "RoomPresence_roomId_idx" ON "RoomPresence"("roomId");
CREATE INDEX "RoomPresence_lastSeenAt_idx" ON "RoomPresence"("lastSeenAt");
