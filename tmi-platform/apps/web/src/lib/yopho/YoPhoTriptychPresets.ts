/**
 * YoPhoTriptychPresets — multi-image depth layer configs for YoPho cards.
 *
 * A triptych uses the existing YoPhoDepthParallaxCanvas DepthLayer system to
 * show 2 or 3 portrait images at different perceived Z-depths with parallax.
 * The result matches the boxing-card reference: one dominant subject foreground,
 * two flanking portraits receding in the background.
 *
 * These configs are pure data — no rendering happens here.
 * Pass `triptych.layers` to <YoPhoDepthParallaxCanvas layers={...} />.
 */

import type { DepthLayer } from "@/components/yopho/YoPhoDepthParallaxCanvas";

/** Layout style for the background portrait grid */
export type YoPhoTriptychLayout =
  | "flanking"       // left + right pillars (classic boxing-card)
  | "flanking_center" // left + center + right (triple / triptych)
  | "stacked"        // two images overlaid with depth separation
  | "mirror";        // single image mirrored left / right

/** What the owner provided for each slot */
export interface YoPhoTriptychSlot {
  imageUrl: string;
  /** Optional secondary image for motion poster / hover swap */
  altImageUrl?: string;
  label?: string;
}

/** The triptych config stored on a YoPhoCardDocument */
export interface YoPhoTriptychConfig {
  layout: YoPhoTriptychLayout;
  /** Primary subject (foreground) */
  foreground: YoPhoTriptychSlot;
  /** 1–3 background portrait slots */
  backgrounds: [YoPhoTriptychSlot, ...YoPhoTriptychSlot[]];
  /** CSS custom-property accent (e.g. "#FFD700") — overrides scene default */
  accentColor?: string;
  /** 0–1 opacity for background portraits (default 0.65) */
  bgOpacity?: number;
}

// ── Builders ──────────────────────────────────────────────────────────────────

/**
 * Convert a YoPhoTriptychConfig into the DepthLayer array the parallax canvas expects.
 * Call this inside the component that renders the card.
 */
export function buildTriptychDepthLayers(cfg: YoPhoTriptychConfig): DepthLayer[] {
  const bgOpacity = cfg.bgOpacity ?? 0.65;
  const layers: DepthLayer[] = [];

  // Background portraits — depth recedes left→right depending on layout
  cfg.backgrounds.forEach((slot, i) => {
    const count = cfg.backgrounds.length;

    let xOffset = 0;
    if (cfg.layout === "flanking" || cfg.layout === "flanking_center") {
      if (count === 1) xOffset = 0;
      else if (count === 2) xOffset = i === 0 ? -55 : 55;
      else xOffset = [-55, 0, 55][i] ?? 0;
    } else if (cfg.layout === "mirror") {
      xOffset = i === 0 ? -40 : 40;
    }

    layers.push({
      id: `triptych_bg_${i}`,
      imageUrl: slot.imageUrl,
      label: slot.label ?? `Background ${i + 1}`,
      depthZ: -60 - i * 15,
      parallaxStrength: 0.18 + i * 0.04,
      depthBlur: 1.5 + i * 0.5,
      scale: 1.12,
      xOffset,
      yOffset: 0,
      opacity: bgOpacity,
    });
  });

  // Foreground subject — sits closest to viewer
  layers.push({
    id: "triptych_fg",
    imageUrl: cfg.foreground.imageUrl,
    label: cfg.foreground.label ?? "Subject",
    depthZ: 25,
    parallaxStrength: 0.55,
    depthBlur: 0,
    scale: 1.0,
    xOffset: 0,
    yOffset: 0,
    opacity: 1,
  });

  return layers;
}

// ── Preset configs (no real images — consumer must supply imageUrls) ──────────

export function makeFlanking2Config(
  foregroundUrl: string,
  leftBgUrl: string,
  rightBgUrl: string,
  accentColor?: string,
): YoPhoTriptychConfig {
  return {
    layout: "flanking",
    foreground: { imageUrl: foregroundUrl, label: "Subject" },
    backgrounds: [
      { imageUrl: leftBgUrl, label: "Left" },
      { imageUrl: rightBgUrl, label: "Right" },
    ],
    accentColor,
    bgOpacity: 0.6,
  };
}

export function makeTriptych3Config(
  foregroundUrl: string,
  leftBgUrl: string,
  centerBgUrl: string,
  rightBgUrl: string,
  accentColor?: string,
): YoPhoTriptychConfig {
  return {
    layout: "flanking_center",
    foreground: { imageUrl: foregroundUrl, label: "Subject" },
    backgrounds: [
      { imageUrl: leftBgUrl, label: "Left" },
      { imageUrl: centerBgUrl, label: "Center" },
      { imageUrl: rightBgUrl, label: "Right" },
    ],
    accentColor,
    bgOpacity: 0.55,
  };
}

export function makeMirrorConfig(
  foregroundUrl: string,
  portraitUrl: string,
  accentColor?: string,
): YoPhoTriptychConfig {
  return {
    layout: "mirror",
    foreground: { imageUrl: foregroundUrl, label: "Subject" },
    backgrounds: [
      { imageUrl: portraitUrl, label: "Mirror L" },
      { imageUrl: portraitUrl, label: "Mirror R" },
    ],
    accentColor,
    bgOpacity: 0.5,
  };
}
