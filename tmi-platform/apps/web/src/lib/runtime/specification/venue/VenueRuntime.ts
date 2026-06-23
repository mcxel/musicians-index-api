import type { VenueRenderer } from "./VenueRenderer";
import type { SeatAssignmentEngine } from "./SeatAssignmentEngine";
import type { VenueTicketEngine } from "./TicketEngine";
import type { AudienceRouting } from "./AudienceRouting";

export interface VenueRuntime {
  renderer: VenueRenderer;
  seats: SeatAssignmentEngine;
  tickets: VenueTicketEngine;
  audienceRouting: AudienceRouting;
}
