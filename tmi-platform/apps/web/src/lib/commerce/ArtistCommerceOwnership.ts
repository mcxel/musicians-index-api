/**
 * ArtistCommerceOwnership — durable buyer-side ownership/entitlement authority
 * for ArtistCommerceProduct purchases (schema-registered in
 * packages/db/prisma/schema.prisma as `ArtistCommerceOwnership`, following the
 * same runtime-DDL pattern as ArtistCommerceCatalog.ts — see that file's own
 * header comment for why: the parent ArtistCommerceProduct table itself was
 * never run through a real `prisma migrate`, so this uses the same
 * ensure-table raw SQL rather than the typed Prisma client accessor, to stay
 * consistent with the one live table it's keyed against).
 *
 * Scope: only durable-entitlement product types get an ownership row here —
 * DIGITAL_PRODUCT, LICENSING_PACK, VIP_PASS, OTHER. Obligation-fulfillment
 * types (MERCH physical shipment, SHOUTOUT/MEET_AND_GREET service requests)
 * are correctly represented by the existing Order record alone — creating an
 * "ownership" row for a to-be-fulfilled service would misrepresent an
 * obligation as durable owned access. See DURABLE_OWNERSHIP_TYPES below.
 *
 * Idempotency is keyed on orderId (one order → at most one ownership row),
 * never on (buyerId, productId) — a buyer legitimately re-purchasing the same
 * product (e.g. a second licensing pack, a repeat digital-product gift to a
 * different context) must still get its own row. The webhook's own
 * event.id-level idempotency (isStripeEventProcessed) is the primary guard;
 * this unique constraint is defense-in-depth against any future call site
 * that invokes grantArtistCommerceOwnership outside that guard.
 *
 * Refund/reversal: `status` exists (ACTIVE default) so the schema is
 * refund-ready, but no code path transitions it — this repo has no working
 * refund/reversal fulfillment anywhere yet (Refund model is real but never
 * written to; charge.refunded only revokes subscription tiers). That remains
 * an explicitly open gap, not something this file invents a policy for.
 */

import prisma from "@/lib/prisma";
import type { ArtistCommerceProductType } from "@/lib/commerce/ArtistCommerceTypes";

/** Product types that produce durable buyer ownership rather than a
 * to-be-fulfilled Order obligation. */
export const DURABLE_OWNERSHIP_TYPES: ReadonlySet<ArtistCommerceProductType> = new Set([
  "DIGITAL_PRODUCT",
  "LICENSING_PACK",
  "VIP_PASS",
  "OTHER",
]);

export function isDurableOwnershipType(type: string): type is ArtistCommerceProductType {
  return DURABLE_OWNERSHIP_TYPES.has(type as ArtistCommerceProductType);
}

export type ArtistCommerceOwnershipStatus = "ACTIVE" | "REFUNDED" | "REVOKED";

export type ArtistCommerceOwnershipRecord = {
  id: string;
  buyerUserId: string;
  artistId: string;
  productId: string;
  productType: ArtistCommerceProductType;
  productTitle: string;
  orderId: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  priceCentsPaid: number;
  currency: string;
  acquisitionSource: "PURCHASE";
  status: ArtistCommerceOwnershipStatus;
  acquiredAt: string;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  buyerUserId: string;
  artistId: string;
  productId: string;
  productType: string;
  productTitle: string;
  orderId: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  priceCentsPaid: number;
  currency: string;
  acquisitionSource: string;
  status: string;
  acquiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function mapRow(row: Row): ArtistCommerceOwnershipRecord {
  return {
    id: row.id,
    buyerUserId: row.buyerUserId,
    artistId: row.artistId,
    productId: row.productId,
    productType: row.productType as ArtistCommerceProductType,
    productTitle: row.productTitle,
    orderId: row.orderId,
    stripeSessionId: row.stripeSessionId,
    stripePaymentId: row.stripePaymentId,
    priceCentsPaid: row.priceCentsPaid,
    currency: row.currency,
    acquisitionSource: "PURCHASE",
    status: row.status as ArtistCommerceOwnershipStatus,
    acquiredAt: row.acquiredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

let schemaReady: Promise<void> | null = null;

function newId(): string {
  return `acow_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Idempotent DDL — safe on every cold start, same pattern as ArtistCommerceCatalog.ts. */
export async function ensureArtistCommerceOwnershipSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ArtistCommerceOwnership" (
          id TEXT PRIMARY KEY,
          "buyerUserId" TEXT NOT NULL,
          "artistId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "productType" TEXT NOT NULL,
          "productTitle" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "stripeSessionId" TEXT,
          "stripePaymentId" TEXT,
          "priceCentsPaid" INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'usd',
          "acquisitionSource" TEXT NOT NULL DEFAULT 'PURCHASE',
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ArtistCommerceOwnership_orderId_key" UNIQUE ("orderId")
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ArtistCommerceOwnership_buyerUserId_idx"
          ON "ArtistCommerceOwnership"("buyerUserId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ArtistCommerceOwnership_artistId_idx"
          ON "ArtistCommerceOwnership"("artistId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ArtistCommerceOwnership_productId_idx"
          ON "ArtistCommerceOwnership"("productId");
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

/**
 * Idempotent grant — ON CONFLICT (orderId) DO NOTHING, then re-read whichever
 * row actually exists for that orderId. Called from the Stripe webhook only
 * for DURABLE_OWNERSHIP_TYPES; safe to call more than once for the same order
 * (duplicate webhook delivery), never creates a second row.
 */
export async function grantArtistCommerceOwnership(input: {
  buyerUserId: string;
  artistId: string;
  productId: string;
  productType: ArtistCommerceProductType;
  productTitle: string;
  orderId: string;
  stripeSessionId?: string | null;
  stripePaymentId?: string | null;
  priceCentsPaid: number;
  currency?: string;
}): Promise<ArtistCommerceOwnershipRecord> {
  await ensureArtistCommerceOwnershipSchema();
  const id = newId();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ArtistCommerceOwnership"
      (id, "buyerUserId", "artistId", "productId", "productType", "productTitle",
       "orderId", "stripeSessionId", "stripePaymentId", "priceCentsPaid", currency,
       "acquisitionSource", status, "acquiredAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PURCHASE', 'ACTIVE',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT ("orderId") DO NOTHING`,
    id,
    input.buyerUserId,
    input.artistId,
    input.productId,
    input.productType,
    input.productTitle,
    input.orderId,
    input.stripeSessionId ?? null,
    input.stripePaymentId ?? null,
    input.priceCentsPaid,
    (input.currency ?? "usd").toLowerCase(),
  );

  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT * FROM "ArtistCommerceOwnership" WHERE "orderId" = $1 LIMIT 1`,
    input.orderId,
  );
  if (!rows[0]) throw new Error("grant_failed");
  return mapRow(rows[0]);
}

export async function listArtistCommerceOwnershipForBuyer(
  buyerUserId: string,
): Promise<ArtistCommerceOwnershipRecord[]> {
  await ensureArtistCommerceOwnershipSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT * FROM "ArtistCommerceOwnership" WHERE "buyerUserId" = $1 ORDER BY "acquiredAt" DESC`,
    buyerUserId,
  );
  return rows.map(mapRow);
}

export async function getArtistCommerceOwnershipByOrderId(
  orderId: string,
): Promise<ArtistCommerceOwnershipRecord | null> {
  await ensureArtistCommerceOwnershipSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT * FROM "ArtistCommerceOwnership" WHERE "orderId" = $1 LIMIT 1`,
    orderId,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}
