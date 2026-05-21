// apps/web/src/lib/subscription/subscriptionFeatureMatrix.ts
// THE SINGLE SOURCE OF TRUTH FOR ALL TIER RULES.
// Every gate, every percentage, every feature limit lives here.

export type SubscriptionTier = "FREE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface TierFeatures {
  tier: SubscriptionTier;
  displayName: string;
  color: string;
  glowFrame: boolean;
  glowIntensity: "none" | "soft" | "medium" | "bright" | "reactive";
  fullscreenStageMode: boolean;
  directorCameraMode: boolean;
  canCreateMiniBattle: boolean;
  canCreateMiniCypher: boolean;
  canStartConcert: boolean;
  canStartWorldRelease: boolean;
  canScheduleEvents: boolean;
  canHostRooms: boolean;
  adLoadPercent: number;       // % of ad coverage on their page
  platformCutPercent: number;  // % platform takes from sponsorships/tips
  artistKeepsPercent: number;
  lobbyInviteSlots: number;
  performerLobbySlots: number;
  fanLobbySlots: number;
  sponsorSlots: { local: number; platform: number; total: number };
  emoteAccess: "basic" | "standard" | "premium" | "elite";
  reactions: string[];         // which reactions are included
  queuePriority: number;       // lower = higher priority
  premiumCosmetics: boolean;
  roomCosmeticsAccess: boolean;
  monthlyFee: number;          // in cents
  seasonPassFreeTrack: boolean;
  seasonPassPremiumTrack: boolean;
  fanRoomWaitMinutes: number;  // fan presence wait before earning
  performerRoomWaitMinutes: number;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    tier:"FREE", displayName:"Free", color:"#4A90E2",
    glowFrame:false, glowIntensity:"none",
    fullscreenStageMode:false, directorCameraMode:false,
    canCreateMiniBattle:false, canCreateMiniCypher:false,
    canStartConcert:false, canStartWorldRelease:false,
    canScheduleEvents:false, canHostRooms:false,
    adLoadPercent:80, platformCutPercent:50, artistKeepsPercent:50,
    lobbyInviteSlots:0, performerLobbySlots:3, fanLobbySlots:3,
    sponsorSlots:{ local:6, platform:4, total:10 },
    emoteAccess:"basic",
    reactions:["heart","seated_clap","join_clap"],
    queuePriority:5,
    premiumCosmetics:false, roomCosmeticsAccess:false,
    monthlyFee:0,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:false,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
  BRONZE: {
    tier:"BRONZE", displayName:"Bronze", color:"#CD7F32",
    glowFrame:false, glowIntensity:"none",
    fullscreenStageMode:false, directorCameraMode:false,
    canCreateMiniBattle:false, canCreateMiniCypher:false,
    canStartConcert:false, canStartWorldRelease:false,
    canScheduleEvents:false, canHostRooms:false,
    adLoadPercent:65, platformCutPercent:40, artistKeepsPercent:60,
    lobbyInviteSlots:1, performerLobbySlots:5, fanLobbySlots:5,
    sponsorSlots:{ local:12, platform:8, total:20 },
    emoteAccess:"basic",
    reactions:["heart","seated_clap","join_clap"],
    queuePriority:4,
    premiumCosmetics:false, roomCosmeticsAccess:false,
    monthlyFee:999,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:false,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
  SILVER: {
    tier:"SILVER", displayName:"Silver", color:"#C0C0C0",
    glowFrame:false, glowIntensity:"none",
    fullscreenStageMode:false, directorCameraMode:false,
    canCreateMiniBattle:false, canCreateMiniCypher:false,
    canStartConcert:true, canStartWorldRelease:false,
    canScheduleEvents:true, canHostRooms:false,
    adLoadPercent:45, platformCutPercent:30, artistKeepsPercent:70,
    lobbyInviteSlots:3, performerLobbySlots:8, fanLobbySlots:8,
    sponsorSlots:{ local:22, platform:18, total:40 },
    emoteAccess:"standard",
    reactions:["heart","seated_clap","join_clap","stand_clap","wave","hype"],
    queuePriority:3,
    premiumCosmetics:false, roomCosmeticsAccess:true,
    monthlyFee:1999,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:false,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
  GOLD: {
    tier:"GOLD", displayName:"Gold", color:"#FFD700",
    glowFrame:true, glowIntensity:"soft",
    fullscreenStageMode:true, directorCameraMode:false,
    canCreateMiniBattle:true, canCreateMiniCypher:true,
    canStartConcert:true, canStartWorldRelease:true,
    canScheduleEvents:true, canHostRooms:true,
    adLoadPercent:25, platformCutPercent:20, artistKeepsPercent:80,
    lobbyInviteSlots:5, performerLobbySlots:12, fanLobbySlots:12,
    sponsorSlots:{ local:35, platform:40, total:75 },
    emoteAccess:"premium",
    reactions:["heart","seated_clap","join_clap","stand_clap","wave","hype","dance_clap","candle","flashlight","confetti"],
    queuePriority:2,
    premiumCosmetics:true, roomCosmeticsAccess:true,
    monthlyFee:4999,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:true,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
  PLATINUM: {
    tier:"PLATINUM", displayName:"Platinum", color:"#E5E4E2",
    glowFrame:true, glowIntensity:"medium",
    fullscreenStageMode:true, directorCameraMode:false,
    canCreateMiniBattle:true, canCreateMiniCypher:true,
    canStartConcert:true, canStartWorldRelease:true,
    canScheduleEvents:true, canHostRooms:true,
    adLoadPercent:10, platformCutPercent:10, artistKeepsPercent:90,
    lobbyInviteSlots:10, performerLobbySlots:20, fanLobbySlots:20,
    sponsorSlots:{ local:50, platform:75, total:125 },
    emoteAccess:"elite",
    reactions:["heart","seated_clap","join_clap","stand_clap","wave","hype","dance_clap","candle","flashlight","confetti","sparks","firecracker","crowd_wave","stage_burst"],
    queuePriority:1,
    premiumCosmetics:true, roomCosmeticsAccess:true,
    monthlyFee:9999,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:true,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
  DIAMOND: {
    tier:"DIAMOND", displayName:"Diamond", color:"#00E5FF",
    glowFrame:true, glowIntensity:"reactive",
    fullscreenStageMode:true, directorCameraMode:true,
    canCreateMiniBattle:true, canCreateMiniCypher:true,
    canStartConcert:true, canStartWorldRelease:true,
    canScheduleEvents:true, canHostRooms:true,
    adLoadPercent:0, platformCutPercent:5, artistKeepsPercent:95,
    lobbyInviteSlots:25, performerLobbySlots:50, fanLobbySlots:50,
    sponsorSlots:{ local:90, platform:160, total:250 },
    emoteAccess:"elite",
    reactions:["heart","seated_clap","join_clap","stand_clap","wave","hype","dance_clap","candle","flashlight","confetti","sparks","firecracker","crowd_wave","stage_burst","diamond_rain","crown_drop"],
    queuePriority:0,
    premiumCosmetics:true, roomCosmeticsAccess:true,
    monthlyFee:49999,
    seasonPassFreeTrack:true, seasonPassPremiumTrack:true,
    fanRoomWaitMinutes:7, performerRoomWaitMinutes:10,
  },
};

// Hardcoded permanent Diamond tier (Platform Law #2)
export const PERMANENT_DIAMOND_ACCOUNTS = [
  "berntmusic33@gmail.com",   // Marcel Dickens
  "bj_m_beat@tmi.local",      // B.J. M Beat's
];

export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return SUBSCRIPTION_TIERS[tier];
}

export function canCreate(tier: SubscriptionTier, feature: "mini_battle" | "mini_cypher" | "concert" | "world_release"): boolean {
  const t = SUBSCRIPTION_TIERS[tier];
  switch(feature) {
    case "mini_battle":   return t.canCreateMiniBattle;
    case "mini_cypher":   return t.canCreateMiniCypher;
    case "concert":       return t.canStartConcert;
    case "world_release": return t.canStartWorldRelease;
  }
}

export function getPlatformCut(tier: SubscriptionTier, grossCents: number): { platformCents: number; artistCents: number } {
  const t = SUBSCRIPTION_TIERS[tier];
  const platformCents = Math.round(grossCents * (t.platformCutPercent / 100));
  return { platformCents, artistCents: grossCents - platformCents };
}
