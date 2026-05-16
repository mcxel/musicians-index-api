export type FanHubMode =
  | "neutral"
  | "live-auditorium"
  | "lobby"
  | "earn-points"
  | "shop"
  | "trivia"
  | "livestream";

export type FanSubscriptionTier = "free" | "pro-bronze" | "gold-platinum" | "diamond";

export type FanTransitionState =
  | "HUB_IDLE"
  | "LOBBY_OPEN"
  | "INVITE_ACCEPTED"
  | "SEATED"
  | "SHOW_START"
  | "FULLSCREEN_MODE"
  | "INTERMISSION"
  | "RETURN_TO_HUB";

export type FanTierConfig = {
  label: string;
  badge: string;
  glow: string;
  panelBackground: string;
  accent: string;
  secondaryAccent: string;
  lobbySlots: number;
  cosmeticsLimit: number;
  fanMixSlots: number;
  reactions: string[];
  watchToEarnMultiplier: number;
  premiumSeatMovement: boolean;
  privateLobby: boolean;
  advancedAnalytics: boolean;
};

const TIER_CONFIG: Record<FanSubscriptionTier, FanTierConfig> = {
  free: {
    label: "Free",
    badge: "Starter",
    glow: "0 0 0 1px rgba(255,120,45,0.35)",
    panelBackground: "linear-gradient(180deg, rgba(6,14,30,0.95), rgba(4,9,20,0.98))",
    accent: "#ff7b2f",
    secondaryAccent: "#5ad7ff",
    lobbySlots: 2,
    cosmeticsLimit: 4,
    fanMixSlots: 2,
    reactions: ["tip", "heart", "wave"],
    watchToEarnMultiplier: 1,
    premiumSeatMovement: false,
    privateLobby: false,
    advancedAnalytics: false,
  },
  "pro-bronze": {
    label: "Pro/Bronze",
    badge: "Bronze Plus",
    glow: "0 0 0 1px rgba(255,120,45,0.5), 0 0 18px rgba(255,120,45,0.22)",
    panelBackground: "linear-gradient(180deg, rgba(14,20,38,0.95), rgba(7,11,23,0.98))",
    accent: "#ff9d38",
    secondaryAccent: "#5ad7ff",
    lobbySlots: 4,
    cosmeticsLimit: 10,
    fanMixSlots: 4,
    reactions: ["tip", "heart", "wave", "confetti", "stage-spark"],
    watchToEarnMultiplier: 1.2,
    premiumSeatMovement: false,
    privateLobby: false,
    advancedAnalytics: false,
  },
  "gold-platinum": {
    label: "Gold/Platinum",
    badge: "Gold Prime",
    glow: "0 0 0 1px rgba(255,169,56,0.62), 0 0 20px rgba(255,169,56,0.3)",
    panelBackground: "linear-gradient(180deg, rgba(19,24,42,0.95), rgba(9,13,24,0.98))",
    accent: "#ffb44a",
    secondaryAccent: "#62ecff",
    lobbySlots: 6,
    cosmeticsLimit: 18,
    fanMixSlots: 8,
    reactions: ["tip", "heart", "wave", "confetti", "stage-spark", "volume"],
    watchToEarnMultiplier: 1.45,
    premiumSeatMovement: true,
    privateLobby: false,
    advancedAnalytics: false,
  },
  diamond: {
    label: "Diamond",
    badge: "Diamond Elite",
    glow: "0 0 0 1px rgba(106,236,255,0.78), 0 0 24px rgba(90,215,255,0.4)",
    panelBackground: "linear-gradient(180deg, rgba(10,19,34,0.95), rgba(5,10,19,0.98))",
    accent: "#6aecff",
    secondaryAccent: "#ffb44a",
    lobbySlots: 10,
    cosmeticsLimit: 30,
    fanMixSlots: 14,
    reactions: ["tip", "heart", "wave", "confetti", "stage-spark", "volume", "menu"],
    watchToEarnMultiplier: 2,
    premiumSeatMovement: true,
    privateLobby: true,
    advancedAnalytics: true,
  },
};

export function getFanTierConfig(tier: FanSubscriptionTier): FanTierConfig {
  return TIER_CONFIG[tier];
}

export function mapSlugToTier(slug: string): FanSubscriptionTier {
  if (slug.includes("diamond") || slug.includes("elite")) return "diamond";
  if (slug.includes("gold") || slug.includes("platinum")) return "gold-platinum";
  if (slug.includes("pro") || slug.includes("bronze")) return "pro-bronze";
  return "free";
}

export function isModeEnabled(mode: FanHubMode, tier: FanSubscriptionTier): boolean {
  if (mode === "shop" && tier === "free") return true;
  if (mode === "lobby" && tier === "free") return true;
  return true;
}
