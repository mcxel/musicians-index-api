import { NextResponse } from "next/server";
import { scanTicket } from "@/lib/tickets/ticketEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ticketId = typeof body?.ticketId === "string" ? body.ticketId : "";
  const gate = typeof body?.gate === "string" ? body.gate : "A1";
  if (!ticketId) {
    return NextResponse.json({ ok: false, error: "ticketId_required" }, { status: 400 });
  }

  return NextResponse.json(scanTicket(ticketId, gate));
}
