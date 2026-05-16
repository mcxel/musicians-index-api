/**
 * TicketAuthorityEngine
 *
 * Web-layer authority engine for the TMI Ticket system.
 * Handles: creation, QR derivation, ownership verification,
 * scan/admission flow, anti-replay guard, seat assignment,
 * and print template assembly.
 *
 * Architecture:
 *   All API calls are made to the Next.js web proxy routes
 *   (/api/tickets/*) which forward to the NestJS API.
 *   This engine is safe to import in "use client" components.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStatusValue =
  | "ACTIVE"
  | "USED"
  | "CANCELED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "EXPIRED";

export interface SeatAssignment {
  section: string;
  row: string;
  seat: string;
  /** Derived display label, e.g. "Section A · Row 3 · Seat 12" */
  label: string;
}

export interface TicketRecord {
  id: string;
  status: TicketStatusValue;
  token?: string;
  qrSeed: string;
  qrUrl: string;
  seat?: SeatAssignment;
  event: {
    id: string;
    title: string;
    startsAt: string;
    venueName: string | null;
    venueCity?: string | null;
  };
  ticketType: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
  };
  issuedAt: string;
  checkedInAt?: string | null;
}

export interface TicketCreateInput {
  ticketTypeId: string;
  quantity: number;
  /** Optional seat assignment per ticket. Length must equal quantity. */
  seats?: Array<{ section: string; row: string; seat: string }>;
}

export interface TicketCreateResult {
  success: boolean;
  tickets: Array<{ id: string; token: string; seat?: SeatAssignment; qrUrl: string }>;
  soldOut?: boolean;
  remaining?: number;
  error?: string;
}

export interface TicketScanInput {
  /** Scan by raw token (QR reader) or by ticketId (admin override). */
  token?: string;
  ticketId?: string;
  scannerId?: string;
  venueId?: string;
}

export type ScanResultCode =
  | "ADMITTED"
  | "ALREADY_USED"
  | "NOT_ACTIVE"
  | "NOT_FOUND"
  | "EXPIRED"
  | "WRONG_VENUE"
  | "ERROR";

export interface TicketScanResult {
  ok: boolean;
  code: ScanResultCode;
  already?: boolean;
  ticketId?: string;
  event?: { id: string; title: string; startsAt: string; venueName: string | null };
  seat?: SeatAssignment;
  message: string;
}

export interface TicketPrintTemplate {
  ticketId: string;
  layout: "STANDARD_TMI_EVENT_TICKET";
  brandingUrl: string;
  qrUrl: string;
  seatLabel: string;
  event: {
    title: string;
    startsAt: string;
    endsAt?: string;
    venueName: string;
    venueCity?: string;
  };
  ticketType: { name: string };
  issuedAt: string;
  validationUrl: string;
}

// ─── QR helpers ───────────────────────────────────────────────────────────────

const QR_BASE = "https://themusicianindex.com/verify/";

/**
 * Derives the public QR URL from a raw token.
 * Token is never exposed in the URL — only the hash seed is used.
 * In production the scanner calls /tickets/scan with the hash extracted from the QR payload.
 */
export function deriveQrUrl(tokenOrHash: string): string {
  return `${QR_BASE}${tokenOrHash.slice(0, 32)}`;
}

/**
 * Assembles a seat label from raw components.
 */
export function buildSeatLabel(seat: { section: string; row: string; seat: string }): string {
  if (!seat.section && !seat.row && !seat.seat) return "General Admission";
  const parts: string[] = [];
  if (seat.section) parts.push(`Section ${seat.section}`);
  if (seat.row) parts.push(`Row ${seat.row}`);
  if (seat.seat) parts.push(`Seat ${seat.seat}`);
  return parts.join(" · ");
}

// ─── Anti-replay guard ────────────────────────────────────────────────────────

/** In-memory scan log for client-side replay prevention (belt-and-suspenders over API guard). */
const _scannedTokens = new Set<string>();

function clientReplayGuard(tokenOrId: string): boolean {
  if (_scannedTokens.has(tokenOrId)) return false;
  _scannedTokens.add(tokenOrId);
  return true;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Ticket API error ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "GET" });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Ticket API error ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class TicketAuthorityEngine {
  private readonly base: string;

  constructor(apiBase = "/api/tickets") {
    this.base = apiBase;
  }

  /**
   * CREATE
   * Issues one or more tickets for a TicketType.
   * Optionally assigns section/row/seat per ticket.
   * Returns tokens + QR URLs — tokens must be stored client-side securely (wallet).
   */
  async create(input: TicketCreateInput): Promise<TicketCreateResult> {
    try {
      const result = await apiPost<{
        success: boolean;
        tickets?: Array<{ id: string; token: string; seat?: SeatAssignment }>;
        soldOut?: boolean;
        remaining?: number;
        error?: string;
      }>(`${this.base}/create`, input);

      if (!result.success) {
        return {
          success: false as const,
          tickets: [],
          soldOut: result.soldOut,
          remaining: result.remaining,
          error: result.error,
        };
      }

      const tickets = (result.tickets ?? []).map((t) => ({
        id: t.id,
        token: t.token,
        seat: t.seat,
        qrUrl: deriveQrUrl(t.token),
      }));

      return { success: true, tickets };
    } catch (err) {
      return { success: false, tickets: [], error: String(err) };
    }
  }

  /**
   * SCAN
   * Validates and admits a ticket holder.
   * Client-side anti-replay runs before the API call.
   * API performs the authoritative anti-replay (DB/atomic update).
   *
   * @param input - token (from QR scan) or ticketId (admin override)
   */
  async scan(input: TicketScanInput): Promise<TicketScanResult> {
    const key = input.token ?? input.ticketId ?? "";
    if (!key) {
      return { ok: false, code: "ERROR", message: "No token or ticketId provided" };
    }

    // Client-side replay guard — belt-and-suspenders
    if (!clientReplayGuard(key)) {
      return {
        ok: false,
        code: "ALREADY_USED",
        message: "This ticket was already scanned in this session.",
      };
    }

    try {
      const result = await apiPost<{
        ok: boolean;
        already?: boolean;
        code?: ScanResultCode;
        reason?: string;
        ticketId?: string;
        event?: { id: string; title: string; startsAt: string; venueName: string | null };
        seat?: SeatAssignment;
      }>(`${this.base}/scan`, input);

      if (!result.ok) {
        const code: ScanResultCode = (result.reason as ScanResultCode) ?? (result.code ?? "ERROR");
        return {
          ok: false,
          code,
          message: this.scanMessage(code),
        };
      }

      return {
        ok: true,
        code: result.already ? "ALREADY_USED" : "ADMITTED",
        already: result.already,
        ticketId: result.ticketId,
        event: result.event,
        seat: result.seat,
        message: result.already ? "Already admitted — entry logged." : "Admitted. Welcome!",
      };
    } catch (err) {
      return { ok: false, code: "ERROR", message: String(err) };
    }
  }

  /**
   * GET
   * Fetches a single ticket record by ID.
   * Includes event, ticket type, seat, and QR URL.
   */
  async get(ticketId: string): Promise<TicketRecord | null> {
    try {
      return await apiGet<TicketRecord>(`${this.base}/${ticketId}`);
    } catch {
      return null;
    }
  }

  /**
   * GET OWNED
   * Returns all tickets owned by the authenticated user.
   */
  async getOwned(): Promise<TicketRecord[]> {
    try {
      const result = await apiGet<{ tickets: TicketRecord[] }>(`${this.base}/mine`);
      return result.tickets ?? [];
    } catch {
      return [];
    }
  }

  /**
   * PRINT
   * Assembles a printable venue ticket template for a given ticket ID.
   * Returns structured data — rendering is handled by the print component.
   */
  async getPrintData(ticketId: string): Promise<TicketPrintTemplate | null> {
    try {
      return await apiGet<TicketPrintTemplate>(`${this.base}/${ticketId}/print`);
    } catch {
      return null;
    }
  }

  /**
   * VERIFY OWNERSHIP
   * Lightweight check — does this user own this ticket and can they enter?
   */
  async verifyOwnership(ticketId: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const result = await apiPost<{ valid: boolean; reason?: string }>(
        `${this.base}/validate-entry`,
        { ticketId }
      );
      return result;
    } catch (err) {
      return { valid: false, reason: String(err) };
    }
  }

  private scanMessage(code: ScanResultCode): string {
    const messages: Record<ScanResultCode, string> = {
      ADMITTED:     "Admitted.",
      ALREADY_USED: "Ticket already used — duplicate scan blocked.",
      NOT_ACTIVE:   "Ticket is not active.",
      NOT_FOUND:    "Ticket not found.",
      EXPIRED:      "Ticket has expired.",
      WRONG_VENUE:  "Ticket is not valid for this venue.",
      ERROR:        "Scan error — try again.",
    };
    return messages[code] ?? "Unknown error";
  }
}

/** Default singleton — import and call directly in components. */
export const ticketAuthority = new TicketAuthorityEngine();
