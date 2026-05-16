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
  return [
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
}
