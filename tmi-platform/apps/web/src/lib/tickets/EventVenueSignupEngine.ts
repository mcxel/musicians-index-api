/**
 * EventVenueSignupEngine
 * Venue account registration and venue selection during event setup.
 */

export type VenueAccountType = "venue" | "organization";

export type EventVenueAccount = {
  venueId: string;
  accountType: VenueAccountType;
  venueName: string;
  venueSlug: string;
  city: string;
  region: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  capacity?: number;
  isNewVenue: boolean;
  createdAtMs: number;
};

const venueAccounts: EventVenueAccount[] = [];
let venueCounter = 0;

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createEventVenueAccount(input: {
  accountType: VenueAccountType;
  venueName: string;
  city: string;
  region: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  capacity?: number;
  isNewVenue?: boolean;
}): EventVenueAccount {
  const account: EventVenueAccount = {
    venueId: `evt-venue-${++venueCounter}`,
    accountType: input.accountType,
    venueName: input.venueName,
    venueSlug: toSlug(input.venueName),
    city: input.city,
    region: input.region,
    country: input.country,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    capacity: input.capacity,
    isNewVenue: input.isNewVenue ?? true,
    createdAtMs: Date.now(),
  };
  venueAccounts.unshift(account);
  return account;
}

export function selectExistingVenueForEvent(venueId: string): EventVenueAccount {
  const venue = venueAccounts.find((item) => item.venueId === venueId);
  if (!venue) throw new Error(`Venue ${venueId} not found`);
  return venue;
}

export function listEventVenues(filters?: {
  city?: string;
  region?: string;
  country?: string;
}): EventVenueAccount[] {
  return venueAccounts.filter((venue) => {
    if (filters?.city && venue.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters?.region && venue.region.toLowerCase() !== filters.region.toLowerCase()) return false;
    if (filters?.country && venue.country.toLowerCase() !== filters.country.toLowerCase()) return false;
    return true;
  });
}

export function getEventVenueBySlug(venueSlug: string): EventVenueAccount | null {
  return venueAccounts.find((venue) => venue.venueSlug === venueSlug) ?? null;
}
