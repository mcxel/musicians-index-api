-- CreateTable: SeatReservation
CREATE TABLE "SeatReservation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RoomSeatState
CREATE TABLE "RoomSeatState" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "currentUser" TEXT,
    "occupied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoomSeatState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatReservation_roomId_seatId_key" ON "SeatReservation"("roomId", "seatId");
CREATE INDEX "SeatReservation_userId_idx" ON "SeatReservation"("userId");
CREATE INDEX "SeatReservation_expiresAt_idx" ON "SeatReservation"("expiresAt");
CREATE UNIQUE INDEX "RoomSeatState_roomId_seatId_key" ON "RoomSeatState"("roomId", "seatId");
