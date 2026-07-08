export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { redeemTicket, validateTicket } from "@/lib/tickets/ticketEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

// Rule 17: Check-in (redeeming a ticket at the gate) is a Venue/Promoter/Admin
// operation. Fans and Performers cannot check in tickets — they surrender them.
const CHECKIN_AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'authentication_required' },
      { status: 401 },
    );
  }

  const callerRole = (session.user.role ?? '').toUpperCase();
  if (!CHECKIN_AUTHORIZED_ROLES.has(callerRole)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'forbidden',
        message: 'Only Venue and Promoter accounts may check in tickets. (TMI Rule 17)',
      },
      { status: 403 },
    );
  }

  const rawBody = await req.json().catch(() => ({}));
  const ticketId = typeof rawBody?.ticketId === 'string' ? rawBody.ticketId.trim() : '';
  if (!ticketId) {
    return NextResponse.json({ ok: false, error: 'ticketId_required' }, { status: 400 });
  }

  try {
    // Validate first, then redeem
    const validation = await validateTicket(ticketId);
    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: 'ticket_invalid', detail: validation }, { status: 422 });
    }
    const redeemed = await redeemTicket(ticketId);
    return NextResponse.json({ ok: true, redeemed, checkedInBy: session.user.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'checkin_failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
