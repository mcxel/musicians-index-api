-- Lane D Phase 2: durable StoreItemEngine ownership (lobby/venue skins sold
-- via /store/lobbies and /store/venues — distinct from VenueSkinCommerce's
-- separate /store/venue-skins system). Without this table, OwnershipRuntime's
-- grants were in-memory only and did not survive a serverless cold start or
-- redeploy. IF NOT EXISTS guards used defensively against concurrent-agent
-- migration races on this shared repo, matching this project's established
-- self-healing-schema practice.
CREATE TABLE IF NOT EXISTS "store_item_ownerships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "pricePaidCents" INTEGER NOT NULL DEFAULT 0,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_item_ownerships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "store_item_ownerships_userId_itemId_key"
  ON "store_item_ownerships"("userId", "itemId");

CREATE INDEX IF NOT EXISTS "store_item_ownerships_userId_idx"
  ON "store_item_ownerships"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'store_item_ownerships_userId_fkey'
  ) THEN
    ALTER TABLE "store_item_ownerships"
      ADD CONSTRAINT "store_item_ownerships_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
