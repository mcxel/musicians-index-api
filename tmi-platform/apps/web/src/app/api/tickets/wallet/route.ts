export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getOwnedTickets } from "@/lib/tickets/ticketEngine";

/**
 * GET /api/tickets/wallet?ownerId=<slug>
 * Returns venue-branded/printable tickets (ticketCore/ticketEngine — distinct
 * from the Stripe-purchased general-admission tickets served by
 * /api/tickets/mine, per the intentional two-system separation).
 */
export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }
  const tickets = await getOwnedTickets(ownerId);
  return NextResponse.json({ ok: true, tickets });
}
