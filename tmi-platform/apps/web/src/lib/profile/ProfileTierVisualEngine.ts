export type ProfileTier = "free" | "pro" | "bronze" | "gold" | "platinum" | "diamond";

export type TierVisualTheme = {
  tier: ProfileTier;
  accent: string;
  frameStyle: "flat" | "neon" | "metal" | "prism";
  glow: number;
};

const THEMES: Record<ProfileTier, TierVisualTheme> = {
  free: { tier: "free", accent: "#6b7280", frameStyle: "flat", glow: 0 },
  pro: { tier: "pro", accent: "#22d3ee", frameStyle: "neon", glow: 0.25 },
  bronze: { tier: "bronze", accent: "#cd7f32", frameStyle: "metal", glow: 0.2 },
  gold: { tier: "gold", accent: "#facc15", frameStyle: "metal", glow: 0.32 },
  platinum: { tier: "platinum", accent: "#93c5fd", frameStyle: "prism", glow: 0.36 },
  diamond: { tier: "diamond", accent: "#c4b5fd", frameStyle: "prism", glow: 0.42 },
};

export function resolveProfileTierTheme(tier: ProfileTier): TierVisualTheme {
  return THEMES[tier];
}
