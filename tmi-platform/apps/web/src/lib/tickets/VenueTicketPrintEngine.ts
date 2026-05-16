// VenueTicketPrintEngine
// Orchestration layer: combines venue branding + seat metadata + NFT-backed option
// into a unified print-ready ticket payload.
//
// Distinct from:
//   BrickAndMortarTicketEngine — handles print job lifecycle
//   TicketPrintEngine          — handles raw HTML snapshot generation
// This engine owns the assembly: branding + seat + NFT layer → printable ticket

export type NftBackingStatus = "none" | "pending_mint" | "minted" | "redeemed";

export type SeatMetadata = {
  section: string;
  row: string;
  number: string;
  accessLevel: "general" | "vip" | "backstage" | "press";
  isADA: boolean;
  notes?: string;
};

export type VenueBrandingLayer = {
  venueName: string;
  venueSlug: string;
  primaryColor: string;    // hex
  accentColor: string;     // hex
  logoUrl?: string;
  backgroundPattern?: "grid" | "noise" | "lines" | "none";
  footerText?: string;
  watermarkText?: string;
};

export type VenueTicketPayload = {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  dateDisplay: string;        // "Saturday, May 10, 2026"
  timeDisplay: string;        // "9:00 PM"
  seat: SeatMetadata;
  holderName: string;
  holderEmail?: string;
  branding: VenueBrandingLayer;
  qrPayload: string;          // encoded URL: /tickets/verify/<ticketId>
  barcodeValue: string;       // 12-digit numeric
  nftStatus: NftBackingStatus;
  nftTokenId?: string;
  nftContractAddress?: string;
  priceDisplay: string;       // "$45.00"
  isTransferable: boolean;
  isRefundable: boolean;
  printedAt?: number;         // unix ms — set when rendered
};

export type PrintReadyTicket = {
  payload: VenueTicketPayload;
  htmlSnapshot: string;       // ready for window.print() or PDF service
  cssStyles: string;          // print-specific CSS
};

// ── QR / barcode generation ───────────────────────────────────────────────────

const BASE_VERIFY_URL = "/tickets/verify";

export function buildQrPayload(ticketId: string, eventId: string): string {
  return `${BASE_VERIFY_URL}/${ticketId}?event=${eventId}&ts=${Date.now()}`;
}

export function buildBarcodeValue(ticketId: string): string {
  // 12-digit numeric barcode derived from ticketId hash
  let hash = 0;
  for (const ch of ticketId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const numeric = String(hash).padStart(12, "0").slice(-12);
  return numeric;
}

// ── NFT layer ─────────────────────────────────────────────────────────────────

export function markNftPendingMint(payload: VenueTicketPayload): VenueTicketPayload {
  return { ...payload, nftStatus: "pending_mint" };
}

export function markNftMinted(
  payload: VenueTicketPayload,
  tokenId: string,
  contractAddress: string,
): VenueTicketPayload {
  return { ...payload, nftStatus: "minted", nftTokenId: tokenId, nftContractAddress: contractAddress };
}

export function markNftRedeemed(payload: VenueTicketPayload): VenueTicketPayload {
  return { ...payload, nftStatus: "redeemed" };
}

// ── Payload builder ───────────────────────────────────────────────────────────

export function buildVenueTicketPayload(options: {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  dateDisplay: string;
  timeDisplay: string;
  seat: SeatMetadata;
  holderName: string;
  holderEmail?: string;
  branding: VenueBrandingLayer;
  priceDisplay: string;
  isTransferable?: boolean;
  isRefundable?: boolean;
  nftBacked?: boolean;
}): VenueTicketPayload {
  const {
    ticketId, eventId, eventTitle, dateDisplay, timeDisplay,
    seat, holderName, holderEmail, branding, priceDisplay,
    isTransferable = false,
    isRefundable = false,
    nftBacked = false,
  } = options;

  return {
    ticketId,
    eventId,
    eventTitle,
    dateDisplay,
    timeDisplay,
    seat,
    holderName,
    holderEmail,
    branding,
    qrPayload: buildQrPayload(ticketId, eventId),
    barcodeValue: buildBarcodeValue(ticketId),
    nftStatus: nftBacked ? "pending_mint" : "none",
    priceDisplay,
    isTransferable,
    isRefundable,
  };
}

// ── HTML print renderer ───────────────────────────────────────────────────────

export function renderPrintCss(branding: VenueBrandingLayer): string {
  return `
    @media print { body { margin: 0; } }
    .vtp-root {
      width: 100mm; min-height: 50mm;
      background: #0a0a0a;
      border: 2px solid ${branding.accentColor};
      border-radius: 8px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #fff;
      padding: 12px 14px;
      position: relative;
      overflow: hidden;
    }
    .vtp-header { font-size: 7pt; letter-spacing: 0.22em; text-transform: uppercase; color: ${branding.accentColor}; margin-bottom: 4px; }
    .vtp-title  { font-size: 13pt; font-weight: 900; margin-bottom: 2px; }
    .vtp-sub    { font-size: 8pt; color: rgba(255,255,255,0.55); }
    .vtp-seat   { margin-top: 8px; font-size: 8pt; font-weight: 700; color: ${branding.primaryColor}; letter-spacing: 0.1em; }
    .vtp-qr     { position: absolute; right: 12px; top: 12px; width: 40px; height: 40px; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 6pt; color: #000; font-weight: 700; }
    .vtp-nft    { margin-top: 6px; font-size: 6pt; letter-spacing: 0.14em; color: ${branding.accentColor}; text-transform: uppercase; }
    .vtp-footer { margin-top: 10px; font-size: 6pt; color: rgba(255,255,255,0.28); }
    .vtp-wm     { position: absolute; bottom: 6px; right: 14px; font-size: 5pt; color: rgba(255,255,255,0.12); letter-spacing: 0.08em; }
  `.trim();
}

export function renderTicketHtml(p: VenueTicketPayload): string {
  const { branding, seat } = p;
  const seatLabel = `${seat.section} · Row ${seat.row} · Seat ${seat.number}`;
  const accessLabel = seat.accessLevel.toUpperCase().replace("_", " ");
  const nftLine = p.nftStatus !== "none"
    ? `<div class="vtp-nft">NFT-BACKED · ${p.nftStatus.toUpperCase()}${p.nftTokenId ? ` · ${p.nftTokenId.slice(0, 10)}` : ""}</div>`
    : "";

  return `
<div class="vtp-root">
  <div class="vtp-header">${branding.venueName} · ${accessLabel}</div>
  <div class="vtp-title">${p.eventTitle}</div>
  <div class="vtp-sub">${p.dateDisplay} &nbsp;·&nbsp; ${p.timeDisplay}</div>
  <div class="vtp-seat">${seatLabel}</div>
  <div class="vtp-qr">QR</div>
  ${nftLine}
  <div class="vtp-footer">${p.holderName} &nbsp;·&nbsp; ${p.priceDisplay}${branding.footerText ? " &nbsp;·&nbsp; " + branding.footerText : ""}</div>
  ${branding.watermarkText ? `<div class="vtp-wm">${branding.watermarkText}</div>` : ""}
</div>`.trim();
}

export function renderPrintReadyTicket(payload: VenueTicketPayload): PrintReadyTicket {
  const stamped: VenueTicketPayload = { ...payload, printedAt: Date.now() };
  return {
    payload: stamped,
    htmlSnapshot: renderTicketHtml(stamped),
    cssStyles: renderPrintCss(stamped.branding),
  };
}

// ── Default venue branding presets ────────────────────────────────────────────

export const TMI_ARENA_BRANDING: VenueBrandingLayer = {
  venueName: "TMI Arena",
  venueSlug: "tmi-arena",
  primaryColor: "#00FFFF",
  accentColor: "#AA2DFF",
  backgroundPattern: "grid",
  footerText: "TMI Platform · tmi.live",
  watermarkText: "TMI OFFICIAL TICKET",
};

export const TMI_CYPHER_ROOM_BRANDING: VenueBrandingLayer = {
  venueName: "TMI Cypher Room",
  venueSlug: "tmi-cypher-room",
  primaryColor: "#AA2DFF",
  accentColor: "#FF2DAA",
  backgroundPattern: "lines",
  footerText: "TMI Cypher · tmi.live/cypher",
  watermarkText: "CYPHER PASS",
};

export const TMI_MONDAY_STAGE_BRANDING: VenueBrandingLayer = {
  venueName: "TMI Monday Night Stage",
  venueSlug: "monday-night-stage",
  primaryColor: "#FFD700",
  accentColor: "#FF2DAA",
  backgroundPattern: "noise",
  footerText: "Every Monday 8PM · tmi.live/events",
  watermarkText: "MONDAY NIGHT STAGE",
};
