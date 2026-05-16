import { NextResponse } from "next/server";
import { printTicket } from "@/lib/tickets/ticketEngine";

export async function GET(_req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    return NextResponse.json({ ok: true, ticketId: id, outputs: printTicket(id) });
  } catch {
    return NextResponse.json({ ok: false, error: "ticket_not_found" }, { status: 404 });
  }
}
