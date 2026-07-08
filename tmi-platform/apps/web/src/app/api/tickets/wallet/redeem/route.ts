import { NextRequest, NextResponse } from "next/server";
import { redeemTicket } from "@/lib/tickets/ticketEngine";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { ticketId } = body as { ticketId?: string };
  if (!ticketId) {
    return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
  }
  try {
    const ticket = await redeemTicket(ticketId);
    return NextResponse.json({ ok: true, ticket });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "redeem_failed" }, { status: 400 });
  }
}
