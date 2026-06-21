import type { UserTier } from '@/lib/auth/UserStore';

// Map Stripe price IDs → platform tier. Env vars take precedence over hardcoded fallbacks.
// Single source of truth — both the webhook (real grant path) and the
// payment-success activation check (verification path) must resolve a given
// Stripe price ID to the exact same tier, or a paying customer could be
// under/over-granted depending on which code path runs first.
export const PRICE_TO_TIER: Record<string, UserTier> = {
  // Fan tiers
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE      ?? 'price_1TcJXrEAwH1Fjtu9pYxAwEqi']: 'FREE',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY      ?? 'price_1TcJnFEAwH1Fjtu98MhoEGqG']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER    ?? 'price_1TcJoOEAwH1Fjtu9IrhSwoyA']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD      ?? 'price_1TcJrTEAwH1Fjtu9wjhmnv5K']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM  ?? 'price_1TcJsDEAwH1Fjtu9zU7X7mml']: 'PLATINUM',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND   ?? 'price_1TcJvaEAwH1Fjtu9me4Aq2UU']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY    ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'GOLD',
  // Performer tiers
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY    ?? 'price_1TcJzdEAwH1Fjtu9Nx5DsRzL']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER  ?? 'price_1TcK0dEAwH1Fjtu9MXK323Q7']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD    ?? 'price_1TcK1LEAwH1Fjtu9ZnOrTyZw']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? 'price_1TcK2xEAwH1Fjtu9FLlIHItH']: 'PLATINUM',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND ?? 'price_1TcK4MEAwH1Fjtu96b2TJlBe']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND    ?? 'price_1TcK68EAwH1Fjtu9KGLcf8HE']: 'GOLD',
  // Sponsor/Advertiser/Venue/Promoter
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
