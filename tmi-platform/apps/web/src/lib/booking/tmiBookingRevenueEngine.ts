import type { TmiBookingStatus } from "./tmiVenueBookingMatchEngine";

export type TmiBookingRevenueEntry = {
  id: string;
  eventId: string;
  venueId: string;
  gross: number;
  net: number;
  sponsorContribution: number;
  advertiserContribution: number;
  status: TmiBookingStatus;
  route: string;
  backRoute: string;
  reason?: string;
};

export function listBookingRevenueEntries(): TmiBookingRevenueEntry[] {
  return [
    {
      id: "rev-neon-finals",
      eventId: "event-neon-finals",
      venueId: "neon-dome",
      gross: 120000,
      net: 92000,
      sponsorContribution: 18000,
      advertiserContribution: 10000,
      status: "ACTIVE",
      route: "/admin/overseer?panel=revenue&event=event-neon-finals",
      backRoute: "/bookings",
      reason: "Revenue stream healthy",
    },
    {
      id: "rev-luna-night",
      eventId: "event-luna-night",
      venueId: "luna-hall",
      gross: 42000,
      net: 28000,
      sponsorContribution: 8000,
      advertiserContribution: 2000,
      status: "NEEDS_SETUP",
      route: "/admin/overseer?panel=revenue&event=event-luna-night",
      backRoute: "/bookings",
      reason: "Pending sponsor confirmations",
    },
  ];
}
