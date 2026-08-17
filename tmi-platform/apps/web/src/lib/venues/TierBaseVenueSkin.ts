/**
 * Subscription base venue skins — appearance only.
 * Geometry, seats, capacity, and collision do not change by tier.
 * Ladder is FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND.
 * Bronze is not a tier; it maps to RUBY.
 */

import type { UserTier } from "@/lib/auth/UserStore";

export type TierBaseVenueSkinId =
  | "BASE_FREE"
  | "BASE_PRO"
  | "BASE_RUBY"
  | "BASE_SILVER"
  | "BASE_GOLD"
  | "BASE_PLATINUM"
  | "BASE_DIAMOND";

export type TierBaseVenueSkin = {
  id: TierBaseVenueSkinId;
  tier: UserTier;
  label: string;
  accent: string;
  trim: string;
  lightingLayers: number;
  animatedLed: boolean;
  prestigeFx: boolean;
  interiorVariant: string;
  exteriorVariant: string;
  loungeVariant: string;
  outdoorVariant: string;
};

const TIER_BASE_SKINS: Record<UserTier, TierBaseVenueSkin> = {
  FREE: {
    id: "BASE_FREE",
    tier: "FREE",
    label: "Base Arena",
    accent: "#6B7280",
    trim: "graphite",
    lightingLayers: 1,
    animatedLed: false,
    prestigeFx: false,
    interiorVariant: "base-interior-free",
    exteriorVariant: "base-exterior-free",
    loungeVariant: "base-lounge-free",
    outdoorVariant: "base-outdoor-free",
  },
  PRO: {
    id: "BASE_PRO",
    tier: "PRO",
    label: "Pro Arena",
    accent: "#22D3EE",
    trim: "electric-cool",
    lightingLayers: 2,
    animatedLed: true,
    prestigeFx: false,
    interiorVariant: "base-interior-pro",
    exteriorVariant: "base-exterior-pro",
    loungeVariant: "base-lounge-pro",
    outdoorVariant: "base-outdoor-pro",
  },
  RUBY: {
    id: "BASE_RUBY",
    tier: "RUBY",
    label: "Ruby Arena",
    accent: "#FF2DAA",
    trim: "ruby-crimson",
    lightingLayers: 3,
    animatedLed: true,
    prestigeFx: false,
    interiorVariant: "base-interior-ruby",
    exteriorVariant: "base-exterior-ruby",
    loungeVariant: "base-lounge-ruby",
    outdoorVariant: "base-outdoor-ruby",
  },
  SILVER: {
    id: "BASE_SILVER",
    tier: "SILVER",
    label: "Silver Arena",
    accent: "#C0C7D1",
    trim: "silver-metal",
    lightingLayers: 3,
    animatedLed: true,
    prestigeFx: false,
    interiorVariant: "base-interior-silver",
    exteriorVariant: "base-exterior-silver",
    loungeVariant: "base-lounge-silver",
    outdoorVariant: "base-outdoor-silver",
  },
  GOLD: {
    id: "BASE_GOLD",
    tier: "GOLD",
    label: "Gold Arena",
    accent: "#FFD700",
    trim: "gold-champagne",
    lightingLayers: 4,
    animatedLed: true,
    prestigeFx: false,
    interiorVariant: "base-interior-gold",
    exteriorVariant: "base-exterior-gold",
    loungeVariant: "base-lounge-gold",
    outdoorVariant: "base-outdoor-gold",
  },
  PLATINUM: {
    id: "BASE_PLATINUM",
    tier: "PLATINUM",
    label: "Platinum Arena",
    accent: "#E5E4E2",
    trim: "platinum-chrome",
    lightingLayers: 5,
    animatedLed: true,
    prestigeFx: false,
    interiorVariant: "base-interior-platinum",
    exteriorVariant: "base-exterior-platinum",
    loungeVariant: "base-lounge-platinum",
    outdoorVariant: "base-outdoor-platinum",
  },
  DIAMOND: {
    id: "BASE_DIAMOND",
    tier: "DIAMOND",
    label: "Diamond Arena",
    accent: "#F8FAFC",
    trim: "crystal-prismatic",
    lightingLayers: 6,
    animatedLed: true,
    prestigeFx: true,
    interiorVariant: "base-interior-diamond",
    exteriorVariant: "base-exterior-diamond",
    loungeVariant: "base-lounge-diamond",
    outdoorVariant: "base-outdoor-diamond",
  },
};

const TIER_ORDER: UserTier[] = ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

/** Legacy Bronze → Ruby. Never emit BRONZE as a live tier. */
export function canonicalizeAccountTier(raw: string | null | undefined): UserTier {
  const n = (raw ?? "").trim().toUpperCase();
  if (n === "BRONZE") return "RUBY";
  if ((TIER_ORDER as string[]).includes(n)) return n as UserTier;
  return "FREE";
}

export function resolveBaseVenueSkin(tier: UserTier | string | null | undefined): TierBaseVenueSkin {
  const canonical = canonicalizeAccountTier(typeof tier === "string" ? tier : tier ?? "FREE");
  return TIER_BASE_SKINS[canonical];
}

export function getAllTierBaseVenueSkins(): TierBaseVenueSkin[] {
  return TIER_ORDER.map((t) => TIER_BASE_SKINS[t]);
}

export function tierBaseSkinMap(): Record<UserTier, string> {
  return {
    FREE: "BASE_FREE",
    PRO: "BASE_PRO",
    RUBY: "BASE_RUBY",
    SILVER: "BASE_SILVER",
    GOLD: "BASE_GOLD",
    PLATINUM: "BASE_PLATINUM",
    DIAMOND: "BASE_DIAMOND",
  };
}
