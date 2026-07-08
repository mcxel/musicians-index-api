import { NextResponse } from "next/server";
import { printTicket, getOwnedTickets } from "@/lib/tickets/ticketEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

// Rule 17: Only the ticket's current owner OR Venue/Promoter/Admin staff may print it.
const STAFF_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function GET(_req: Request, context: { params: { id: string } }) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'authentication_required' },
      { status: 401 },
    );
  }

  const { id } = context.params;
  const callerRole = (session.user.role ?? '').toUpperCase();
  const isStaff = STAFF_ROLES.has(callerRole);

  if (!isStaff) {
    // Non-staff callers must own this ticket.
    const owned = await getOwnedTickets(session.user.id);
    const owns = owned.some((t) => t.id === id);
    if (!owns) {
      return NextResponse.json(
        { ok: false, error: 'forbidden', message: 'You do not own this ticket. (TMI Rule 17)' },
        { status: 403 },
      );
    }
  }

  try {
    const outputs = await printTicket(id);
    return NextResponse.json({ ok: true, ticketId: id, outputs });
  } catch {
    return NextResponse.json({ ok: false, error: "ticket_not_found" }, { status: 404 });
  }
}
