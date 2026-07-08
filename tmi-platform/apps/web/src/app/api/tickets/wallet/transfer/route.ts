import { NextRequest, NextResponse } from "next/server";
import { transferTicket } from "@/lib/tickets/ticketEngine";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { ticketId, toUserId, actorId } = body as { ticketId?: string; toUserId?: string; actorId?: string };
  if (!ticketId || !toUserId || !actorId) {
    return NextResponse.json({ error: "ticketId, toUserId, and actorId are required" }, { status: 400 });
  }
  try {
    const ticket = await transferTicket(ticketId, toUserId, actorId);
    return NextResponse.json({ ok: true, ticket });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "transfer_failed" }, { status: 400 });
  }
}
