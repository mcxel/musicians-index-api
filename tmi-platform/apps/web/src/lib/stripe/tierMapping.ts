import type { UserTier } from '@/lib/auth/UserStore';

// TMI Canonical Tier Order: FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND
//
// IMPORTANT — Stripe price names vs. TMI tier names differ because the Stripe products
// were created before the canonical tier order was locked. The Stripe labels are legacy;
// the TMI tier assignments below are authoritative.
//
// Volume Accessibility Ladder — both roles share the same 7-tier structure.
// Target prices (create new Stripe prices for each, update env vars in Vercel):
//
// Fan:       FREE | PRO $2.99 | RUBY $5.99 | SILVER $9.99 | GOLD $19.99 | PLATINUM $29.99 | DIAMOND $37
// Performer: FREE | PRO $1.99 | RUBY $3.99 | SILVER $6.99 | GOLD $12.99 | PLATINUM $19.99 | DIAMOND $24.99
//
// NOTE: Existing Stripe price IDs (hardcoded as fallbacks below) were created at different amounts.
// Until new prices are created in Stripe and env vars updated in Vercel, the old price amounts
// will be charged — the UI displays the new target prices.

export const PRICE_TO_TIER: Record<string, UserTier> = {

  // ── Fan tiers ────────────────────────────────────────────────────────────────
  // FREE
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE      ?? 'price_1TcJXrEAwH1Fjtu9pYxAwEqi']: 'FREE',
  // PRO — $4.99/mo (Stripe label: "Ruby Fan Entry supporter")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PRO       ?? 'price_1TcJnFEAwH1Fjtu98MhoEGqG']: 'PRO',
  // RUBY — $9.99/mo (Stripe label: "Silver Fan Enhanced fan experience")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY      ?? 'price_1TcJoOEAwH1Fjtu9IrhSwoyA']: 'RUBY',
  // SILVER — $14.99/mo (Stripe label: "Gold Fan Premium access")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER    ?? 'price_1TcJrTEAwH1Fjtu9wjhmnv5K']: 'SILVER',
  // GOLD — $24.99/mo (Stripe label: "Platinum Fan VIP fan status")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD      ?? 'price_1TcJsDEAwH1Fjtu9zU7X7mml']: 'GOLD',
  // PLATINUM — $49.99/mo (Stripe label: "Diamond Fan Ultimate fan tier")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM  ?? 'price_1TcJvaEAwH1Fjtu9me4Aq2UU']: 'PLATINUM',
  // DIAMOND fan — env var or known Stripe test ID (price_1TUWI4EL7B8tMf4NHs74ydgc)
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND ?? 'price_1TUWI4EL7B8tMf4NHs74ydgc']: 'DIAMOND' as UserTier,
  // Family plan — maps to GOLD
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY    ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'GOLD',

  // ── Performer tiers ──────────────────────────────────────────────────────────
  // FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND (same structure as fans)
  // FREE
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_FREE     ?? 'price_1TcJyeEAwH1Fjtu9obYiHFoy']: 'FREE',
  // PRO — $2.99/mo (Stripe: "Ruby Performer")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PRO      ?? 'price_1TcJzdEAwH1Fjtu9Nx5DsRzL']: 'PRO',
  // RUBY — $4.99/mo (Stripe: "Silver Performer")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY     ?? 'price_1TcK0dEAwH1Fjtu9MXK323Q7']: 'RUBY',
  // SILVER — $9.99/mo (Stripe: "Gold Performer")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER   ?? 'price_1TcK1LEAwH1Fjtu9ZnOrTyZw']: 'SILVER',
  // GOLD — $19.99/mo (Stripe: "Platinum Performer")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD     ?? 'price_1TcK2xEAwH1Fjtu9FLlIHItH']: 'GOLD',
  // PLATINUM — $29.99/mo (Stripe: "Diamond Performer")
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? 'price_1TcK4MEAwH1Fjtu96b2TJlBe']: 'PLATINUM',
  // DIAMOND performer
  ...(process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND
    ? { [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND]: 'DIAMOND' as UserTier }
    : {}),
  // Legacy band/group plan fallback — maps to GOLD
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND      ?? 'price_1TcK68EAwH1Fjtu9KGLcf8HE']: 'GOLD',

  // ── Band tiers ───────────────────────────────────────────────────────────────
  ...(process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PRO
    ? { [process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PRO]: 'PRO' as UserTier }
    : {}),
  ...(process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_GOLD
    ? { [process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_GOLD]: 'GOLD' as UserTier }
    : {}),
  ...(process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PLATINUM
    ? { [process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_PLATINUM]: 'PLATINUM' as UserTier }
    : {}),
  ...(process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_DIAMOND
    ? { [process.env.NEXT_PUBLIC_STRIPE_PRICE_BAND_DIAMOND]: 'DIAMOND' as UserTier }
    : {}),

  // ── Business tiers ───────────────────────────────────────────────────────────
  // Sponsor/Advertiser/Venue/Promoter
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? 'price_1Tb148EAwH1Fjtu9KZFL3H3Y']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? 'price_1Tb147EAwH1Fjtu9yCbRfH3j']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? 'price_1Tb144EAwH1Fjtu9I0Xq1iFV']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? 'price_1Tb143EAwH1Fjtu9WDqnYV7z']: 'DIAMOND',
  // Venue Owner — $14.99/week → PRO
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE            ?? 'price_1TdZQEEAwH1Fjtu9JcPS32sL']: 'PRO',
  // Promoter — $9.99/week → PRO
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER         ?? 'price_1TdZQSEAwH1Fjtu9Cz3j2Rik']: 'PRO',
  // Advertiser Monthly — $49.99/mo → GOLD
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVERTISER       ?? 'price_1TdY0UEAwH1Fjtu9FTrdprdy']: 'GOLD',
};

export function tierForPriceId(priceId: string): UserTier | null {
  return PRICE_TO_TIER[priceId] ?? null;
}
