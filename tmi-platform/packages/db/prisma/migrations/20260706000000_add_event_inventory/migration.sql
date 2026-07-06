-- CreateTable
CREATE TABLE "EventInventory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "issued" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventInventory_key_key" ON "EventInventory"("key");

-- CreateIndex
CREATE INDEX "EventInventory_key_idx" ON "EventInventory"("key");
