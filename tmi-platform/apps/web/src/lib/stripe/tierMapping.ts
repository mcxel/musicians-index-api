import type { UserTier } from '@/lib/auth/UserStore';
import { STRIPE_PRODUCTS, SUBSCRIPTION_TIER_ORDER, SUBSCRIPTION_TIER_PRODUCT_KEYS } from './products';

// Map Stripe price IDs → platform tier. Single source of truth — both the
// webhook (real grant path) and the payment-success activation check
// (verification path) must resolve a given Stripe price ID to the exact same
// tier, or a paying customer could be under/over-granted depending on which
// code path runs first.
//
// The FAN/PERFORMER PRO-through-DIAMOND ladder below is generated from
// products.ts's SUBSCRIPTION_TIER_PRODUCT_KEYS (which itself reads the real
// env-var price IDs) rather than duplicating those env var reads a second
// time here — that duplication is exactly what let the PRO/RUBY pricing drift
// happen in the first place (Lane A A5, 2026-09-01). FREE and non-ladder
// products (sponsor/venue/promoter/advertiser) aren't part of that ladder and
// stay listed explicitly below.
const TIER_LADDER: Record<string, UserTier> = {};
for (const accountType of ['fan', 'performer'] as const) {
  for (const tier of SUBSCRIPTION_TIER_ORDER) {
    const key = SUBSCRIPTION_TIER_PRODUCT_KEYS[accountType][tier];
    TIER_LADDER[STRIPE_PRODUCTS[key].priceId] = tier;
  }
}

export const PRICE_TO_TIER: Record<string, UserTier> = {
  ...TIER_LADDER,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE ?? 'price_1TcJXrEAwH1Fjtu9pYxAwEqi']: 'FREE',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'GOLD',
  // LEGACY (2026-09-01 pricing migration): original Fan/Performer "Ruby" prices,
  // actually priced at what's now PRO's amount. Kept mapped to RUBY — their tier
  // at time of sale — for any historical reconciliation. Verified 0 real Stripe
  // subscriptions referenced either before this migration; never used for new
  // checkout (products.ts no longer references these IDs at all).
  'price_1TcJnFEAwH1Fjtu98MhoEGqG': 'RUBY', // legacy Fan Ruby
  'price_1TcJzdEAwH1Fjtu9Nx5DsRzL': 'RUBY', // legacy Performer Ruby
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND ?? 'price_1TcK68EAwH1Fjtu9KGLcf8HE']: 'GOLD',
  // Sponsor/Advertiser/Venue/Promoter — not part of the Fan/Performer ladder
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? 'price_1Tb148EAwH1Fjtu9KZFL3H3Y']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? 'price_1Tb147EAwH1Fjtu9yCbRfH3j']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? 'price_1Tb144EAwH1Fjtu9I0Xq1iFV']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? 'price_1Tb143EAwH1Fjtu9WDqnYV7z']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE       ?? 'price_1TdZQEEAwH1Fjtu9JcPS32sL']: 'PRO',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER    ?? 'price_1TdZQSEAwH1Fjtu9Cz3j2Rik']: 'PRO',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVERTISER  ?? 'price_1TdY0UEAwH1Fjtu9FTrdprdy']: 'GOLD',
};

export function tierForPriceId(priceId: string): UserTier | null {
  return PRICE_TO_TIER[priceId] ?? null;
}
