/**
 * BookingOpportunityRegistry
 *
 * Tracks open booking opportunities posted by venues (the supply side).
 * Performers browse and apply to these. Venue owners post them.
 * Backed by prisma.feedItem (type='BOOKING_OPPORTUNITY').
 */

import prisma from '@/lib/prisma';

const FEED_TYPE = 'BOOKING_OPPORTUNITY';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');
const SYSTEM_USER_EMAIL = 'platform@themusiciansindex.com';

// FeedItem.userId is a required FK to a real User.id — see the same fix in
// VenueBookingRegistry.ts for why the literal string 'system' cannot be used.
let cachedSystemUserId: string | null | undefined;

async function getSystemUserId(): Promise<string | null> {
  if (cachedSystemUserId !== undefined) return cachedSystemUserId;
  const systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL },
    select: { id: true },
  });
  cachedSystemUserId = systemUser?.id ?? null;
  return cachedSystemUserId;
}

export type OpportunityStatus = 'open' | 'filled' | 'cancelled' | 'expired';

export interface BookingOpportunity {
  opportunityId:    string;
  venueSlug:        string;
  venueName:        string;
  venueCity:        string;
  eventName:        string;
  eventDate:        string;
  eventType:        string;
  genres:           string[];
  capacity:         number;
  guaranteeUsd:     number;
  revenueSplitPct:  number;
  requirements:     string[];
  status:           OpportunityStatus;
  applicantCount:   number;
  postedAt:         number;
  deadline?:        string;
}

export const BookingOpportunityRegistry = {
  async post(
    params: Omit<BookingOpportunity, 'opportunityId' | 'postedAt' | 'status' | 'applicantCount'> & { userId?: string }
  ): Promise<BookingOpportunity> {
    const opportunityId = `bkopp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const opp: BookingOpportunity = {
      opportunityId,
      venueSlug:       params.venueSlug,
      venueName:       params.venueName,
      venueCity:       params.venueCity,
      eventName:       params.eventName,
      eventDate:       params.eventDate,
      eventType:       params.eventType,
      genres:          params.genres,
      capacity:        params.capacity,
      guaranteeUsd:    params.guaranteeUsd,
      revenueSplitPct: params.revenueSplitPct,
      requirements:    params.requirements,
      status:          'open',
      applicantCount:  0,
      postedAt:        Date.now(),
      deadline:        params.deadline,
    };

    const userId = params.userId ?? (await getSystemUserId());
    if (!userId) {
      throw new Error('BookingOpportunityRegistry.post: no system user configured for unattributed opportunities');
    }

    await prisma.feedItem.create({
      data: {
        userId,
        type:       FEED_TYPE,
        entityId:   params.venueSlug,
        entityType: 'venue',
        data:       opp as object,
        expiresAt:  FAR_FUTURE,
      },
    });

    return opp;
  },

  async listOpen(genre?: string): Promise<BookingOpportunity[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE },
      orderBy: { createdAt: 'desc' },
      take:    200,
    });
    const all = rows.map(r => r.data as unknown as BookingOpportunity)
      .filter(o => o.status === 'open');

    if (genre) {
      return all.filter(o => o.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
    }
    return all;
  },

  async listByVenue(venueSlug: string): Promise<BookingOpportunity[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE, entityId: venueSlug, entityType: 'venue' },
      orderBy: { createdAt: 'desc' },
      take:    100,
    });
    return rows.map(r => r.data as unknown as BookingOpportunity);
  },

  async incrementApplicants(opportunityId: string): Promise<void> {
    const rows = await prisma.feedItem.findMany({ where: { type: FEED_TYPE } });
    for (const row of rows) {
      const opp = row.data as unknown as BookingOpportunity;
      if (opp.opportunityId === opportunityId) {
        await prisma.feedItem.update({
          where: { id: row.id },
          data:  { data: { ...opp, applicantCount: opp.applicantCount + 1 } as object },
        });
        break;
      }
    }
  },

  async fill(opportunityId: string): Promise<void> {
    const rows = await prisma.feedItem.findMany({ where: { type: FEED_TYPE } });
    for (const row of rows) {
      const opp = row.data as unknown as BookingOpportunity;
      if (opp.opportunityId === opportunityId) {
        await prisma.feedItem.update({
          where: { id: row.id },
          data:  { data: { ...opp, status: 'filled' as const } as object },
        });
        break;
      }
    }
  },
};
