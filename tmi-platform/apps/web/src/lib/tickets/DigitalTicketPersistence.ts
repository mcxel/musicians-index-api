/**
 * DigitalTicketPersistence — DB authority for digital offers + issued tickets.
 * Uses ensure* runtime DDL (ArtistCommerceCatalog pattern) so Vercel works
 * before a formal migrate. Prisma Ticket/CheckIn require Event FKs and are
 * Venue/Promoter inventory (Rule 17) — not reused for digital offer drafts.
 */

import prisma from "@/lib/prisma";
import { TICKET_FEE_POLICY_ID } from "@/lib/tickets/TicketFeeResolver";
import type { DigitalTicketOffer, DigitalTicketStatus, DigitalTicketType } from "@/lib/tickets/DigitalTicketOfferEngine";
import type { TicketRecord } from "@/lib/tickets/ticketCore";

type OfferRow = {
  id: string;
  eventId: string;
  ownerId: string;
  ticketType: string;
  title: string;
  artworkAssetId: string | null;
  artworkUrl: string | null;
  priceCents: number;
  currency: string;
  capacity: number;
  soldCount: number;
  pricingZone: string | null;
  seatMapId: string | null;
  saleStart: Date | null;
  saleEnd: Date | null;
  feePolicyId: string;
  status: string;
  venueBusinessRevenueCents: number;
  digitalPerformerRevenueCents: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type IssuedRow = {
  id: string;
  offerId: string | null;
  eventId: string;
  ownerId: string;
  redeemed: boolean;
  checkedInAt: Date | null;
  checkedInBy: string | null;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

let schemaReady: Promise<void> | null = null;

/** Idempotent DDL — safe on every cold start. */
export async function ensureDigitalTicketSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DigitalTicketOffer" (
          id TEXT PRIMARY KEY,
          "eventId" TEXT NOT NULL,
          "ownerId" TEXT NOT NULL,
          "ticketType" TEXT NOT NULL DEFAULT 'general',
          title TEXT NOT NULL,
          "artworkAssetId" TEXT,
          "artworkUrl" TEXT,
          "priceCents" INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          capacity INTEGER NOT NULL DEFAULT 100,
          "soldCount" INTEGER NOT NULL DEFAULT 0,
          "pricingZone" TEXT,
          "seatMapId" TEXT,
          "saleStart" TIMESTAMP(3),
          "saleEnd" TIMESTAMP(3),
          "feePolicyId" TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          "venueBusinessRevenueCents" INTEGER NOT NULL DEFAULT 0,
          "digitalPerformerRevenueCents" INTEGER NOT NULL DEFAULT 0,
          "publishedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalTicketOffer_ownerId_idx"
          ON "DigitalTicketOffer"("ownerId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalTicketOffer_eventId_idx"
          ON "DigitalTicketOffer"("eventId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalTicketOffer_ownerId_status_idx"
          ON "DigitalTicketOffer"("ownerId", status);
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DigitalIssuedTicket" (
          id TEXT PRIMARY KEY,
          "offerId" TEXT,
          "eventId" TEXT NOT NULL,
          "ownerId" TEXT NOT NULL,
          redeemed BOOLEAN NOT NULL DEFAULT false,
          "checkedInAt" TIMESTAMP(3),
          "checkedInBy" TEXT,
          payload JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalIssuedTicket_offerId_idx"
          ON "DigitalIssuedTicket"("offerId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalIssuedTicket_eventId_idx"
          ON "DigitalIssuedTicket"("eventId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalIssuedTicket_ownerId_idx"
          ON "DigitalIssuedTicket"("ownerId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DigitalIssuedTicket_redeemed_idx"
          ON "DigitalIssuedTicket"(redeemed);
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function iso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString();
}

export function mapOfferRow(row: OfferRow): DigitalTicketOffer {
  return {
    id: row.id,
    eventId: row.eventId,
    ownerId: row.ownerId,
    ticketType: row.ticketType as DigitalTicketType,
    title: row.title,
    artworkAssetId: row.artworkAssetId,
    artworkUrl: row.artworkUrl,
    priceCents: row.priceCents,
    currency: "USD",
    capacity: row.capacity,
    soldCount: row.soldCount,
    pricingZone: row.pricingZone,
    seatMapId: row.seatMapId,
    saleStart: iso(row.saleStart),
    saleEnd: iso(row.saleEnd),
    feePolicyId: (row.feePolicyId || TICKET_FEE_POLICY_ID) as typeof TICKET_FEE_POLICY_ID,
    status: row.status as DigitalTicketStatus,
    venueBusinessRevenueCents: row.venueBusinessRevenueCents,
    digitalPerformerRevenueCents: row.digitalPerformerRevenueCents,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: iso(row.publishedAt),
  };
}

function mapIssuedRow(row: IssuedRow): TicketRecord {
  const payload = row.payload as TicketRecord;
  return {
    ...payload,
    id: row.id,
    ownerId: row.ownerId,
    redeemed: row.redeemed,
    checkedInAt: iso(row.checkedInAt),
    checkedInBy: row.checkedInBy,
    offerId: row.offerId ?? payload.offerId,
  };
}

export async function dbGetOffer(offerId: string): Promise<DigitalTicketOffer | null> {
  await ensureDigitalTicketSchema();
  const rows = await prisma.$queryRawUnsafe<OfferRow[]>(
    `SELECT * FROM "DigitalTicketOffer" WHERE id = $1 LIMIT 1`,
    offerId,
  );
  return rows[0] ? mapOfferRow(rows[0]) : null;
}

export async function dbListOffersByOwner(ownerId: string): Promise<DigitalTicketOffer[]> {
  await ensureDigitalTicketSchema();
  const rows = await prisma.$queryRawUnsafe<OfferRow[]>(
    `SELECT * FROM "DigitalTicketOffer" WHERE "ownerId" = $1 ORDER BY "updatedAt" DESC`,
    ownerId,
  );
  return rows.map(mapOfferRow);
}

export async function dbListOffersByEvent(eventId: string): Promise<DigitalTicketOffer[]> {
  await ensureDigitalTicketSchema();
  const rows = await prisma.$queryRawUnsafe<OfferRow[]>(
    `SELECT * FROM "DigitalTicketOffer" WHERE "eventId" = $1 ORDER BY "updatedAt" DESC`,
    eventId,
  );
  return rows.map(mapOfferRow);
}

export async function dbUpsertOffer(offer: DigitalTicketOffer): Promise<DigitalTicketOffer> {
  await ensureDigitalTicketSchema();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "DigitalTicketOffer" (
      id, "eventId", "ownerId", "ticketType", title, "artworkAssetId", "artworkUrl",
      "priceCents", currency, capacity, "soldCount", "pricingZone", "seatMapId",
      "saleStart", "saleEnd", "feePolicyId", status,
      "venueBusinessRevenueCents", "digitalPerformerRevenueCents",
      "publishedAt", "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14::timestamp, $15::timestamp, $16, $17,
      $18, $19,
      $20::timestamp, $21::timestamp, $22::timestamp
    )
    ON CONFLICT (id) DO UPDATE SET
      "eventId" = EXCLUDED."eventId",
      "ownerId" = EXCLUDED."ownerId",
      "ticketType" = EXCLUDED."ticketType",
      title = EXCLUDED.title,
      "artworkAssetId" = EXCLUDED."artworkAssetId",
      "artworkUrl" = EXCLUDED."artworkUrl",
      "priceCents" = EXCLUDED."priceCents",
      currency = EXCLUDED.currency,
      capacity = EXCLUDED.capacity,
      "soldCount" = EXCLUDED."soldCount",
      "pricingZone" = EXCLUDED."pricingZone",
      "seatMapId" = EXCLUDED."seatMapId",
      "saleStart" = EXCLUDED."saleStart",
      "saleEnd" = EXCLUDED."saleEnd",
      "feePolicyId" = EXCLUDED."feePolicyId",
      status = EXCLUDED.status,
      "venueBusinessRevenueCents" = EXCLUDED."venueBusinessRevenueCents",
      "digitalPerformerRevenueCents" = EXCLUDED."digitalPerformerRevenueCents",
      "publishedAt" = EXCLUDED."publishedAt",
      "updatedAt" = EXCLUDED."updatedAt"`,
    offer.id,
    offer.eventId,
    offer.ownerId,
    offer.ticketType,
    offer.title,
    offer.artworkAssetId,
    offer.artworkUrl,
    offer.priceCents,
    offer.currency,
    offer.capacity,
    offer.soldCount,
    offer.pricingZone,
    offer.seatMapId,
    offer.saleStart,
    offer.saleEnd,
    offer.feePolicyId,
    offer.status,
    offer.venueBusinessRevenueCents,
    offer.digitalPerformerRevenueCents,
    offer.publishedAt,
    offer.createdAt,
    offer.updatedAt,
  );
  return offer;
}

/**
 * Atomically increment soldCount if capacity allows.
 * Returns updated offer or null if sold out / missing.
 */
export async function dbIncrementSoldCount(input: {
  offerId: string;
  quantity: number;
  hostPayoutCents: number;
  statusIfStillOpen: DigitalTicketStatus;
}): Promise<DigitalTicketOffer | null> {
  await ensureDigitalTicketSchema();
  const qty = Math.max(1, Math.floor(input.quantity));
  const rows = await prisma.$queryRawUnsafe<OfferRow[]>(
    `UPDATE "DigitalTicketOffer" SET
      "soldCount" = "soldCount" + $2,
      "digitalPerformerRevenueCents" = "digitalPerformerRevenueCents" + $3,
      status = CASE
        WHEN "soldCount" + $2 >= capacity THEN 'sold_out'
        ELSE $4
      END,
      "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $1
       AND "soldCount" + $2 <= capacity
     RETURNING *`,
    input.offerId,
    qty,
    Math.max(0, Math.floor(input.hostPayoutCents)),
    input.statusIfStillOpen,
  );
  return rows[0] ? mapOfferRow(rows[0]) : null;
}

export async function dbUpsertIssuedTicket(ticket: TicketRecord): Promise<TicketRecord> {
  await ensureDigitalTicketSchema();
  const payload = JSON.stringify(ticket);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "DigitalIssuedTicket" (
      id, "offerId", "eventId", "ownerId", redeemed, "checkedInAt", "checkedInBy",
      payload, "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6::timestamp, $7,
      $8::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      "offerId" = EXCLUDED."offerId",
      "eventId" = EXCLUDED."eventId",
      "ownerId" = EXCLUDED."ownerId",
      redeemed = EXCLUDED.redeemed,
      "checkedInAt" = EXCLUDED."checkedInAt",
      "checkedInBy" = EXCLUDED."checkedInBy",
      payload = EXCLUDED.payload,
      "updatedAt" = CURRENT_TIMESTAMP`,
    ticket.id,
    ticket.offerId ?? null,
    ticket.template.eventSlug,
    ticket.ownerId,
    Boolean(ticket.redeemed),
    ticket.checkedInAt ?? null,
    ticket.checkedInBy ?? null,
    payload,
  );
  return ticket;
}

export async function dbGetIssuedTicket(ticketId: string): Promise<TicketRecord | null> {
  await ensureDigitalTicketSchema();
  const rows = await prisma.$queryRawUnsafe<IssuedRow[]>(
    `SELECT * FROM "DigitalIssuedTicket" WHERE id = $1 LIMIT 1`,
    ticketId,
  );
  return rows[0] ? mapIssuedRow(rows[0]) : null;
}

/**
 * Single-flight redeem across instances: UPDATE … WHERE redeemed = false.
 */
export async function dbAtomicRedeemIssuedTicket(input: {
  ticketId: string;
  operatorId: string;
  checkedInAt: string;
}): Promise<
  | { ok: true; ticket: TicketRecord }
  | { ok: false; reason: "not_found" | "already_redeemed"; ticket?: TicketRecord }
> {
  await ensureDigitalTicketSchema();
  const rows = await prisma.$queryRawUnsafe<IssuedRow[]>(
    `UPDATE "DigitalIssuedTicket" SET
      redeemed = true,
      "checkedInAt" = $2::timestamp,
      "checkedInBy" = $3,
      payload = jsonb_set(
        jsonb_set(
          jsonb_set(payload, '{redeemed}', 'true'::jsonb, true),
          '{checkedInAt}', to_jsonb($2::text), true
        ),
        '{checkedInBy}', to_jsonb($3::text), true
      ),
      "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $1 AND redeemed = false
     RETURNING *`,
    input.ticketId,
    input.checkedInAt,
    input.operatorId,
  );
  if (rows[0]) {
    return { ok: true, ticket: mapIssuedRow(rows[0]) };
  }
  const existing = await dbGetIssuedTicket(input.ticketId);
  if (!existing) return { ok: false, reason: "not_found" };
  return { ok: false, reason: "already_redeemed", ticket: existing };
}
