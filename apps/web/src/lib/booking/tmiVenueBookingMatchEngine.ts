export type TmiBookingStatus = "ACTIVE" | "LOCKED" | "NEEDS_SETUP";

export type TmiVenueBookingMatch = {
  id: string;
  venueId: string;
  venueName: string;
  performerId: string;
  performerName: string;
  genre: string;
  status: TmiBookingStatus;
  reason?: string;
  route: string;
  backRoute: string;
};

export function listVenueBookingMatches(): TmiVenueBookingMatch[] {
  // HONESTY QUARANTINE (2026-09-16): demo Neon Dome / Luna Hall / Rift Arena
  // matches must never appear as real booking opportunities on customer surfaces.
  // Legacy sample data retained below as comments for reference only — do not restore to UI.
  return [];
}

/** Legacy demo fixtures — NOT for product UI. Honesty cert asserts public surfaces ignore this. */
export const LEGACY_DEMO_VENUE_BOOKING_MATCHES_DO_NOT_SURFACE: TmiVenueBookingMatch[] = [
  {
    id: "match-neon-dome-aria-volt",
    venueId: "neon-dome",
    venueName: "Neon Dome",
    performerId: "aria-volt",
    performerName: "Aria Volt",
    genre: "Electro Pop",
    status: "ACTIVE",
    reason: "Audience fit and capacity match",
    route: "/venues?venue=neon-dome&performer=aria-volt",
    backRoute: "/bookings",
  },
  {
    id: "match-luna-hall-kairo",
    venueId: "luna-hall",
    venueName: "Luna Hall",
    performerId: "kairo-rhythm",
    performerName: "Kairo Rhythm",
    genre: "R&B",
    status: "NEEDS_SETUP",
    reason: "Ticket tiers not finalized",
    route: "/venues?venue=luna-hall&performer=kairo-rhythm",
    backRoute: "/bookings",
  },
  {
    id: "match-rift-arena-dj-zenith",
    venueId: "rift-arena",
    venueName: "Rift Arena",
    performerId: "dj-zenith",
    performerName: "DJ Zenith",
    genre: "EDM",
    status: "LOCKED",
    reason: "Venue blackout window",
    route: "/venues?venue=rift-arena&performer=dj-zenith",
    backRoute: "/bookings",
  },
];
