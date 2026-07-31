-- Real persistence for lib/avatar/avatarPersistence.ts inventory storage —
-- additive only. Replaces the module-level in-memory Map, which loses or
-- diverges state across Vercel's multiple serverless instances (same bug
-- class fixed for LobbyPresence in 20260723010000_add_lobby_presence).

-- CreateTable
CREATE TABLE "avatar_inventory_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "type" TEXT,
    "category" TEXT,
    "name" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'free',
    "owned" BOOLEAN NOT NULL DEFAULT true,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "mintable" BOOLEAN NOT NULL DEFAULT false,
    "tradeable" BOOLEAN NOT NULL DEFAULT false,
    "sponsor_locked" BOOLEAN NOT NULL DEFAULT false,
    "tier_locked" BOOLEAN NOT NULL DEFAULT false,
    "unlock_requirement" TEXT,
    "xp_required" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatar_inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avatar_inventory_items_user_id_idx" ON "avatar_inventory_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatar_inventory_items_user_id_item_id_key" ON "avatar_inventory_items"("user_id", "item_id");
