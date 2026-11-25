-- Durable avatar Saved Looks + venue Saved Designs.
-- OWNER APPROVAL REQUIRED BEFORE APPLYING ANYWHERE PERSISTENT. Additive only; rollback at bottom.
-- Replaces the in-memory avatar loadout (lib/avatar/avatarPersistence.ts Maps) as the durable
-- source for the active look. Inventory/entitlements stay in avatar_inventory_items.

CREATE TABLE IF NOT EXISTS "avatar_saved_looks" (
  "id"                  TEXT        NOT NULL,
  "owner_user_id"       TEXT        NOT NULL,
  "name"                TEXT        NOT NULL,
  -- TmiAvatarRuntimeContract AvatarAppearance (validated + size-capped by the service).
  "appearance"          JSONB       NOT NULL,
  -- TmiAvatarRuntimeContract AvatarLoadoutContract.equipped (every item ownership-checked).
  "loadout"             JSONB       NOT NULL,
  "base_asset_id"       TEXT        NOT NULL,
  "base_asset_version"  INTEGER     NOT NULL,
  "revision"            INTEGER     NOT NULL DEFAULT 1,
  "is_active"           BOOLEAN     NOT NULL DEFAULT FALSE,
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"          TIMESTAMPTZ,
  CONSTRAINT "avatar_saved_looks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "avatar_saved_looks_name_len" CHECK (char_length("name") BETWEEN 1 AND 60),
  CONSTRAINT "avatar_saved_looks_revision_pos" CHECK ("revision" >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS "avatar_saved_looks_owner_name"
  ON "avatar_saved_looks" ("owner_user_id", lower("name")) WHERE "deleted_at" IS NULL;
-- Exactly zero or one active look per owner.
CREATE UNIQUE INDEX IF NOT EXISTS "avatar_saved_looks_one_active"
  ON "avatar_saved_looks" ("owner_user_id") WHERE "is_active" AND "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "avatar_saved_looks_owner" ON "avatar_saved_looks" ("owner_user_id", "updated_at");

CREATE TABLE IF NOT EXISTS "venue_saved_designs" (
  "id"                   TEXT        NOT NULL,
  "venue_blueprint_id"   TEXT        NOT NULL,
  "owner_user_id"        TEXT        NOT NULL,
  "name"                 TEXT        NOT NULL,
  -- TmiVenueRuntimeContract VenueDesign (surfaces, placements, lighting) — validated by the service.
  "design"               JSONB       NOT NULL,
  "revision"             INTEGER     NOT NULL DEFAULT 1,
  "is_published"         BOOLEAN     NOT NULL DEFAULT FALSE,
  "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"           TIMESTAMPTZ,
  CONSTRAINT "venue_saved_designs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "venue_saved_designs_name_len" CHECK (char_length("name") BETWEEN 1 AND 80),
  CONSTRAINT "venue_saved_designs_revision_pos" CHECK ("revision" >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS "venue_saved_designs_owner_name"
  ON "venue_saved_designs" ("venue_blueprint_id", "owner_user_id", lower("name")) WHERE "deleted_at" IS NULL;
-- One published design per blueprint per owner.
CREATE UNIQUE INDEX IF NOT EXISTS "venue_saved_designs_one_published"
  ON "venue_saved_designs" ("venue_blueprint_id", "owner_user_id") WHERE "is_published" AND "deleted_at" IS NULL;

-- ROLLBACK:
--   DROP TABLE IF EXISTS "venue_saved_designs";
--   DROP TABLE IF EXISTS "avatar_saved_looks";
