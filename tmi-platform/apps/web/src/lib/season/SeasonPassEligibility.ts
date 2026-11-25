/**
 * Season Pass eligibility — Fan + Performer only.
 * Owner law §§8955–8964 / §§8979 / §§8986.
 * Does not create a second catalog or checkout engine.
 */

export const SEASON_PASS_ELIGIBLE_ROLES = ["FAN", "PERFORMER", "ARTIST"] as const;
export const SEASON_PASS_EXCLUDED_ROLES = [
  "SPONSOR",
  "ADVERTISER",
  "BUSINESS",
  "VENUE",
  "PROMOTER",
] as const;
export const SEASON_PASS_EXCLUDED_OFFER_IDS = [
  "sponsor",
  "business",
  "venue",
  "promoter",
  "advertiser",
] as const;
/** Pricing guitar section shows only these two role tracks. */
export const PRICING_SEASON_PASS_OFFER_IDS = ["fan", "artist"] as const;

export type SeasonPassEligibleRole = (typeof SEASON_PASS_ELIGIBLE_ROLES)[number];
export type SeasonPassPricingRole = "fan" | "performer";

function normalizeRole(role: string | null | undefined): string {
  return String(role ?? "").trim().toUpperCase();
}

function normalizeOfferId(id: string | null | undefined): string {
  return String(id ?? "").trim().toLowerCase();
}

export function isSeasonPassAccountRoleEligible(role: string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return true;
  if ((SEASON_PASS_EXCLUDED_ROLES as readonly string[]).includes(normalized)) return false;
  return (SEASON_PASS_ELIGIBLE_ROLES as readonly string[]).includes(normalized);
}

export function isExcludedSeasonPassOfferId(id: string | null | undefined): boolean {
  return (SEASON_PASS_EXCLUDED_OFFER_IDS as readonly string[]).includes(normalizeOfferId(id));
}

export function isPricingSeasonPassOfferId(id: string | null | undefined): boolean {
  return (PRICING_SEASON_PASS_OFFER_IDS as readonly string[]).includes(normalizeOfferId(id));
}

export function seasonPassRoleForOfferId(id: string): SeasonPassPricingRole | null {
  const normalized = normalizeOfferId(id);
  if (normalized === "fan") return "fan";
  if (normalized === "artist") return "performer";
  return null;
}

export function canAccountPurchaseSeasonPassOffer(
  role: string | null | undefined,
  offerId: string,
): boolean {
  if (isExcludedSeasonPassOfferId(offerId)) return false;
  if (!isSeasonPassAccountRoleEligible(role)) return false;
  const normalized = normalizeRole(role);
  if (!normalized) return isPricingSeasonPassOfferId(offerId);
  const offerRole = seasonPassRoleForOfferId(offerId);
  if (!offerRole) return !isExcludedSeasonPassOfferId(offerId);
  if (normalized === "FAN") return offerRole === "fan";
  if (normalized === "PERFORMER" || normalized === "ARTIST") return offerRole === "performer";
  return false;
}
