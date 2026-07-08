export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createTicket, resolveTicketRoyalty } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

// Rule 17: Only Venue, Promoter, and Admin may create ticket inventory.
// Fans and Performers are never in this set — they may only buy/own tickets.
const AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json(
      { error: 'authentication_required' },
      { status: 401 }
    );
  }
  const role = session.user.role.toUpperCase();
  if (!AUTHORIZED_ROLES.has(role)) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        message: 'Only Venue, Promoter, and Admin accounts may create ticket inventory. (TMI Rule 17)',
      },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  // ownerId is the authenticated creator — not taken from body to prevent spoofing.
  const ownerId = session.user.id;
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug.trim() : "";
  const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";
  const tier = typeof body?.tier === "string" ? (body.tier as TicketTier) : "STANDARD";
  const faceValue = typeof body?.faceValue === "number" ? body.faceValue : 30;

  if (!venueSlug || !eventSlug) {
    return NextResponse.json(
      { error: 'venueSlug_and_eventSlug_required' },
      { status: 400 }
    );
  }

  const ticket = createTicket({
    ownerId,
    venueSlug,
    eventSlug,
    tier,
    faceValue,
    venueLogo: typeof body?.venueLogo === "string" ? body.venueLogo : undefined,
    sponsorLogo: typeof body?.sponsorLogo === "string" ? body.sponsorLogo : undefined,
    eventBranding: typeof body?.eventBranding === "string" ? body.eventBranding : undefined,
  });

  return NextResponse.json({
    ok: true,
    ticket,
    royalty: resolveTicketRoyalty(faceValue),
  });
}
