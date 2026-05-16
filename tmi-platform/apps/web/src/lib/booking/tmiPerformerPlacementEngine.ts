import type { TmiBookingStatus } from "./tmiVenueBookingMatchEngine";

export type TmiPerformerPlacement = {
  id: string;
  performerId: string;
  performerName: string;
  venueId: string;
  stageId: string;
  slot: string;
  status: TmiBookingStatus;
  route: string;
  backRoute: string;
  reason?: string;
};

export function listPerformerPlacements(): TmiPerformerPlacement[] {
  return [
    {
      id: "placement-aria-neon-main",
      performerId: "aria-volt",
      performerName: "Aria Volt",
      venueId: "neon-dome",
      stageId: "main",
      slot: "21:00",
      status: "ACTIVE",
      route: "/bookings/placements?performer=aria-volt&venue=neon-dome",
      backRoute: "/bookings",
      reason: "Main stage confirmed",
    },
    {
      id: "placement-kairo-luna-side",
      performerId: "kairo-rhythm",
      performerName: "Kairo Rhythm",
      venueId: "luna-hall",
      stageId: "side-a",
      slot: "20:00",
      status: "NEEDS_SETUP",
      route: "/bookings/placements?performer=kairo-rhythm&venue=luna-hall",
      backRoute: "/bookings",
      reason: "Audio line-check required",
    },
  ];
}
