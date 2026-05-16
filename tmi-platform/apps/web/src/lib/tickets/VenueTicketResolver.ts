type VenueTicketProfile = {
  venueSlug: string;
  venueName: string;
  city: string;
  state: string;
  capacity: number;
  primaryGenres: string[];
  eventPrefix: string;
};

const VENUE_TICKET_PROFILES: VenueTicketProfile[] = [
  {
    venueSlug: "the-underground",
    venueName: "The Underground",
    city: "Houston",
    state: "TX",
    capacity: 480,
    primaryGenres: ["Hip-Hop", "R&B", "Trap", "Soul"],
    eventPrefix: "underground-live",
  },
  {
    venueSlug: "jakarta-arena",
    venueName: "Jakarta Arena",
    city: "Jakarta",
    state: "ID",
    capacity: 12000,
    primaryGenres: ["Electronic", "Pop", "Rock", "Metal"],
    eventPrefix: "jakarta-mainstage",
  },
  {
    venueSlug: "test-venue",
    venueName: "TMI Test Venue",
    city: "Austin",
    state: "TX",
    capacity: 120,
    primaryGenres: ["Country", "Jazz"],
    eventPrefix: "tmi-test",
  },
];

export type VenueTicketTarget = {
  venueSlug: string;
  venueName: string;
  city: string;
  state: string;
  capacity: number;
  eventId: string;
  route: string;       // buy route: /venues/:slug/tickets
  printRoute: string;  // print preview: /venues/:slug/tickets/:eventId/print
  eventRoute: string;  // event detail: /events/:eventId
  venueRoute: string;  // venue page: /venues/:slug
};

function slugifyPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveVenueProfileByGenre(genre: string): VenueTicketProfile {
  const normalized = genre.trim().toLowerCase();
  const exact = VENUE_TICKET_PROFILES.find((profile) =>
    profile.primaryGenres.some((g) => g.toLowerCase() === normalized),
  );
  return exact ?? VENUE_TICKET_PROFILES[0] ?? VENUE_TICKET_PROFILES[2]!;
}

export function resolveVenueTicketTarget(args: {
  genre: string;
  roomTitle?: string;
  slotIndex?: number;
}): VenueTicketTarget {
  const { genre, roomTitle = "main-room", slotIndex = 0 } = args;
  const profile = resolveVenueProfileByGenre(genre);

  const roomPart = slugifyPart(roomTitle);
  const eventId = `${profile.eventPrefix}-${roomPart}-${slotIndex + 1}`;

  return {
    venueSlug: profile.venueSlug,
    venueName: profile.venueName,
    city: profile.city,
    state: profile.state,
    capacity: profile.capacity,
    eventId,
    route: `/venues/${profile.venueSlug}/tickets`,
    printRoute: `/venues/${profile.venueSlug}/tickets/${eventId}/print`,
    eventRoute: `/events/${eventId}`,
    venueRoute: `/venues/${profile.venueSlug}`,
  };
}

export function resolveVenueProfileBySlug(slug: string): VenueTicketProfile | undefined {
  return VENUE_TICKET_PROFILES.find((p) => p.venueSlug === slug);
}

export function getAllVenueProfiles(): VenueTicketProfile[] {
  return VENUE_TICKET_PROFILES;
}
