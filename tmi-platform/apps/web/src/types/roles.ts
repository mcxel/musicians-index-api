/**
 * Centralized role type definitions for the TMI platform.
 * Use these everywhere role checks, guards, and routing are needed.
 */

export type TMIRole =
  | "FAN"
  | "PERFORMER"
  | "ARTIST"
  | "SPONSOR"
  | "ADVERTISER"
  | "VENUE"
  | "PROMOTER"
  | "WRITER"
  | "ADMIN"
  | "STAFF";

/** Lowercase version used in cookies and routing */
export type TMIRoleLower = Lowercase<TMIRole>;

export const ALL_ROLES: TMIRole[] = [
  "FAN", "PERFORMER", "ARTIST", "SPONSOR", "ADVERTISER", "VENUE", "PROMOTER", "WRITER", "ADMIN", "STAFF",
];

export const REVENUE_ROLES: TMIRole[] = ["SPONSOR", "ADVERTISER", "VENUE", "PROMOTER"];
export const CREATOR_ROLES: TMIRole[]  = ["PERFORMER", "ARTIST", "WRITER"];
export const ADMIN_ROLES: TMIRole[]    = ["ADMIN", "STAFF"];

/** Dashboard route for each role */
export const ROLE_DASHBOARD: Record<TMIRoleLower, string> = {
  fan:        "/dashboard/fan",
  performer:  "/dashboard/performer",
  artist:     "/dashboard/artist",
  sponsor:    "/dashboard/sponsor",
  advertiser: "/dashboard/advertiser",
  venue:      "/dashboard/venue",
  promoter:   "/dashboard/fan",
  writer:     "/dashboard/writer",
  admin:      "/admin",
  staff:      "/admin",
};

/** Hub route for each role */
export const ROLE_HUB: Record<TMIRoleLower, string> = {
  fan:        "/hub/fan",
  performer:  "/hub/performer",
  artist:     "/hub/artist",
  sponsor:    "/hub/sponsor",
  advertiser: "/hub/advertiser",
  venue:      "/hub/venue",
  promoter:   "/hub/fan",
  writer:     "/hub/writer",
  admin:      "/admin",
  staff:      "/admin",
};

/** Onboarding route for each role */
export const ROLE_ONBOARDING: Record<TMIRoleLower, string> = {
  fan:        "/onboarding/fan",
  performer:  "/onboarding/performer",
  artist:     "/onboarding/artist",
  sponsor:    "/onboarding/sponsor",
  advertiser: "/onboarding/advertiser",
  venue:      "/onboarding/venue",
  promoter:   "/onboarding/promoter",
  writer:     "/onboarding/performer",
  admin:      "/onboarding/admin",
  staff:      "/onboarding/admin",
};

/** Accent color for each role — matches TMI visual canon */
export const ROLE_COLOR: Record<TMIRoleLower, string> = {
  fan:        "#FF2DAA",
  performer:  "#AA2DFF",
  artist:     "#00FFFF",
  sponsor:    "#FFD700",
  advertiser: "#FFA500",
  venue:      "#00FF88",
  promoter:   "#00FF88",
  writer:     "#FF2DAA",
  admin:      "#94a3b8",
  staff:      "#94a3b8",
};

/** Icon for each role */
export const ROLE_ICON: Record<TMIRoleLower, string> = {
  fan:        "🎵",
  performer:  "🎭",
  artist:     "🎤",
  sponsor:    "🤝",
  advertiser: "📢",
  venue:      "🏟️",
  promoter:   "🎟️",
  writer:     "✏️",
  admin:      "⚙️",
  staff:      "🛠️",
};

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role.toUpperCase() as TMIRole);
}

export function isRevenueRole(role: string): boolean {
  return REVENUE_ROLES.includes(role.toUpperCase() as TMIRole);
}

export function isCreatorRole(role: string): boolean {
  return CREATOR_ROLES.includes(role.toUpperCase() as TMIRole);
}

export function roleToLower(role: string): TMIRoleLower {
  return role.toLowerCase() as TMIRoleLower;
}
