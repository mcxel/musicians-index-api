export type ProfileTier = "free" | "pro" | "gold" | "diamond";

export type ProfileTierSkin = {
  titleColor: string;
  panelBorder: string;
  panelGlow: string;
  commandAccent: string;
  actionAccent: string;
  background: string;
};

const SKINS: Record<ProfileTier, ProfileTierSkin> = {
  free: {
    titleColor: "#ff8f3a",
    panelBorder: "rgba(255,120,45,0.42)",
    panelGlow: "0 0 26px rgba(255,120,45,0.22)",
    commandAccent: "#5ad7ff",
    actionAccent: "#ff8f3a",
    background: "radial-gradient(circle at 14% 9%, rgba(255,120,45,0.22), transparent 27%), radial-gradient(circle at 88% 18%, rgba(90,215,255,0.18), transparent 30%), linear-gradient(180deg, #04070f 0%, #050a17 45%, #02050b 100%)",
  },
  pro: {
    titleColor: "#ff9a41",
    panelBorder: "rgba(255,156,70,0.48)",
    panelGlow: "0 0 28px rgba(255,156,70,0.24)",
    commandAccent: "#62e4ff",
    actionAccent: "#ff9a41",
    background: "radial-gradient(circle at 14% 9%, rgba(255,145,60,0.23), transparent 28%), radial-gradient(circle at 88% 18%, rgba(98,228,255,0.2), transparent 30%), linear-gradient(180deg, #04070f 0%, #050a17 45%, #02050b 100%)",
  },
  gold: {
    titleColor: "#ffc45a",
    panelBorder: "rgba(255,196,90,0.5)",
    panelGlow: "0 0 30px rgba(255,196,90,0.24)",
    commandAccent: "#6aecff",
    actionAccent: "#ffc45a",
    background: "radial-gradient(circle at 14% 9%, rgba(255,180,70,0.23), transparent 28%), radial-gradient(circle at 88% 18%, rgba(106,236,255,0.2), transparent 30%), linear-gradient(180deg, #04070f 0%, #050a17 45%, #02050b 100%)",
  },
  diamond: {
    titleColor: "#6aecff",
    panelBorder: "rgba(106,236,255,0.56)",
    panelGlow: "0 0 34px rgba(106,236,255,0.28)",
    commandAccent: "#ffc45a",
    actionAccent: "#6aecff",
    background: "radial-gradient(circle at 14% 9%, rgba(106,236,255,0.2), transparent 28%), radial-gradient(circle at 88% 18%, rgba(255,190,90,0.2), transparent 30%), linear-gradient(180deg, #04070f 0%, #050a17 45%, #02050b 100%)",
  },
};

export function mapFanTierToProfileTier(tier: string): ProfileTier {
  if (tier === "diamond") return "diamond";
  if (tier === "gold-platinum") return "gold";
  if (tier === "pro-bronze") return "pro";
  return "free";
}

export function getProfileTierSkin(tier: ProfileTier): ProfileTierSkin {
  return SKINS[tier];
}
