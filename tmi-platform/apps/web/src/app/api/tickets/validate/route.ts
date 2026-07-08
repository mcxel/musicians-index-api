export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { validateTicket } from '@/lib/tickets/ticketEngine';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

// Rule 17: Ticket validation (scanning at the gate) is a Venue/Promoter/Admin
// operation. Fans and Performers may not call this endpoint.
const SCAN_AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function POST(req: NextRequest) {
  try {
    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
    }
    const role = (session.user.role ?? '').toUpperCase();
    if (!SCAN_AUTHORIZED_ROLES.has(role)) {
      return NextResponse.json(
        { ok: false, error: 'forbidden', message: 'Only Venue and Promoter accounts may validate tickets. (TMI Rule 17)' },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const ticketId = typeof body?.ticketId === 'string' ? body.ticketId.trim() : '';
    if (!ticketId) {
      return NextResponse.json({ ok: false, error: 'ticketId_required' }, { status: 400 });
    }
    const result = await validateTicket(ticketId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'validation_error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}