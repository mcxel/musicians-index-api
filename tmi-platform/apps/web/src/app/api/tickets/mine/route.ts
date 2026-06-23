export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { listTicketsByOwner } from '@/lib/tickets/ticketCore';

// Rule 17: Any authenticated user may VIEW and own tickets.
// Returns tickets owned by the currently authenticated user.
//
// NOTE: The underlying store (ticketCore.ts) is in-memory for dev.
// TODO-PROD: Replace listTicketsByOwner() with a Prisma query once the
// TicketRecord → Prisma Ticket schema migration is complete.
// In production serverless (Vercel), tickets created by the Stripe webhook
// invocation will persist only for the lifetime of that function instance
// unless the Prisma migration is in place.

export async function GET() {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json(
      { error: 'authentication_required', tickets: [] },
      { status: 401 }
    );
  }

  const tickets = listTicketsByOwner(session.user.id);
  return NextResponse.json({ tickets });
}
