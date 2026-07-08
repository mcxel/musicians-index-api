-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "payment_failure_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "last_payment_attempt" TIMESTAMP(3);
