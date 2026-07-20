-- Venue skin commerce + persistence layer. The visual/config layer
-- (VENUE_SKINS in apps/web/src/lib/venue/venueSkinEngine.ts) already
-- existed; this table was the missing piece — no way to purchase, own, or
-- customize a skin's colors and have it persist.
CREATE TABLE "venue_skin_ownerships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinId" TEXT NOT NULL,
    "customColors" JSONB,
    "unlockedVia" TEXT NOT NULL DEFAULT 'purchase',
    "stripePaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_skin_ownerships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "venue_skin_ownerships_userId_skinId_key" ON "venue_skin_ownerships"("userId", "skinId");

CREATE INDEX "venue_skin_ownerships_userId_idx" ON "venue_skin_ownerships"("userId");

ALTER TABLE "venue_skin_ownerships" ADD CONSTRAINT "venue_skin_ownerships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
