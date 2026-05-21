// apps/web/src/systems/tiers/tier-engine.ts
// Controls every tier-gated feature across the platform.

export type TierLevel = 'free' | 'starter' | 'pro' | 'gold' | 'platinum' | 'diamond';

export interface TierConfig {
  level: TierLevel;
  label: string;
  monthlyPriceCents: number;       // 0 for free
  color: string;                   // badge color
  glowColor: string;
  icon: string;

  // Content limits
  maxArticlesPerMonth: number;     // -1 = unlimited
  maxMediaUploadsGB: number;
  maxClipsPerMonth: number;        // -1 = unlimited
  maxVideoLengthMinutes: number;
  maxLiveSessionsPerWeek: number;  // -1 = unlimited

  // Feature access
  canCreateStation: boolean;
  canGoLive: boolean;
  canEnterContests: boolean;
  canAccessAnalytics: 'none' | 'basic' | 'standard' | 'advanced' | 'full';
  canReceiveSponsorOffers: boolean;
  canCreateSponsorCampaign: boolean;
  canAccessBeatMarketplace: boolean;
  canSellDigitalProducts: boolean; // future feature flag
  canSetCustomScene: boolean;
  canAccessBackstage: boolean;
  canReceiveTips: boolean;

  // Ad/sponsor experience
  seesAds: boolean;
  canHideAdsOnProfile: boolean;
  sponsorPlacementPriority: number; // 1-10, higher = more prominent placement
  homepageFeatureEligible: boolean;  // can appear in homepage belts

  // Discovery boost
  discoveryWeight: number;  // multiplier for recommendations (1.0 = baseline)
  rankingBoost: number;     // bonus points in weekly ranking

  // Visual customization
  profileThemeAccess: 'default' | 'extended' | 'full';
  customBannerAllowed: boolean;
  animatedPortraitAllowed: boolean;
  stationThemeAccess: 'default' | 'extended' | 'full';
}

export const TIER_CONFIG: Record<TierLevel, TierConfig> = {
  free: {
    level: 'free', label: 'Free', monthlyPriceCents: 0,
    color: '#7A5F9A', glowColor: 'rgba(122,95,154,0.3)', icon: '○',
    maxArticlesPerMonth: 2, maxMediaUploadsGB: 1, maxClipsPerMonth: 5,
    maxVideoLengthMinutes: 10, maxLiveSessionsPerWeek: 3,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'basic', canReceiveSponsorOffers: false,
    canCreateSponsorCampaign: false, canAccessBeatMarketplace: true,
    canSellDigitalProducts: false, canSetCustomScene: false,
    canAccessBackstage: false, canReceiveTips: true,
    seesAds: true, canHideAdsOnProfile: false,
    sponsorPlacementPriority: 1, homepageFeatureEligible: false,
    discoveryWeight: 1.0, rankingBoost: 0,
    profileThemeAccess: 'default', customBannerAllowed: false,
    animatedPortraitAllowed: false, stationThemeAccess: 'default',
  },
  starter: {
    level: 'starter', label: 'Starter', monthlyPriceCents: 499,
    color: '#00C896', glowColor: 'rgba(0,200,150,0.3)', icon: '●',
    maxArticlesPerMonth: 8, maxMediaUploadsGB: 5, maxClipsPerMonth: 20,
    maxVideoLengthMinutes: 30, maxLiveSessionsPerWeek: 10,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'standard', canReceiveSponsorOffers: true,
    canCreateSponsorCampaign: false, canAccessBeatMarketplace: true,
    canSellDigitalProducts: false, canSetCustomScene: true,
    canAccessBackstage: false, canReceiveTips: true,
    seesAds: true, canHideAdsOnProfile: false,
    sponsorPlacementPriority: 3, homepageFeatureEligible: false,
    discoveryWeight: 1.2, rankingBoost: 5,
    profileThemeAccess: 'default', customBannerAllowed: true,
    animatedPortraitAllowed: false, stationThemeAccess: 'default',
  },
  pro: {
    level: 'pro', label: 'Pro', monthlyPriceCents: 1299,
    color: '#00E5FF', glowColor: 'rgba(0,229,255,0.35)', icon: '★',
    maxArticlesPerMonth: -1, maxMediaUploadsGB: 20, maxClipsPerMonth: -1,
    maxVideoLengthMinutes: 90, maxLiveSessionsPerWeek: -1,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'advanced', canReceiveSponsorOffers: true,
    canCreateSponsorCampaign: false, canAccessBeatMarketplace: true,
    canSellDigitalProducts: false, canSetCustomScene: true,
    canAccessBackstage: true, canReceiveTips: true,
    seesAds: false, canHideAdsOnProfile: true,
    sponsorPlacementPriority: 6, homepageFeatureEligible: true,
    discoveryWeight: 1.5, rankingBoost: 15,
    profileThemeAccess: 'extended', customBannerAllowed: true,
    animatedPortraitAllowed: true, stationThemeAccess: 'extended',
  },
  gold: {
    level: 'gold', label: 'Gold', monthlyPriceCents: 2499,
    color: '#FFB800', glowColor: 'rgba(255,184,0,0.4)', icon: '✦',
    maxArticlesPerMonth: -1, maxMediaUploadsGB: 50, maxClipsPerMonth: -1,
    maxVideoLengthMinutes: -1, maxLiveSessionsPerWeek: -1,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'full', canReceiveSponsorOffers: true,
    canCreateSponsorCampaign: true, canAccessBeatMarketplace: true,
    canSellDigitalProducts: false, canSetCustomScene: true,
    canAccessBackstage: true, canReceiveTips: true,
    seesAds: false, canHideAdsOnProfile: true,
    sponsorPlacementPriority: 8, homepageFeatureEligible: true,
    discoveryWeight: 2.0, rankingBoost: 30,
    profileThemeAccess: 'full', customBannerAllowed: true,
    animatedPortraitAllowed: true, stationThemeAccess: 'full',
  },
  platinum: {
    level: 'platinum', label: 'Platinum', monthlyPriceCents: 4999,
    color: '#C8A8E8', glowColor: 'rgba(200,168,232,0.4)', icon: '◆',
    maxArticlesPerMonth: -1, maxMediaUploadsGB: 200, maxClipsPerMonth: -1,
    maxVideoLengthMinutes: -1, maxLiveSessionsPerWeek: -1,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'full', canReceiveSponsorOffers: true,
    canCreateSponsorCampaign: true, canAccessBeatMarketplace: true,
    canSellDigitalProducts: true, canSetCustomScene: true,
    canAccessBackstage: true, canReceiveTips: true,
    seesAds: false, canHideAdsOnProfile: true,
    sponsorPlacementPriority: 9, homepageFeatureEligible: true,
    discoveryWeight: 2.5, rankingBoost: 50,
    profileThemeAccess: 'full', customBannerAllowed: true,
    animatedPortraitAllowed: true, stationThemeAccess: 'full',
  },
  diamond: {
    level: 'diamond', label: 'Diamond', monthlyPriceCents: 0,  // permanent — never billed
    color: '#00E5FF', glowColor: 'rgba(0,229,255,0.6)', icon: '💎',
    maxArticlesPerMonth: -1, maxMediaUploadsGB: -1, maxClipsPerMonth: -1,
    maxVideoLengthMinutes: -1, maxLiveSessionsPerWeek: -1,
    canCreateStation: true, canGoLive: true, canEnterContests: true,
    canAccessAnalytics: 'full', canReceiveSponsorOffers: true,
    canCreateSponsorCampaign: true, canAccessBeatMarketplace: true,
    canSellDigitalProducts: true, canSetCustomScene: true,
    canAccessBackstage: true, canReceiveTips: true,
    seesAds: false, canHideAdsOnProfile: true,
    sponsorPlacementPriority: 10, homepageFeatureEligible: true,
    discoveryWeight: 3.0, rankingBoost: 100,
    profileThemeAccess: 'full', customBannerAllowed: true,
    animatedPortraitAllowed: true, stationThemeAccess: 'full',
    // PERMANENT DIAMOND: Marcel Dickens + B.J. M Beat's — hardcoded, never revoked
  },
};

export function getTier(level: TierLevel): TierConfig {
  return TIER_CONFIG[level];
}

export function canDo(level: TierLevel, feature: keyof Pick<TierConfig,
  'canCreateStation' | 'canGoLive' | 'canEnterContests' | 'canReceiveSponsorOffers' |
  'canCreateSponsorCampaign' | 'canAccessBeatMarketplace' | 'canSellDigitalProducts' |
  'canSetCustomScene' | 'canAccessBackstage' | 'canReceiveTips' |
  'canHideAdsOnProfile' | 'homepageFeatureEligible' | 'animatedPortraitAllowed'
>): boolean {
  return TIER_CONFIG[level][feature] as boolean;
}

export const PERMANENT_DIAMOND_USERS = [
  "berntmusic33@gmail.com",  // Marcel Dickens
  // B.J. M Beat's account configured by Big Ace
] as const;

export function isPermanentDiamond(email: string): boolean {
  return (PERMANENT_DIAMOND_USERS as readonly string[]).includes(email);
}
