import { prisma } from "@/lib/prisma";
import type { VenueTicketRecord as PrismaVenueTicketRecord } from "@prisma/client";

export type TicketTier =
  | "VIP"
  | "STANDARD"
  | "BACKSTAGE"
  | "MEET_AND_GREET"
  | "SPONSOR_GIFT"
  | "SEASON_PASS"
  | "BATTLE_PASS"
  | "RAFFLE_PASS";

export type TicketTemplate = {
  id: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  faceValue: number;
  currency: "USD";
};

export type TicketBrandingLayer = {
  venueLogo: string;
  sponsorLogo: string;
  eventBranding: string;
  qrCode: string;
  barcode: string;
  hologramNftOverlay: string;
};

export type TicketBarcodeLayer = {
  barcodeValue: string;
  qrValue: string;
  signed: boolean;
};

export type TicketSeatBinding = {
  section: string;
  row: string;
  seat: string;
};

export type TicketScanLedger = {
  ticketId: string;
  scannedAt: string;
  gate: string;
  status: "allowed" | "denied";
  reason?: string;
};

export type TicketFraudGuard = {
  ticketId: string;
  checksumValid: boolean;
  duplicateScan: boolean;
  status: "safe" | "flagged";
};

export type TicketRoyaltySplit = {
  creatorRoyaltyPct: number;
  sponsorSplitPct: number;
  venueCutPct: number;
  platformPct: number;
};

export type TicketRecord = {
  id: string;
  ownerId: string;
  orderId?: string;
  template: TicketTemplate;
  branding: TicketBrandingLayer;
  barcode: TicketBarcodeLayer;
  seat: TicketSeatBinding;
  outputFormats: Array<"PDF" | "IMAGE" | "NFT" | "MOBILE_WALLET">;
  mintedAt: string;
  redeemed: boolean;
};

function toTicketRecord(row: PrismaVenueTicketRecord): TicketRecord {
  return {
    id: row.id,
    ownerId: row.ownerId,
    orderId: row.orderId ?? undefined,
    template: row.template as unknown as TicketTemplate,
    branding: row.branding as unknown as TicketBrandingLayer,
    barcode: row.barcode as unknown as TicketBarcodeLayer,
    seat: row.seat as unknown as TicketSeatBinding,
    outputFormats: row.outputFormats as TicketRecord["outputFormats"],
    mintedAt: row.mintedAt.toISOString(),
    redeemed: row.redeemed,
  };
}

export async function listTicketsByOwner(ownerId: string): Promise<TicketRecord[]> {
  const rows = await prisma.venueTicketRecord.findMany({ where: { ownerId }, orderBy: { mintedAt: "desc" } });
  return rows.map(toTicketRecord);
}

export async function listAllTickets(): Promise<TicketRecord[]> {
  const rows = await prisma.venueTicketRecord.findMany({ orderBy: { mintedAt: "desc" }, take: 1000 });
  return rows.map(toTicketRecord);
}

export async function getTicketById(ticketId: string): Promise<TicketRecord | undefined> {
  const row = await prisma.venueTicketRecord.findUnique({ where: { id: ticketId } });
  return row ? toTicketRecord(row) : undefined;
}

export async function saveTicket(ticket: TicketRecord): Promise<TicketRecord> {
  const data = {
    ownerId: ticket.ownerId,
    orderId: ticket.orderId ?? null,
    template: ticket.template as object,
    branding: ticket.branding as object,
    barcode: ticket.barcode as object,
    seat: ticket.seat as object,
    outputFormats: ticket.outputFormats,
    redeemed: ticket.redeemed,
  };
  const row = await prisma.venueTicketRecord.upsert({
    where: { id: ticket.id },
    update: data,
    create: { id: ticket.id, ...data, mintedAt: new Date(ticket.mintedAt) },
  });
  return toTicketRecord(row);
}

export async function appendScanLedger(entry: TicketScanLedger): Promise<void> {
  await prisma.venueTicketScan.create({
    data: {
      ticketId: entry.ticketId,
      scannedAt: new Date(entry.scannedAt),
      gate: entry.gate,
      status: entry.status,
      reason: entry.reason,
    },
  });
}

export async function listScanLedger(ownerId?: string): Promise<TicketScanLedger[]> {
  if (!ownerId) {
    const rows = await prisma.venueTicketScan.findMany({ orderBy: { scannedAt: "desc" }, take: 500 });
    return rows.map((r) => ({
      ticketId: r.ticketId,
      scannedAt: r.scannedAt.toISOString(),
      gate: r.gate,
      status: r.status as "allowed" | "denied",
      reason: r.reason ?? undefined,
    }));
  }
  const ownedTickets = await listTicketsByOwner(ownerId);
  const ticketIds = ownedTickets.map((t) => t.id);
  if (ticketIds.length === 0) return [];
  const rows = await prisma.venueTicketScan.findMany({
    where: { ticketId: { in: ticketIds } },
    orderBy: { scannedAt: "desc" },
  });
  return rows.map((r) => ({
    ticketId: r.ticketId,
    scannedAt: r.scannedAt.toISOString(),
    gate: r.gate,
    status: r.status as "allowed" | "denied",
    reason: r.reason ?? undefined,
  }));
}

export async function evaluateFraudGuard(ticketId: string): Promise<TicketFraudGuard> {
  const scans = await prisma.venueTicketScan.findMany({ where: { ticketId, status: "allowed" } });
  const duplicateScan = scans.length > 1;
  return {
    ticketId,
    checksumValid: true,
    duplicateScan,
    status: duplicateScan ? "flagged" : "safe",
  };
}

export function getDefaultRoyaltySplit(): TicketRoyaltySplit {
  return {
    creatorRoyaltyPct: 15,
    sponsorSplitPct: 10,
    venueCutPct: 55,
    platformPct: 20,
  };
}
