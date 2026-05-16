export type TmiOverlayPreset = {
  id: string;
  frameGlow: string;
  badgeGlow: string;
  motionTrail: string;
};

export const TMI_OVERLAY_PRESETS: TmiOverlayPreset[] = [
  {
    id: "magazine-neon",
    frameGlow: "0 0 18px rgba(34,211,238,0.32), 0 0 32px rgba(255,80,214,0.22)",
    badgeGlow: "0 0 14px rgba(255,224,102,0.38)",
    motionTrail: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.24), rgba(255,255,255,0))",
  },
];

export function getOverlayPreset(id = "magazine-neon"): TmiOverlayPreset {
  return TMI_OVERLAY_PRESETS.find((item) => item.id === id) ?? TMI_OVERLAY_PRESETS[0];
}
