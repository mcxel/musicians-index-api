import type { TmiBookingStatus } from "./tmiVenueBookingMatchEngine";

export type TmiTicketRuntimeEntry = {
  id: string;
  eventId: string;
  eventName: string;
  venueId: string;
  status: TmiBookingStatus;
  route: string;
  backRoute: string;
  reason?: string;
  sponsorPrizeHook?: string;
  advertiserPrizeHook?: string;
};

export function listTicketRuntimeEntries(): TmiTicketRuntimeEntry[] {
  return [
    {
      id: "ticket-neon-finals",
      eventId: "event-neon-finals",
      eventName: "Neon Finals",
      venueId: "neon-dome",
      status: "ACTIVE",
      route: "/tickets?event=event-neon-finals&venue=neon-dome",
      backRoute: "/bookings",
      reason: "Ticketing open",
      sponsorPrizeHook: "sponsor:neon-energy-pack",
    },
    {
      id: "ticket-luna-night",
      eventId: "event-luna-night",
      eventName: "Luna Showcase Night",
      venueId: "luna-hall",
      status: "NEEDS_SETUP",
      route: "/tickets?event=event-luna-night&venue=luna-hall",
      backRoute: "/bookings",
      reason: "Seat map tiering pending",
      advertiserPrizeHook: "advertiser:partner-merch-voucher",
    },
  ];
}
