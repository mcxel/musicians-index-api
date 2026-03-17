/**
 * sponsor.tiers.ts
 * Repo: apps/web/src/config/sponsor.tiers.ts
 * Action: CREATE | Wave: B10
 * Purpose: Single source of truth for all sponsor tier rules.
 * NEVER hardcode tier prices or benefits in components.
 */

export type SponsorTierType = 'local-bronze' | 'local-silver' | 'local-gold' | 'major-bronze' | 'major-silver' | 'major-gold' | 'title';
export type SponsorCategory = 'local' | 'major';

export interface SponsorTier {
  id: SponsorTierType;
  label: string;
  category: SponsorCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  price: number;            // USD minimum contribution
  benefits: string[];
  logoOnProfile: boolean;
  stageOverlay: boolean;
  stageMentionCount: number; // 0 = none, -1 = unlimited
  analyticsDepth: 'none' | 'basic' | 'full' | 'premium';
  overlayFrequency: 'none' | 'low' | 'medium' | 'high' | 'exclusive';
  namingRights: boolean;
  color: string;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: 'local-bronze', label: 'Local Bronze', category: 'local', tier: 'bronze',
    price: 50, benefits: ['Name on profile', 'Contest entry acknowledgment'],
    logoOnProfile: false, stageOverlay: false, stageMentionCount: 0,
    analyticsDepth: 'none', overlayFrequency: 'none', namingRights: false, color: '#cd7f32',
  },
  {
    id: 'local-silver', label: 'Local Silver', category: 'local', tier: 'silver',
    price: 100, benefits: ['Name + logo on profile', 'Fan page visibility'],
    logoOnProfile: true, stageOverlay: false, stageMentionCount: 0,
    analyticsDepth: 'basic', overlayFrequency: 'none', namingRights: false, color: '#c0c0c0',
  },
  {
    id: 'local-gold', label: 'Local Gold', category: 'local', tier: 'gold',
    price: 250, benefits: ['Logo + profile placement', 'Stage mention', 'Analytics'],
    logoOnProfile: true, stageOverlay: false, stageMentionCount: 1,
    analyticsDepth: 'basic', overlayFrequency: 'none', namingRights: false, color: '#ffd700',
  },
  {
    id: 'major-bronze', label: 'Major Bronze', category: 'major', tier: 'bronze',
    price: 1000, benefits: ['Logo + profile placement', 'Stage mention', 'Analytics'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: 2,
    analyticsDepth: 'basic', overlayFrequency: 'low', namingRights: false, color: '#cd7f32',
  },
  {
    id: 'major-silver', label: 'Major Silver', category: 'major', tier: 'silver',
    price: 5000, benefits: ['Logo + stage overlay', 'Priority mention', 'Full analytics', 'Email spotlight'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: 4,
    analyticsDepth: 'full', overlayFrequency: 'medium', namingRights: false, color: '#c0c0c0',
  },
  {
    id: 'major-gold', label: 'Major Gold', category: 'major', tier: 'gold',
    price: 10000, benefits: ['All surfaces', 'Pre-performance slate', 'Premium analytics', 'Monthly report'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: -1,
    analyticsDepth: 'premium', overlayFrequency: 'high', namingRights: false, color: '#ffd700',
  },
  {
    id: 'title', label: 'Title Sponsor', category: 'major', tier: 'title',
    price: 25000, benefits: ['Full naming rights', 'Exclusive overlays', 'All surfaces exclusive', 'Season co-branding', 'Direct analytics API'],
    logoOnProfile: true, stageOverlay: true, stageMentionCount: -1,
    analyticsDepth: 'premium', overlayFrequency: 'exclusive', namingRights: true, color: '#00e5ff',
  },
];

export const LOCAL_SPONSORS_REQUIRED = 10;
export const MAJOR_SPONSORS_REQUIRED = 10;
export const TOTAL_SPONSORS_REQUIRED = LOCAL_SPONSORS_REQUIRED + MAJOR_SPONSORS_REQUIRED;

export function getTierById(id: SponsorTierType): SponsorTier {
  return SPONSOR_TIERS.find(t => t.id === id) ?? SPONSOR_TIERS[0];
}

export function getTiersByCategory(category: SponsorCategory): SponsorTier[] {
  return SPONSOR_TIERS.filter(t => t.category === category);
}

export function isLocalTier(id: SponsorTierType): boolean {
  return id.startsWith('local-');
}
