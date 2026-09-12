/**
 * Route Ad Eligibility Resolver & AdSense Policy Guard.
 *
 * Rules:
 *   1. Protects interactive HUDs, checkout, auth, and private live control rooms from ad collision.
 *   2. Identifies public crawlable editorial pages eligible for AdSense serving & crawler indexing.
 *   3. Enforces AdSense policy compliance across mobile and desktop.
 */

export type RouteAdEligibilityCategory =
  | "PUBLIC_EDITORIAL"
  | "PUBLIC_DISCOVERY"
  | "ACCOUNT_FINANCE"
  | "INTERACTIVE_HUD"
  | "AUTH"
  | "PRIVATE_ROOM";

export interface RouteAdEligibilityStatus {
  pathname: string;
  eligible: boolean;
  category: RouteAdEligibilityCategory;
  reason: string;
}

const PROTECTED_PREFIXES = [
  "/checkout",
  "/billing",
  "/account/finance",
  "/account",
  "/settings",
  "/hub",
  "/dashboard",
  "/wallet",
  "/inventory",
  "/login",
  "/signup",
  "/password-reset",
  "/stage",
  "/rooms/monday-stage",
  "/rooms",
  "/live/rooms",
  "/live/room",
  "/arena",
  "/video/call",
  "/admin",
  "/administration",
  "/games",
  "/competitions",
  "/battles",
  "/cyphers",
];

const PUBLIC_EDITORIAL_PREFIXES = [
  "/",
  "/magazine",
  "/news",
  "/articles",
  "/shows",
  "/artists",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/disclosures",
  "/refund-policy",
];

export function resolveRouteAdEligibility(pathname: string): RouteAdEligibilityStatus {
  const normalized = pathname.toLowerCase();

  // 1. Check protected prefixes (No ads on checkout, auth, live controls, or admin)
  for (const prefix of PROTECTED_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      let category: RouteAdEligibilityCategory = "INTERACTIVE_HUD";
      if (prefix.includes("checkout") || prefix.includes("billing") || prefix.includes("finance")) {
        category = "ACCOUNT_FINANCE";
      } else if (prefix.includes("login") || prefix.includes("signup") || prefix.includes("password")) {
        category = "AUTH";
      } else if (prefix.includes("stage") || prefix.includes("room") || prefix.includes("call")) {
        category = "PRIVATE_ROOM";
      }
      return {
        pathname,
        eligible: false,
        category,
        reason: `AdSense disabled on ${category} route to prevent ad collisions and policy violations.`,
      };
    }
  }

  // 2. Check public editorial pages
  for (const prefix of PUBLIC_EDITORIAL_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return {
        pathname,
        eligible: true,
        category: "PUBLIC_EDITORIAL",
        reason: "Public crawlable editorial surface eligible for AdSense publisher units.",
      };
    }
  }

  // Default discovery routes
  return {
    pathname,
    eligible: true,
    category: "PUBLIC_DISCOVERY",
    reason: "Public discovery route eligible for AdSense publisher units.",
  };
}
