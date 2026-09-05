/**
 * DigitalTicketOfferEngine — performer/event-owner digital ticket pipeline.
 * Create → artwork → save draft → preview → sale terms → Review & Publish → sale.
 * Physical venue tickets remain Venue/Promoter (Rule 17).
 * Offers + issued tickets persist via DigitalTicketPersistence (DB / ensure*).
 */

import {
  TICKET_FEE_POLICY_ID,
  resolveTicketFee,
  buildTicketSaleSplit,
  type TicketFeeResolution,
  type TicketSaleSplit,
} from "@/lib/tickets/TicketFeeResolver";
import { createTicket, redeemTicket } from "@/lib/tickets/ticketEngine";
import { getTicketById, saveTicket, type TicketRecord } from "@/lib/tickets/ticketCore";
import {
  dbGetIssuedTicket,
  dbGetOffer,
  dbIncrementSoldCount,
  dbListOffersByEvent,
  dbListOffersByOwner,
  dbUpsertIssuedTicket,
  dbUpsertOffer,
} from "@/lib/tickets/DigitalTicketPersistence";

export type DigitalTicketStatus =
  | "draft"
  | "review"
  | "published"
  | "on_sale"
  | "sold_out"
  | "ended"
  | "cancelled";

export type DigitalTicketType =
  | "general"
  | "vip"
  | "backstage"
  | "concert"
  | "comedy"
  | "streamcast"
  | "dance_off"
  | "world_concert"
  | "premiere"
  | "custom";

export type DigitalTicketOffer = {
  id: string;
  eventId: string;
  ownerId: string;
  ticketType: DigitalTicketType;
  title: string;
  artworkAssetId: string | null;
  artworkUrl: string | null;
  priceCents: number;
  currency: "USD";
  capacity: number;
  soldCount: number;
  pricingZone: string | null;
  seatMapId: string | null;
  saleStart: string | null;
  saleEnd: string | null;
  feePolicyId: typeof TICKET_FEE_POLICY_ID;
  status: DigitalTicketStatus;
  venueBusinessRevenueCents: number;
  digitalPerformerRevenueCents: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type DigitalTicketSaleQuote = {
  offer: DigitalTicketOffer;
  fee: TicketFeeResolution;
  split: TicketSaleSplit;
};

/** Process-local cache only — DB is source of truth across instances. */
const offerCache = new Map<string, DigitalTicketOffer>();

function nowIso(): string {
  return new Date().toISOString();
}

function createOfferId(): string {
  return `dto-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function cacheOffer(offer: DigitalTicketOffer): DigitalTicketOffer {
  offerCache.set(offer.id, offer);
  return offer;
}

export async function listDigitalOffersForOwner(ownerId: string): Promise<DigitalTicketOffer[]> {
  const rows = await dbListOffersByOwner(ownerId);
  for (const o of rows) cacheOffer(o);
  return rows;
}

export async function getDigitalOffer(offerId: string): Promise<DigitalTicketOffer | undefined> {
  // Always read DB — process cache must not hide updates from other instances.
  const row = await dbGetOffer(offerId);
  if (!row) {
    offerCache.delete(offerId);
    return undefined;
  }
  return cacheOffer(row);
}

export async function getDigitalOfferByEvent(eventId: string): Promise<DigitalTicketOffer[]> {
  const rows = await dbListOffersByEvent(eventId);
  for (const o of rows) cacheOffer(o);
  return rows;
}

export async function saveDigitalOfferDraft(input: {
  id?: string;
  eventId: string;
  ownerId: string;
  ticketType?: DigitalTicketType;
  title: string;
  artworkAssetId?: string | null;
  artworkUrl?: string | null;
  priceCents: number;
  capacity?: number;
  pricingZone?: string | null;
  seatMapId?: string | null;
  saleStart?: string | null;
  saleEnd?: string | null;
  status?: DigitalTicketStatus;
}): Promise<DigitalTicketOffer> {
  const existing = input.id
    ? (await getDigitalOffer(input.id)) ?? undefined
    : undefined;
  if (existing && existing.ownerId !== input.ownerId) {
    throw new Error("offer_owner_mismatch");
  }

  const id = existing?.id ?? input.id ?? createOfferId();
  const priceCents = Math.max(99, Math.round(input.priceCents));
  const offer: DigitalTicketOffer = {
    id,
    eventId: input.eventId.trim() || "event-unassigned",
    ownerId: input.ownerId,
    ticketType: input.ticketType ?? existing?.ticketType ?? "general",
    title: input.title.trim() || "Digital Ticket",
    artworkAssetId: input.artworkAssetId ?? existing?.artworkAssetId ?? null,
    artworkUrl: input.artworkUrl ?? existing?.artworkUrl ?? null,
    priceCents,
    currency: "USD",
    capacity: Math.max(1, Math.floor(input.capacity ?? existing?.capacity ?? 100)),
    soldCount: existing?.soldCount ?? 0,
    pricingZone: input.pricingZone ?? existing?.pricingZone ?? null,
    seatMapId: input.seatMapId ?? existing?.seatMapId ?? null,
    saleStart: input.saleStart ?? existing?.saleStart ?? null,
    saleEnd: input.saleEnd ?? existing?.saleEnd ?? null,
    feePolicyId: TICKET_FEE_POLICY_ID,
    status: input.status ?? existing?.status ?? "draft",
    venueBusinessRevenueCents: existing?.venueBusinessRevenueCents ?? 0,
    digitalPerformerRevenueCents: existing?.digitalPerformerRevenueCents ?? 0,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    publishedAt: existing?.publishedAt ?? null,
  };

  await dbUpsertOffer(offer);
  return cacheOffer(offer);
}

export async function quoteDigitalOffer(
  offerId: string,
  quantity = 1,
): Promise<DigitalTicketSaleQuote> {
  const offer = await getDigitalOffer(offerId);
  if (!offer) throw new Error("offer_not_found");
  const fee = resolveTicketFee({ baseTicketPriceCents: offer.priceCents });
  const split = buildTicketSaleSplit({
    baseTicketPriceCents: offer.priceCents,
    quantity,
  });
  return { offer, fee, split };
}

/** Review & Publish — creator path (not buyer checkout). */
export async function publishDigitalOffer(
  offerId: string,
  ownerId: string,
): Promise<DigitalTicketOffer> {
  const offer = await getDigitalOffer(offerId);
  if (!offer) throw new Error("offer_not_found");
  if (offer.ownerId !== ownerId) throw new Error("offer_owner_mismatch");
  if (!offer.title.trim()) throw new Error("title_required");
  if (offer.priceCents < 99) throw new Error("price_below_floor");
  if (offer.capacity < 1) throw new Error("capacity_required");

  const published: DigitalTicketOffer = {
    ...offer,
    status: "on_sale",
    feePolicyId: TICKET_FEE_POLICY_ID,
    publishedAt: offer.publishedAt ?? nowIso(),
    updatedAt: nowIso(),
  };
  await dbUpsertOffer(published);
  return cacheOffer(published);
}

export type DigitalPurchaseResult = {
  offer: DigitalTicketOffer;
  ticket: TicketRecord;
  fee: TicketFeeResolution;
  split: TicketSaleSplit;
  buyerTotalCents: number;
  sellerPayoutCents: number;
};

/**
 * Issue a sold digital ticket after payment (or TEST PURCHASE).
 * Price + fee always come from the offer + TicketFeePolicy — never client amounts.
 */
export async function purchaseDigitalOffer(input: {
  offerId: string;
  buyerId: string;
  quantity?: number;
  testPurchase?: boolean;
}): Promise<DigitalPurchaseResult> {
  const offer = await getDigitalOffer(input.offerId);
  if (!offer) throw new Error("offer_not_found");
  if (offer.status !== "on_sale" && offer.status !== "published" && !input.testPurchase) {
    throw new Error("offer_not_on_sale");
  }
  if (input.testPurchase && offer.ownerId !== input.buyerId) {
    throw new Error("test_purchase_owner_only");
  }

  const quantity = Math.max(1, Math.min(10, Math.floor(input.quantity ?? 1)));
  if (offer.soldCount + quantity > offer.capacity) {
    throw new Error("sold_out");
  }

  const fee = resolveTicketFee({ baseTicketPriceCents: offer.priceCents });
  const split = buildTicketSaleSplit({
    baseTicketPriceCents: offer.priceCents,
    quantity,
  });

  const statusIfStillOpen: DigitalTicketStatus =
    offer.status === "published" ? "on_sale" : offer.status;

  const updated = await dbIncrementSoldCount({
    offerId: offer.id,
    quantity,
    hostPayoutCents: split.hostPayoutCents,
    statusIfStillOpen,
  });
  if (!updated) {
    throw new Error("sold_out");
  }
  cacheOffer(updated);

  const ticket = createTicket({
    ownerId: input.buyerId,
    venueSlug: offer.pricingZone ?? "digital",
    eventSlug: offer.eventId,
    tier: offer.ticketType === "vip" ? "VIP" : offer.ticketType === "backstage" ? "BACKSTAGE" : "STANDARD",
    faceValue: offer.priceCents / 100,
    eventBranding: offer.title,
    venueLogo: offer.artworkUrl ?? undefined,
  });

  const enriched: TicketRecord = {
    ...ticket,
    artworkAssetId: offer.artworkAssetId,
    artworkUrl: offer.artworkUrl,
    feePolicyId: offer.feePolicyId,
    priceCents: offer.priceCents,
    offerId: offer.id,
    branding: {
      ...ticket.branding,
      eventBranding: offer.title,
      venueLogo: offer.artworkUrl || ticket.branding.venueLogo,
    },
  };
  saveTicket(enriched);
  await dbUpsertIssuedTicket(enriched);

  return {
    offer: updated,
    ticket: enriched,
    fee,
    split,
    buyerTotalCents: split.buyerTotalCents,
    sellerPayoutCents: split.hostPayoutCents,
  };
}

export async function attachDigitalOfferToEvent(input: {
  eventId: string;
  ownerId: string;
  title: string;
  priceCents: number;
  capacity?: number;
  artworkUrl?: string | null;
}): Promise<DigitalTicketOffer> {
  return saveDigitalOfferDraft({
    eventId: input.eventId,
    ownerId: input.ownerId,
    title: input.title,
    priceCents: input.priceCents,
    capacity: input.capacity ?? 500,
    artworkUrl: input.artworkUrl ?? null,
    ticketType: "concert",
    status: "draft",
  });
}

/** Load ticket for preview/management — never redirects. */
export async function loadTicketForPreview(ticketId: string): Promise<{
  ticket: TicketRecord;
  offer: DigitalTicketOffer | null;
} | null> {
  const mem = getTicketById(ticketId);
  const ticket = mem ?? (await dbGetIssuedTicket(ticketId)) ?? null;
  if (!ticket) return null;
  if (!mem) saveTicket(ticket);

  let offer: DigitalTicketOffer | null = null;
  if (ticket.offerId) {
    offer = (await getDigitalOffer(ticket.offerId)) ?? null;
  }
  if (!offer) {
    const byEvent = await getDigitalOfferByEvent(ticket.template.eventSlug);
    offer = byEvent.find((o) => o.ownerId === ticket.ownerId) ?? byEvent[0] ?? null;
  }
  return { ticket, offer };
}

export async function markDigitalTicketRedeemed(ticketId: string): Promise<TicketRecord> {
  const ticket = redeemTicket(ticketId);
  await dbUpsertIssuedTicket(ticket);
  return ticket;
}
