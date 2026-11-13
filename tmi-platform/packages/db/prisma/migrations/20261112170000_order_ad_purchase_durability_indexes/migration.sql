-- P0 ad_purchase durability INDEXES (2026-11-12) — production-safe companion.
-- LOCAL / staging apply only until owner separately approves production migration.
--
-- Prisma strategy (packages/db prisma ^7.4 / ^7.6):
--   Prisma 7.4.0+ supports CREATE INDEX CONCURRENTLY in migrate scripts and no
--   longer wraps PostgreSQL migration statements in a single outer transaction
--   (prisma-engines#5767). CONCURRENTLY is therefore compatible with
--   `prisma migrate deploy` on this repo's Prisma major — verified against
--   installed CLI before production apply.
--
-- PostgreSQL rules honored here:
--   1. CREATE INDEX CONCURRENTLY must NOT run inside BEGIN/COMMIT.
--   2. Keep concurrent index builds in their own migration file (focused retry).
--   3. IF NOT EXISTS does NOT repair an INVALID leftover index after a failed
--      concurrent build — operator must check pg_index.indisvalid and
--      DROP INDEX CONCURRENTLY IF EXISTS before retry.
--
-- Schema remainders: Order @@index([orderKind, status]) and
-- @@index([adActivationStatus]) in schema.prisma are unchanged.

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Order_orderKind_status_idx"
  ON "Order"("orderKind", "status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Order_adActivationStatus_idx"
  ON "Order"("adActivationStatus");

-- Operator recovery (manual, only if a concurrent build fails mid-flight):
--   SELECT c.relname, i.indisvalid
--   FROM pg_index i
--   JOIN pg_class c ON c.oid = i.indexrelid
--   WHERE c.relname IN ('Order_orderKind_status_idx', 'Order_adActivationStatus_idx');
--   -- if indisvalid = false:
--   DROP INDEX CONCURRENTLY IF EXISTS "Order_orderKind_status_idx";
--   DROP INDEX CONCURRENTLY IF EXISTS "Order_adActivationStatus_idx";
--   -- then re-run this migration / recreate indexes.
