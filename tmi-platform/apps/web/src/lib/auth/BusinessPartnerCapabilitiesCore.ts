/**
 * Client-safe business partner capability labels + pure role routing helpers.
 * Durable profile get/save lives in BusinessPartnerCapabilities.ts (server-only).
 */

export type BusinessPartnerCapability =
  | "ADVERTISER"
  | "SHOW_EVENT_SPONSOR"
  | "ARTIST_SPONSOR"
  | "PRODUCT_PRIZE_SPONSOR";

export const BUSINESS_PARTNER_CAPABILITY_LABELS: Record<BusinessPartnerCapability, string> = {
  ADVERTISER: "Run ad placements & media buys",
  SHOW_EVENT_SPONSOR: "Sponsor shows & official events (TV-style)",
  ARTIST_SPONSOR: "Sponsor performers (overlays & canisters)",
  PRODUCT_PRIZE_SPONSOR: "Sponsor products & prize pools",
};

export type BusinessPartnerProfile = {
  businessName: string;
  legalName?: string;
  username?: string;
  website?: string;
  category?: string;
  contactEmail?: string;
  region?: string;
  capabilities: BusinessPartnerCapability[];
  /** Conditional answers keyed by capability id */
  followUps?: Partial<Record<BusinessPartnerCapability, Record<string, string>>>;
  updatedAt?: string;
};

export function rolesFromBusinessCapabilities(
  capabilities: BusinessPartnerCapability[],
): ("SPONSOR" | "ADVERTISER")[] {
  const roles = new Set<"SPONSOR" | "ADVERTISER">();
  if (capabilities.includes("ADVERTISER")) roles.add("ADVERTISER");
  if (
    capabilities.some(
      (c) =>
        c === "SHOW_EVENT_SPONSOR" ||
        c === "ARTIST_SPONSOR" ||
        c === "PRODUCT_PRIZE_SPONSOR",
    )
  ) {
    roles.add("SPONSOR");
  }
  if (roles.size === 0) roles.add("SPONSOR");
  return [...roles];
}

export function primaryBusinessHubRoute(capabilities: BusinessPartnerCapability[]): string {
  const hasSponsor = capabilities.some((c) => c !== "ADVERTISER");
  if (hasSponsor && capabilities.includes("ADVERTISER")) return "/hub/sponsor";
  if (capabilities.includes("ADVERTISER")) return "/hub/advertiser";
  return "/hub/sponsor";
}
