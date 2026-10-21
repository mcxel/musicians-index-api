/**
 * AE-1 shared account destinations.
 * One menu, role-specific profile routes only where a real page already exists.
 */

export const SHARED_ACCOUNT_CART = "/cart";
export const SHARED_ACCOUNT_BILLING = "/billing";
export const SHARED_ACCOUNT_SETTINGS = "/settings";

const PROFILE_BY_ROLE: Record<string, string> = {
  FAN: "/fan/profile",
  MEMBER: "/fan/profile",
  USER: "/fan/profile",
  PERFORMER: "/performer/profile",
  ARTIST: "/performer/profile",
  BAND: "/performer/profile",
  WRITER: "/writer/profile",
  PROMOTER: "/promoter/profile",
  VENUE: "/venue/profile",
  ADVERTISER: "/advertiser/profile",
  SPONSOR: "/sponsor/profile",
};

export function accountProfileTarget(role: string | null | undefined): string {
  const key = (role ?? "").trim().toUpperCase();
  return PROFILE_BY_ROLE[key] ?? "/settings/profile";
}

/**
 * A cart count is shown only when the persistent cart authority says this
 * session is authenticated and returns a finite count. Guests and failed
 * reads stay unavailable. A proven empty cart may be 0.
 */
export function presentCartCount(
  body: { authenticated?: boolean; itemCount?: unknown } | null | undefined,
): number | null {
  if (!body || body.authenticated !== true) return null;
  if (typeof body.itemCount !== "number" || !Number.isFinite(body.itemCount) || body.itemCount < 0) {
    return null;
  }
  return Math.floor(body.itemCount);
}
