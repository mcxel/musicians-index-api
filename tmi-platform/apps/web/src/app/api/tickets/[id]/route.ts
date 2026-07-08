import { NextResponse } from "next/server";
import { getOwnedTickets } from "@/lib/tickets/ticketEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getTicketById } from "@/lib/tickets/ticketCore";

// Rule 17: A ticket record is visible only to its owner or Venue/Promoter/Admin.
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
  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ ok: false, error: 'ticket_not_found' }, { status: 404 });
  }

  const callerRole = (session.user.role ?? '').toUpperCase();
  const isStaff = STAFF_ROLES.has(callerRole);

  if (!isStaff && ticket.ownerId !== session.user.id) {
    return NextResponse.json(
      { ok: false, error: 'forbidden', message: 'You do not own this ticket. (TMI Rule 17)' },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, ticket });
}
