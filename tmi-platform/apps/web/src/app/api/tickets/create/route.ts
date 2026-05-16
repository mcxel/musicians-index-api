import { NextResponse } from "next/server";
import { createTicket, resolveTicketRoyalty } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ownerId = typeof body?.ownerId === "string" ? body.ownerId : "demo-user";
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug : "test-venue";
  const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug : "main-event";
  const tier = typeof body?.tier === "string" ? (body.tier as TicketTier) : "STANDARD";
  const faceValue = typeof body?.faceValue === "number" ? body.faceValue : 30;

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
