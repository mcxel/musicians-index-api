-- Additive only. Fixes real production regressions found 2026-08-04 while
-- investigating unrelated reports: apps/web/src/lib/rankings/rankingDbHelpers.ts
-- and api/rankings/* already select UserProfile.city/state/country, and
-- api/admin/users/assign-roles + grant-tier already write AuditLogAction
-- values that didn't exist in the enum — both were failing at runtime.

-- AlterTable
ALTER TABLE "UserProfile"
  ADD COLUMN "city" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "country" TEXT;

-- AlterEnum
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'ADMIN_ASSIGN_ROLES';
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'ADMIN_GRANT_TIER';
