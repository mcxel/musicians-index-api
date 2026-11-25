/**
 * Commercial capability gate — Phase 2B.1
 *
 * Fan and Performer are not business-cockpit accounts.
 * Campaign mutation follows the role matrix: Advertiser, Sponsor, Promoter,
 * plus Admin/Staff oversight. A UI label is not a role.
 */

export const BUSINESS_ACCOUNT_ROLES = ["PROMOTER", "VENUE", "ADVERTISER", "SPONSOR"] as const;

export type BusinessAccountRole = (typeof BUSINESS_ACCOUNT_ROLES)[number];

export const CAMPAIGN_AUTHORITY_ROLES = ["ADVERTISER", "SPONSOR", "PROMOTER", "ADMIN", "STAFF"] as const;

const BUSINESS_HUB_SEGMENTS = new Set(["promoter", "venue", "advertiser", "sponsor"]);

export function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

export function isBusinessAccountRole(role: string): role is BusinessAccountRole {
  return (BUSINESS_ACCOUNT_ROLES as readonly string[]).includes(normalizeRole(role));
}

export function isFanOrPerformerBaseline(role: string): boolean {
  const normalized = normalizeRole(role);
  return normalized === "FAN" || normalized === "PERFORMER" || normalized === "ARTIST" || normalized === "BAND" || normalized === "USER" || normalized === "MEMBER";
}

export function businessWorkspaceEligible(roles: readonly string[]): boolean {
  return roles.some((role) => isBusinessAccountRole(role));
}

export function campaignAuthorityAllowed(roles: readonly string[]): boolean {
  const allowed = CAMPAIGN_AUTHORITY_ROLES as readonly string[];
  return roles.some((role) => allowed.includes(normalizeRole(role)));
}

export function parseRoleCookies(single: string | undefined, multiJson: string | undefined): string[] {
  const roles = new Set<string>();
  if (single?.trim()) roles.add(normalizeRole(single));
  if (multiJson) {
    try {
      const parsed = JSON.parse(multiJson) as unknown;
      if (Array.isArray(parsed)) {
        for (const role of parsed) {
          if (typeof role === "string" && role.trim()) roles.add(normalizeRole(role));
        }
      }
    } catch {
      /* malformed multi-role cookie does not grant access */
    }
  }
  return [...roles];
}

/** Business hubs require a session. Fan and Performer hubs are unchanged here. */
export function businessHubRequiresAuthentication(hubSegment: string): boolean {
  return BUSINESS_HUB_SEGMENTS.has(hubSegment.toLowerCase());
}

export type BusinessCapabilityId =
  | "ARTIST_DISCOVERY"
  | "BOOKING"
  | "VENUE_PROFILE"
  | "EVENTS"
  | "TICKETING"
  | "BOX_OFFICE"
  | "AD_CAMPAIGNS"
  | "AD_ANALYTICS"
  | "MESSAGING"
  | "SPONSORSHIP"
  | "CROWD_DRAW_SCORE"
  | "DIGITAL_RIDER"
  | "STAGE_CAPACITY_SIMULATOR"
  | "APPLE_WALLET"
  | "GOOGLE_WALLET"
  | "LEGAL_FIRE_CAPACITY"
  | "CAMPAIGN_PACING"
  | "VIEWABILITY_HEATMAP"
  | "CONVERSION_LEDGER"
  | "TERRITORY_MAP";

export type BusinessCapabilityDecision = "ALLOWED" | "PARTIAL" | "DENIED" | "NOT_CONNECTED";

type CapabilityRule = {
  provenRoles: readonly BusinessAccountRole[];
  partialRoles: readonly BusinessAccountRole[];
  connected: boolean;
};

const NOT_CONNECTED_CAPABILITIES = new Set<BusinessCapabilityId>([
  "CROWD_DRAW_SCORE",
  "DIGITAL_RIDER",
  "STAGE_CAPACITY_SIMULATOR",
  "APPLE_WALLET",
  "GOOGLE_WALLET",
  "LEGAL_FIRE_CAPACITY",
  "CAMPAIGN_PACING",
  "VIEWABILITY_HEATMAP",
  "CONVERSION_LEDGER",
  "TERRITORY_MAP",
]);

const CAPABILITY_RULES: Record<BusinessCapabilityId, CapabilityRule> = {
  ARTIST_DISCOVERY: { connected: true, provenRoles: [], partialRoles: BUSINESS_ACCOUNT_ROLES },
  BOOKING: { connected: true, provenRoles: ["VENUE"], partialRoles: ["PROMOTER"] },
  VENUE_PROFILE: { connected: true, provenRoles: ["VENUE"], partialRoles: [] },
  EVENTS: { connected: true, provenRoles: [], partialRoles: ["VENUE", "PROMOTER"] },
  TICKETING: { connected: true, provenRoles: [], partialRoles: ["VENUE", "PROMOTER"] },
  BOX_OFFICE: { connected: true, provenRoles: [], partialRoles: ["VENUE", "PROMOTER"] },
  AD_CAMPAIGNS: { connected: true, provenRoles: [], partialRoles: ["ADVERTISER", "SPONSOR", "PROMOTER"] },
  AD_ANALYTICS: { connected: true, provenRoles: [], partialRoles: ["ADVERTISER", "SPONSOR"] },
  MESSAGING: { connected: true, provenRoles: [], partialRoles: BUSINESS_ACCOUNT_ROLES },
  SPONSORSHIP: { connected: true, provenRoles: [], partialRoles: ["SPONSOR"] },
  CROWD_DRAW_SCORE: { connected: false, provenRoles: [], partialRoles: [] },
  DIGITAL_RIDER: { connected: false, provenRoles: [], partialRoles: [] },
  STAGE_CAPACITY_SIMULATOR: { connected: false, provenRoles: [], partialRoles: [] },
  APPLE_WALLET: { connected: false, provenRoles: [], partialRoles: [] },
  GOOGLE_WALLET: { connected: false, provenRoles: [], partialRoles: [] },
  LEGAL_FIRE_CAPACITY: { connected: false, provenRoles: [], partialRoles: [] },
  CAMPAIGN_PACING: { connected: false, provenRoles: [], partialRoles: [] },
  VIEWABILITY_HEATMAP: { connected: false, provenRoles: [], partialRoles: [] },
  CONVERSION_LEDGER: { connected: false, provenRoles: [], partialRoles: [] },
  TERRITORY_MAP: { connected: false, provenRoles: [], partialRoles: [] },
};

export function isBusinessCapabilityId(value: string): value is BusinessCapabilityId {
  return Object.prototype.hasOwnProperty.call(CAPABILITY_RULES, value);
}

/**
 * Authenticated active role decides the command.
 * A painted UI label does not. Missing authorities stay NOT_CONNECTED.
 * PARTIAL means the data exists and the finished cockpit command does not.
 */
export function authorizeBusinessCapability(input: {
  authenticated: boolean;
  roles: readonly string[];
  capability: string;
}): BusinessCapabilityDecision {
  if (!isBusinessCapabilityId(input.capability) || NOT_CONNECTED_CAPABILITIES.has(input.capability)) {
    return "NOT_CONNECTED";
  }
  if (!input.authenticated) return "DENIED";
  const roles = input.roles.map(normalizeRole);
  if (roles.length === 0 || roles.every((role) => isFanOrPerformerBaseline(role))) return "DENIED";
  const rule = CAPABILITY_RULES[input.capability];
  if (!rule.connected) return "NOT_CONNECTED";
  if (roles.some((role) => (rule.provenRoles as readonly string[]).includes(role))) return "ALLOWED";
  if (roles.some((role) => (rule.partialRoles as readonly string[]).includes(role))) return "PARTIAL";
  return "DENIED";
}
