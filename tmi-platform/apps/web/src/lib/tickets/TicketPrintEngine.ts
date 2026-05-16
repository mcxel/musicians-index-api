import { ImageSlotWrapper } from '@/components/visual-enforcement';
import type { TicketTier } from "./TicketCommerceEngine";
import type { TicketInventoryEntry } from "./TicketInventoryEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketPrintData = {
  ticketId: string;
  eventName: string;
  artistName: string;
  venueName: string;
  venueAddress?: string;
  dateDisplay: string;        // "Saturday, June 14, 2026"
  timeDisplay: string;        // "8:00 PM"
  tier: TicketTier;
  seatLabel?: string;         // "Section A · Row 4 · Seat 12"
  qrPayload: string;          // URL or token for scan
  sponsorName?: string;
  sponsorLogoUrl?: string;
  venueLogoUrl?: string;
  customFooter?: string;
  subtotalDisplay: string;
  taxDisplay: string;
  totalDisplay: string;
};

export type PrintedTicket = {
  ticketId: string;
  printedAtMs: number;
  data: TicketPrintData;
  htmlSnapshot: string;       // static HTML string, ready for print/PDF
};

// ─── HTML template ────────────────────────────────────────────────────────────

function renderTicketHtml(d: TicketPrintData): string {
  const sponsorBlock = d.sponsorName
    ? `<div class="tkt-sponsor">${d.sponsorLogoUrl ? `<ImageSlotWrapper imageId="img-j7ijug" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />` : ""}<span>${d.sponsorName}</span></div>`
    : "";

  const seatBlock = d.seatLabel
    ? `<div class="tkt-seat"><span class="tkt-label">Seat</span><span class="tkt-value">${d.seatLabel}</span></div>`
    : "";

  const venueLogoBlock = d.venueLogoUrl
    ? `<ImageSlotWrapper imageId="img-bmproo" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: 'Courier New', monospace; background: #000; color: #fff; margin: 0; padding: 0; }
  .tkt-shell { width: 600px; border: 2px solid #00f5ff; border-radius: 12px; overflow: hidden; background: #0a0a14; }
  .tkt-header { background: linear-gradient(135deg,#0a0a14,#1a0030); padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #00f5ff44; }
  .tkt-event { font-size: 20px; font-weight: 700; color: #00f5ff; letter-spacing: 1px; }
  .tkt-artist { font-size: 14px; color: #a78bfa; margin-top: 4px; }
  .tkt-body { padding: 20px 24px; }
  .tkt-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .tkt-label { color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  .tkt-value { color: #f4f4f5; font-size: 13px; font-weight: 600; }
  .tkt-seat { background: rgba(0,245,255,.08); border: 1px solid #00f5ff44; border-radius: 8px; padding: 10px 14px; margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
  .tkt-qr { text-align: center; padding: 16px 0; }
  .tkt-qr-code { width: 120px; height: 120px; background: #fff; border-radius: 8px; display: inline-block; padding: 8px; color: #000; font-size: 10px; line-height: 1; word-break: break-all; }
  .tkt-receipt { border-top: 1px dashed #3f3f46; padding-top: 12px; margin-top: 12px; }
  .tkt-receipt-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .tkt-receipt-total { font-weight: 700; color: #00f5ff; border-top: 1px solid #3f3f46; padding-top: 6px; margin-top: 4px; }
  .tkt-footer { background: rgba(0,0,0,.4); padding: 12px 24px; font-size: 10px; color: #52525b; text-align: center; border-top: 1px solid #27272a; }
  .tkt-sponsor { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #a78bfa; }
  .tkt-sponsor img { height: 24px; }
  .tkt-tier { display: inline-block; background: #7c3aed; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 10px; border-radius: 99px; text-transform: uppercase; }
  .tkt-venue-logo { height: 32px; }
</style>
</head>
<body>
<div class="tkt-shell">
  <div class="tkt-header">
    ${venueLogoBlock}
    <div>
      <div class="tkt-event">${d.eventName}</div>
      <div class="tkt-artist">${d.artistName}</div>
    </div>
    <span class="tkt-tier">${d.tier}</span>
  </div>
  <div class="tkt-body">
    <div class="tkt-row">
      <div><span class="tkt-label">Venue</span><br/><span class="tkt-value">${d.venueName}</span>${d.venueAddress ? `<br/><span class="tkt-label">${d.venueAddress}</span>` : ""}</div>
      <div style="text-align:right"><span class="tkt-label">Date &amp; Time</span><br/><span class="tkt-value">${d.dateDisplay}</span><br/><span class="tkt-label">${d.timeDisplay}</span></div>
    </div>
    ${seatBlock}
    <div class="tkt-qr">
      <div class="tkt-qr-code">${d.qrPayload}</div>
      <div style="font-size:10px;color:#52525b;margin-top:6px">Scan at entry</div>
    </div>
    <div class="tkt-receipt">
      <div class="tkt-receipt-row"><span>Subtotal</span><span>${d.subtotalDisplay}</span></div>
      <div class="tkt-receipt-row"><span>Tax</span><span>${d.taxDisplay}</span></div>
      <div class="tkt-receipt-row tkt-receipt-total"><span>Total</span><span>${d.totalDisplay}</span></div>
    </div>
    ${sponsorBlock}
  </div>
  <div class="tkt-footer">${d.customFooter ?? "TMI Platform · The Musician's Index · tmi.live"}<br/>Ticket ID: ${d.ticketId}</div>
</div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildTicketPrintData(
  ticketId: string,
  overrides: Partial<TicketPrintData>,
): TicketPrintData {
  return {
    ticketId,
    eventName:      "TMI Live Event",
    artistName:     "TBA",
    venueName:      "TMI Venue",
    dateDisplay:    "TBA",
    timeDisplay:    "TBA",
    tier:           "general",
    qrPayload:      `https://tmi.live/tickets/${ticketId}`,
    subtotalDisplay: "$0.00",
    taxDisplay:     "$0.00",
    totalDisplay:   "$0.00",
    ...overrides,
  };
}

// ─── Build a PrintedTicket from TicketPrintData ────────────────────────────────

export function printTicket(data: TicketPrintData): PrintedTicket {
  return {
    ticketId:     data.ticketId,
    printedAtMs:  Date.now(),
    data,
    htmlSnapshot: renderTicketHtml(data),
  };
}

// ─── Convenience: build PrintedTicket directly from inventory entry ───────────

export function buildTicketFromInventory(
  entry: TicketInventoryEntry,
  overrides: Partial<TicketPrintData> = {},
): PrintedTicket {
  const subtotal = entry.priceCents;
  const tax      = Math.round(subtotal * 0.0825);
  const total    = subtotal + tax;

  const data = buildTicketPrintData(entry.ticketId, {
    eventName:       entry.roomTitle,
    venueName:       entry.venueName,
    venueAddress:    `${entry.city}, ${entry.state}`,
    dateDisplay:     entry.startsAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    timeDisplay:     entry.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    tier:            "general",
    qrPayload:       `https://tmi.live/tickets/${entry.ticketId}`,
    subtotalDisplay: `$${(subtotal / 100).toFixed(2)}`,
    taxDisplay:      `$${(tax / 100).toFixed(2)}`,
    totalDisplay:    `$${(total / 100).toFixed(2)}`,
    customFooter:    `${entry.venueName} · ${entry.city}, ${entry.state}`,
    ...overrides,
  });

  return printTicket(data);
}

// ─── Printable CSS payload — inject into a print window ──────────────────────

export function getTicketPrintCss(): string {
  return `
@media print {
  body { margin: 0; background: #fff; }
  .tkt-shell { width: 100%; max-width: 600px; margin: 0 auto; border: 2px solid #00f5ff; }
  .tkt-header { background: #0a0a14 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .tkt-qr-code { background: #fff !important; color: #000 !important; }
  .no-print { display: none !important; }
}
@page { size: A4; margin: 16mm; }
`.trim();
}

// ─── Build static print data from event fields (no inventory lookup) ──────────

export function buildStaticTicketPrintData(args: {
  ticketId: string;
  eventName: string;
  venueName: string;
  venueAddress?: string;
  dateDisplay: string;
  timeDisplay: string;
  priceCents: number;
  tier?: TicketTier;
  seatLabel?: string;
  sponsorName?: string;
  customFooter?: string;
}): TicketPrintData {
  const { priceCents, tier = "general", ...rest } = args;
  const tax   = Math.round(priceCents * 0.0825);
  const total = priceCents + tax;
  return buildTicketPrintData(args.ticketId, {
    ...rest,
    tier,
    artistName:      "TMI Artist",
    qrPayload:       `https://tmi.live/tickets/${args.ticketId}`,
    subtotalDisplay: `$${(priceCents / 100).toFixed(2)}`,
    taxDisplay:      `$${(tax / 100).toFixed(2)}`,
    totalDisplay:    `$${(total / 100).toFixed(2)}`,
  });
}
