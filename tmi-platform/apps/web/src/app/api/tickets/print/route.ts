import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

// --- Security & Sanitization Helpers ---

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (['http:', 'https:', 'data:'].includes(u.protocol)) {
      return u.href;
    }
  } catch {
    // Invalid URL, return empty
  }
  return '';
}

type CustomField = { label: string; value: string };

function sanitizeCustomFields(fields: unknown): CustomField[] {
  if (!Array.isArray(fields)) return [];
  return fields
    .map((f: unknown) => {
      if (typeof f === 'object' && f !== null && 'label' in f && 'value' in f) {
        return {
          label: escapeHtml(String((f as CustomField).label)),
          value: escapeHtml(String((f as CustomField).value)),
        };
      }
      return null;
    })
    .filter((f): f is CustomField => f !== null)
    .slice(0, 5); // Cap custom fields to prevent abuse
}

// --- V2 Ticket HTML Builder ---

interface TicketHtmlParams {
  ticketId: string;
  venueName: string;
  eventTitle: string;
  section?: string;
  row?: string;
  seat?: string;
  holderName?: string;
  qrCodeHash: string;
  accentColor?: string;
  borderColor?: string;
  termsText?: string;
  customFields?: CustomField[];
}

function buildTicketHtml(params: TicketHtmlParams): string {
  const {
    ticketId,
    venueName,
    eventTitle,
    section = 'GA',
    row = 'N/A',
    seat = 'N/A',
    holderName = 'Guest',
    qrCodeHash,
    accentColor = '#FFD700',
    borderColor = '#e2e8f0',
    termsText = 'Admit one. Venue policies apply. Non-refundable.',
    customFields = [],
  } = params;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeHash)}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TMI Ticket: ${escapeHtml(ticketId)}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f0f2f5; display: grid; place-items: center; min-height: 100vh; margin: 0; }
        .ticket {
          width: 100%;
          max-width: 700px;
          background: #0a0a1a;
          color: ${escapeHtml(borderColor)};
          border: 4px solid ${escapeHtml(accentColor)};
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          margin: 20px;
        }
        .header { padding: 20px; text-align: center; border-bottom: 2px dashed ${escapeHtml(accentColor)}55; }
        .header h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 0.2em; color: ${escapeHtml(accentColor)}; margin: 0; }
        .header h2 { font-size: 16px; color: #fff; margin: 5px 0 0; }
        .content { display: flex; padding: 24px; gap: 24px; }
        .details { flex: 1; }
        .details h3 { font-size: 28px; font-weight: 900; color: #fff; margin: 0 0 12px; }
        .seat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .seat-item { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; text-align: center; }
        .seat-item .label { font-size: 10px; text-transform: uppercase; color: #8899aa; }
        .seat-item .value { font-size: 20px; font-weight: bold; color: ${escapeHtml(accentColor)}; }
        .holder { font-size: 14px; }
        .qr-section { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .qr-code { background: #fff; padding: 10px; border-radius: 8px; }
        .footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #667; text-align: center; }
        .custom-fields { margin-top: 16px; font-size: 11px; color: #99a; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h1>THE MUSICIAN'S INDEX</h1>
          <h2>${escapeHtml(venueName)}</h2>
        </div>
        <div class="content">
          <div class="details">
            <h3>${escapeHtml(eventTitle)}</h3>
            <div class="seat-grid">
              <div class="seat-item"><div class="label">Section</div><div class="value">${escapeHtml(section)}</div></div>
              <div class="seat-item"><div class="label">Row</div><div class="value">${escapeHtml(row)}</div></div>
              <div class="seat-item"><div class="label">Seat</div><div class="value">${escapeHtml(seat)}</div></div>
            </div>
            <div class="holder">HOLDER: <strong>${escapeHtml(holderName)}</strong></div>
            <div class="custom-fields">
              ${customFields.map(f => `<div><strong>${f.label}:</strong> ${f.value}</div>`).join('')}
            </div>
          </div>
          <div class="qr-section">
            <div class="qr-code"><img src="${sanitizeUrl(qrUrl)}" alt="Ticket QR Code" width="150" height="150"></div>
            <div style="font-family: monospace; font-size: 11px; color: #667;">${escapeHtml(ticketId)}</div>
          </div>
        </div>
        <div class="footer">${escapeHtml(termsText)}</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * GET /api/tickets/print
 * Health check endpoint for the ticket printing service.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    engine: 'TMI Hardened Ticket Print v2',
    timestamp: new Date().toISOString(),
    capabilities: ['html_generation', 'pdf_generation_pending', 'rate_limiting', 'input_sanitization'],
  });
}

/**
 * POST /api/tickets/print
 * V2 Hardened endpoint for generating printable ticket HTML.
 * Replaces the previous insecure implementation.
 */
export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';

  // Aggressive rate limiting to prevent abuse
  const { allowed, remaining } = checkRateLimit(`ticket:print:${clientIp}`, 20, 60_000);
  const headers = { 'X-RateLimit-Remaining': String(remaining) };

  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again shortly.' }, { status: 429, headers });
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400, headers });
    }

    const {
      ticketId,
      venueName,
      eventTitle,
      qrCodeHash,
      mode = 'inline', // 'inline' or 'pdf'
      ...rest
    } = body;

    if (!ticketId || !venueName || !eventTitle || !qrCodeHash) {
      return NextResponse.json({ error: 'Missing required ticket parameters: ticketId, venueName, eventTitle, qrCodeHash are required.' }, { status: 400, headers });
    }

    const ticketParams: TicketHtmlParams = {
      ticketId: String(ticketId),
      venueName: String(venueName),
      eventTitle: String(eventTitle),
      qrCodeHash: String(qrCodeHash),
      section: rest.section ? String(rest.section) : undefined,
      row: rest.row ? String(rest.row) : undefined,
      seat: rest.seat ? String(rest.seat) : undefined,
      holderName: rest.holderName ? String(rest.holderName) : undefined,
      accentColor: rest.accentColor ? String(rest.accentColor) : undefined,
      borderColor: rest.borderColor ? String(rest.borderColor) : undefined,
      termsText: rest.termsText ? String(rest.termsText) : undefined,
      customFields: sanitizeCustomFields(rest.customFields),
    };

    const html = buildTicketHtml(ticketParams);

    if (mode === 'pdf') {
      // PDF generation is a future enhancement. For now, we return an error if requested.
      // To implement: use puppeteer-core and @sparticuz/chromium in a serverless function.
      return NextResponse.json({ error: 'PDF generation is not yet available in this build.' }, { status: 501, headers });
    }

    // Return the generated HTML string for inline display or printing from a popup.
    return new NextResponse(html, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' https://api.qrserver.com; style-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[TMI_TICKET_PRINT_ERROR]', error);
    return NextResponse.json({ error: 'An internal error occurred while generating the ticket.' }, { status: 500, headers });
  }
}