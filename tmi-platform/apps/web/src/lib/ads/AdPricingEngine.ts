// Ad placement pricing — cheap to encourage volume, tiered by position quality.
// Free member pages carry MORE ad slots (monetizes free usage).
// Paid tiers carry FEWER ads (reward for paying).

export type AdPlacement =
  | "free-member-profile"
  | "RUBY-silver-profile"
  | "gold-plus-profile"
  | "homepage-ticker"
  | "homepage-rail"
  | "homepage-hero"
  | "magazine-strip"
  | "magazine-half-page"
  | "magazine-full-page"
  | "magazine-cover-wrap"
  | "game-show-sponsor"
  | "battle-cypher-sponsor"
  | "lobby-sidebar"
  | "event-banner";

export type AdDuration = "day" | "week" | "month";

// All prices in USD cents
export const AD_PRICES: Record<AdPlacement, Record<AdDuration, number>> = {
  // Free profiles — 6 slots each, highest inventory, cheapest CPM
  "free-member-profile":      { day:   99, week:   499, month:  1499 },
  // RUBY/Silver profiles — 3 slots each
  "RUBY-silver-profile":    { day:  199, week:  1199, month:  2999 },
  // Gold+ profiles — 1 slot, premium audience
  "gold-plus-profile":        { day:  299, week:  1799, month:  4499 },
  // Homepage placements
  "homepage-ticker":          { day:  299, week:  1499, month:  3999 },
  "homepage-rail":            { day:  499, week:  2499, month:  6999 },
  "homepage-hero":            { day:  999, week:  4999, month: 14999 },
  // Magazine — premium real estate
  "magazine-strip":           { day:  499, week:  2499, month:  5999 },
  "magazine-half-page":       { day: 1499, week:  7499, month: 19999 },
  "magazine-full-page":       { day: 2499, week: 12499, month: 34999 },
  "magazine-cover-wrap":      { day: 4999, week: 24999, month: 69999 },
  // Competition sponsor slots
  "game-show-sponsor":        { day: 1999, week:  9999, month: 27999 },
  "battle-cypher-sponsor":    { day: 1499, week:  7499, month: 19999 },
  // Utility slots
  "lobby-sidebar":            { day:  299, week:  1499, month:  3999 },
  "event-banner":             { day:  999, week:  4999, month: 12999 },
};

// How many ad slots appear on each member tier's profile page
export const MEMBER_AD_SLOT_COUNT: Record<string, number> = {
  free:     6,
  pro:      4,
  RUBY:   3,
  silver:   2,
  gold:     1,
  platinum: 1,
  diamond:  0,
};

// Which placement applies to a given member tier's profile
export function profileAdPlacement(tier: string): AdPlacement {
  if (tier === "gold" || tier === "platinum" || tier === "diamond") return "gold-plus-profile";
  if (tier === "RUBY" || tier === "silver") return "RUBY-silver-profile";
  return "free-member-profile";
}

export function formatAdPrice(placement: AdPlacement, duration: AdDuration): string {
  const cents = AD_PRICES[placement][duration];
  return `$${(cents / 100).toFixed(2)}`;
}

export function getAdSlotCount(memberTier: string): number {
  return MEMBER_AD_SLOT_COUNT[memberTier] ?? 6;
}
