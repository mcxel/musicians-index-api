import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { getOwnedTickets } from '@/lib/tickets/ticketEngine';

export const dynamic = 'force-dynamic';

// Rule 17: Ticket printing requires an authenticated session.
// The caller must own the ticket (fan/performer) OR be venue/admin staff.
const STAFF_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export async function GET(req: NextRequest) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId');
  const venueId = searchParams.get('venue') || 'World Concert Arena';

  // Ownership check for non-staff callers
  if (ticketId) {
    const callerRole = (session.user.role ?? '').toUpperCase();
    const isStaff = STAFF_ROLES.has(callerRole);
    if (!isStaff) {
      const owned = await getOwnedTickets(session.user.id);
      if (!owned.some((t) => t.id === ticketId)) {
        return NextResponse.json(
          { error: 'forbidden', message: 'You do not own this ticket. (TMI Rule 17)' },
          { status: 403 },
        );
      }
    }
  }

  // Generate a print-ready ticket ID (real or stub for missing ID edge case)
  const resolvedTicketId = ticketId || `TMI-${Date.now().toString(36).toUpperCase()}`;

  // QR code points to the real verify page so venue staff can scan at the door.
  const verifyUrl = `${req.nextUrl.origin}/ticket/verify/${encodeURIComponent(resolvedTicketId)}`;

  // Thermal Printer Output Engine — formatted for 80mm ESC/POS printers.
  const ticketPayload = {
    platform: "THE MUSICIAN'S INDEX (TMI)",
    venue: venueId,
    event: "LIVE MAIN STAGE",
    ticketId: resolvedTicketId,
    barcodeType: "QR_CODE",
    barcodeData: verifyUrl,
    issuedAt: new Date().toISOString(),
    advisory: "Valid for single entry. TMI Platform Rule 17 Enforced.",
    thermalPrintFormat: {
      width: "80mm",
      encoding: "base64",
      data: Buffer.from(`TMI TICKET\nID: ${resolvedTicketId}\nVENUE: ${venueId}\nVERIFY: ${verifyUrl}`).toString('base64'),
    },
  };

  return NextResponse.json({ success: true, payload: ticketPayload }, { status: 200 });
}