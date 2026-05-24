export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface PrintTicketRequest {
  tickets: Array<{
    id: string;
    tier: string;
    ownerName?: string;
    seatLabel?: string;
    price?: number;
  }>;
  event: {
    name: string;
    venue: string;
    date: string;
    time: string;
  };
  venueBranding?: {
    venueName?: string;
    logoText?: string;
    primaryColor?: string;
    secondaryColor?: string;
    footerNote?: string;
  };
}

function generateQRHash(ticketId: string, eventName: string): string {
  const salt = process.env.TICKET_SECRET_SALT ?? 'tmi-default-salt';
  return crypto.createHash('sha256').update(`${ticketId}:${eventName}:${salt}`).digest('hex').slice(0, 16).toUpperCase();
}

function qrSvgPath(data: string): string {
  const size = 8;
  const cells = data.length;
  const paths: string[] = [];
  for (let i = 0; i < cells; i++) {
    if (data.charCodeAt(i) % 2 === 0) {
      const x = (i % size) * 4;
      const y = Math.floor(i / size) * 4;
      paths.push(`M${x},${y}h4v4h-4z`);
    }
  }
  return paths.join(' ');
}

function renderTicketHTML(
  ticket: PrintTicketRequest['tickets'][0],
  event: PrintTicketRequest['event'],
  branding: PrintTicketRequest['venueBranding'] = {},
  index: number,
): string {
  const qrHash = generateQRHash(ticket.id, event.name);
  const verifyUrl = `https://themusiciansindex.com/verify/${qrHash}`;
  const color = branding.primaryColor ?? '#FFD700';
  const secondary = branding.secondaryColor ?? '#050510';
  const tierColors: Record<string, string> = {
    vip: '#FFD700', premium: '#AA2DFF', general: '#00FFFF',
    'collector vip': '#FF2DAA', default: '#00FF88',
  };
  const tierColor = tierColors[ticket.tier.toLowerCase()] ?? tierColors.default;

  return `
  <div class="ticket" style="page-break-after: ${index % 2 === 1 ? 'always' : 'auto'}">
    <!-- Left accent bar -->
    <div class="ticket-bar" style="background: ${tierColor}"></div>

    <!-- Main content -->
    <div class="ticket-body">
      <!-- Header -->
      <div class="ticket-header">
        <div class="venue-logo" style="color: ${color}">${branding.logoText ?? branding.venueName ?? 'TMI'}</div>
        <div class="tier-badge" style="background: ${tierColor}20; color: ${tierColor}; border: 1px solid ${tierColor}60">
          ${ticket.tier.toUpperCase()}
        </div>
      </div>

      <!-- Event info -->
      <div class="event-name">${event.name}</div>
      <div class="event-meta">
        <span>📍 ${event.venue}</span>
        <span>📅 ${event.date}</span>
        <span>⏰ ${event.time}</span>
      </div>

      ${ticket.ownerName ? `<div class="owner-name">Issued to: <strong>${ticket.ownerName}</strong></div>` : ''}
      ${ticket.seatLabel ? `<div class="seat-label" style="color: ${color}">Seat: ${ticket.seatLabel}</div>` : ''}
      ${ticket.price !== undefined ? `<div class="price-label">$${ticket.price.toFixed(2)}</div>` : ''}
    </div>

    <!-- QR code section -->
    <div class="ticket-qr">
      <div class="qr-box">
        <svg width="64" height="64" viewBox="0 0 32 32" style="display:block">
          <!-- QR grid simulation -->
          <rect width="32" height="32" fill="white"/>
          <path d="${qrSvgPath(qrHash)}" fill="${secondary}"/>
          <!-- Corner markers -->
          <rect x="0" y="0" width="9" height="9" rx="1" fill="${secondary}"/>
          <rect x="1" y="1" width="7" height="7" rx="1" fill="white"/>
          <rect x="2" y="2" width="5" height="5" rx="0.5" fill="${secondary}"/>
          <rect x="23" y="0" width="9" height="9" rx="1" fill="${secondary}"/>
          <rect x="24" y="1" width="7" height="7" rx="1" fill="white"/>
          <rect x="25" y="2" width="5" height="5" rx="0.5" fill="${secondary}"/>
          <rect x="0" y="23" width="9" height="9" rx="1" fill="${secondary}"/>
          <rect x="1" y="24" width="7" height="7" rx="1" fill="white"/>
          <rect x="2" y="25" width="5" height="5" rx="0.5" fill="${secondary}"/>
        </svg>
        <div class="qr-code-text">${qrHash}</div>
        <div class="verify-url">Verify: tmindex.com/v/${qrHash.slice(0, 8)}</div>
      </div>
      <div class="ticket-id">ID: ${ticket.id.slice(-8).toUpperCase()}</div>
    </div>

    <!-- Footer -->
    <div class="ticket-footer">
      <span>${branding.footerNote ?? 'This ticket is your proof of entry. Non-transferable.'}</span>
    </div>
  </div>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PrintTicketRequest;
    const { tickets, event, venueBranding } = body;

    if (!tickets?.length || !event?.name) {
      return NextResponse.json({ error: 'tickets and event required' }, { status: 400 });
    }

    const color = venueBranding?.primaryColor ?? '#FFD700';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${event.name} — Tickets</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; font-family: 'Arial', sans-serif; padding: 20px; }
  @media print {
    body { padding: 0; }
    @page { size: 8.5in 11in; margin: 0.5in; }
  }
  .ticket {
    display: flex;
    width: 100%;
    max-width: 680px;
    height: 190px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin: 0 auto 20px;
    background: #050510;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    position: relative;
  }
  .ticket-bar { width: 8px; flex-shrink: 0; }
  .ticket-body { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; }
  .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .venue-logo { font-size: 13px; font-weight: 900; letter-spacing: 0.15em; }
  .tier-badge { font-size: 9px; font-weight: 800; padding: 3px 10px; border-radius: 4px; letter-spacing: 0.1em; }
  .event-name { font-size: 18px; font-weight: 900; color: #fff; margin: 8px 0 4px; line-height: 1.2; }
  .event-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 10px; color: rgba(255,255,255,0.55); }
  .owner-name { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .seat-label { font-size: 12px; font-weight: 800; margin-top: 2px; }
  .price-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .ticket-qr { width: 120px; flex-shrink: 0; border-left: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; gap: 4px; }
  .qr-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .qr-code-text { font-size: 7px; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; }
  .verify-url { font-size: 6px; color: rgba(255,255,255,0.3); }
  .ticket-id { font-size: 8px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; margin-top: 4px; }
  .ticket-footer { position: absolute; bottom: 0; left: 8px; right: 0; padding: 5px 12px; font-size: 8px; color: rgba(255,255,255,0.25); border-top: 1px solid rgba(255,255,255,0.06); }
  .print-controls { text-align: center; margin-bottom: 24px; }
  .print-btn { padding: 10px 24px; background: ${color}; color: #050510; font-weight: 800; font-size: 13px; border: none; border-radius: 8px; cursor: pointer; letter-spacing: 0.08em; }
  @media print { .print-controls { display: none; } }
  .page-title { text-align: center; font-size: 11px; font-weight: 800; letter-spacing: 0.3em; color: ${color}; margin-bottom: 20px; }
</style>
</head>
<body>
<div class="print-controls">
  <button class="print-btn" onclick="window.print()">🖨 PRINT TICKETS</button>
</div>
<div class="page-title">${event.name.toUpperCase()} — ${event.date} · ${event.time}</div>
${tickets.map((t, i) => renderTicketHTML(t, event, venueBranding, i)).join('\n')}
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[tickets/print]', err);
    return NextResponse.json({ error: 'Print failed' }, { status: 500 });
  }
}
