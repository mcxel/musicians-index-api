import { NextResponse } from "next/server";
import { validateTicket } from "@/lib/tickets/ticketEngine";
import { validateTicketOwnership, validateSeatClaim, getSeatClaimant } from "@/lib/lobbies/seatIdentityGuard";
import { getTicketById } from "@/lib/tickets/ticketCore";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ticketId = typeof body?.ticketId === "string" ? body.ticketId : "";
  const userId = typeof body?.userId === "string" ? body.userId : "demo-user";
  const gate = typeof body?.gate === "string" ? body.gate : "GATE-A";

  if (!ticketId) {
    return NextResponse.json({ ok: false, error: "ticketId_required" }, { status: 400 });
  }

  const validation = validateTicket(ticketId);
  const ticket = getTicketById(ticketId);

  const ticketOk = validation.valid;
  const ownershipOk = ticketOk && validateTicketOwnership(userId, ticketId);

  let seatOk = false;
  if (ticket) {
    const seatId = `${ticket.seat.section}-${ticket.seat.row}-${ticket.seat.seat}`;
    const roomId = ticket.template.venueSlug;
    const existing = getSeatClaimant(seatId, roomId);
    seatOk = ticketOk && (existing === null || existing === userId);
    if (seatOk && existing === null) {
      validateSeatClaim(userId, seatId, roomId, { ticketId });
    }
  }

  const chain = {
    faceScan: ownershipOk,
    avatar: ownershipOk,
    ticket: ticketOk,
    seat: seatOk,
  };

  const valid = ticketOk && ownershipOk && seatOk;
  const reason = !ticketOk
    ? (validation.reason ?? "ticket_invalid")
    : !ownershipOk
    ? "ticket_not_owned_by_user"
    : !seatOk
    ? "seat_conflict"
    : "ok";

  return NextResponse.json({ ok: true, valid, reason, chain, gate, fraudGuard: validation.fraudGuard });
}
