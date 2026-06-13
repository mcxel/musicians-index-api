export type UserTier = "free" | "pro" | "RUBY" | "silver" | "gold" | "diamond" | "platinum";

export interface AssetLockerPolicy {
  tier: UserTier;
  maxAlbums: number;
  maxSongsPerAlbum: number;
  maxVideos: number;
  memoryWallSlots: number;
  memoryWallShapes: "static" | "dynamic" | "chroma";
  maxSponsors: number;
  sponsorManualControl: boolean;
  sponsorAmbientRail: boolean;
  platformAds: boolean;
  chromaHero: boolean;
  multiSurfaceLayouts: boolean;
  sponsorSequencing: boolean;
  premiumPlacement: boolean;
  customSponsorSkins: boolean;
  fullBroadcastControl: boolean;
  sponsorPopButton: boolean;
  analytics: "none" | "basic" | "advanced" | "premium";
  maxPromoClips: number;
  canShowExternalMedia: boolean; // YouTube/Spotify/Google pop-ups
  maxActiveSurfaces: number;
}

export const LOCKER_POLICIES: Record<UserTier, AssetLockerPolicy> = {
  free: {
    tier: "free",
    maxAlbums: 1,
    maxSongsPerAlbum: 10,
    maxVideos: 3,
    memoryWallSlots: 5,
    memoryWallShapes: "static",
    maxSponsors: 1,
    sponsorManualControl: false,
    sponsorAmbientRail: false,
    platformAds: true,
    chromaHero: false,
    multiSurfaceLayouts: false,
    sponsorSequencing: false,
    premiumPlacement: false,
    customSponsorSkins: false,
    fullBroadcastControl: false,
    sponsorPopButton: false,
    analytics: "none",
    maxPromoClips: 0,
    canShowExternalMedia: false,
    maxActiveSurfaces: 1,
  },
  pro: {
    tier: "pro",
    maxAlbums: 3,
    maxSongsPerAlbum: 15,
    maxVideos: 10,
    memoryWallSlots: 20,
    memoryWallShapes: "static",
    maxSponsors: 2,
    sponsorManualControl: false,
    sponsorAmbientRail: false,
    platformAds: true,
    chromaHero: false,
    multiSurfaceLayouts: false,
    sponsorSequencing: false,
    premiumPlacement: false,
    customSponsorSkins: false,
    fullBroadcastControl: false,
    sponsorPopButton: true,
    analytics: "basic",
    maxPromoClips: 2,
    canShowExternalMedia: true,
    maxActiveSurfaces: 2,
  },
  RUBY: {
    tier: "RUBY",
    maxAlbums: 5,
    maxSongsPerAlbum: 15,
    maxVideos: 15,
    memoryWallSlots: 30,
    memoryWallShapes: "static",
    maxSponsors: 3,
    sponsorManualControl: true,
    sponsorAmbientRail: false,
    platformAds: true,
    chromaHero: false,
    multiSurfaceLayouts: false,
    sponsorSequencing: false,
    premiumPlacement: false,
    customSponsorSkins: false,
    fullBroadcastControl: false,
    sponsorPopButton: true,
    analytics: "basic",
    maxPromoClips: 3,
    canShowExternalMedia: true,
    maxActiveSurfaces: 2,
  },
  silver: {
    tier: "silver",
    maxAlbums: 10,
    maxSongsPerAlbum: 20,
    maxVideos: 30,
    memoryWallSlots: 60,
    memoryWallShapes: "dynamic",
    maxSponsors: 6,
    sponsorManualControl: true,
    sponsorAmbientRail: true,
    platformAds: false,
    chromaHero: false,
    multiSurfaceLayouts: false,
    sponsorSequencing: false,
    premiumPlacement: false,
    customSponsorSkins: false,
    fullBroadcastControl: false,
    sponsorPopButton: true,
    analytics: "advanced",
    maxPromoClips: 6,
    canShowExternalMedia: true,
    maxActiveSurfaces: 3,
  },
  gold: {
    tier: "gold",
    maxAlbums: 25,
    maxSongsPerAlbum: 30,
    maxVideos: 75,
    memoryWallSlots: 150,
    memoryWallShapes: "dynamic",
    maxSponsors: 10,
    sponsorManualControl: true,
    sponsorAmbientRail: true,
    platformAds: false,
    chromaHero: true,
    multiSurfaceLayouts: true,
    sponsorSequencing: false,
    premiumPlacement: false,
    customSponsorSkins: false,
    fullBroadcastControl: false,
    sponsorPopButton: true,
    analytics: "advanced",
    maxPromoClips: 12,
    canShowExternalMedia: true,
    maxActiveSurfaces: 4,
  },
  diamond: {
    tier: "diamond",
    maxAlbums: 50,
    maxSongsPerAlbum: 40,
    maxVideos: 200,
    memoryWallSlots: 500,
    memoryWallShapes: "chroma",
    maxSponsors: 20,
    sponsorManualControl: true,
    sponsorAmbientRail: true,
    platformAds: false,
    chromaHero: true,
    multiSurfaceLayouts: true,
    sponsorSequencing: true,
    premiumPlacement: true,
    customSponsorSkins: false,
    fullBroadcastControl: true,
    sponsorPopButton: true,
    analytics: "premium",
    maxPromoClips: 25,
    canShowExternalMedia: true,
    maxActiveSurfaces: 6,
  },
  platinum: {
    tier: "platinum",
    maxAlbums: Infinity,
    maxSongsPerAlbum: Infinity,
    maxVideos: Infinity,
    memoryWallSlots: Infinity,
    memoryWallShapes: "chroma",
    maxSponsors: Infinity,
    sponsorManualControl: true,
    sponsorAmbientRail: true,
    platformAds: false,
    chromaHero: true,
    multiSurfaceLayouts: true,
    sponsorSequencing: true,
    premiumPlacement: true,
    customSponsorSkins: true,
    fullBroadcastControl: true,
    sponsorPopButton: true,
    analytics: "premium",
    maxPromoClips: Infinity,
    canShowExternalMedia: true,
    maxActiveSurfaces: 8,
  },
};

export function getAssetLockerPolicy(tier: UserTier): AssetLockerPolicy {
  return LOCKER_POLICIES[tier] ?? LOCKER_POLICIES.free;
}

export function canUseSponsorPop(tier: UserTier): boolean {
  return LOCKER_POLICIES[tier]?.sponsorPopButton ?? false;
}

export function canUseChromaHero(tier: UserTier): boolean {
  return LOCKER_POLICIES[tier]?.chromaHero ?? false;
}

export function canShowExternalMedia(tier: UserTier): boolean {
  return LOCKER_POLICIES[tier]?.canShowExternalMedia ?? false;
}

export function getSponsorLimit(tier: UserTier): number {
  return LOCKER_POLICIES[tier]?.maxSponsors ?? 1;
}

export function getMediaSurfaceLimit(tier: UserTier): number {
  return LOCKER_POLICIES[tier]?.maxActiveSurfaces ?? 1;
}

export function tierRank(tier: UserTier): number {
  const ranks: Record<UserTier, number> = {
    free: 0, pro: 1, RUBY: 2, silver: 3, gold: 4, diamond: 5, platinum: 6,
  };
  return ranks[tier] ?? 0;
}

export function isEligibleForUpgrade(tier: UserTier): boolean {
  return tier !== "platinum";
}

export function getNextTier(tier: UserTier): UserTier | null {
  const ladder: UserTier[] = ["free", "pro", "RUBY", "silver", "gold", "diamond", "platinum"];
  const idx = ladder.indexOf(tier);
  return idx >= 0 && idx < ladder.length - 1 ? ladder[idx + 1] : null;
}
