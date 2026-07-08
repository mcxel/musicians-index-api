export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { listTicketsByOwner } from '@/lib/tickets/ticketCore';
import { prisma } from '@/lib/prisma';
import type { TicketRecord, TicketTier } from '@/lib/tickets/ticketCore';

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

  try {
    const dbTickets = await prisma.ticket.findMany({
      where: { ownerUserId: session.user.id },
      include: {
        ticketType: { select: { name: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const normalized: TicketRecord[] = dbTickets.map((t) => {
      const rawTier = (t.ticketType?.name ?? 'STANDARD').toUpperCase();
      const tier: TicketTier = (
        rawTier === 'VIP' ||
        rawTier === 'STANDARD' ||
        rawTier === 'BACKSTAGE' ||
        rawTier === 'MEET_AND_GREET' ||
        rawTier === 'SPONSOR_GIFT' ||
        rawTier === 'SEASON_PASS' ||
        rawTier === 'BATTLE_PASS' ||
        rawTier === 'RAFFLE_PASS'
      ) ? rawTier : 'STANDARD';

      const eventTitle = t.event?.title ?? 'event';
      const eventSlug = eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || 'event';

      return {
        id: t.id,
        ownerId: session.user.id,
        orderId: t.orderId ?? undefined,
        template: {
          id: t.ticketTypeId,
          venueSlug: 'tmi-platform',
          eventSlug,
          tier,
          faceValue: 0,
          currency: 'USD',
        },
        branding: {
          venueLogo: '',
          sponsorLogo: '',
          eventBranding: '',
          qrCode: t.tokenHash,
          barcode: t.tokenHash,
          hologramNftOverlay: '',
        },
        barcode: {
          barcodeValue: t.tokenHash,
          qrValue: t.tokenHash,
          signed: true,
        },
        seat: {
          section: 'GA',
          row: '-',
          seat: '-',
        },
        outputFormats: ['PDF', 'IMAGE', 'MOBILE_WALLET'],
        mintedAt: t.createdAt.toISOString(),
        redeemed: String(t.status).toUpperCase() === 'REDEEMED',
      };
    });

    return NextResponse.json({ tickets: normalized });
  } catch {
    if (process.env.NODE_ENV === 'development') {
      const tickets = await listTicketsByOwner(session.user.id);
      return NextResponse.json({ tickets, source: 'memory_fallback_dev_only' });
    }

    return NextResponse.json(
      { error: 'ticket_store_unavailable', tickets: [] },
      { status: 503 }
    );
  }
}
