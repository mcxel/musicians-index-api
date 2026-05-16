import { getTicket, burnTicket, verifyOwnership } from "@/lib/ticketing/TicketOwnershipEngine";

export type CheckInStatus = "not-checked-in" | "checked-in" | "already-used" | "invalid" | "denied";

export interface CheckInRecord {
  checkInId: string;
  ticketId: string;
  userId: string;
  eventId: string;
  venueId?: string;
  status: CheckInStatus;
  method: "qr" | "manual" | "nfc" | "link";
  checkedInAt: string;
  gateId?: string;
}

const checkInLog = new Map<string, CheckInRecord>();
const usedTickets = new Set<string>();

function gen(): string {
  return `chkin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function checkIn(
  ticketId: string,
  userId: string,
  method: CheckInRecord["method"] = "qr",
  opts: { gateId?: string } = {},
): CheckInRecord {
  const now = new Date().toISOString();
  let status: CheckInStatus = "not-checked-in";

  if (usedTickets.has(ticketId)) {
    status = "already-used";
  } else {
    const ticket = getTicket(ticketId);
    if (!ticket) {
      status = "invalid";
    } else if (!verifyOwnership(ticketId, userId)) {
      status = "denied";
    } else {
      status = "checked-in";
      usedTickets.add(ticketId);
      burnTicket(ticketId);
    }
  }

  const ticket = getTicket(ticketId);
  const record: CheckInRecord = {
    checkInId: gen(),
    ticketId,
    userId,
    eventId: ticket?.eventId ?? "unknown",
    venueId: ticket?.venueId,
    status,
    method,
    checkedInAt: now,
    gateId: opts.gateId,
  };

  checkInLog.set(record.checkInId, record);
  return record;
}

export function isCheckedIn(ticketId: string): boolean {
  return usedTickets.has(ticketId);
}

export function getCheckInRecord(checkInId: string): CheckInRecord | null {
  return checkInLog.get(checkInId) ?? null;
}

export function getEventCheckIns(eventId: string): CheckInRecord[] {
  return [...checkInLog.values()].filter((r) => r.eventId === eventId && r.status === "checked-in");
}

export function getEventCheckInCount(eventId: string): number {
  return getEventCheckIns(eventId).length;
}

export function denyEntry(ticketId: string, userId: string, reason: string): CheckInRecord {
  const ticket = getTicket(ticketId);
  const record: CheckInRecord = {
    checkInId: gen(),
    ticketId,
    userId,
    eventId: ticket?.eventId ?? "unknown",
    venueId: ticket?.venueId,
    status: "denied",
    method: "manual",
    checkedInAt: new Date().toISOString(),
    gateId: reason,
  };
  checkInLog.set(record.checkInId, record);
  return record;
}
