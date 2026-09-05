-- Lane D Phase 2: fulfillment recovery observability on Order.
-- Required so a PAID_PENDING_FULFILLMENT → retry → PAID reconciliation loop
-- never silently swallows a failure. IF NOT EXISTS guards used defensively
-- against concurrent-agent migration races on this shared repo, matching
-- this project's established self-healing-schema practice.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "fulfillmentRetryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lastFulfillmentAttemptAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lastFulfillmentError" TEXT;
