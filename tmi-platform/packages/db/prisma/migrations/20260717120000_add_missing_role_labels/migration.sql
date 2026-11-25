-- Labels present on production and in schema.prisma, missing from every
-- migration before 20260718000000_add_band_role. BAND stays in that later
-- file so PERFORMER is committed before ADD VALUE ... AFTER 'PERFORMER'.
-- No BEFORE/AFTER here: existing production order is unchanged, and a fresh
-- database appends these after the original six.
-- is_live / live_room_id are nullable-scalar additions. live_room_id is not
-- a foreign key. New enum labels are not used in this file.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FAN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PERFORMER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADVERTISER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VENUE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'WRITER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROMOTER';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_live" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_room_id" TEXT;
