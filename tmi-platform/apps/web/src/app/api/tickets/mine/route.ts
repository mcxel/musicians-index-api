export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { listTicketsByOwner } from '@/lib/tickets/ticketCore';
import { prisma } from '@/lib/prisma';
import type { TicketRecord, TicketTier } from '@/lib/tickets/ticketCore';

/**
 * GET /api/tickets/mine
 * Rule 17: any authenticated user may VIEW tickets they own.
 * Prefer Prisma Ticket rows (Stripe webhook fulfillment). Memory fallback is CERT-ENV only.
 */

const VALID_TIERS = new Set<TicketTier>([
  'VIP',
  'STANDARD',
  'BACKSTAGE',
  'MEET_AND_GREET',
  'SPONSOR_GIFT',
  'SEASON_PASS',
  'BATTLE_PASS',
  'RAFFLE_PASS',
]);

function toTier(name: string | undefined | null): TicketTier {
  const raw = (name ?? 'STANDARD').toUpperCase();
  return VALID_TIERS.has(raw as TicketTier) ? (raw as TicketTier) : 'STANDARD';
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'event'
  );
}

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
      const tier = toTier(t.ticketType?.name);
      const eventSlug = slugify(t.event?.title ?? 'event');
      return {
        id: t.id,
        ownerId: session.user.id,
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

    return NextResponse.json({ tickets: normalized, source: 'prisma' });
  } catch {
    // CERT-ENV: local/dev without migrate may lack Ticket table — memory only there.
    // PRODUCTION: do not silently invent a full ticket wallet from process memory.
    if (process.env.NODE_ENV === 'development') {
      const tickets = listTicketsByOwner(session.user.id);
      return NextResponse.json({ tickets, source: 'memory_fallback_dev_only' });
    }

    return NextResponse.json(
      { error: 'ticket_store_unavailable', tickets: [], source: 'unavailable' },
      { status: 503 }
    );
  }
}
