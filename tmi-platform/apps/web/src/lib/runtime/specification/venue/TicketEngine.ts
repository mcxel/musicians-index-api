export interface VenueTicketEngine {
  issueTicket(input: { venueId: string; eventId: string; ownerUserId: string; tier: string }): Promise<{ ticketId: string }>;
  validateTicket(ticketId: string): Promise<boolean>;
}
