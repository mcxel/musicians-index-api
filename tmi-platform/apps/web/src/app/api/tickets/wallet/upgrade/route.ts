import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { upgradeTicket } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

export async function POST(req: NextRequest) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { ticketId, newTier } = body as { ticketId?: string; newTier?: TicketTier };
  if (!ticketId || !newTier) {
    return NextResponse.json({ error: "ticketId and newTier are required" }, { status: 400 });
  }

  try {
    const ticket = await upgradeTicket(ticketId, newTier, session.user.role, true);
    return NextResponse.json({ ok: true, ticket });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "upgrade_failed" }, { status: 400 });
  }
}
