export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Returns published events with their ticket types — consumed by /tickets page.
// Venue/Promoter authority: events are created by Venue or Promoter accounts per Rule 17.
// This route is read-only, available to all authenticated and unauthenticated visitors.

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ['PUBLISHED', 'ON_SALE', 'DOORS_OPEN'] } },
      orderBy: { startsAt: 'asc' },
      include: {
        ticketTypes: {
          where: { quantity: { gt: 0 } },
          orderBy: { priceCents: 'asc' },
        },
      },
      take: 50,
    });

    const payload = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description ?? null,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt?.toISOString() ?? null,
      venueName: e.venueName ?? null,
      venueCity: e.venueCity ?? null,
      venueState: e.venueState ?? null,
      ticketTypes: e.ticketTypes.map((t) => ({
        id: t.id,
        name: t.name,
        priceCents: t.priceCents,
        quantity: t.quantity,
      })),
    }));

    return NextResponse.json({ events: payload });
  } catch (err) {
    console.error('[events/list]', err);
    return NextResponse.json({ events: [] });
  }
}
