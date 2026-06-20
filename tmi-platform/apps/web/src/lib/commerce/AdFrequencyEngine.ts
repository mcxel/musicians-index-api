/**
 * AdFrequencyEngine — how often the ad rail shows an ad, by tier.
 * FREE/PRO see it every time the slot would otherwise show (today's default
 * behavior, unchanged). Higher tiers see it less often, down to DIAMOND's
 * "once in a blue moon" per Marcel Dickens (locked 2026-06-19). This governs
 * frequency only — it never fabricates content; when the roll says "no ad
 * this time," the caller should render nothing or whatever real content
 * would otherwise occupy that slot, not a placeholder.
 */

export type MembershipTier = 'FREE' | 'PRO' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// Probability the ad rail shows an ad on any given render/refresh.
const AD_SHOW_PROBABILITY: Record<MembershipTier, number> = {
  FREE: 1,
  PRO: 1,
  RUBY: 0.85,
  SILVER: 0.6,
  GOLD: 0.35,
  PLATINUM: 0.15,
  DIAMOND: 0.05, // "once every blue moon"
};

export function shouldShowAd(tier: MembershipTier): boolean {
  return Math.random() < (AD_SHOW_PROBABILITY[tier] ?? 1);
}
