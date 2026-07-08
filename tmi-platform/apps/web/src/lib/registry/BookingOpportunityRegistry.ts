export interface BookingOpportunity {
  id: string;
  venueId: string;
  date: Date;
  status: 'open' | 'booked' | 'completed';
  requiredTier: string;
}

class BookingOpportunityRegistry {
  private opportunities: Map<string, BookingOpportunity> = new Map();

  register(opportunity: BookingOpportunity) {
    this.opportunities.set(opportunity.id, opportunity);
  }

  getOpportunity(id: string) {
    return this.opportunities.get(id);
  }

  getAllOpportunities() {
    return Array.from(this.opportunities.values());
  }
}

export const bookingOpportunityRegistry = new BookingOpportunityRegistry();