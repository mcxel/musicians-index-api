export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { listTicketHistory } from "@/lib/tickets/ticketEngine";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId") ?? "demo-user";
  return NextResponse.json({
    ok: true,
    ownerId,
    ...listTicketHistory(ownerId),
  });
}
