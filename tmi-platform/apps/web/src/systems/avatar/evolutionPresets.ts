// ============================================================
// AVATAR EVOLUTION PRESETS
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarEvolutionTier } from './types';

export interface EvolutionTierDefinition {
  tier: AvatarEvolutionTier;
  label: string;
  description: string;
  pointsRequired: number;
  unlockedCostumeIds: string[];
  unlockedPropIds: string[];
  unlockedZones: string[];
  badgeAsset: string;
  glowColor: string;
  perks: string[];
}

export const EVOLUTION_TIERS: Record<AvatarEvolutionTier, EvolutionTierDefinition> = {
  starter: {
    tier: 'starter',
    label: 'Starter',
    description: 'Just getting started on The Musicians Index.',
    pointsRequired: 0,
    unlockedCostumeIds: ['casual-default'],
    unlockedPropIds: ['mic-standard', 'glow-stick'],
    unlockedZones: ['audience-seat', 'venue-walkway'],
    badgeAsset: 'badge-starter',
    glowColor: '#888888',
    perks: ['Basic avatar customization', 'Access to audience seats', 'Standard reactions'],
  },
  rising: {
    tier: 'rising',
    label: 'Rising',
    description: 'Building a presence on the platform.',
    pointsRequired: 500,
    unlockedCostumeIds: ['casual-default', 'stage-performer', 'cypher-street'],
    unlockedPropIds: ['mic-standard', 'mic-wireless', 'glow-stick', 'glow-wristband', 'sign-fan'],
    unlockedZones: ['audience-seat', 'venue-walkway', 'front-row', 'cypher-circle'],
    badgeAsset: 'badge-rising',
    glowColor: '#ff6b35',
    perks: [
      'Expanded costume options',
      'Front row access',
      'Cypher circle access',
      'Animated glow items',
    ],
  },
  established: {
    tier: 'established',
    label: 'Established',
    description: 'A recognized presence in the community.',
    pointsRequired: 2000,
    unlockedCostumeIds: ['casual-default', 'stage-performer', 'cypher-street', 'vip-elite', 'formal-gala'],
    unlockedPropIds: [
      'mic-standard', 'mic-wireless', 'glow-stick', 'glow-wristband',
      'sign-fan', 'sign-glowing', 'guitar-electric', 'guitar-acoustic',
    ],
    unlockedZones: ['audience-seat', 'venue-walkway', 'front-row', 'cypher-circle', 'vip-balcony', 'backstage-zone'],
    badgeAsset: 'badge-established',
    glowColor: '#ffd700',
    perks: [
      'VIP balcony access',
      'Backstage zone access',
      'Instrument props',
      'Glowing sign props',
      'Priority seating',
    ],
  },
  featured: {
    tier: 'featured',
    label: 'Featured',
    description: 'A featured member of The Musicians Index.',
    pointsRequired: 7500,
    unlockedCostumeIds: [
      'casual-default', 'stage-performer', 'cypher-street', 'vip-elite',
      'formal-gala', 'contest-champion',
    ],
    unlockedPropIds: [
      'mic-standard', 'mic-wireless', 'mic-golden', 'glow-stick', 'glow-wristband',
      'sign-fan', 'sign-glowing', 'guitar-electric', 'guitar-acoustic',
      'dj-headphones', 'trophy',
    ],
    unlockedZones: [
      'audience-seat', 'venue-walkway', 'front-row', 'cypher-circle',
      'vip-balcony', 'backstage-zone', 'green-room', 'sponsor-booth',
    ],
    badgeAsset: 'badge-featured',
    glowColor: '#c0c0ff',
    perks: [
      'Golden microphone prop',
      'Trophy prop',
      'Green room access',
      'Sponsor booth access',
      'Champion costume',
      'Featured profile badge',
    ],
  },
  legendary: {
    tier: 'legendary',
    label: 'Legendary',
    description: 'A legend of The Musicians Index.',
    pointsRequired: 25000,
    unlockedCostumeIds: [
      'casual-default', 'stage-performer', 'cypher-street', 'vip-elite',
      'formal-gala', 'contest-champion', 'legendary-icon',
    ],
    unlockedPropIds: [
      'mic-standard', 'mic-wireless', 'mic-golden', 'glow-stick', 'glow-wristband',
      'sign-fan', 'sign-glowing', 'guitar-electric', 'guitar-acoustic',
      'dj-headphones', 'trophy', 'confetti-cannon',
    ],
    unlockedZones: [
      'audience-seat', 'venue-walkway', 'front-row', 'cypher-circle',
      'vip-balcony', 'backstage-zone', 'green-room', 'sponsor-booth',
      'stage-mark', 'contest-platform', 'interview-chair',
    ],
    badgeAsset: 'badge-legendary',
    glowColor: '#ff00ff',
    perks: [
      'Legendary Icon costume (animated)',
      'Confetti cannon prop',
      'Stage mark access',
      'Contest platform access',
      'Interview chair access',
      'Animated accessories',
      'Legendary profile aura',
      'Priority in all rooms',
    ],
  },
};

export function getTierForPoints(points: number): AvatarEvolutionTier {
  const tiers: AvatarEvolutionTier[] = ['legendary', 'featured', 'established', 'rising', 'starter'];
  for (const tier of tiers) {
    if (points >= EVOLUTION_TIERS[tier].pointsRequired) return tier;
  }
  return 'starter';
}

export function getNextTier(current: AvatarEvolutionTier): AvatarEvolutionTier | null {
  const order: AvatarEvolutionTier[] = ['starter', 'rising', 'established', 'featured', 'legendary'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getPointsToNextTier(current: AvatarEvolutionTier, currentPoints: number): number | null {
  const next = getNextTier(current);
  if (!next) return null;
  return Math.max(0, EVOLUTION_TIERS[next].pointsRequired - currentPoints);
}
