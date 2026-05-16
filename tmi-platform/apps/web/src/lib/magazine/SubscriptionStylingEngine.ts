export type SubscriptionTier =
  | 'free'
  | 'pro'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export interface TierStyleToken {
  tier: SubscriptionTier;
  accent: string;
  glow: string;
  density: number;
  modules: number;
  prestigeLabel: string;
}

const TIER_TOKENS: Record<SubscriptionTier, TierStyleToken> = {
  free: { tier: 'free', accent: '#00FFFF', glow: 'rgba(0,255,255,0.2)', density: 1, modules: 2, prestigeLabel: 'Basic' },
  pro: { tier: 'pro', accent: '#FF2DAA', glow: 'rgba(255,45,170,0.24)', density: 1.25, modules: 3, prestigeLabel: 'Pro' },
  bronze: { tier: 'bronze', accent: '#CD7F32', glow: 'rgba(205,127,50,0.24)', density: 1.35, modules: 4, prestigeLabel: 'Bronze' },
  silver: { tier: 'silver', accent: '#C0C0C0', glow: 'rgba(192,192,192,0.24)', density: 1.5, modules: 5, prestigeLabel: 'Silver' },
  gold: { tier: 'gold', accent: '#FFD700', glow: 'rgba(255,215,0,0.3)', density: 1.7, modules: 6, prestigeLabel: 'Gold' },
  platinum: { tier: 'platinum', accent: '#7DF9FF', glow: 'rgba(125,249,255,0.34)', density: 1.9, modules: 7, prestigeLabel: 'Platinum' },
  diamond: { tier: 'diamond', accent: '#B9F2FF', glow: 'rgba(185,242,255,0.42)', density: 2.2, modules: 8, prestigeLabel: 'Diamond' },
};

export function parseTier(value?: string | null): SubscriptionTier {
  const raw = (value ?? '').toLowerCase();
  if (raw === 'pro') return 'pro';
  if (raw === 'bronze') return 'bronze';
  if (raw === 'silver') return 'silver';
  if (raw === 'gold') return 'gold';
  if (raw === 'platinum') return 'platinum';
  if (raw === 'diamond') return 'diamond';
  return 'free';
}

export function getTierStyleToken(tier: SubscriptionTier): TierStyleToken {
  return TIER_TOKENS[tier];
}
