import { listBookingRevenueEntries } from "./tmiBookingRevenueEngine";
import { listPerformerPlacements } from "./tmiPerformerPlacementEngine";
import { listTicketRuntimeEntries } from "./tmiTicketRuntimeEngine";
import { listVenueBookingMatches } from "./tmiVenueBookingMatchEngine";
import { listBookingMultiplierObjects, seedBookingFromTopMatch } from "./BookingDepartmentEngine";

export type TmiBookingRuntime = {
  matches: ReturnType<typeof listVenueBookingMatches>;
  tickets: ReturnType<typeof listTicketRuntimeEntries>;
  placements: ReturnType<typeof listPerformerPlacements>;
  revenue: ReturnType<typeof listBookingRevenueEntries>;
  multiplierObjects: ReturnType<typeof listBookingMultiplierObjects>;
  adminObservability: {
    route: string;
    backRoute: string;
    status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
    reason?: string;
  };
};

export function getBookingRuntime(): TmiBookingRuntime {
  if (listBookingMultiplierObjects().length === 0) {
    seedBookingFromTopMatch();
  }

  return {
    matches: listVenueBookingMatches(),
    tickets: listTicketRuntimeEntries(),
    placements: listPerformerPlacements(),
    revenue: listBookingRevenueEntries(),
    multiplierObjects: listBookingMultiplierObjects(),
    adminObservability: {
      route: "/admin/overseer?panel=booking-runtime",
      backRoute: "/bookings",
      status: "ACTIVE",
      reason: "Runtime snapshots available",
    },
  };
}
