import type { UserTier } from '@/lib/auth/UserStore';
import { STRIPE_PRODUCTS, SUBSCRIPTION_TIER_ORDER, SUBSCRIPTION_TIER_PRODUCT_KEYS } from './products';

/** Checkout session metadata.plan — account family, not entitlement tier. */
export type CheckoutAccountPlan = 'FAN' | 'PERFORMER';

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
const ACCOUNT_PLAN_LADDER: Record<string, CheckoutAccountPlan> = {};
for (const accountType of ['fan', 'performer'] as const) {
  for (const tier of SUBSCRIPTION_TIER_ORDER) {
    const key = SUBSCRIPTION_TIER_PRODUCT_KEYS[accountType][tier];
    const priceId = STRIPE_PRODUCTS[key].priceId;
    TIER_LADDER[priceId] = tier;
    ACCOUNT_PLAN_LADDER[priceId] = accountType === 'fan' ? 'FAN' : 'PERFORMER';
  }
}

export const PRICE_TO_TIER: Record<string, UserTier> = {
  ...TIER_LADDER,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE ?? 'price_1TcJXrEAwH1Fjtu9pYxAwEqi']: 'FREE',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'GOLD',
  // LIVE-mode Pro twins (resource_missing under TEST keys). Map for live webhooks.
  'price_1TcJnFEAwH1Fjtu98MhoEGqG': 'PRO', // live Fan Pro $4.99
  'price_1TcKDBEAwH1Fjtu9fyPClyCM': 'PRO', // live Performer Pro $2.99
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

/** priceId → FAN | PERFORMER for checkout metadata.plan (analytics/receipts). */
export const PRICE_TO_ACCOUNT_PLAN: Record<string, CheckoutAccountPlan> = {
  ...ACCOUNT_PLAN_LADDER,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'FAN',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND ?? 'price_1TcK68EAwH1Fjtu9KGLcf8HE']: 'PERFORMER',
  // LIVE-mode Pro twins — preserve both TEST (UAj28…) and LIVE (Tc…) IDs; never swap globally.
  'price_1TcJnFEAwH1Fjtu98MhoEGqG': 'FAN',
  'price_1TcKDBEAwH1Fjtu9fyPClyCM': 'PERFORMER',
};

export function tierForPriceId(priceId: string): UserTier | null {
  return PRICE_TO_TIER[priceId] ?? null;
}

export function accountPlanForPriceId(priceId: string): CheckoutAccountPlan | null {
  return PRICE_TO_ACCOUNT_PLAN[priceId] ?? null;
}

/**
 * Checkout session metadata.plan — account family for analytics/receipts.
 * Entitlement still resolves via priceId → tierForPriceId (unchanged).
 */
export function resolveCheckoutMetadataPlan(
  priceId: string,
  productName = '',
): CheckoutAccountPlan {
  const fromPrice = accountPlanForPriceId(priceId);
  if (fromPrice) return fromPrice;

  const pn = productName.toUpperCase();
  if (pn.includes('PERFORMER') || pn.includes('ARTIST') || pn.includes('BAND')) {
    return 'PERFORMER';
  }
  if (pn.includes('FAN') || pn.includes('FAMILY')) {
    return 'FAN';
  }
  return 'FAN';
}
