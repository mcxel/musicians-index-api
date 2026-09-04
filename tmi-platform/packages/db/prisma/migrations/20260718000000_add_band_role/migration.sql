-- Schema drift repair for Role enum.
-- Historical DBs may only have USER|ARTIST|STAFF|ADMIN|JUDGE|SPONSOR.
-- schema.prisma declares: USER, FAN, ARTIST, PERFORMER, BAND, SPONSOR,
-- ADVERTISER, VENUE, WRITER, PROMOTER, STAFF, ADMIN, JUDGE.
--
-- Migration 20260718000000 previously did ADD VALUE 'BAND' AFTER 'PERFORMER',
-- but PERFORMER was never migrated on those DBs -> P3018.
-- This file adds every missing label that schema expects (FAN, PERFORMER,
-- BAND, ADVERTISER, VENUE, WRITER, PROMOTER) with IF NOT EXISTS and no AFTER
-- clauses so Postgres never references a label that is not yet present.
--
-- ALTER TYPE ... ADD VALUE cannot run inside an explicit transaction block
-- before Postgres 12; this repo targets Postgres 12+ (see the pg driver
-- adapter usage in apps/web/src/lib/prisma.ts), so these are safe as
-- standalone statements.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FAN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PERFORMER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'BAND';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADVERTISER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VENUE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'WRITER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROMOTER';
