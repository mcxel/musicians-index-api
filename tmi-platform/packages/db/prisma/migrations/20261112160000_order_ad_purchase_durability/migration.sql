-- P0 ad_purchase durability COLUMNS (2026-11-12).
-- LOCAL / staging apply only until owner separately approves production migration.
-- Nullable columns keep legacy Order rows intact (no backfill required).
-- Does NOT auto-activate advertisements.
--
-- INDEXES intentionally moved to sibling migration
-- 20261112170000_order_ad_purchase_durability_indexes
-- so production can apply CREATE INDEX CONCURRENTLY without SHARE-locking
-- "Order" during index builds, and so column DDL can succeed independently
-- if an index build later fails / leaves an invalid index.

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderKind" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "fulfillmentMetadataJson" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "adActivationStatus" TEXT;
