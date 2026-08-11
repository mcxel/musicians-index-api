/**
 * YoPho portrait creative controls — catalog + blueprint mutations.
 * Rule 20: unavailable effects are not clickable as if live.
 */

import type {
  YoPhoPortraitBlueprint,
  YoPhoPortraitOverlayEffectId,
  YoPhoPortraitEffectParams,
  PortraitCompositionMode,
  TexturePreset,
  BlendMode,
} from "./YoPhoPortraitEngine";
import {
  defaultPortraitEffectParams,
  upsertPortraitEffect,
  removePortraitEffect,
} from "./YoPhoPortraitEngine";

export type YoPhoPortraitControlStatus = "pass" | "coming_soon";

export type YoPhoPortraitControlKind =
  | "mode"
  | "texture"
  | "overlay"
  | "layer"
  | "ai";

export interface YoPhoPortraitControlDef {
  id: string;
  label: string;
  kind: YoPhoPortraitControlKind;
  status: YoPhoPortraitControlStatus;
  description: string;
  /** Overlay id when kind === overlay */
  overlayId?: YoPhoPortraitOverlayEffectId;
}

export const YOPHO_PORTRAIT_CONTROLS: YoPhoPortraitControlDef[] = [
  { id: "black_white", label: "Black & White", kind: "texture", status: "pass", description: "Grayscale look on the active working image (CSS filter — live preview)." },
  { id: "era_60s", label: "60s Era", kind: "texture", status: "coming_soon", description: "Dedicated 60s era filter pack — not wired yet." },
  { id: "era_70s", label: "70s Era", kind: "texture", status: "coming_soon", description: "Dedicated 70s era filter pack — not wired yet." },
  { id: "vintage", label: "Vintage Album", kind: "texture", status: "pass", description: "Warm sepia album texture (real CSS preset)." },
  { id: "animation", label: "Animation", kind: "layer", status: "pass", description: "Loop stage underlay video on the card." },
  { id: "particles", label: "Particles", kind: "overlay", status: "pass", description: "Foreground celebration flecks.", overlayId: "particles" },
  { id: "double_exposure", label: "Double Exposure", kind: "mode", status: "pass", description: "Silhouette filled with memory scene." },
  { id: "motion", label: "Motion", kind: "layer", status: "pass", description: "Enable motion underlay + drift." },
  { id: "lighting", label: "Lighting", kind: "layer", status: "pass", description: "Cycle stage lighting direction." },
  { id: "blend", label: "Blend", kind: "layer", status: "pass", description: "Cycle inner blend mode." },
  { id: "shake", label: "Shake", kind: "overlay", status: "pass", description: "Beat-sync style camera shake.", overlayId: "shake" },
  { id: "fade", label: "Fade", kind: "overlay", status: "pass", description: "Opacity pulse on subject.", overlayId: "fade" },
  { id: "drift", label: "Drift", kind: "overlay", status: "pass", description: "Slow lateral drift.", overlayId: "drift" },
  { id: "zoom", label: "Zoom", kind: "overlay", status: "pass", description: "Breathing zoom on subject.", overlayId: "zoom" },
  { id: "particle_dissolve", label: "Particle Dissolve", kind: "overlay", status: "coming_soon", description: "Mesh dissolve export — not built yet." },
  { id: "neon_pulse", label: "Neon Pulse", kind: "overlay", status: "pass", description: "Cyan/fuchsia bloom pulse.", overlayId: "neon_pulse" },
  { id: "parallax", label: "Parallax", kind: "mode", status: "pass", description: "Depth parallax foreground/background." },
  { id: "film_burn", label: "Film Burn", kind: "overlay", status: "pass", description: "Warm edge burn sweep.", overlayId: "film_burn" },
  { id: "smoke", label: "Smoke", kind: "overlay", status: "pass", description: "Stage haze columns.", overlayId: "smoke" },
  { id: "light_sweep", label: "Light Sweep", kind: "overlay", status: "pass", description: "Broadcast light pass.", overlayId: "light_sweep" },
  { id: "glitch", label: "Glitch", kind: "overlay", status: "pass", description: "RGB split glitch burst.", overlayId: "glitch" },
  { id: "rotate", label: "Rotate", kind: "overlay", status: "pass", description: "Slow subject rotation.", overlayId: "rotate" },
  { id: "ai_magic", label: "AI Magic", kind: "ai", status: "coming_soon", description: "Generative preview pipeline — not connected." },
];

const LIGHTING_CYCLE = ["top-left", "top-right", "center-stage", "bottom-up"] as const;
const BLEND_CYCLE: BlendMode[] = [
  "normal",
  "screen",
  "overlay",
  "multiply",
  "color-dodge",
  "soft-light",
  "luminosity",
];

export function getPortraitControl(id: string): YoPhoPortraitControlDef | undefined {
  return YOPHO_PORTRAIT_CONTROLS.find((c) => c.id === id);
}

export function getActiveOverlayParams(
  blueprint: YoPhoPortraitBlueprint,
  overlayId: YoPhoPortraitOverlayEffectId,
): YoPhoPortraitEffectParams | null {
  const layer = (blueprint.portraitEffects ?? []).find(
    (e) => e.effectId === overlayId && e.enabled,
  );
  return layer?.params ?? null;
}

export function applyPortraitControl(
  blueprint: YoPhoPortraitBlueprint,
  controlId: string,
): YoPhoPortraitBlueprint {
  const def = getPortraitControl(controlId);
  if (!def || def.status === "coming_soon") return blueprint;

  let next = { ...blueprint, updatedAt: new Date().toISOString() };

  switch (controlId) {
    case "black_white":
      next.texturePreset = next.texturePreset === "black_white" ? "none" : "black_white";
      break;
    case "vintage":
      next.texturePreset = next.texturePreset === "vintage_album" ? "none" : "vintage_album";
      break;
    case "animation":
      next.isAnimated = !next.isAnimated;
      break;
    case "double_exposure":
      next.mode = next.mode === "double_exposure" ? "single" : "double_exposure";
      break;
    case "parallax":
      next.mode = next.mode === "depth_parallax" ? "single" : "depth_parallax";
      break;
    case "motion":
      next.isAnimated = true;
      next = upsertPortraitEffect(next, "drift", { intensity: 45, speed: 0.85 });
      break;
    case "lighting": {
      const idx = LIGHTING_CYCLE.indexOf(next.lightingDirection);
      next.lightingDirection = LIGHTING_CYCLE[(idx + 1) % LIGHTING_CYCLE.length]!;
      break;
    }
    case "blend": {
      const current = next.primaryLayer.blendMode;
      const bIdx = BLEND_CYCLE.indexOf(current);
      const blendMode = BLEND_CYCLE[(bIdx + 1) % BLEND_CYCLE.length]!;
      next.primaryLayer = { ...next.primaryLayer, blendMode };
      break;
    }
    default:
      if (def.overlayId) {
        const existing = (next.portraitEffects ?? []).find((e) => e.effectId === def.overlayId);
        if (existing?.enabled) {
          next = removePortraitEffect(next, def.overlayId);
        } else {
          next = upsertPortraitEffect(next, def.overlayId, defaultPortraitEffectParams());
        }
      }
      break;
  }

  return next;
}

export function patchOverlayParams(
  blueprint: YoPhoPortraitBlueprint,
  overlayId: YoPhoPortraitOverlayEffectId,
  partial: Partial<YoPhoPortraitEffectParams>,
): YoPhoPortraitBlueprint {
  return upsertPortraitEffect(blueprint, overlayId, partial);
}

export function resetPreviewEffects(blueprint: YoPhoPortraitBlueprint): YoPhoPortraitBlueprint {
  return {
    ...blueprint,
    portraitEffects: [],
    updatedAt: new Date().toISOString(),
  };
}

export function textureFromControl(id: string): TexturePreset | null {
  const map: Record<string, TexturePreset> = {
    cyber_glow: "cyber_glow",
    vintage: "vintage_album",
    black_white: "black_white",
  };
  return map[id] ?? null;
}

export function applyTexturePreset(
  blueprint: YoPhoPortraitBlueprint,
  preset: TexturePreset,
): YoPhoPortraitBlueprint {
  return { ...blueprint, texturePreset: preset, updatedAt: new Date().toISOString() };
}

export function setCompositionMode(
  blueprint: YoPhoPortraitBlueprint,
  mode: PortraitCompositionMode,
): YoPhoPortraitBlueprint {
  if (mode === "live_cutout") return blueprint;
  return { ...blueprint, mode, updatedAt: new Date().toISOString() };
}
