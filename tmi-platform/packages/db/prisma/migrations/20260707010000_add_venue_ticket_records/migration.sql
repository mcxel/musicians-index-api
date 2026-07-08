-- CreateTable
CREATE TABLE "VenueTicketRecord" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "orderId" TEXT,
    "template" JSONB NOT NULL,
    "branding" JSONB NOT NULL,
    "barcode" JSONB NOT NULL,
    "seat" JSONB NOT NULL,
    "outputFormats" TEXT[],
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueTicketRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenueTicketRecord_ownerId_idx" ON "VenueTicketRecord"("ownerId");

-- CreateTable
CREATE TABLE "VenueTicketScan" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "VenueTicketScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenueTicketScan_ticketId_idx" ON "VenueTicketScan"("ticketId");
