// lib/stripe/regionalPricing.ts — Purchasing Power Parity pricing for TMI
//
// 3 regions:
//   TIER_1 — full price (US, UK, Canada, Australia, Western Europe, Gulf)
//   TIER_2 — 65% price (Mexico, Brazil, Eastern Europe, South Africa, SE Asia)
//   TIER_3 — 40% price (Sub-Saharan Africa, South Asia, Indonesia, Philippines)
//
// To activate regional price IDs on Stripe, set ENV vars:
//   STRIPE_PRICE_FAN_TIER_2     (Fan Pro monthly at 65%)
//   STRIPE_PRICE_ARTIST_TIER_2  (Artist Pro monthly at 65%)
//   STRIPE_PRICE_VIP_TIER_2     (Diamond VIP monthly at 65%)
//   STRIPE_PRICE_FAN_TIER_3     (Fan Pro monthly at 40%)
//   STRIPE_PRICE_ARTIST_TIER_3  (Artist Pro monthly at 40%)
//   STRIPE_PRICE_VIP_TIER_3     (Diamond VIP monthly at 40%)
// Until set, checkout falls back to the Tier 1 (full-price) Stripe price ID.

export type PricingRegion = 'TIER_1' | 'TIER_2' | 'TIER_3';

// Country → pricing region
const REGION_MAP: Record<string, PricingRegion> = {
  // TIER_1 — full price
  US: 'TIER_1', GB: 'TIER_1', CA: 'TIER_1', AU: 'TIER_1',
  DE: 'TIER_1', FR: 'TIER_1', NL: 'TIER_1', SE: 'TIER_1',
  NO: 'TIER_1', DK: 'TIER_1', FI: 'TIER_1', CH: 'TIER_1',
  AT: 'TIER_1', IE: 'TIER_1', NZ: 'TIER_1', SG: 'TIER_1',
  JP: 'TIER_1', KR: 'TIER_1', IL: 'TIER_1', AE: 'TIER_1',
  QA: 'TIER_1', KW: 'TIER_1', SA: 'TIER_1', BE: 'TIER_1',
  IT: 'TIER_1', ES: 'TIER_1', PT: 'TIER_1',

  // TIER_2 — 65% price
  MX: 'TIER_2', BR: 'TIER_2', AR: 'TIER_2', CL: 'TIER_2',
  CO: 'TIER_2', PE: 'TIER_2', UY: 'TIER_2',
  PL: 'TIER_2', RO: 'TIER_2', HU: 'TIER_2', CZ: 'TIER_2',
  SK: 'TIER_2', BG: 'TIER_2', HR: 'TIER_2', RS: 'TIER_2',
  TR: 'TIER_2', ZA: 'TIER_2', MA: 'TIER_2', TN: 'TIER_2',
  EG: 'TIER_2', TH: 'TIER_2', MY: 'TIER_2', VN: 'TIER_2',
  CN: 'TIER_2', RU: 'TIER_2', UA: 'TIER_2',

  // Everything else falls to TIER_3 via the default in getRegion()
};

export const PRICE_MULTIPLIERS: Record<PricingRegion, number> = {
  TIER_1: 1.0,
  TIER_2: 0.65,
  TIER_3: 0.40,
};

export const REGION_BADGE: Record<PricingRegion, string | null> = {
  TIER_1: null,
  TIER_2: '🌍 Local pricing applied for your region',
  TIER_3: '🌍 Local pricing applied for your region',
};

export function getRegion(country: string | null | undefined): PricingRegion {
  if (!country) return 'TIER_1';
  return REGION_MAP[country.toUpperCase()] ?? 'TIER_3';
}

export function applyRegion(baseCents: number, region: PricingRegion): number {
  return Math.max(99, Math.round(baseCents * PRICE_MULTIPLIERS[region]));
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export type RegionalProductKey = 'FAN' | 'ARTIST' | 'VIP';

// Returns the correct Stripe price ID for the given product + region.
// Falls back to the Tier 1 price ID until regional IDs are set in ENV.
export function getRegionalPriceId(
  tier1PriceId: string,
  productKey: RegionalProductKey,
  region: PricingRegion,
): string {
  if (region === 'TIER_1') return tier1PriceId;
  const envKey = `STRIPE_PRICE_${productKey}_${region}`;
  return process.env[envKey] ?? tier1PriceId;
}

// Full regional subscription pricing table
// Used by the pricing page and any server-side checkout logic
export const SUBSCRIPTION_TIERS = [
  {
    key: 'FAN' as RegionalProductKey,
    name: 'FAN',
    icon: '🎧',
    color: '#00FFFF',
    basePriceCents: 999,
    tier1PriceId: process.env.STRIPE_PRICE_FAN_TIER_1 ?? 'price_fan_monthly',
    perks: ['Access all live rooms', 'Chat + reactions', 'Tip performers', 'Monthly magazine', 'XP + achievements'],
  },
  {
    key: 'ARTIST' as RegionalProductKey,
    name: 'ARTIST / PERFORMER',
    icon: '🎤',
    color: '#FF2DAA',
    basePriceCents: 1999,
    tier1PriceId: process.env.STRIPE_PRICE_ARTIST_TIER_1 ?? 'price_artist_monthly',
    perks: ['Go live anytime', 'Beat marketplace access', 'Fan club tools', 'Booking requests', 'Analytics dashboard', 'Everything in Fan'],
  },
  {
    key: 'VIP' as RegionalProductKey,
    name: 'DIAMOND VIP',
    icon: '💎',
    color: '#FFD700',
    basePriceCents: 4999,
    tier1PriceId: process.env.STRIPE_PRICE_VIP_TIER_1 ?? 'price_vip_monthly',
    perks: ['NFT minting rights', 'Unlimited beat uploads', 'Priority booking', 'Front-row seats', 'Gold avatar glow', 'Everything in Artist'],
  },
] as const;
