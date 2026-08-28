export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyTicketToken } from "@/lib/tickets/AtomicCheckIn";

/** Alias for scanner clients that POST /api/tickets/verify */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token =
    (typeof body?.token === "string" && body.token) ||
    (typeof body?.ticketId === "string" && body.ticketId) ||
    "";
  if (!token.trim()) {
    return NextResponse.json({ ok: false, valid: false, error: "token_required" }, { status: 400 });
  }
  const v = await verifyTicketToken(token);
  return NextResponse.json({
    ok: v.ok,
    valid: v.valid,
    tokenStatus: v.reason,
    ticketId: v.ticketId,
    message: v.reason,
  });
}
