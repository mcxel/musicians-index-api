export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { listTicketHistory } from "@/lib/tickets/ticketEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

// Rule 17: Ticket history is scoped to the authenticated caller.
// Admin may pass an explicit ownerId to view another user's history.
const ADMIN_ROLES = new Set(['ADMIN', 'SUPERADMIN', 'OWNER']);

export async function GET(req: NextRequest) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  }

  const callerRole = (session.user.role ?? '').toUpperCase();
  const requestedOwner = req.nextUrl.searchParams.get("ownerId");

  // Non-admin callers may only view their own ticket history.
  const ownerId = ADMIN_ROLES.has(callerRole)
    ? (requestedOwner ?? session.user.id)
    : session.user.id;

  const history = await listTicketHistory(ownerId);
  return NextResponse.json({
    ok: true,
    ownerId,
    ...history,
  });
}
