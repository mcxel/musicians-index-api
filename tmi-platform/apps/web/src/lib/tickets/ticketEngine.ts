import { prisma } from "@/lib/prisma";
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

const INVENTORY_AUTHORIZED_ROLES = new Set([
  "VENUE",
  "PROMOTER",
  "ADMIN",
  "SUPERADMIN",
  "OWNER",
]);

type CreateTicketInput = {
  ownerId: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  faceValue: number;
  venueLogo?: string;
  sponsorLogo?: string;
  eventBranding?: string;
  actorRole?: string;
  isAuthenticated?: boolean;
  inventoryLimit?: number;
};

function throwTicketEngineError(code: string): never {
  const err = new Error(code);
  (err as Error & { code: string }).code = code;
  throw err;
}

function normalizeRole(role?: string): string {
  return (role ?? "").trim().toUpperCase();
}

function assertInventoryAuthority(input: CreateTicketInput): void {
  if (!input.isAuthenticated) {
    throwTicketEngineError("authentication_required");
  }
  const role = normalizeRole(input.actorRole);
  if (!INVENTORY_AUTHORIZED_ROLES.has(role)) {
    throwTicketEngineError("forbidden_inventory_role");
  }
}

function inventoryKeyFor(input: CreateTicketInput): string {
  return `${input.venueSlug}::${input.eventSlug}::${input.tier}`;
}

// Atomic, DB-backed inventory reservation (EventInventory table) — replaces
// the previous process-local Maps, which reset on server restart and
// diverged across multi-instance deployments (allowing overselling).
//
// IMPORTANT: only participates in inventory tracking when THIS call supplies
// inventoryLimit. Some callers (e.g. /api/tickets/create) already run their
// own EventInventory reservation before calling createTicket() and deliberately
// omit inventoryLimit here to avoid a double-increment — do not "helpfully"
// increment an existing row for a key this call was never given a limit for.
async function reserveInventorySlot(input: CreateTicketInput): Promise<void> {
  const configuredLimit = input.inventoryLimit;
  if (configuredLimit === undefined) return;

  if (!Number.isInteger(configuredLimit) || configuredLimit <= 0) {
    throwTicketEngineError("invalid_inventory_limit");
  }

  const key = inventoryKeyFor(input);
  await prisma.eventInventory.upsert({
    where: { key },
    update: {},
    create: { key, capacity: configuredLimit },
  });

  const existing = await prisma.eventInventory.findUniqueOrThrow({ where: { key } });

  // Atomic conditional increment: only succeeds if issued < capacity, so
  // concurrent requests can never oversell past capacity.
  const result = await prisma.eventInventory.updateMany({
    where: { key, issued: { lt: existing.capacity } },
    data: { issued: { increment: 1 } },
  });

  if (result.count === 0) {
    throwTicketEngineError("sold_out");
  }
}

function createTicketId(prefix = "tkt") {
  return `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`;
}

function seatFromTier(tier: TicketTier): TicketSeatBinding {
  if (tier === "VIP") return { section: "VIP", row: "A", seat: "01" };
  if (tier === "BACKSTAGE") return { section: "BKS", row: "B", seat: "07" };
  if (tier === "MEET_AND_GREET") return { section: "MNG", row: "M", seat: "03" };
  return { section: "STD", row: "C", seat: "14" };
}

export async function createTicket(input: CreateTicketInput): Promise<TicketRecord> {
  assertInventoryAuthority(input);
  if (!Number.isFinite(input.faceValue) || input.faceValue <= 0) {
    throwTicketEngineError("invalid_face_value");
  }
  await reserveInventorySlot(input);

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

export async function printTicket(ticketId: string) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  return TicketPrinterEngine(ticket);
}

export async function scanTicket(ticketId: string, gate = "A1") {
  return TicketScannerEngine({ ticketId, gate });
}

export async function validateTicket(ticketId: string) {
  return TicketValidationEngine(ticketId);
}

export async function listTicketHistory(ownerId: string) {
  const [tickets, scans] = await Promise.all([
    listTicketsByOwner(ownerId),
    listScanLedger(ownerId),
  ]);
  return { tickets, scans };
}

export function resolveTicketRoyalty(faceValue: number) {
  return TicketRoyaltyEngine(faceValue);
}

export async function transferTicket(
  ticketId: string,
  toUserId: string,
  actorId: string,
): Promise<TicketRecord> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  if (ticket.redeemed) throw new Error("ticket_already_redeemed");
  // Only the current owner may transfer their own ticket.
  if (ticket.ownerId !== actorId) throw new Error("forbidden_not_owner");
  const updated: TicketRecord = { ...ticket, ownerId: toUserId };
  return saveTicket(updated);
}

export async function verifyTicket(ticketId: string) {
  return TicketValidationEngine(ticketId);
}

export async function getOwnedTickets(ownerId: string) {
  return listTicketsByOwner(ownerId);
}

export async function upgradeTicket(
  ticketId: string,
  newTier: TicketTier,
  actorRole: string,
  isAuthenticated = false,
): Promise<TicketRecord> {
  // Tier upgrades change the ticket's commercial value — authority required.
  if (!isAuthenticated) throwTicketEngineError("authentication_required");
  if (!INVENTORY_AUTHORIZED_ROLES.has(normalizeRole(actorRole))) {
    throwTicketEngineError("forbidden_inventory_role");
  }
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  if (ticket.redeemed) throw new Error("ticket_already_redeemed");
  const upgraded: TicketRecord = {
    ...ticket,
    template: { ...ticket.template, tier: newTier },
  };
  return saveTicket(upgraded);
}

export async function redeemTicket(ticketId: string): Promise<TicketRecord> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error("ticket_not_found");
  if (ticket.redeemed) throw new Error("ticket_already_redeemed");
  const redeemed: TicketRecord = { ...ticket, redeemed: true };
  return saveTicket(redeemed);
}
