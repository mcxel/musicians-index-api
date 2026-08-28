/**
 * AtomicCheckIn — single-flight verify + redeem for door / kiosk / scanner.
 * Rejects already-used tickets; stores timestamp + operator; no double redemption.
 * Redeem is DB-atomic (DigitalIssuedTicket) so duplicate scans fail across instances.
 */

import {
  getTicketById,
  saveTicket,
  appendScanLedger,
  type TicketRecord,
} from "@/lib/tickets/ticketCore";
import { getDigitalOfferByEvent } from "@/lib/tickets/DigitalTicketOfferEngine";
import {
  dbAtomicRedeemIssuedTicket,
  dbGetIssuedTicket,
  dbUpsertIssuedTicket,
} from "@/lib/tickets/DigitalTicketPersistence";

export type AtomicCheckInMethod = "qr" | "barcode" | "manual" | "kiosk" | "camera";

export type AtomicCheckInDecision =
  | "admitted"
  | "already_used"
  | "not_found"
  | "wrong_event"
  | "not_active"
  | "error";

export type AtomicCheckInResult = {
  ok: boolean;
  decision: AtomicCheckInDecision;
  ticketId: string;
  eventId?: string;
  checkedInAt?: string;
  operatorId?: string;
  method: AtomicCheckInMethod;
  message: string;
  ticket?: TicketRecord;
};

/** In-process lock only — DB redeem is the cross-instance authority. */
const inFlight = new Set<string>();
const checkInLedger: AtomicCheckInResult[] = [];

function normalizeToken(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\/ticket\/verify\/([^/?#]+)/i);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return trimmed.replace(/-(QR|BAR)$/i, "");
}

async function resolveTicket(ticketId: string): Promise<TicketRecord | null> {
  const mem = getTicketById(ticketId);
  if (mem) return mem;
  const db = await dbGetIssuedTicket(ticketId);
  if (db) {
    saveTicket(db);
    return db;
  }
  return null;
}

export async function atomicCheckIn(input: {
  tokenOrTicketId: string;
  eventId?: string;
  operatorId?: string;
  method?: AtomicCheckInMethod;
  gate?: string;
}): Promise<AtomicCheckInResult> {
  const method = input.method ?? "manual";
  const ticketId = normalizeToken(input.tokenOrTicketId);
  const now = new Date().toISOString();
  const operatorId = input.operatorId ?? "kiosk";

  if (!ticketId) {
    return {
      ok: false,
      decision: "error",
      ticketId: "",
      method,
      message: "token_required",
    };
  }

  if (inFlight.has(ticketId)) {
    return {
      ok: false,
      decision: "already_used",
      ticketId,
      method,
      operatorId,
      message: "check_in_in_progress",
    };
  }

  inFlight.add(ticketId);
  try {
    let ticket = await resolveTicket(ticketId);
    if (!ticket) {
      const denied: AtomicCheckInResult = {
        ok: false,
        decision: "not_found",
        ticketId,
        method,
        operatorId,
        message: "ticket_not_found",
      };
      appendScanLedger({
        ticketId,
        scannedAt: now,
        gate: input.gate ?? "door",
        status: "denied",
        reason: "not_found",
      });
      checkInLedger.unshift(denied);
      return denied;
    }

    if (input.eventId && ticket.template.eventSlug !== input.eventId) {
      const linked = (await getDigitalOfferByEvent(input.eventId)).some(
        (o) => o.eventId === ticket!.template.eventSlug || o.id === ticket!.template.eventSlug,
      );
      if (!linked) {
        const wrong: AtomicCheckInResult = {
          ok: false,
          decision: "wrong_event",
          ticketId,
          eventId: ticket.template.eventSlug,
          method,
          operatorId,
          message: "ticket_wrong_event",
          ticket,
        };
        appendScanLedger({
          ticketId,
          scannedAt: now,
          gate: input.gate ?? "door",
          status: "denied",
          reason: "wrong_event",
        });
        checkInLedger.unshift(wrong);
        return wrong;
      }
    }

    // Ensure row exists before atomic redeem (legacy in-memory-only tickets).
    if (!(await dbGetIssuedTicket(ticketId))) {
      await dbUpsertIssuedTicket(ticket);
    }

    if (ticket.redeemed) {
      const used: AtomicCheckInResult = {
        ok: false,
        decision: "already_used",
        ticketId,
        eventId: ticket.template.eventSlug,
        method,
        operatorId,
        message: "already_redeemed",
        ticket,
      };
      appendScanLedger({
        ticketId,
        scannedAt: now,
        gate: input.gate ?? "door",
        status: "denied",
        reason: "already_redeemed",
      });
      checkInLedger.unshift(used);
      return used;
    }

    const redeem = await dbAtomicRedeemIssuedTicket({
      ticketId,
      operatorId,
      checkedInAt: now,
    });

    if (!redeem.ok) {
      const used: AtomicCheckInResult = {
        ok: false,
        decision: redeem.reason === "not_found" ? "not_found" : "already_used",
        ticketId,
        eventId: redeem.ticket?.template.eventSlug ?? ticket.template.eventSlug,
        method,
        operatorId,
        message: redeem.reason === "not_found" ? "ticket_not_found" : "already_redeemed",
        ticket: redeem.ticket ?? ticket,
      };
      appendScanLedger({
        ticketId,
        scannedAt: now,
        gate: input.gate ?? "door",
        status: "denied",
        reason: redeem.reason,
      });
      checkInLedger.unshift(used);
      return used;
    }

    saveTicket(redeem.ticket);

    const admitted: AtomicCheckInResult = {
      ok: true,
      decision: "admitted",
      ticketId,
      eventId: redeem.ticket.template.eventSlug,
      checkedInAt: now,
      operatorId,
      method,
      message: "admitted",
      ticket: redeem.ticket,
    };

    appendScanLedger({
      ticketId,
      scannedAt: now,
      gate: input.gate ?? "door",
      status: "allowed",
      reason: `operator:${operatorId};method:${method}`,
    });
    checkInLedger.unshift(admitted);
    return admitted;
  } finally {
    inFlight.delete(ticketId);
  }
}

export function listAtomicCheckIns(eventId?: string): AtomicCheckInResult[] {
  if (!eventId) return [...checkInLedger];
  return checkInLedger.filter((r) => r.eventId === eventId);
}

export async function verifyTicketToken(tokenOrTicketId: string): Promise<{
  ok: boolean;
  valid: boolean;
  ticketId: string;
  reason: string;
  ticket?: TicketRecord;
}> {
  const ticketId = normalizeToken(tokenOrTicketId);
  const ticket = await resolveTicket(ticketId);
  if (!ticket) {
    return { ok: true, valid: false, ticketId, reason: "NOT_FOUND" };
  }
  if (ticket.redeemed) {
    return { ok: true, valid: false, ticketId, reason: "ALREADY_USED", ticket };
  }
  return { ok: true, valid: true, ticketId, reason: "ACTIVE", ticket };
}
