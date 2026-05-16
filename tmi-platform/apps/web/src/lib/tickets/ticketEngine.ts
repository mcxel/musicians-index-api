import { TicketBrandingEngine } from "@/lib/tickets/TicketBrandingEngine";
import { TicketPrinterEngine } from "@/lib/tickets/TicketPrinterEngine";
import { TicketRoyaltyEngine } from "@/lib/tickets/TicketRoyaltyEngine";
import { TicketScannerEngine } from "@/lib/tickets/TicketScannerEngine";
import { TicketValidationEngine } from "@/lib/tickets/TicketValidationEngine";
import { VenueTicketCustomizer } from "@/lib/tickets/VenueTicketCustomizer";
import {
  getTicketById,
  listScanLedger,
  listTicketsByOwner,
  saveTicket,
  type TicketRecord,
  type TicketSeatBinding,
  type TicketTemplate,
  type TicketTier,
} from "@/lib/tickets/ticketCore";

function createTicketId(prefix = "tkt") {
  return `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`;
}

function seatFromTier(tier: TicketTier): TicketSeatBinding {
  if (tier === "VIP") return { section: "VIP", row: "A", seat: "01" };
  if (tier === "BACKSTAGE") return { section: "BKS", row: "B", seat: "07" };
  if (tier === "MEET_AND_GREET") return { section: "MNG", row: "M", seat: "03" };
  return { section: "STD", row: "C", seat: "14" };
}

export function createTicket(input: {
  ownerId: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  faceValue: number;
  venueLogo?: string;
  sponsorLogo?: string;
  eventBranding?: string;
}): TicketRecord {
  const template: TicketTemplate = {
    id: createTicketId("tmpl"),
    venueSlug: input.venueSlug,
    eventSlug: input.eventSlug,
    tier: input.tier,
    faceValue: input.faceValue,
    currency: "USD",
  };

  const branding = VenueTicketCustomizer(
    TicketBrandingEngine({
      venueSlug: input.venueSlug,
      eventSlug: input.eventSlug,
      venueLogo: input.venueLogo,
      sponsorLogo: input.sponsorLogo,
      eventBranding: input.eventBranding,
    }),
    {
      venueLogo: input.venueLogo,
      sponsorLogo: input.sponsorLogo,
      eventBranding: input.eventBranding,
    },
  );

  const id = createTicketId();
  const ticket: TicketRecord = {
    id,
    ownerId: input.ownerId,
    template,
    branding,
    barcode: {
      barcodeValue: `${id}-BAR`,
      qrValue: `${id}-QR`,
      signed: true,
    },
    seat: seatFromTier(input.tier),
    outputFormats: ["PDF", "IMAGE", "NFT", "MOBILE_WALLET"],
    mintedAt: new Date().toISOString(),
    redeemed: false,
  };
  return saveTicket(ticket);
}

export function printTicket(ticketId: string) {
  const ticket = getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  return TicketPrinterEngine(ticket);
}

export function scanTicket(ticketId: string, gate = "A1") {
  return TicketScannerEngine({ ticketId, gate });
}

export function validateTicket(ticketId: string) {
  return TicketValidationEngine(ticketId);
}

export function listTicketHistory(ownerId: string) {
  return {
    tickets: listTicketsByOwner(ownerId),
    scans: listScanLedger(ownerId),
  };
}

export function resolveTicketRoyalty(faceValue: number) {
  return TicketRoyaltyEngine(faceValue);
}

export function transferTicket(ticketId: string, toUserId: string): TicketRecord {
  const ticket = getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  if (ticket.redeemed) throw new Error("ticket_already_redeemed");
  const updated: TicketRecord = { ...ticket, ownerId: toUserId };
  return saveTicket(updated);
}

export function verifyTicket(ticketId: string) {
  return TicketValidationEngine(ticketId);
}

export function getOwnedTickets(ownerId: string) {
  return listTicketsByOwner(ownerId);
}

export function upgradeTicket(ticketId: string, newTier: TicketTier): TicketRecord {
  const ticket = getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  const upgraded: TicketRecord = {
    ...ticket,
    template: { ...ticket.template, tier: newTier },
  };
  return saveTicket(upgraded);
}

export function redeemTicket(ticketId: string): TicketRecord {
  const ticket = getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  if (ticket.redeemed) throw new Error("ticket_already_redeemed");
  const redeemed: TicketRecord = { ...ticket, redeemed: true };
  return saveTicket(redeemed);
}
