import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/TMISecurityEngine";

export const dynamic = "force-dynamic";

type PrintCustomField = {
  label: string;
  value: string;
};

type TicketRenderRequest = {
  ticketId?: string;
  venueName?: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  section?: string;
  row?: string;
  seat?: string;
  holderName?: string;
  qrCodeHash?: string;
  accentColor?: string;
  borderColor?: string;
  termsText?: string;
  customFields?: PrintCustomField[];
  mode?: "inline" | "attachment";
};

function clip(input: unknown, max = 160): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeColor(input: string, fallback: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(input)) return input.toUpperCase();
  return fallback;
}

function sanitizeCustomFields(input: unknown): PrintCustomField[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 8)
    .map((item) => {
      const raw = item as Partial<PrintCustomField>;
      return {
        label: clip(raw.label, 24),
        value: clip(raw.value, 120),
      };
    })
    .filter((field) => field.label && field.value);
}

function isSameOriginRequest(req: Request): boolean {
  const secFetchSite = req.headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "same-origin") return true;

  const origin = req.headers.get("origin")?.trim();
  const host = req.headers.get("host")?.trim();
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function htmlHeaders(contentDisposition: "inline" | "attachment", filename: string): HeadersInit {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline';",
    "Content-Disposition": `${contentDisposition}; filename="${filename}"`,
  };
}

function buildTicketHtml(payload: {
  ticketId: string;
  venueName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  section: string;
  row: string;
  seat: string;
  holderName: string;
  qrCodeHash: string;
  accentColor: string;
  borderColor: string;
  termsText: string;
  customFields: PrintCustomField[];
}): string {
  const qrData = encodeURIComponent(payload.qrCodeHash);
  const customFieldsHtml = payload.customFields
    .map(
      (field) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;margin-top:6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;"><span style="color:#9ca3af;font-size:11px;letter-spacing:0.08em;">${escapeHtml(field.label)}</span><span style="color:#e5e7eb;font-size:11px;font-weight:700;text-align:right;">${escapeHtml(field.value)}</span></div>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TMI Ticket ${escapeHtml(payload.ticketId)}</title>
  </head>
  <body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#050510;color:#e5e7eb;padding:24px;">
    <main style="max-width:700px;margin:0 auto;border:3px solid ${payload.borderColor};border-radius:12px;background:linear-gradient(150deg,#06070d,#0d1020);padding:24px 24px 20px;box-shadow:0 0 24px rgba(0,0,0,0.3);">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,0.14);padding-bottom:12px;">
        <div>
          <h1 style="margin:0;font-size:14px;letter-spacing:0.22em;color:${payload.accentColor};text-transform:uppercase;">The Musician's Index</h1>
          <h2 style="margin:8px 0 0;font-size:22px;color:#f8fafc;">${escapeHtml(payload.venueName)}</h2>
        </div>
        <div style="padding:6px 10px;border:1px solid ${payload.accentColor};border-radius:6px;color:${payload.accentColor};font-weight:800;font-size:10px;letter-spacing:0.16em;">ADMIT ONE</div>
      </header>

      <section style="margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:16px;">
        <div>
          <p style="margin:0;color:#9ca3af;font-size:11px;letter-spacing:0.16em;">EVENT</p>
          <p style="margin:4px 0 10px;font-size:20px;font-weight:800;color:#ffffff;">${escapeHtml(payload.eventTitle)}</p>

          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">DATE</div><div style="font-size:12px;font-weight:700;">${escapeHtml(payload.eventDate)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">TIME</div><div style="font-size:12px;font-weight:700;">${escapeHtml(payload.eventTime)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">SECTION</div><div style="font-size:12px;font-weight:700;">${escapeHtml(payload.section)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">ROW / SEAT</div><div style="font-size:12px;font-weight:700;">${escapeHtml(payload.row)} / ${escapeHtml(payload.seat)}</div></div>
          </div>

          <div style="margin-top:10px;font-size:11px;color:#d1d5db;"><strong style="color:${payload.accentColor};">Holder:</strong> ${escapeHtml(payload.holderName)}</div>
          <div style="margin-top:6px;font-size:11px;color:#9ca3af;"><strong style="color:${payload.accentColor};">Ticket ID:</strong> ${escapeHtml(payload.ticketId)}</div>
          ${customFieldsHtml}
        </div>

        <aside style="width:172px;">
          <div style="width:162px;height:162px;border-radius:8px;background:#fff;padding:8px;margin:0 auto;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}" alt="Ticket QR" width="150" height="150" style="display:block;width:150px;height:150px;" />
          </div>
        </aside>
      </section>

      <footer style="margin-top:14px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);font-size:10px;color:#9ca3af;letter-spacing:0.08em;">
        ${escapeHtml(payload.termsText)}
      </footer>
    </main>
  </body>
</html>`;
}

export async function GET() {
  const internalPrintKey = process.env.INTERNAL_TICKET_PRINT_API_KEY?.trim();
  return NextResponse.json({
    ok: true,
    route: "tickets-render-v2",
    supports: ["html", "venue-custom-fields", "rate-limit"],
    auth: internalPrintKey ? "optional-internal-key-or-same-origin" : "disabled",
  });
}

export async function POST(req: NextRequest) {
  try {
    const internalPrintKey = process.env.INTERNAL_TICKET_PRINT_API_KEY?.trim();
    const providedKey = req.headers.get("x-tmi-print-key")?.trim();
    if (internalPrintKey && providedKey !== internalPrintKey && !isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Unauthorized print request" }, { status: 401 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = checkRateLimit(`tickets:render:${clientIp}`, 80, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please retry shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        },
      );
    }

    const body = (await req.json()) as TicketRenderRequest;

    const ticketId = clip(body.ticketId, 80);
    const venueName = clip(body.venueName, 90);
    const eventTitle = clip(body.eventTitle, 120);
    if (!ticketId || !venueName || !eventTitle) {
      return NextResponse.json(
        { error: "Missing required fields: ticketId, venueName, eventTitle" },
        { status: 400 },
      );
    }

    const eventDate = clip(body.eventDate, 40) || "TBA";
    const eventTime = clip(body.eventTime, 40) || "TBA";
    const section = clip(body.section, 20) || "GENERAL";
    const row = clip(body.row, 12) || "GA";
    const seat = clip(body.seat, 12) || "OPEN";
    const holderName = clip(body.holderName, 80) || "Guest";
    const qrCodeHash = clip(body.qrCodeHash, 200) || ticketId;
    const accentColor = sanitizeColor(clip(body.accentColor, 7), "#00FFFF");
    const borderColor = sanitizeColor(clip(body.borderColor, 7), "#FFD700");
    const termsText = clip(body.termsText, 180) || "Admit one. Non-refundable. Subject to venue policy.";
    const customFields = sanitizeCustomFields(body.customFields);
    const mode = body.mode === "attachment" ? "attachment" : "inline";

    const html = buildTicketHtml({
      ticketId,
      venueName,
      eventTitle,
      eventDate,
      eventTime,
      section,
      row,
      seat,
      holderName,
      qrCodeHash,
      accentColor,
      borderColor,
      termsText,
      customFields,
    });

    const safeName = ticketId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 42) || "ticket";
    return new NextResponse(html, {
      headers: htmlHeaders(mode, `tmi-ticket-${safeName}.html`),
    });
  } catch {
    return NextResponse.json({ error: "Unable to generate print ticket" }, { status: 500 });
  }
}
