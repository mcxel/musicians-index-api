-- Trust & Safety Runtime — case packages, evidence vault, reporter protections.
-- Complements Report/ModerationAction; ScamDefenseCenter reads these tables.
-- Additive only. Hand-written migration (same pattern as lobby_presences).

-- CreateTable
CREATE TABLE "trust_safety_cases" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "accused_id" TEXT,
    "reasons_json" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "room_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "enforcement_level" INTEGER NOT NULL DEFAULT 1,
    "outcome" TEXT,
    "detail" TEXT,
    "block_immediate" BOOLEAN NOT NULL DEFAULT false,
    "include_messages" BOOLEAN NOT NULL DEFAULT false,
    "screenshot_url" TEXT,
    "content_snapshot" TEXT,
    "content_hash" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_safety_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_safety_evidence" (
    "id" TEXT NOT NULL,
    "case_db_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content_hash" TEXT,
    "payload_json" TEXT NOT NULL,
    "preserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_safety_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_safety_protections" (
    "id" TEXT NOT NULL,
    "case_db_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "accused_id" TEXT NOT NULL,
    "hide_content" BOOLEAN NOT NULL DEFAULT true,
    "block_dms" BOOLEAN NOT NULL DEFAULT false,
    "freeze_payments" BOOLEAN NOT NULL DEFAULT false,
    "room_rejoin_block" BOOLEAN NOT NULL DEFAULT false,
    "room_id" TEXT NOT NULL DEFAULT '',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_safety_protections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trust_safety_cases_case_id_key" ON "trust_safety_cases"("case_id");

-- CreateIndex
CREATE INDEX "trust_safety_cases_status_created_at_idx" ON "trust_safety_cases"("status", "created_at");

-- CreateIndex
CREATE INDEX "trust_safety_cases_reporter_id_idx" ON "trust_safety_cases"("reporter_id");

-- CreateIndex
CREATE INDEX "trust_safety_cases_accused_id_idx" ON "trust_safety_cases"("accused_id");

-- CreateIndex
CREATE INDEX "trust_safety_evidence_case_db_id_idx" ON "trust_safety_evidence"("case_db_id");

-- CreateIndex
CREATE INDEX "trust_safety_protections_reporter_id_idx" ON "trust_safety_protections"("reporter_id");

-- CreateIndex
CREATE INDEX "trust_safety_protections_accused_id_room_id_idx" ON "trust_safety_protections"("accused_id", "room_id");

-- CreateIndex
CREATE UNIQUE INDEX "trust_safety_protections_reporter_id_accused_id_room_id_key" ON "trust_safety_protections"("reporter_id", "accused_id", "room_id");

-- AddForeignKey
ALTER TABLE "trust_safety_evidence" ADD CONSTRAINT "trust_safety_evidence_case_db_id_fkey" FOREIGN KEY ("case_db_id") REFERENCES "trust_safety_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_safety_protections" ADD CONSTRAINT "trust_safety_protections_case_db_id_fkey" FOREIGN KEY ("case_db_id") REFERENCES "trust_safety_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
