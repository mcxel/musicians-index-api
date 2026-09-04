/**
 * Authoritative Season Pass catalog (TMI-owned).
 * Prices are sourced from STRIPE_PRODUCTS — display amount MUST match checkout.
 * Always present offers sorted by priceCents ASC unless a campaign override is passed.
 */

import { STRIPE_PRODUCTS, type StripeProductKey } from "@/lib/stripe/products";

export type SeasonPassId =
  | "starter"
  | "plus"
  | "fan"
  | "artist"
  | "bundle"
  | "vip";

export type SeasonPassOffer = {
  id: SeasonPassId;
  productKey: StripeProductKey;
  label: string;
  shortLabel: string;
  description: string;
  priceCents: number;
  priceDisplay: string;
  priceId: string;
  color: string;
  icon: string;
  perks: string[];
  /** Highlight as entry / recommended without reordering (still ASC by price). */
  entry?: boolean;
  popular?: boolean;
  available: boolean;
};

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fromProduct(
  id: SeasonPassId,
  productKey: StripeProductKey,
  meta: Omit<SeasonPassOffer, "id" | "productKey" | "priceCents" | "priceDisplay" | "priceId" | "label"> & {
    label?: string;
  },
): SeasonPassOffer {
  const product = STRIPE_PRODUCTS[productKey];
  const priceCents = product.price;
  return {
    id,
    productKey,
    label: meta.label ?? product.name,
    shortLabel: meta.shortLabel,
    description: meta.description,
    priceCents,
    priceDisplay: centsToDisplay(priceCents),
    priceId: product.priceId,
    color: meta.color,
    icon: meta.icon,
    perks: meta.perks,
    entry: meta.entry,
    popular: meta.popular,
    available: meta.available,
  };
}

/** Canonical season-pass offers — single source for UI + checkout amounts. */
const SEASON_PASS_OFFERS: SeasonPassOffer[] = [
  fromProduct("starter", "SEASON_PASS_STARTER", {
    shortLabel: "Starter Season Pass",
    description: "Low-cost way to join Season 1 — badge + bonus points.",
    color: "#00FF88",
    icon: "🎟️",
    entry: true,
    available: true,
    perks: [
      "Season Pass badge on profile",
      "Entry to season XP track",
      "Bonus TMI points on purchase",
      "Community giveaway entries × 1",
    ],
  }),
  fromProduct("plus", "SEASON_PASS_PLUS", {
    shortLabel: "Plus Season Pass",
    description: "More rewards and early room access for the season.",
    color: "#00FFFF",
    icon: "✨",
    available: true,
    perks: [
      "Everything in Starter",
      "Early room access (15 min)",
      "Plus emote pack",
      "Bonus TMI points on purchase",
    ],
  }),
  fromProduct("fan", "SEASON_PASS_FAN", {
    shortLabel: "Fan Season Pass",
    description: "Full fan track — cosmetics, emotes, and priority seating.",
    color: "#00FFFF",
    icon: "🎧",
    popular: true,
    available: true,
    perks: [
      "All Fan track rewards as you earn XP",
      "Season 1 exclusive avatar items",
      "Priority seating in live rooms",
      "Season Pass badge on profile",
    ],
  }),
  fromProduct("artist", "SEASON_PASS_ARTIST", {
    shortLabel: "Artist Season Pass",
    description: "Artist career track — promos, bandwidth, magazine eligibility.",
    color: "#FF2DAA",
    icon: "🎸",
    available: true,
    perks: [
      "All Artist track rewards as you earn XP",
      "HD WebRTC bandwidth upgrade keys",
      "Live World billboard promo slots",
      "Monthly Magazine feature eligibility",
    ],
  }),
  fromProduct("bundle", "SEASON_PASS_BUNDLE", {
    shortLabel: "Full Bundle",
    description: "Every reward on both Fan and Artist tracks.",
    color: "#AA2DFF",
    icon: "🎁",
    available: true,
    perks: [
      "All Fan + Artist track rewards",
      "Exclusive Bundle badge",
      "Priority support channel",
      "Early access to next season",
    ],
  }),
  fromProduct("vip", "SEASON_PASS_VIP", {
    shortLabel: "VIP Season Pass",
    description: "Maximum season access — VIP rooms, credits, and champion perks.",
    color: "#FFD700",
    icon: "💎",
    available: true,
    perks: [
      "Everything in Full Bundle",
      "Private VIP rooms access",
      "Season Champion badge eligibility",
      "Priority admin support",
    ],
  }),
];

export type ListSeasonPassOptions = {
  /** Include unavailable offers in-place (ASC preserved). Default false = skip unavailable. */
  includeUnavailable?: boolean;
  /** Optional campaign override — when set, returns this list as-is (no ASC re-sort). */
  campaignOverride?: SeasonPassOffer[];
};

/**
 * Visible season-pass offers sorted by priceCents ASC.
 * Unavailable tiers are skipped by default (remaining stay ASC — never jump to VIP first).
 * Pass includeUnavailable: true to keep sold-out cards in place without reordering.
 */
export function listSeasonPassOffers(opts: ListSeasonPassOptions = {}): SeasonPassOffer[] {
  if (opts.campaignOverride?.length) {
    return opts.campaignOverride;
  }
  const pool = opts.includeUnavailable
    ? [...SEASON_PASS_OFFERS]
    : SEASON_PASS_OFFERS.filter((o) => o.available);
  return pool.sort((a, b) => a.priceCents - b.priceCents);
}

export function getSeasonPassOffer(id: string): SeasonPassOffer | undefined {
  return SEASON_PASS_OFFERS.find((o) => o.id === id);
}

/** Map passType → checkout cents (authoritative). */
export function seasonPassAmountCents(passType: string): number {
  const offer = getSeasonPassOffer(passType);
  if (offer) return offer.priceCents;
  return STRIPE_PRODUCTS.SEASON_PASS_FAN.price;
}

/** Checkout href that charges the same cents shown in UI. */
export function seasonPassCheckoutHref(offer: SeasonPassOffer): string {
  const params = new URLSearchParams({
    priceId: offer.priceId,
    amount: String(offer.priceCents),
    productName: offer.label,
    mode: "payment",
    passType: offer.id,
    type: "season_pass",
  });
  return `/api/stripe/checkout?${params.toString()}`;
}
