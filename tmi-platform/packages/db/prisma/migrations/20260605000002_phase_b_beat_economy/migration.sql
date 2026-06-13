-- Phase B: Beat & Attribution Economy
-- Adds moderationStatus, adminSubmitted, producerName to Beat
-- Creates beat_assignments table
-- Adds BEAT_SUBMITTED + BEAT_ADMIN_SUBMITTED to AuditLogAction enum

-- AlterEnum: Add beat audit actions
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'BEAT_SUBMITTED';
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'BEAT_ADMIN_SUBMITTED';
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'BEAT_PUBLISHED';
ALTER TYPE "AuditLogAction" ADD VALUE IF NOT EXISTS 'BEAT_ASSIGNED';

-- AlterTable: Beat — Phase B fields
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "adminSubmitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "producerName" TEXT;

-- AlterIndex: status+createdAt for moderation queue
CREATE INDEX IF NOT EXISTS "Beat_status_createdAt_idx" ON "Beat"("status", "createdAt");

-- CreateTable: beat_assignments
CREATE TABLE IF NOT EXISTS "beat_assignments" (
    "id" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beat_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "beat_assignments_beatId_targetType_targetId_key"
  ON "beat_assignments"("beatId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "beat_assignments"
  ADD CONSTRAINT "beat_assignments_beatId_fkey"
  FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
