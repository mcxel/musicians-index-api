export interface VenueRenderer {
  renderVenue(venueId: string): Promise<void>;
}
