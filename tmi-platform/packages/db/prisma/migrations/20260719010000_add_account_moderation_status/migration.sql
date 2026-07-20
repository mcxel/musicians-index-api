-- Trust & safety enforcement fields on User. The Report and
-- ModerationAction tables already existed with zero API/enforcement wiring
-- (same "real schema, no route" gap found elsewhere this session) — this
-- migration adds what's needed to actually act on a report: a real account
-- status the session/login layer can check.
ALTER TABLE "User" ADD COLUMN "account_status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "account_status_reason" TEXT;
ALTER TABLE "User" ADD COLUMN "account_status_expires_at" TIMESTAMP(3);
