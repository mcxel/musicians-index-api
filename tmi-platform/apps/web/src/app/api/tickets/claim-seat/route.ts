export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createTicket, resolveTicketRoyalty } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";
import { claimSeat, getSeatClaim } from "@/lib/venue/tmiVenueSeatEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

/**
 * POST /api/tickets/claim-seat
 *
 * Fan-facing "buy/own a ticket" flow (Rule 17 — any authenticated user may
 * claim a seat and be issued a ticket; this is distinct from
 * /api/tickets/create, which is the Venue/Promoter/Admin-only ticket
 * *inventory* creation endpoint).
 *
 * Was previously called directly from the browser (SeatClaimRail.tsx
 * importing createTicket()/claimSeat() and calling them client-side) with
 * no authentication at all. Moved server-side: ownerId is always the real
 * signed-in session, never client-supplied, and the seat-claim check now
 * actually runs before a ticket is minted instead of trusting whatever the
 * client already believes it holds.
 */
export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seatId = typeof body?.seatId === "string" ? body.seatId.trim() : "";
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug.trim() : "";
  const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";
  const tier: TicketTier = body?.tier === "VIP" ? "VIP" : "STANDARD";
  const faceValue = typeof body?.faceValue === "number" ? body.faceValue : 0;

  if (!seatId || !venueSlug || !eventSlug) {
    return NextResponse.json({ error: "seatId_venueSlug_eventSlug_required" }, { status: 400 });
  }

  const existingClaim = getSeatClaim(seatId);
  if (existingClaim && existingClaim.claimedBy !== session.user.id) {
    return NextResponse.json({ error: "seat_already_claimed" }, { status: 409 });
  }
  if (existingClaim && existingClaim.claimedBy === session.user.id && existingClaim.ticketId) {
    // Idempotent — this user already holds this seat, return the existing ticket id.
    return NextResponse.json({ ok: true, ticketId: existingClaim.ticketId, alreadyClaimed: true });
  }

  const ownerId = session.user.id;
  const ticket = createTicket({ ownerId, venueSlug, eventSlug, tier, faceValue });
  claimSeat(seatId, ownerId, ticket.id);

  return NextResponse.json({
    ok: true,
    ticket,
    royalty: resolveTicketRoyalty(faceValue),
  });
}
