import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export interface FanPerspectiveState {
  section: "back" | "mid" | "lower-front" | "front-row" | "vip";
  label: string;
  cameraHeightOffset: number;  // px offset from baseline, positive = higher seat (back)
  cameraFOV: number;           // degrees
  occlusionIntensity: number;  // 0–1: 0 = clear, 1 = max heads visible
  canRotate180: boolean;       // turn around and see crowd
  audioMix: "crowd-forward" | "balanced" | "performer-clear";
  renderQuality: "standard" | "enhanced" | "premium";
  proximityBonusXP: number;    // XP/min bonus for being in this section
}

const PERSPECTIVE_MAP: Record<TmiSeatTier, FanPerspectiveState> = {
  "free-back-row": {
    section: "back",
    label: "Back Row",
    cameraHeightOffset: 120,
    cameraFOV: 80,
    occlusionIntensity: 1,
    canRotate180: false,
    audioMix: "crowd-forward",
    renderQuality: "standard",
    proximityBonusXP: 0,
  },
  "paid-mid-row": {
    section: "mid",
    label: "Mid Section",
    cameraHeightOffset: 60,
    cameraFOV: 72,
    occlusionIntensity: 0.5,
    canRotate180: false,
    audioMix: "balanced",
    renderQuality: "standard",
    proximityBonusXP: 2,
  },
  "premium-front-row": {
    section: "front-row",
    label: "Front Row",
    cameraHeightOffset: 0,
    cameraFOV: 65,
    occlusionIntensity: 0,
    canRotate180: false,
    audioMix: "performer-clear",
    renderQuality: "enhanced",
    proximityBonusXP: 5,
  },
  "sponsor-vip-front-glow": {
    section: "vip",
    label: "VIP / Side Stage",
    cameraHeightOffset: -20,
    cameraFOV: 60,
    occlusionIntensity: 0,
    canRotate180: true,
    audioMix: "performer-clear",
    renderQuality: "premium",
    proximityBonusXP: 10,
  },
};

export function getFanPerspective(tier: TmiSeatTier): FanPerspectiveState {
  return PERSPECTIVE_MAP[tier] ?? PERSPECTIVE_MAP["free-back-row"];
}

export function getOcclusionOpacity(tier: TmiSeatTier): number {
  return PERSPECTIVE_MAP[tier]?.occlusionIntensity ?? 1;
}

export function getCameraTransform(tier: TmiSeatTier): string {
  const p = getFanPerspective(tier);
  const translateY = p.cameraHeightOffset;
  const scale = 1 - (p.occlusionIntensity * 0.08);
  return `translateY(${translateY}px) scale(${scale.toFixed(3)})`;
}

// Returns a CSS filter that simulates perspective distance blur for back rows
export function getDistanceFilter(tier: TmiSeatTier): string {
  const intensity = PERSPECTIVE_MAP[tier]?.occlusionIntensity ?? 1;
  if (intensity === 0) return "none";
  const blur = (intensity * 0.8).toFixed(1);
  const brightness = (1 - intensity * 0.12).toFixed(2);
  return `blur(${blur}px) brightness(${brightness})`;
}

// Number of fake "crowd head" avatars to render in front of this viewer
export function getOcclusionHeadCount(tier: TmiSeatTier): number {
  const intensity = PERSPECTIVE_MAP[tier]?.occlusionIntensity ?? 1;
  return Math.round(intensity * 8);
}

export function upgradePerspectiveLabel(from: TmiSeatTier, to: TmiSeatTier): string {
  const fromP = getFanPerspective(from);
  const toP = getFanPerspective(to);
  return `Move from ${fromP.label} → ${toP.label}`;
}
