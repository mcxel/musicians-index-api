-- Forward migration: financial integrity ledger + Stripe webhook receipt tables.
-- Reviewed 2026-11-14 for release candidate fresh-install closure.
--
-- Provenance (honest): SQL shape was reviewed against uncommitted blob
-- 9de64b360c992318de010f30361f834a4da95401 (historical folder name
-- 20261018120000_financial_integrity_* was previously REJECTED for silent
-- promotion). This is a NEW dated forward migration (20261114), not that
-- historical migration path, and not a checksum rewrite of old history.
--
-- Creates tables required by Prisma models:
--   StripeWebhookEvent, wallet_mode_balances, economic_payments,
--   financial_adjustments, financial_integrity_flags
-- Plus nullable livemode on Transaction / wallet_transactions.
-- Idempotent (IF NOT EXISTS) so already-migrated / partial DBs do not fail.

-- ── Stripe webhook receipt / idempotency ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StripeWebhookEvent_eventId_key"
  ON "StripeWebhookEvent"("eventId");

ALTER TABLE "StripeWebhookEvent" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "StripeWebhookEvent" ADD COLUMN IF NOT EXISTS "processingError" TEXT;
ALTER TABLE "StripeWebhookEvent" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "StripeWebhookEvent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "StripeWebhookEvent" SET "status" = 'PROCESSED' WHERE "status" IS NULL;

ALTER TABLE "StripeWebhookEvent" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
ALTER TABLE "StripeWebhookEvent" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "StripeWebhookEvent" ALTER COLUMN "processedAt" DROP NOT NULL;
ALTER TABLE "StripeWebhookEvent" ALTER COLUMN "processedAt" DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StripeWebhookEvent_status_check'
  ) THEN
    ALTER TABLE "StripeWebhookEvent"
      ADD CONSTRAINT "StripeWebhookEvent_status_check"
      CHECK ("status" IN (
        'RECEIVED',
        'PROCESSING',
        'FINANCIAL_CREDIT_RECORDED',
        'PROCESSED',
        'FAILED_RETRYABLE'
      ));
  END IF;
END $$;

-- ── Wallet mode balances (test vs live isolation) ──────────────────────────
CREATE TABLE IF NOT EXISTS "wallet_mode_balances" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "availableBalance" INTEGER NOT NULL DEFAULT 0,
    "pendingBalance" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarnings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_mode_balances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wallet_mode_balance_key"
  ON "wallet_mode_balances"("walletId", "livemode");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallet_mode_balances_walletId_fkey'
  ) THEN
    ALTER TABLE "wallet_mode_balances"
      ADD CONSTRAINT "wallet_mode_balances_walletId_fkey"
      FOREIGN KEY ("walletId") REFERENCES "Wallet"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Economic payments (one checkout session → one credit identity) ─────────
CREATE TABLE IF NOT EXISTS "economic_payments" (
    "id" TEXT NOT NULL,
    "economicPaymentId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "walletId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "grossCents" INTEGER NOT NULL,
    "platformFeeBps" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL,
    "performerShareCents" INTEGER NOT NULL,
    "sellerTier" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "chargeId" TEXT,
    "productId" TEXT,
    "committingEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "economic_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "economic_payment_identity_key"
  ON "economic_payments"("economicPaymentId", "transactionType", "livemode");

CREATE INDEX IF NOT EXISTS "economic_payment_payment_intent_idx"
  ON "economic_payments"("paymentIntentId", "livemode");

CREATE INDEX IF NOT EXISTS "economic_payment_wallet_mode_idx"
  ON "economic_payments"("walletId", "livemode");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'economic_payments_walletId_fkey'
  ) THEN
    ALTER TABLE "economic_payments"
      ADD CONSTRAINT "economic_payments_walletId_fkey"
      FOREIGN KEY ("walletId") REFERENCES "Wallet"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Financial adjustments (refunds / disputes keyed by external id) ────────
CREATE TABLE IF NOT EXISTS "financial_adjustments" (
    "id" TEXT NOT NULL,
    "economicPaymentId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "externalId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "grossCents" INTEGER NOT NULL,
    "performerShareCents" INTEGER NOT NULL,
    "stripeEventId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_adjustments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "financial_adjustment_external_id_key"
  ON "financial_adjustments"("externalId");

CREATE INDEX IF NOT EXISTS "financial_adjustment_payment_idx"
  ON "financial_adjustments"("economicPaymentId", "transactionType", "livemode");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_adjustments_payment_fkey'
  ) THEN
    ALTER TABLE "financial_adjustments"
      ADD CONSTRAINT "financial_adjustments_payment_fkey"
      FOREIGN KEY ("economicPaymentId", "transactionType", "livemode")
      REFERENCES "economic_payments"("economicPaymentId", "transactionType", "livemode")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Integrity flags ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "financial_integrity_flags" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "economicPaymentId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "externalId" TEXT NOT NULL DEFAULT '',
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_integrity_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "financial_integrity_flag_key"
  ON "financial_integrity_flags"("code", "economicPaymentId", "transactionType", "livemode", "externalId");

-- ── Livemode columns on legacy money rows (nullable = historical UNKNOWN) ──
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "livemode" BOOLEAN;

DO $$
BEGIN
  IF to_regclass('public.wallet_transactions') IS NOT NULL THEN
    ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "livemode" BOOLEAN;
  END IF;
END $$;
