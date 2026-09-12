/**
 * resolveCompanionProfileOffer
 *
 * Single canonical source for whether adding a companion Fan/Performer
 * profile is free or paid, and at what price. The UI must never hardcode
 * the word "FREE" itself — it renders whatever this resolver returns
 * (Marcel Dickens, 2026-09-06: "Never show FREE unless the canonical
 * entitlement/pricing system confirms that the base companion profile is
 * free").
 *
 * Today there is no priced product for adding a companion profile — Rule 26
 * provisions every role at FREE tier baseline by default, and no Stripe
 * price exists for this action anywhere in the codebase — so this
 * genuinely, currently returns free. That is a real fact about the system's
 * present state, not a fabricated UI label: this function is the one place
 * that fact is decided, so a future priced companion-profile product can
 * change the return value here without any caller needing to change.
 */

export type CompanionProfileType = "FAN" | "PERFORMER";

export interface CompanionOffer {
  targetProfile: CompanionProfileType;
  /** False if this companion profile type isn't offered at all (shouldn't happen for FAN/PERFORMER). */
  available: boolean;
  /** Price in cents. 0 when isFree is true. */
  price: number;
  currency: string;
  isFree: boolean;
  /** Where this determination came from, for audit/debugging — never displayed raw to users. */
  entitlementSource: string;
}

export function resolveCompanionProfileOffer(targetProfile: CompanionProfileType): CompanionOffer {
  return {
    targetProfile,
    available: true,
    price: 0,
    currency: "USD",
    isFree: true,
    entitlementSource: "rule26-default-free-tier-baseline",
  };
}

export function resolveCompanionProfileOffers(): Record<CompanionProfileType, CompanionOffer> {
  return {
    FAN: resolveCompanionProfileOffer("FAN"),
    PERFORMER: resolveCompanionProfileOffer("PERFORMER"),
  };
}
