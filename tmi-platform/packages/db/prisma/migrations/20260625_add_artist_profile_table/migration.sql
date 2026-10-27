-- RECONCILIATION NO-OP (P0 CI / P3018)
--
-- "ArtistProfile" (table, unique indexes on userId/slug, and userId FK) was already
-- created by migration 20260326225501_profiles. This later migration previously
-- re-ran identical CREATE TABLE / CREATE UNIQUE INDEX / ADD CONSTRAINT DDL and
-- failed Prisma migrate deploy with P3018 (relation "ArtistProfile" already exists).
--
-- Diff vs 20260326225501_profiles ArtistProfile section:
--   - Same columns, defaults, PK, and unique indexes (full duplicate).
--   - FK was ON DELETE RESTRICT only here vs ON DELETE RESTRICT ON UPDATE CASCADE
--     in 20260326 — no silent ON DELETE change; leave established 20260326 semantics.
--   - No net-new columns or constraints to apply.
--
-- Intentionally no CREATE / ALTER / DROP. Marker statement so Prisma has executable SQL.

SELECT 1;
