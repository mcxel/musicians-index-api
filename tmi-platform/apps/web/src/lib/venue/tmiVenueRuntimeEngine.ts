import { buildVenueSeatingMap } from "./tmiVenueSeatEngine";
import { getVenueDanceFloorRuntime } from "./tmiVenueDanceFloorEngine";
import { getVenuePropRuntime } from "./tmiVenuePropEngine";
import { getVenueEnvironmentRuntime } from "./tmiVenueEnvironmentEngine";
import { getVenueLightingRuntime } from "./tmiVenueLightingEngine";

export type TmiVenueRuntimeStatus = "ACTIVE" | "LOCKED" | "NEEDS_SETUP";

export type TmiVenueRuntime = {
  venueId: string;
  venueName: string;
  route: string;
  backRoute: string;
  status: TmiVenueRuntimeStatus;
  reason?: string;
  seating: ReturnType<typeof buildVenueSeatingMap>;
  danceFloor: ReturnType<typeof getVenueDanceFloorRuntime>;
  props: ReturnType<typeof getVenuePropRuntime>;
  environment: ReturnType<typeof getVenueEnvironmentRuntime>;
  lighting: ReturnType<typeof getVenueLightingRuntime>;
};

export function getVenueRuntime(venueId = "neon-dome"): TmiVenueRuntime {
  return {
    venueId,
    venueName: "Neon Dome",
    route: "/venues",
    backRoute: "/home/5",
    status: "ACTIVE",
    seating: buildVenueSeatingMap(venueId),
    danceFloor: getVenueDanceFloorRuntime(venueId),
    props: getVenuePropRuntime(venueId),
    environment: getVenueEnvironmentRuntime(venueId),
    lighting: getVenueLightingRuntime(venueId),
  };
}
