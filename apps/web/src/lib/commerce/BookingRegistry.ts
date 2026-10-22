/**
 * LEGACY commerce BookingRegistry — honesty quarantine 2026-09-16.
 * Canonical booking persistence lives in lib/registries/VenueBookingRegistry.
 * This file must not invent PENDING opportunities for customer UI.
 * Do not delete (legacy reference); returns honest empty inventories.
 */

export class VenueBookingRegistry {
  static async createBookingRequest(data: {
    performerId: string;
    venueId: string;
    date: string;
    budget: number;
  }) {
    // TODO: Wire to prisma.bookingRequest when schema migration add_booking_models completes
    return { id: `req-${Date.now()}`, ...data, status: "PENDING" as const };
  }

  static async getRequestsForVenue(_venueId: string) {
    return [] as Array<{
      id: string;
      performerId: string;
      venueId: string;
      date: string;
      budget: number;
      status: string;
    }>;
  }
}

export class BookingOpportunityRegistry {
  static async getOpportunities() {
    return [] as Array<{
      id: string;
      title: string;
      venueId: string;
      payoutUsd: number;
      status: string;
      genre: string;
    }>;
  }
}
