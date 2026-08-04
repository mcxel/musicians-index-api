-- Media Player Stage 2: durable chassis ownership + equipped preference.
-- Playlist Artifact ownership stays separate (not this table).
CREATE TABLE "media_player_chassis_ownerships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chassisId" TEXT NOT NULL,
    "unlockedVia" TEXT NOT NULL DEFAULT 'purchase',
    "stripePaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_player_chassis_ownerships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_player_chassis_ownerships_userId_chassisId_key"
  ON "media_player_chassis_ownerships"("userId", "chassisId");

CREATE INDEX "media_player_chassis_ownerships_userId_idx"
  ON "media_player_chassis_ownerships"("userId");

ALTER TABLE "media_player_chassis_ownerships"
  ADD CONSTRAINT "media_player_chassis_ownerships_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "media_player_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equippedChassisId" TEXT NOT NULL DEFAULT 'standard',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_player_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_player_preferences_userId_key"
  ON "media_player_preferences"("userId");

ALTER TABLE "media_player_preferences"
  ADD CONSTRAINT "media_player_preferences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
