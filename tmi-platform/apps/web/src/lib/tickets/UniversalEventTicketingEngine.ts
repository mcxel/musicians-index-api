/**
 * UniversalEventTicketingEngine
 * Universal ticketing for any event host worldwide.
 * Ticketing and fee split are independent from sponsor logic.
 */

import { resolveEventCategory, type EventCategory } from "./EventCategoryResolver";
import type { EventHostType } from "./EventHostAccountEngine";
import { buildTicketSaleSplit, resolveTicketFee, type EventVenueSize } from "./TicketFeeResolver";
import { createEventVenueAccount, selectExistingVenueForEvent } from "./EventVenueSignupEngine";

export type TicketOwnerAccountType = EventHostType;

export type UniversalSeatInfo = {
  section?: string;
  row?: string;
  seat?: string;
};

export type UniversalTicketTemplate = {
  venueName: string;
  promoterName: string;
  eventName: string;
  performerNames: string[];
  dateIso: string;
  timeLabel: string;
  sponsorStrip: string[];
  imageUrl?: string;
  qrAreaEnabled: boolean;
  printableLayout: "classic" | "modern" | "sports" | "community" | "custom";
};

export type UniversalEventRecord = {
  eventId: string;
  ownerAccountType: TicketOwnerAccountType;
  ownerAccountId: string;
  category: EventCategory;
  categoryLabel: string;
  eventName: string;
  venueId: string;
  venueName: string;
  promoterId?: string;
  promoterName?: string;
  performerNames: string[];
  eventDateIso: string;
  eventTimeLabel: string;
  region: string;
  city: string;
  description?: string;
  createdAtMs: number;
};

export type UniversalTicketReceipt = {
  receiptId: string;
  ticketId: string;
  eventId: string;
  quantity: number;
  baseSubtotalCents: number;
  platformFeeSubtotalCents: number;
  taxSubtotalCents: number;
  buyerTotalCents: number;
  hostPayoutCents: number;
  taxRateBps: number;
  issuedAtMs: number;
};

export type UniversalTicketLedgerEntry = {
  ledgerId: string;
  ticketId: string;
  eventId: string;
  hostAccountId: string;
  platformFeeCents: number;
  hostPayoutCents: number;
  taxCents: number;
  buyerTotalCents: number;
  createdAtMs: number;
};

export type UniversalTicketCheckoutResult = {
  ticket: UniversalTicketInventory;
  receipt: UniversalTicketReceipt;
  ledger: UniversalTicketLedgerEntry;
};

export type UniversalTicketInventory = {
  ticketId: string;
  eventId: string;
  ticketType: "general" | "vip" | "ringside" | "premium" | "custom";
  priceCents: number;
  currency: "USD";
  seatInfo?: UniversalSeatInfo;
  quantityAvailable: number;
  quantitySold: number;
  routeBuy: string;
  routePrint: string;
};

export type UniversalEventRoutes = {
  buyTicketRoute: string;
  printTicketRoute: string;
  promoteEventRoute: string;
  venueSignupRoute: string;
  hostSignupRoute: string;
  magazinePromotionUpsellRoute: string;
  contactSupportRoute: string;
};

const events: UniversalEventRecord[] = [];
const tickets: UniversalTicketInventory[] = [];
const ticketLedger: UniversalTicketLedgerEntry[] = [];
let eventCounter = 0;
let ticketCounter = 0;
let receiptCounter = 0;
let ledgerCounter = 0;

function routeBase(eventId: string): string {
  return `/events/${eventId}`;
}

export function createUniversalEvent(input: {
  ownerAccountType: TicketOwnerAccountType;
  ownerAccountId: string;
  category: string;
  eventName: string;
  venueId: string;
  venueName: string;
  promoterId?: string;
  promoterName?: string;
  performerNames?: string[];
  eventDateIso: string;
  eventTimeLabel: string;
  region: string;
  city: string;
  description?: string;
}): UniversalEventRecord {
  const resolved = resolveEventCategory(input.category);
  const event: UniversalEventRecord = {
    eventId: `universal-event-${++eventCounter}`,
    ownerAccountType: input.ownerAccountType,
    ownerAccountId: input.ownerAccountId,
    category: resolved.category,
    categoryLabel: resolved.label,
    eventName: input.eventName,
    venueId: input.venueId,
    venueName: input.venueName,
    promoterId: input.promoterId,
    promoterName: input.promoterName,
    performerNames: input.performerNames ?? [],
    eventDateIso: input.eventDateIso,
    eventTimeLabel: input.eventTimeLabel,
    region: input.region,
    city: input.city,
    description: input.description,
    createdAtMs: Date.now(),
  };
  events.unshift(event);
  return event;
}

export function createUniversalEventWithNewVenue(input: {
  ownerAccountType: TicketOwnerAccountType;
  ownerAccountId: string;
  category: string;
  eventName: string;
  eventDateIso: string;
  eventTimeLabel: string;
  region: string;
  city: string;
  description?: string;
  promoterId?: string;
  promoterName?: string;
  performerNames?: string[];
  venue: {
    accountType: "venue" | "organization";
    venueName: string;
    city: string;
    region: string;
    country: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    capacity?: number;
  };
}): UniversalEventRecord {
  const createdVenue = createEventVenueAccount({
    ...input.venue,
    isNewVenue: true,
  });

  return createUniversalEvent({
    ownerAccountType: input.ownerAccountType,
    ownerAccountId: input.ownerAccountId,
    category: input.category,
    eventName: input.eventName,
    venueId: createdVenue.venueId,
    venueName: createdVenue.venueName,
    promoterId: input.promoterId,
    promoterName: input.promoterName,
    performerNames: input.performerNames,
    eventDateIso: input.eventDateIso,
    eventTimeLabel: input.eventTimeLabel,
    region: input.region,
    city: input.city,
    description: input.description,
  });
}

export function createUniversalEventWithExistingVenue(input: {
  ownerAccountType: TicketOwnerAccountType;
  ownerAccountId: string;
  category: string;
  eventName: string;
  existingVenueId: string;
  eventDateIso: string;
  eventTimeLabel: string;
  region: string;
  city: string;
  description?: string;
  promoterId?: string;
  promoterName?: string;
  performerNames?: string[];
}): UniversalEventRecord {
  const selectedVenue = selectExistingVenueForEvent(input.existingVenueId);

  return createUniversalEvent({
    ownerAccountType: input.ownerAccountType,
    ownerAccountId: input.ownerAccountId,
    category: input.category,
    eventName: input.eventName,
    venueId: selectedVenue.venueId,
    venueName: selectedVenue.venueName,
    promoterId: input.promoterId,
    promoterName: input.promoterName,
    performerNames: input.performerNames,
    eventDateIso: input.eventDateIso,
    eventTimeLabel: input.eventTimeLabel,
    region: input.region,
    city: input.city,
    description: input.description,
  });
}

export function createUniversalTicketInventory(input: {
  eventId: string;
  ticketType: "general" | "vip" | "ringside" | "premium" | "custom";
  priceCents: number;
  quantityAvailable: number;
  seatInfo?: UniversalSeatInfo;
}): UniversalTicketInventory {
  const event = events.find((item) => item.eventId === input.eventId);
  if (!event) throw new Error(`Event ${input.eventId} not found`);

  const route = routeBase(input.eventId);
  const record: UniversalTicketInventory = {
    ticketId: `universal-ticket-${++ticketCounter}`,
    eventId: input.eventId,
    ticketType: input.ticketType,
    priceCents: input.priceCents,
    currency: "USD",
    seatInfo: input.seatInfo,
    quantityAvailable: input.quantityAvailable,
    quantitySold: 0,
    routeBuy: `${route}/tickets/buy`,
    routePrint: `${route}/tickets/print`,
  };
  tickets.unshift(record);
  return record;
}

export function purchaseUniversalTicket(input: {
  ticketId: string;
  quantity?: number;
}): UniversalTicketInventory {
  const ticket = tickets.find((item) => item.ticketId === input.ticketId);
  if (!ticket) throw new Error(`Ticket ${input.ticketId} not found`);

  const quantity = input.quantity ?? 1;
  if (quantity <= 0) throw new Error("Quantity must be positive");
  if (ticket.quantitySold + quantity > ticket.quantityAvailable) {
    throw new Error("Not enough ticket inventory available");
  }

  ticket.quantitySold += quantity;
  return ticket;
}

export function checkoutUniversalTicket(input: {
  ticketId: string;
  quantity?: number;
  ticketVolumeHint?: number;
  venueSize?: EventVenueSize;
  taxRateBps?: number;
}): UniversalTicketCheckoutResult {
  const ticket = tickets.find((item) => item.ticketId === input.ticketId);
  if (!ticket) throw new Error(`Ticket ${input.ticketId} not found`);

  const event = events.find((item) => item.eventId === ticket.eventId);
  if (!event) throw new Error(`Event ${ticket.eventId} not found`);

  const quantity = input.quantity ?? 1;
  if (quantity <= 0) throw new Error("Quantity must be positive");
  if (ticket.quantitySold + quantity > ticket.quantityAvailable) {
    throw new Error("Not enough ticket inventory available");
  }

  const volume = input.ticketVolumeHint ?? ticket.quantityAvailable;
  const fee = resolveTicketFee({
    baseTicketPriceCents: ticket.priceCents,
    ticketVolume: volume,
    eventCategory: String(event.category),
    venueSize: input.venueSize,
    taxRateBps: input.taxRateBps,
  });

  const split = buildTicketSaleSplit({
    baseTicketPriceCents: ticket.priceCents,
    quantity,
    ticketVolume: volume,
    venueSize: input.venueSize,
    eventCategory: String(event.category),
    taxRateBps: fee.taxRateBps,
  });

  ticket.quantitySold += quantity;

  const receipt: UniversalTicketReceipt = {
    receiptId: `universal-ticket-receipt-${++receiptCounter}`,
    ticketId: ticket.ticketId,
    eventId: event.eventId,
    quantity,
    baseSubtotalCents: split.baseSubtotalCents,
    platformFeeSubtotalCents: split.platformFeeSubtotalCents,
    taxSubtotalCents: split.taxSubtotalCents,
    buyerTotalCents: split.buyerTotalCents,
    hostPayoutCents: split.hostPayoutCents,
    taxRateBps: fee.taxRateBps,
    issuedAtMs: Date.now(),
  };

  const ledger: UniversalTicketLedgerEntry = {
    ledgerId: `universal-ticket-ledger-${++ledgerCounter}`,
    ticketId: ticket.ticketId,
    eventId: event.eventId,
    hostAccountId: event.ownerAccountId,
    platformFeeCents: split.platformFeeSubtotalCents,
    hostPayoutCents: split.hostPayoutCents,
    taxCents: split.taxSubtotalCents,
    buyerTotalCents: split.buyerTotalCents,
    createdAtMs: Date.now(),
  };

  ticketLedger.unshift(ledger);

  return {
    ticket,
    receipt,
    ledger,
  };
}

export function buildUniversalEventRoutes(eventId: string): UniversalEventRoutes {
  const base = routeBase(eventId);
  return {
    buyTicketRoute: `${base}/tickets/buy`,
    printTicketRoute: `${base}/tickets/print`,
    promoteEventRoute: `${base}/promote`,
    venueSignupRoute: `/venues/signup`,
    hostSignupRoute: `/event-hosts/signup`,
    magazinePromotionUpsellRoute: `${base}/promote/magazine-upsell`,
    contactSupportRoute: `/events/support/contact`,
  };
}

export function buildUniversalTicketTemplate(input: {
  eventId: string;
  venueName: string;
  promoterName: string;
  eventName: string;
  performerNames: string[];
  dateIso: string;
  timeLabel: string;
  sponsorStrip?: string[];
  imageUrl?: string;
  qrAreaEnabled?: boolean;
  printableLayout?: "classic" | "modern" | "sports" | "community" | "custom";
}): UniversalTicketTemplate {
  return {
    venueName: input.venueName,
    promoterName: input.promoterName,
    eventName: input.eventName,
    performerNames: input.performerNames,
    dateIso: input.dateIso,
    timeLabel: input.timeLabel,
    sponsorStrip: input.sponsorStrip ?? [],
    imageUrl: input.imageUrl,
    qrAreaEnabled: input.qrAreaEnabled ?? true,
    printableLayout: input.printableLayout ?? "classic",
  };
}

export function listUniversalEvents(filters?: {
  category?: string;
  ownerAccountType?: TicketOwnerAccountType;
  city?: string;
  region?: string;
}): UniversalEventRecord[] {
  return events.filter((event) => {
    if (filters?.category && event.category !== filters.category) return false;
    if (filters?.ownerAccountType && event.ownerAccountType !== filters.ownerAccountType) return false;
    if (filters?.city && event.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters?.region && event.region.toLowerCase() !== filters.region.toLowerCase()) return false;
    return true;
  });
}

export function listUniversalTicketsForEvent(eventId: string): UniversalTicketInventory[] {
  return tickets.filter((ticket) => ticket.eventId === eventId);
}

export function listUniversalTicketLedgerEntries(eventId?: string): UniversalTicketLedgerEntry[] {
  if (!eventId) return [...ticketLedger];
  return ticketLedger.filter((entry) => entry.eventId === eventId);
}
