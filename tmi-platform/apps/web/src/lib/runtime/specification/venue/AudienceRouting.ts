export interface AudienceRouting {
  routeAudienceToVenue(venueId: string, userId: string): Promise<void>;
}
