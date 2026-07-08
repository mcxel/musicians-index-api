export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { scanTicket } from "@/lib/tickets/ticketEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

// Rule 17: Gate scanning is a Venue/Promoter/Admin operation.
const SCAN_AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  }
  const role = (session.user.role ?? '').toUpperCase();
  if (!SCAN_AUTHORIZED_ROLES.has(role)) {
    return NextResponse.json(
      { ok: false, error: 'forbidden', message: 'Only Venue and Promoter accounts may scan tickets. (TMI Rule 17)' },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const ticketId = typeof body?.ticketId === "string" ? body.ticketId : "";
  const gate = typeof body?.gate === "string" ? body.gate : "A1";
  if (!ticketId) {
    return NextResponse.json({ ok: false, error: "ticketId_required" }, { status: 400 });
  }

  const result = await scanTicket(ticketId, gate);
  return NextResponse.json(result);
}
