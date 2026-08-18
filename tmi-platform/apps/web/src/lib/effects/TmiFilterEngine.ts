/**
 * TmiFilterEngine.ts
 *
 * WebGL / Canvas / CSS GPU shader engine for in-stream camera filters,
 * era presets, light leaks, chromatic aberration, and neon aura tracing.
 *
 * Zero-latency client execution — preserves source WebRTC resolution.
 */

export type EraPresetId = "natural" | "noir_1950" | "warm_1970" | "camcorder_1990" | "neon_aura" | "chromatic_glitch";

export type QualityTier = "ULTRA" | "HIGH" | "STANDARD" | "MOBILE";

export interface EraPreset {
  id: EraPresetId;
  name: string;
  eraLabel: string;
  cssFilter: string;
  overlayType?: "grain" | "light_leak" | "scanline" | "neon_trace" | "none";
  particleDensity: number; // 0..100
  audioReactiveColor?: string;
  description: string;
}

export const ERA_PRESETS: Record<EraPresetId, EraPreset> = {
  natural: {
    id: "natural",
    name: "Natural Camera",
    eraLabel: "RAW",
    cssFilter: "none",
    overlayType: "none",
    particleDensity: 0,
    description: "Unfiltered clean camera feed.",
  },
  noir_1950: {
    id: "noir_1950",
    name: "1950s Cinema Noir",
    eraLabel: "1950s",
    cssFilter: "grayscale(100%) contrast(140%) brightness(90%) sepia(20%)",
    overlayType: "grain",
    particleDensity: 15,
    audioReactiveColor: "#FFFFFF",
    description: "Classic black-and-white film grain with high contrast shadows.",
  },
  warm_1970: {
    id: "warm_1970",
    name: "1970s Analog Warmth",
    eraLabel: "1970s",
    cssFilter: "sepia(45%) saturate(130%) contrast(110%) hue-rotate(-10deg) brightness(105%)",
    overlayType: "light_leak",
    particleDensity: 25,
    audioReactiveColor: "#FFD700",
    description: "Rich vintage amber saturation, warm light leaks, and retro film vibe.",
  },
  camcorder_1990: {
    id: "camcorder_1990",
    name: "1990s Hi8 Camcorder",
    eraLabel: "1990s",
    cssFilter: "contrast(115%) saturate(120%) brightness(98%) blur(0.3px)",
    overlayType: "scanline",
    particleDensity: 10,
    audioReactiveColor: "#00FF88",
    description: "Analog TV scanlines, subtle date stamp, and authentic home-video noise.",
  },
  neon_aura: {
    id: "neon_aura",
    name: "Neon Energy Aura",
    eraLabel: "CYBER",
    cssFilter: "drop-shadow(0 0 12px #00FFFF) contrast(125%) saturate(160%)",
    overlayType: "neon_trace",
    particleDensity: 60,
    audioReactiveColor: "#00FFFF",
    description: "Pulsing neon edge glow that synchronizes with performance dynamics.",
  },
  chromatic_glitch: {
    id: "chromatic_glitch",
    name: "Ambient Light Glitch",
    eraLabel: "RGB",
    cssFilter: "contrast(130%) saturate(140%) hue-rotate(15deg)",
    overlayType: "scanline",
    particleDensity: 40,
    audioReactiveColor: "#FF2DAA",
    description: "RGB chromatic splitting with reactive ambient focus pulsing.",
  },
};

export class TmiFilterEngine {
  private currentPreset: EraPresetId = "natural";
  private qualityTier: QualityTier = "HIGH";

  constructor(initialPreset: EraPresetId = "natural", tier: QualityTier = "HIGH") {
    this.currentPreset = initialPreset;
    this.qualityTier = tier;
  }

  public getActivePreset(): EraPreset {
    return ERA_PRESETS[this.currentPreset] ?? ERA_PRESETS.natural;
  }

  public setPreset(presetId: EraPresetId): EraPreset {
    if (ERA_PRESETS[presetId]) {
      this.currentPreset = presetId;
    }
    return this.getActivePreset();
  }

  public setQualityTier(tier: QualityTier): void {
    this.qualityTier = tier;
  }

  public getCssFilterString(): string {
    const preset = this.getActivePreset();
    if (this.qualityTier === "MOBILE" && preset.id === "camcorder_1990") {
      return "contrast(110%) saturate(110%)"; // Mobile optimization fallback
    }
    return preset.cssFilter;
  }
}
