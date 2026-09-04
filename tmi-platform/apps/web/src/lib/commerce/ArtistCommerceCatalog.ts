/**
 * ArtistCommerceCatalog — per-artist product authority for shoutouts, merch,
 * meet & greet, VIP, licensing. Prices live in DB (not STRIPE_PRICE_* env).
 *
 * Checkout uses Stripe price_data + optional Connect destination + TMI fee.
 * Uses ensure-table raw SQL so runtime works before a formal migrate lands.
 */

import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import {
  ARTIST_COMMERCE_PRODUCT_TYPES,
  isArtistCommerceProductType,
  type ArtistCommerceProduct,
  type ArtistCommerceProductType,
} from "@/lib/commerce/ArtistCommerceTypes";

export type { ArtistCommerceProduct, ArtistCommerceProductType };
export {
  ARTIST_COMMERCE_PRODUCT_TYPES,
  ARTIST_COMMERCE_TYPE_ICONS,
  ARTIST_COMMERCE_TYPE_LABELS,
  formatArtistCommercePrice,
  isArtistCommerceProductType,
} from "@/lib/commerce/ArtistCommerceTypes";

export type ArtistCommerceProductInput = {
  type: ArtistCommerceProductType;
  title: string;
  description?: string | null;
  priceCents: number;
  currency?: string;
  active?: boolean;
  inventory?: number | null;
  imageUrl?: string | null;
};

type Row = {
  id: string;
  artistId: string;
  type: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  active: boolean;
  inventory: number | null;
  imageUrl: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

let schemaReady: Promise<void> | null = null;

function newId(): string {
  return `acp_${randomBytes(12).toString("hex")}`;
}

function mapRow(row: Row): ArtistCommerceProduct {
  return {
    id: row.id,
    artistId: row.artistId,
    type: row.type as ArtistCommerceProductType,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    currency: row.currency || "usd",
    active: Boolean(row.active),
    inventory: row.inventory,
    imageUrl: row.imageUrl,
    stripeProductId: row.stripeProductId,
    stripePriceId: row.stripePriceId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Idempotent DDL — safe on every cold start. */
export async function ensureArtistCommerceSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "ArtistCommerceProductType" AS ENUM (
            'MERCH', 'SHOUTOUT', 'MEET_AND_GREET', 'VIP_PASS',
            'LICENSING_PACK', 'DIGITAL_PRODUCT', 'OTHER'
          );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ArtistCommerceProduct" (
          id TEXT PRIMARY KEY,
          "artistId" TEXT NOT NULL,
          type "ArtistCommerceProductType" NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          "priceCents" INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'usd',
          active BOOLEAN NOT NULL DEFAULT true,
          inventory INTEGER,
          "imageUrl" TEXT,
          "stripeProductId" TEXT,
          "stripePriceId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ArtistCommerceProduct_artistId_active_idx"
          ON "ArtistCommerceProduct"("artistId", active);
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ArtistCommerceProduct_artistId_type_idx"
          ON "ArtistCommerceProduct"("artistId", type);
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

const DEFAULT_SEEDS: Array<{
  type: ArtistCommerceProductType;
  title: string;
  description: string;
  priceCents: number;
}> = [
  {
    type: "SHOUTOUT",
    title: "Personalized Shoutout",
    description: "Artist records a custom shoutout for you",
    priceCents: 2500,
  },
  {
    type: "MEET_AND_GREET",
    title: "Meet & Greet Pass",
    description: "One-on-one session with the artist",
    priceCents: 7500,
  },
  {
    type: "VIP_PASS",
    title: "VIP Pass",
    description: "VIP access with this artist",
    priceCents: 4900,
  },
  {
    type: "LICENSING_PACK",
    title: "Licensing Pack",
    description: "Music / beat licensing pack from this artist",
    priceCents: 9900,
  },
  {
    type: "MERCH",
    title: "Signature T-Shirt",
    description: "Artist merch tee — price set by the artist",
    priceCents: 3500,
  },
];

/**
 * Ensure default catalog types exist (shoutout, meet, VIP, licensing, merch).
 * Adds any missing seed types even when the artist already has other products —
 * never uses STRIPE_PRICE_* env vars.
 */
export async function ensureDefaultArtistProducts(
  artistId: string,
): Promise<ArtistCommerceProduct[]> {
  await ensureArtistCommerceSchema();
  const existing = await listArtistProducts(artistId, { includeInactive: true });
  const presentTypes = new Set(existing.map((p) => p.type));

  for (const seed of DEFAULT_SEEDS) {
    if (presentTypes.has(seed.type)) continue;
    await createArtistProduct(artistId, {
      type: seed.type,
      title: seed.title,
      description: seed.description,
      priceCents: seed.priceCents,
      active: true,
    });
  }

  return (await listArtistProducts(artistId)).filter((p) => p.active);
}

export async function listArtistProducts(
  artistId: string,
  opts?: { includeInactive?: boolean },
): Promise<ArtistCommerceProduct[]> {
  await ensureArtistCommerceSchema();
  const rows = opts?.includeInactive
    ? await prisma.$queryRawUnsafe<Row[]>(
        `SELECT * FROM "ArtistCommerceProduct" WHERE "artistId" = $1 ORDER BY "createdAt" ASC`,
        artistId,
      )
    : await prisma.$queryRawUnsafe<Row[]>(
        `SELECT * FROM "ArtistCommerceProduct" WHERE "artistId" = $1 AND active = true ORDER BY "createdAt" ASC`,
        artistId,
      );
  return rows.map(mapRow);
}

export async function getArtistProductById(
  productId: string,
): Promise<ArtistCommerceProduct | null> {
  await ensureArtistCommerceSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT * FROM "ArtistCommerceProduct" WHERE id = $1 LIMIT 1`,
    productId,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getActiveProductByType(
  artistId: string,
  type: ArtistCommerceProductType,
): Promise<ArtistCommerceProduct | null> {
  await ensureArtistCommerceSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT * FROM "ArtistCommerceProduct"
     WHERE "artistId" = $1 AND type = $2::"ArtistCommerceProductType" AND active = true
     ORDER BY "updatedAt" DESC LIMIT 1`,
    artistId,
    type,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createArtistProduct(
  artistId: string,
  input: ArtistCommerceProductInput,
): Promise<ArtistCommerceProduct> {
  await ensureArtistCommerceSchema();
  if (!isArtistCommerceProductType(input.type)) {
    throw new Error("invalid_product_type");
  }
  const priceCents = Math.round(Number(input.priceCents));
  if (!Number.isFinite(priceCents) || priceCents < 100) {
    throw new Error("price_too_low");
  }
  const title = (input.title ?? "").trim();
  if (!title) throw new Error("title_required");

  const id = newId();
  const currency = (input.currency ?? "usd").toLowerCase();
  const active = input.active !== false;
  const inventory =
    input.inventory == null || input.inventory === undefined
      ? null
      : Math.max(0, Math.floor(Number(input.inventory)));
  const description = input.description?.trim() || null;
  const imageUrl = input.imageUrl?.trim() || null;

  await prisma.$executeRawUnsafe(
    `INSERT INTO "ArtistCommerceProduct"
      (id, "artistId", type, title, description, "priceCents", currency, active, inventory, "imageUrl", "createdAt", "updatedAt")
     VALUES ($1, $2, $3::"ArtistCommerceProductType", $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    id,
    artistId,
    input.type,
    title,
    description,
    priceCents,
    currency,
    active,
    inventory,
    imageUrl,
  );

  const created = await getArtistProductById(id);
  if (!created) throw new Error("create_failed");
  return created;
}

export async function updateArtistProduct(
  artistId: string,
  productId: string,
  patch: Partial<ArtistCommerceProductInput>,
): Promise<ArtistCommerceProduct | null> {
  await ensureArtistCommerceSchema();
  const current = await getArtistProductById(productId);
  if (!current || current.artistId !== artistId) return null;

  const type = patch.type && isArtistCommerceProductType(patch.type) ? patch.type : current.type;
  const title = patch.title !== undefined ? patch.title.trim() : current.title;
  if (!title) throw new Error("title_required");
  const description =
    patch.description !== undefined ? patch.description?.trim() || null : current.description;
  const priceCents =
    patch.priceCents !== undefined ? Math.round(Number(patch.priceCents)) : current.priceCents;
  if (!Number.isFinite(priceCents) || priceCents < 100) throw new Error("price_too_low");
  const currency = (patch.currency ?? current.currency).toLowerCase();
  const active = patch.active !== undefined ? Boolean(patch.active) : current.active;
  const inventory =
    patch.inventory !== undefined
      ? patch.inventory == null
        ? null
        : Math.max(0, Math.floor(Number(patch.inventory)))
      : current.inventory;
  const imageUrl =
    patch.imageUrl !== undefined ? patch.imageUrl?.trim() || null : current.imageUrl;

  await prisma.$executeRawUnsafe(
    `UPDATE "ArtistCommerceProduct" SET
      type = $1::"ArtistCommerceProductType",
      title = $2,
      description = $3,
      "priceCents" = $4,
      currency = $5,
      active = $6,
      inventory = $7,
      "imageUrl" = $8,
      "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $9 AND "artistId" = $10`,
    type,
    title,
    description,
    priceCents,
    currency,
    active,
    inventory,
    imageUrl,
    productId,
    artistId,
  );

  return getArtistProductById(productId);
}

/** Decrement inventory after paid checkout (null inventory = unlimited). */
export async function decrementArtistProductInventory(
  productId: string,
  qty = 1,
): Promise<boolean> {
  await ensureArtistCommerceSchema();
  const product = await getArtistProductById(productId);
  if (!product) return false;
  if (product.inventory == null) return true;
  if (product.inventory < qty) return false;
  await prisma.$executeRawUnsafe(
    `UPDATE "ArtistCommerceProduct"
     SET inventory = inventory - $1, "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $2 AND inventory IS NOT NULL AND inventory >= $1`,
    qty,
    productId,
  );
  return true;
}
