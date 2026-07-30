/**
 * Venue Skin Registry — Complete Venue Visual Transformation Assets.
 */

export type MembershipTier = 'FREE' | 'VIP' | 'DIAMOND' | 'PRO' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface VenueSkin {
  id: string;
  name: string;
  displayName: string;
  themeFamily: string;
  description: string;
  environmentModelUrl?: string;
  floorMaterialUrl?: string;
  lightingPreset: 'NEON' | 'WARM_STAGE' | 'STROBE' | 'GOLD_VIP' | 'CYBERPUNK' | 'SUNSET';
  ambientAudioUrl?: string;
  isPremium: boolean;
  priceUsd?: number;
}

export const VENUE_SKINS: Record<string, VenueSkin> = {
  default: {
    id: 'venue-skin-default',
    name: 'Canonical TMI Arena',
    displayName: 'Canonical TMI Arena',
    themeFamily: 'TMI Standard',
    description: 'The standard high-intensity 3D performance arena.',
    lightingPreset: 'NEON',
    isPremium: false,
  },
  'neon-tokyo': {
    id: 'venue-skin-neon-tokyo',
    name: 'Neon Tokyo Rooftop',
    displayName: 'Neon Tokyo Rooftop',
    themeFamily: 'Cyberpunk',
    description: 'Futuristic rooftop venue overlooking an illuminated neon city skyline.',
    lightingPreset: 'CYBERPUNK',
    isPremium: true,
    priceUsd: 9.99,
  },
  'mansion-ballroom': {
    id: 'venue-skin-mansion-ballroom',
    name: 'Grand Mansion Ballroom',
    displayName: 'Grand Mansion Ballroom',
    themeFamily: 'Luxury',
    description: 'Opulent gold-leaf chandelier ballroom for high-stakes showcases.',
    lightingPreset: 'GOLD_VIP',
    isPremium: true,
    priceUsd: 14.99,
  },
};

export function getVenueSkinById(id: string): VenueSkin {
  return VENUE_SKINS[id] || VENUE_SKINS['default'];
}

export function getDefaultVenueSkin(): VenueSkin {
  return VENUE_SKINS['default'];
}

export function getSkinsForMembership(tier: MembershipTier): VenueSkin[] {
  return Object.values(VENUE_SKINS);
}
