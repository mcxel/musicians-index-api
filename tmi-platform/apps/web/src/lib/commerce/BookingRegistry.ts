export class VenueBookingRegistry {
  static async createBookingRequest(data: { performerId: string, venueId: string, date: string, budget: number }) {
    // TODO: Wire to prisma.bookingRequest when schema migration add_booking_models completes
    return { id: `req-${Date.now()}`, ...data, status: 'PENDING' };
  }

  static async getRequestsForVenue(venueId: string) {
    return [
      { id: `req-1`, performerId: 'user-123', venueId, date: new Date().toISOString(), budget: 500, status: 'PENDING' }
    ];
  }
}

export class BookingOpportunityRegistry {
  static async getOpportunities() {
    return [
      { id: 'opp-1', title: 'Friday Night Cypher', venueId: 'v-1', payoutUsd: 500, status: 'OPEN', genre: 'Hip-Hop' },
      { id: 'opp-2', title: 'Weekend DJ Showcase', venueId: 'v-2', payoutUsd: 800, status: 'OPEN', genre: 'EDM' }
    ];
  }
}