/**
 * Client-safe venue/promoter capability labels + pure role routing helpers.
 * Durable profile get/save lives in VenueProfessionalCapabilities.ts (server-only).
 */

export type VenueProfessionalCapability = "VENUE_OPERATOR" | "PROMOTER";

export const VENUE_PROFESSIONAL_LABELS: Record<VenueProfessionalCapability, string> = {
  VENUE_OPERATOR: "Operate a venue (space, capacity, ticketing)",
  PROMOTER: "Promote & sell events (shows, tours, ticket sales)",
};

export type VenueProfessionalProfile = {
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  capacity?: string;
  venueType?: string;
  ticketingSales?: string;
  eventSchedule?: string;
  bookingContact?: string;
  payoutPreference?: string;
  /** Promoter-only fields when PROMOTER capability selected */
  promoterCompany?: string;
  promoterFocus?: string;
  capabilities: VenueProfessionalCapability[];
  updatedAt?: string;
};

export function rolesFromVenueCapabilities(
  capabilities: VenueProfessionalCapability[],
): ("VENUE" | "PROMOTER")[] {
  const roles = new Set<"VENUE" | "PROMOTER">();
  if (capabilities.includes("VENUE_OPERATOR")) roles.add("VENUE");
  if (capabilities.includes("PROMOTER")) roles.add("PROMOTER");
  if (roles.size === 0) roles.add("VENUE");
  return [...roles];
}

export function primaryVenueHubRoute(capabilities: VenueProfessionalCapability[]): string {
  if (capabilities.includes("VENUE_OPERATOR")) return "/hub/venue";
  return "/hub/promoter";
}
