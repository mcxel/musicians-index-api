export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { atomicCheckIn, verifyTicketToken } from "@/lib/tickets/AtomicCheckIn";

/**
 * POST /api/tickets/checkin
 * Atomic verify + redeem. Accepts token or ticketId.
 * Optional verifyOnly: true returns validation without redeeming.
 */
export async function POST(req: Request) {
  const rawBody = await req.json().catch(() => ({}));
  const token =
    (typeof rawBody?.token === "string" && rawBody.token) ||
    (typeof rawBody?.ticketId === "string" && rawBody.ticketId) ||
    "";
  const eventId = typeof rawBody?.eventId === "string" ? rawBody.eventId : undefined;
  const gate = typeof rawBody?.gate === "string" ? rawBody.gate : "door";
  const method =
    typeof rawBody?.method === "string"
      ? (rawBody.method as "qr" | "barcode" | "manual" | "kiosk" | "camera")
      : "manual";
  const verifyOnly = Boolean(rawBody?.verifyOnly);

  if (!token.trim()) {
    return NextResponse.json({ ok: false, error: "token_required" }, { status: 400 });
  }

  if (verifyOnly) {
    const v = await verifyTicketToken(token);
    return NextResponse.json({
      ok: v.ok,
      valid: v.valid,
      tokenStatus: v.reason,
      ticketId: v.ticketId,
      ticket: v.ticket
        ? {
            id: v.ticket.id,
            eventSlug: v.ticket.template.eventSlug,
            venueSlug: v.ticket.template.venueSlug,
            tier: v.ticket.template.tier,
            redeemed: v.ticket.redeemed,
          }
        : undefined,
      message: v.reason,
    });
  }

  const auth = await getTmiAuth().catch(() => null);
  const result = await atomicCheckIn({
    tokenOrTicketId: token,
    eventId,
    operatorId: auth?.user?.id ?? "kiosk",
    method,
    gate,
  });

  return NextResponse.json({
    ok: result.ok,
    already: result.decision === "already_used",
    tokenStatus: result.decision,
    checkedInAt: result.checkedInAt,
    ticketId: result.ticketId,
    eventId: result.eventId,
    message: result.message,
    decision: result.decision,
  });
}
