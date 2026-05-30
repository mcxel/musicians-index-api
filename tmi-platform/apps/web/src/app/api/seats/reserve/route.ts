import { NextResponse } from "next/server";
import { createTicket } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

export interface SeatReservation {
  seatId: string;
  fanId: string;
  displayName: string;
  tier: string;
  reservedAt: number;
  ticketId: string;
}

/** Server-side seat reservation store: concertId → seatId → reservation */
const reservationStore = new Map<string, Map<string, SeatReservation>>();

export function getConcertSeats(concertId: string): Map<string, SeatReservation> {
  if (!reservationStore.has(concertId)) {
    reservationStore.set(concertId, new Map());
  }
  return reservationStore.get(concertId)!;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const concertId: string = typeof body.concertId === "string" ? body.concertId : "world-concert";
  const seatId: string    = typeof body.seatId    === "string" ? body.seatId    : "";
  const fanId: string     = typeof body.fanId     === "string" ? body.fanId     : "guest";
  const displayName: string = typeof body.displayName === "string" ? body.displayName : "Fan";
  const tier: TicketTier  = typeof body.tier === "string" ? (body.tier as TicketTier) : "STANDARD";
  const faceValue: number = typeof body.faceValue === "number" ? body.faceValue : 0;

  if (!seatId) {
    return NextResponse.json({ ok: false, error: "seatId required" }, { status: 400 });
  }

  const seats = getConcertSeats(concertId);

  // Check if seat is already taken by someone else
  const existing = seats.get(seatId);
  if (existing && existing.fanId !== fanId) {
    return NextResponse.json({ ok: false, error: "seat_taken" }, { status: 409 });
  }

  // Release any prior seat held by this fan
  for (const [sid, res] of seats.entries()) {
    if (res.fanId === fanId && sid !== seatId) {
      seats.delete(sid);
    }
  }

  // Derive section/row/col from seatId (format: roomId:seat-R-C or r{R}c{C})
  const [rowLabel, colLabel] = parseSeatId(seatId);

  const ticket = createTicket({
    ownerId: fanId,
    venueSlug: concertId,
    eventSlug: concertId,
    tier,
    faceValue,
  });

  // Patch seat binding to match the actual chosen seat
  (ticket.seat as { section: string; row: string; seat: string }) = {
    section: tier === "STANDARD" ? "GEN" : tier.slice(0, 3),
    row: rowLabel,
    seat: colLabel,
  };

  seats.set(seatId, {
    seatId,
    fanId,
    displayName,
    tier,
    reservedAt: Date.now(),
    ticketId: ticket.id,
  });

  return NextResponse.json({ ok: true, ticket, seatId });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const concertId: string = typeof body.concertId === "string" ? body.concertId : "world-concert";
  const fanId: string     = typeof body.fanId     === "string" ? body.fanId     : "";

  if (!fanId) {
    return NextResponse.json({ ok: false, error: "fanId required" }, { status: 400 });
  }

  const seats = getConcertSeats(concertId);
  for (const [sid, res] of seats.entries()) {
    if (res.fanId === fanId) {
      seats.delete(sid);
    }
  }

  return NextResponse.json({ ok: true });
}

function parseSeatId(seatId: string): [string, string] {
  // Format "world-concert:seat-2-5" → row "C", col "6"
  const meshMatch = seatId.match(/seat-(\d+)-(\d+)/);
  if (meshMatch) {
    const r = parseInt(meshMatch[1]!, 10);
    const c = parseInt(meshMatch[2]!, 10);
    return [String.fromCharCode(65 + r), String(c + 1).padStart(2, "0")];
  }
  // Format "r2c5"
  const gridMatch = seatId.match(/r(\d+)c(\d+)/);
  if (gridMatch) {
    const r = parseInt(gridMatch[1]!, 10);
    const c = parseInt(gridMatch[2]!, 10);
    return [String.fromCharCode(65 + r), String(c + 1).padStart(2, "0")];
  }
  return ["A", "01"];
}
