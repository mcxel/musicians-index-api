/**
 * VenueEventPromotionRoutingEngine
 * All route paths for venue event promotion lifecycle:
 * event, ticket buy, venue profile, promote event, article/magazine placement.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueEventRoutes = {
  eventRoute: string;
  ticketBuyRoute: string;
  ticketPrintRoute: string;
  venueRoute: string;
  promoteEventRoute: string;
  articlePlacementRoute: string;
  magazinePlacementRoute: string;
  boostDashboardRoute: string;
};

export type VenueBoostRoutes = {
  boostSignupRoute: string;
  boostCheckoutRoute: string;
  boostDashboardRoute: string;
  campaignRoute: string;
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildVenueEventRoutes(input: {
  venueSlug: string;
  eventId: string;
  artistSlug?: string;
  campaignId?: string;
}): VenueEventRoutes {
  const venueBase = `/venues/${input.venueSlug}`;
  const eventBase = `${venueBase}/events/${input.eventId}`;

  return {
    eventRoute: eventBase,
    ticketBuyRoute: `${eventBase}/tickets`,
    ticketPrintRoute: `${eventBase}/tickets/print`,
    venueRoute: venueBase,
    promoteEventRoute: `${eventBase}/promote`,
    articlePlacementRoute: `/articles/events/${input.eventId}`,
    magazinePlacementRoute: `/magazine/events/${input.eventId}`,
    boostDashboardRoute: input.campaignId
      ? `${venueBase}/boost/${input.campaignId}`
      : `${venueBase}/boost`,
  };
}

export function buildVenueBoostRoutes(input: {
  venueSlug: string;
  eventId: string;
  boostTier?: string;
}): VenueBoostRoutes {
  const base = `/venues/${input.venueSlug}`;

  return {
    boostSignupRoute: input.boostTier
      ? `${base}/boost/new?event=${input.eventId}&tier=${input.boostTier}`
      : `${base}/boost/new?event=${input.eventId}`,
    boostCheckoutRoute: `${base}/boost/checkout?event=${input.eventId}`,
    boostDashboardRoute: `${base}/boost`,
    campaignRoute: `${base}/boost/campaigns`,
  };
}

export function buildTicketBuyRoute(venueSlug: string, eventId: string, refArtistSlug?: string): string {
  const base = `/venues/${venueSlug}/events/${eventId}/tickets`;
  return refArtistSlug ? `${base}?ref=${refArtistSlug}` : base;
}

export function buildEventMagazineRoute(eventId: string): string {
  return `/magazine/events/${eventId}`;
}

export function buildEventArticleRoute(eventId: string): string {
  return `/articles/events/${eventId}`;
}

export function buildVenueProfileRoute(venueSlug: string): string {
  return `/venues/${venueSlug}`;
}

export function buildLiveEventPromoRoute(eventId: string): string {
  return `/live/events/${eventId}`;
}
