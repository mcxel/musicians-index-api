/**
 * VenueBookingRegistry
 *
 * Persistent store for venue booking requests and confirmed bookings.
 * Backed by prisma.feedItem (type='VENUE_BOOKING').
 * Replaces direct feedItem writes in api/booking/create.
 */

import prisma from '@/lib/prisma';

const FEED_TYPE = 'VENUE_BOOKING';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');
const SYSTEM_USER_EMAIL = 'platform@themusiciansindex.com';

// FeedItem.userId is a required FK to a real User.id — the literal string
// 'system' used to be passed directly here, which violated the FK constraint
// and caused every unattributed booking write to silently fail (swallowed by
// the caller's catch block). Resolve to the real platform admin account instead.
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

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface VenueBooking {
  bookingId:          string;
  venueSlug:          string;
  artistName:         string;
  artistSlug?:        string;
  contactEmail:       string;
  eventDate:          string;
  eventType:          string;
  expectedAttendance: number;
  estimatedTotalUsd:  number;
  addOns:             string[];
  additionalNotes:    string;
  status:             BookingStatus;
  contractId?:        string;
  submittedAt:        number;
  updatedAt?:         number;
}

export const VenueBookingRegistry = {
  async create(
    params: Omit<VenueBooking, 'bookingId' | 'submittedAt' | 'status'> & { userId?: string }
  ): Promise<VenueBooking> {
    const bookingId  = `BK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const submittedAt = Date.now();
    const booking: VenueBooking = {
      bookingId,
      venueSlug:          params.venueSlug,
      artistName:         params.artistName,
      artistSlug:         params.artistSlug,
      contactEmail:       params.contactEmail,
      eventDate:          params.eventDate,
      eventType:          params.eventType,
      expectedAttendance: params.expectedAttendance,
      estimatedTotalUsd:  params.estimatedTotalUsd,
      addOns:             params.addOns,
      additionalNotes:    params.additionalNotes,
      status:             'pending',
      contractId:         params.contractId,
      submittedAt,
    };

    const userId = params.userId ?? (await getSystemUserId());
    if (!userId) {
      throw new Error('VenueBookingRegistry.create: no system user configured for unattributed bookings');
    }

    await prisma.feedItem.create({
      data: {
        userId,
        type:       FEED_TYPE,
        entityId:   params.venueSlug,
        entityType: 'venue',
        data:       booking as object,
        expiresAt:  FAR_FUTURE,
      },
    });

    return booking;
  },

  async listByVenue(venueSlug: string): Promise<VenueBooking[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE, entityId: venueSlug, entityType: 'venue' },
      orderBy: { createdAt: 'desc' },
      take:    200,
    });
    return rows.map(r => r.data as unknown as VenueBooking);
  },

  async listAll(status?: BookingStatus): Promise<VenueBooking[]> {
    const rows = await prisma.feedItem.findMany({
      where:   { type: FEED_TYPE },
      orderBy: { createdAt: 'desc' },
      take:    1000,
    });
    const all = rows.map(r => r.data as unknown as VenueBooking);
    return status ? all.filter(b => b.status === status) : all;
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const rows = await prisma.feedItem.findMany({ where: { type: FEED_TYPE } });
    for (const row of rows) {
      const booking = row.data as unknown as VenueBooking;
      if (booking.bookingId === bookingId) {
        await prisma.feedItem.update({
          where: { id: row.id },
          data:  { data: { ...booking, status, updatedAt: Date.now() } as object },
        });
        break;
      }
    }
  },

  async getBooking(bookingId: string): Promise<VenueBooking | null> {
    const all = await VenueBookingRegistry.listAll();
    return all.find(b => b.bookingId === bookingId) ?? null;
  },

  async pendingCount(): Promise<number> {
    const pending = await VenueBookingRegistry.listAll('pending');
    return pending.length;
  },
};
