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
  template: TicketTemplate;
  branding: TicketBrandingLayer;
  barcode: TicketBarcodeLayer;
  seat: TicketSeatBinding;
  outputFormats: Array<"PDF" | "IMAGE" | "NFT" | "MOBILE_WALLET">;
  mintedAt: string;
  redeemed: boolean;
};

const ticketStore = new Map<string, TicketRecord>();
const scanLedgerStore: TicketScanLedger[] = [];

export function listTicketsByOwner(ownerId: string): TicketRecord[] {
  return Array.from(ticketStore.values()).filter((ticket) => ticket.ownerId === ownerId);
}

export function getTicketById(ticketId: string): TicketRecord | undefined {
  return ticketStore.get(ticketId);
}

export function saveTicket(ticket: TicketRecord): TicketRecord {
  ticketStore.set(ticket.id, ticket);
  return ticket;
}

export function appendScanLedger(entry: TicketScanLedger): void {
  scanLedgerStore.unshift(entry);
}

export function listScanLedger(ownerId?: string): TicketScanLedger[] {
  if (!ownerId) return [...scanLedgerStore];
  const ticketIds = new Set(listTicketsByOwner(ownerId).map((ticket) => ticket.id));
  return scanLedgerStore.filter((entry) => ticketIds.has(entry.ticketId));
}

export function evaluateFraudGuard(ticketId: string): TicketFraudGuard {
  const scans = scanLedgerStore.filter((entry) => entry.ticketId === ticketId && entry.status === "allowed");
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
