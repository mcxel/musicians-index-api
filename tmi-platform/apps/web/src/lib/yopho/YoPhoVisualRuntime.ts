/**
 * YoPhoVisualRuntime — canonical visual state for lighting, effects, grade,
 * motion playback, and format overrides (§6257–§6310).
 *
 * This is NOT a second renderer. It is the missing document model the existing
 * CSS overlay (`YoPhoMagicEffectOverlay`) and card composition already needed:
 *   shared effect config + lighting + color grade
 *   + optional per-format overrides
 *   → resolved presentation for TRADING_CARD / ALBUM_COVER
 *
 * DISCOVER → REUSE → EXTEND:
 *   Reuses YoPhoMagicEffectId, YoPhoFormat, YoPhoCardComposition.magicEffects.
 *   Extends those IDs with real params so rain/smoke/lighting survive
 *   SAVE → RELOAD → PREVIEW → EXPORT instead of being on/off chips only.
 */

import type { YoPhoMagicEffectId } from "./YoPhoMagicEffects";
import { YOPHO_MAGIC_EFFECTS, getMagicEffectPreset } from "./YoPhoMagicEffects";
import type { YoPhoFormat } from "./YoPhoFormatAuthority";

export type YoPhoLightingDirection =
  | "top-left"
  | "top-right"
  | "center-stage"
  | "bottom-up";

export type YoPhoEffectDirection = "left" | "right" | "up" | "down";

export const YOPHO_LIGHTING_DIRECTIONS: readonly YoPhoLightingDirection[] = [
  "top-left",
  "top-right",
  "center-stage",
  "bottom-up",
] as const;

export interface YoPhoEffectParams {
  /** 0–100 visual strength */
  intensity: number;
  /** 0.25–3 animation rate */
  speed: number;
  direction: YoPhoEffectDirection;
  color: string;
  /** 0–1 layer opacity */
  opacity: number;
  /** 0–100 particle / haze count */
  density: number;
}

export interface YoPhoEffectInstance {
  id: YoPhoMagicEffectId;
  enabled: boolean;
  params: YoPhoEffectParams;
}

export interface YoPhoLightingState {
  direction: YoPhoLightingDirection;
  /** 0–100 key-light strength */
  intensity: number;
  /** 0 = cool cyan, 100 = warm gold */
  warmth: number;
  tint: string;
}

export interface YoPhoColorGrade {
  saturation: number;
  contrast: number;
  brightness: number;
}

export interface YoPhoFormatVisualOverride {
  lighting?: Partial<YoPhoLightingState>;
  /** Per-effect param overrides (enabled still follows shared unless set). */
  effects?: Partial<Record<YoPhoMagicEffectId, Partial<YoPhoEffectInstance>>>;
}

export interface YoPhoVisualState {
  lighting: YoPhoLightingState;
  grade: YoPhoColorGrade;
  effects: YoPhoEffectInstance[];
  motionPlaying: boolean;
  motionLoop: boolean;
  parallaxEnabled: boolean;
  primaryFormat: YoPhoFormat;
  formatOverrides: Partial<Record<YoPhoFormat, YoPhoFormatVisualOverride>>;
}

export type YoPhoPreviewWindowId =
  | "CARD_STATIC"
  | "CARD_MOTION"
  | "COVER_STATIC"
  | "COVER_MOTION"
  | "FINAL";

export interface YoPhoPreviewWindow {
  id: YoPhoPreviewWindowId;
  label: string;
  format: YoPhoFormat;
  motion: boolean;
  isFinal: boolean;
}

export const YOPHO_PREVIEW_WINDOWS: readonly YoPhoPreviewWindow[] = [
  { id: "CARD_STATIC", label: "Card still", format: "TRADING_CARD", motion: false, isFinal: false },
  { id: "CARD_MOTION", label: "Card motion", format: "TRADING_CARD", motion: true, isFinal: false },
  { id: "COVER_STATIC", label: "Cover still", format: "ALBUM_COVER", motion: false, isFinal: false },
  { id: "COVER_MOTION", label: "Cover motion", format: "ALBUM_COVER", motion: true, isFinal: false },
  { id: "FINAL", label: "Final / public", format: "TRADING_CARD", motion: true, isFinal: true },
] as const;

export interface YoPhoResolvedEffect {
  id: YoPhoMagicEffectId;
  slot: "underlay" | "foreground";
  params: YoPhoEffectParams;
}

export interface YoPhoResolvedVisual {
  format: YoPhoFormat;
  lighting: YoPhoLightingState;
  grade: YoPhoColorGrade;
  effects: YoPhoResolvedEffect[];
  motionPlaying: boolean;
  motionLoop: boolean;
  parallaxEnabled: boolean;
  paused: boolean;
  cssFilter: string;
}

export function defaultEffectParams(
  id: YoPhoMagicEffectId,
  partial?: Partial<YoPhoEffectParams>,
): YoPhoEffectParams {
  const preset = getMagicEffectPreset(id);
  const defaults: Record<YoPhoMagicEffectId, YoPhoEffectParams> = {
    rain: {
      intensity: 62,
      speed: 1.15,
      direction: "down",
      color: "#B4DCFF",
      opacity: 0.7,
      density: 70,
    },
    snow: {
      intensity: 48,
      speed: 0.55,
      direction: "down",
      color: "#E8F4FF",
      opacity: 0.8,
      density: 55,
    },
    fog: {
      intensity: 42,
      speed: 0.35,
      direction: "right",
      color: "#A0A8B8",
      opacity: 0.45,
      density: 50,
    },
    neon_glow: {
      intensity: 58,
      speed: 0.7,
      direction: "right",
      color: "#00E5FF",
      opacity: 0.55,
      density: 40,
    },
    smoke: {
      intensity: 56,
      speed: 0.45,
      direction: "up",
      color: "#8899AA",
      opacity: 0.5,
      density: 60,
    },
    confetti: {
      intensity: 50,
      speed: 1,
      direction: "down",
      color: "#FF2DAA",
      opacity: 0.85,
      density: 45,
    },
    light_leak: {
      intensity: 40,
      speed: 0.4,
      direction: "right",
      color: "#FFD700",
      opacity: 0.4,
      density: 30,
    },
    particles: {
      intensity: 52,
      speed: 0.85,
      direction: "up",
      color: "#00FFFF",
      opacity: 0.75,
      density: 50,
    },
  };
  void preset;
  return { ...defaults[id], ...partial };
}

export function defaultLighting(
  partial?: Partial<YoPhoLightingState>,
): YoPhoLightingState {
  return {
    direction: "center-stage",
    intensity: 55,
    warmth: 42,
    tint: "#00E5FF",
    ...partial,
  };
}

export function defaultColorGrade(partial?: Partial<YoPhoColorGrade>): YoPhoColorGrade {
  return {
    saturation: 110,
    contrast: 108,
    brightness: 100,
    ...partial,
  };
}

export function createDefaultVisual(
  partial?: Partial<YoPhoVisualState>,
): YoPhoVisualState {
  return {
    lighting: defaultLighting(partial?.lighting),
    grade: defaultColorGrade(partial?.grade),
    effects: partial?.effects ?? [],
    motionPlaying: partial?.motionPlaying ?? true,
    motionLoop: partial?.motionLoop ?? true,
    parallaxEnabled: partial?.parallaxEnabled ?? false,
    primaryFormat: partial?.primaryFormat ?? "TRADING_CARD",
    formatOverrides: partial?.formatOverrides ?? {},
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function normalizeEffectParams(params: Partial<YoPhoEffectParams> | undefined, id: YoPhoMagicEffectId): YoPhoEffectParams {
  const base = defaultEffectParams(id, params);
  return {
    intensity: clamp(base.intensity, 0, 100),
    speed: clamp(base.speed, 0.25, 3),
    direction: base.direction,
    color: base.color || defaultEffectParams(id).color,
    opacity: clamp(base.opacity, 0, 1),
    density: clamp(base.density, 0, 100),
  };
}

function mergeLighting(
  base: YoPhoLightingState,
  override?: Partial<YoPhoLightingState>,
): YoPhoLightingState {
  if (!override) return base;
  return {
    direction: override.direction ?? base.direction,
    intensity: clamp(override.intensity ?? base.intensity, 0, 100),
    warmth: clamp(override.warmth ?? base.warmth, 0, 100),
    tint: override.tint ?? base.tint,
  };
}

export function enabledMagicEffectIds(visual: YoPhoVisualState): YoPhoMagicEffectId[] {
  return visual.effects.filter((e) => e.enabled).map((e) => e.id);
}

export function hydrateVisualFromMagicIds(
  ids: YoPhoMagicEffectId[] | undefined,
  existing?: YoPhoVisualState | null,
): YoPhoVisualState {
  const base = createDefaultVisual(existing ?? undefined);
  const wanted = new Set(ids ?? enabledMagicEffectIds(base));
  const byId = new Map(base.effects.map((e) => [e.id, e]));
  const next: YoPhoEffectInstance[] = YOPHO_MAGIC_EFFECTS.map((preset) => {
    const prior = byId.get(preset.id);
    return {
      id: preset.id,
      enabled: wanted.has(preset.id),
      params: normalizeEffectParams(prior?.params, preset.id),
    };
  }).filter((e) => e.enabled || byId.has(e.id));
  return { ...base, effects: next };
}

export function toggleVisualEffect(
  visual: YoPhoVisualState,
  id: YoPhoMagicEffectId,
): YoPhoVisualState {
  const list = [...visual.effects];
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) {
    const cur = list[idx]!;
    if (cur.enabled) {
      list.splice(idx, 1);
    } else {
      list[idx] = { ...cur, enabled: true };
    }
  } else {
    list.push({ id, enabled: true, params: defaultEffectParams(id) });
  }
  return { ...visual, effects: list };
}

export function patchVisualEffect(
  visual: YoPhoVisualState,
  id: YoPhoMagicEffectId,
  partial: Partial<YoPhoEffectParams>,
): YoPhoVisualState {
  const list = [...visual.effects];
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) {
    list.push({
      id,
      enabled: true,
      params: normalizeEffectParams(partial, id),
    });
  } else {
    list[idx] = {
      ...list[idx]!,
      enabled: true,
      params: normalizeEffectParams({ ...list[idx]!.params, ...partial }, id),
    };
  }
  return { ...visual, effects: list };
}

export function setVisualLighting(
  visual: YoPhoVisualState,
  partial: Partial<YoPhoLightingState>,
): YoPhoVisualState {
  return { ...visual, lighting: mergeLighting(visual.lighting, partial) };
}

export function setFormatEffectOverride(
  visual: YoPhoVisualState,
  format: YoPhoFormat,
  id: YoPhoMagicEffectId,
  partial: Partial<YoPhoEffectInstance>,
): YoPhoVisualState {
  const current = visual.formatOverrides[format] ?? {};
  const effects = { ...(current.effects ?? {}) };
  effects[id] = { ...(effects[id] ?? {}), ...partial };
  return {
    ...visual,
    formatOverrides: {
      ...visual.formatOverrides,
      [format]: { ...current, effects },
    },
  };
}

export function resolveVisual(
  visual: YoPhoVisualState,
  format: YoPhoFormat,
  opts: { playing?: boolean } = {},
): YoPhoResolvedVisual {
  const override = visual.formatOverrides[format];
  const lighting = mergeLighting(visual.lighting, override?.lighting);
  const playing = opts.playing ?? visual.motionPlaying;
  const effects: YoPhoResolvedEffect[] = visual.effects
    .filter((e) => e.enabled)
    .map((e) => {
      const fxOverride = override?.effects?.[e.id];
      const enabled = fxOverride?.enabled ?? true;
      if (!enabled) return null;
      const params = normalizeEffectParams(
        { ...e.params, ...fxOverride?.params },
        e.id,
      );
      return {
        id: e.id,
        slot: getMagicEffectPreset(e.id).slot,
        params,
      };
    })
    .filter((e): e is YoPhoResolvedEffect => Boolean(e));

  const sat = clamp(visual.grade.saturation, 0, 200);
  const con = clamp(visual.grade.contrast, 50, 160);
  const bri = clamp(visual.grade.brightness, 50, 160);
  const warmthBoost = 0.85 + (lighting.warmth / 100) * 0.35;
  const cssFilter = `saturate(${sat}%) contrast(${con}%) brightness(${(bri / 100) * warmthBoost})`;

  return {
    format,
    lighting,
    grade: visual.grade,
    effects,
    motionPlaying: playing,
    motionLoop: visual.motionLoop,
    parallaxEnabled: visual.parallaxEnabled,
    paused: !playing,
    cssFilter,
  };
}

export function previewWindowById(id: YoPhoPreviewWindowId): YoPhoPreviewWindow {
  return YOPHO_PREVIEW_WINDOWS.find((w) => w.id === id) ?? YOPHO_PREVIEW_WINDOWS[0]!;
}

export function lightingWashCss(lighting: YoPhoLightingState): string {
  const a = clamp(lighting.intensity, 0, 100) / 100;
  const warm = lighting.warmth / 100;
  const cool = `rgba(0, 229, 255, ${0.18 * a * (1 - warm)})`;
  const gold = `rgba(255, 215, 0, ${0.2 * a * warm})`;
  const fuchsia = `rgba(255, 45, 170, ${0.1 * a})`;
  switch (lighting.direction) {
    case "top-left":
      return `radial-gradient(ellipse at 18% 12%, ${gold} 0%, ${cool} 28%, transparent 62%), radial-gradient(ellipse at 80% 90%, ${fuchsia} 0%, transparent 50%)`;
    case "top-right":
      return `radial-gradient(ellipse at 82% 12%, ${gold} 0%, ${cool} 28%, transparent 62%), radial-gradient(ellipse at 20% 90%, ${fuchsia} 0%, transparent 50%)`;
    case "bottom-up":
      return `radial-gradient(ellipse at 50% 92%, ${gold} 0%, ${cool} 36%, transparent 70%)`;
    default:
      return `radial-gradient(ellipse at 50% 28%, ${gold} 0%, ${cool} 32%, transparent 68%), radial-gradient(ellipse at 50% 100%, ${fuchsia} 0%, transparent 55%)`;
  }
}

export function serializeVisual(visual: YoPhoVisualState): Record<string, unknown> {
  return {
    lighting: visual.lighting,
    grade: visual.grade,
    effects: visual.effects,
    motionPlaying: visual.motionPlaying,
    motionLoop: visual.motionLoop,
    parallaxEnabled: visual.parallaxEnabled,
    primaryFormat: visual.primaryFormat,
    formatOverrides: visual.formatOverrides,
  };
}

export function parseVisual(raw: unknown): YoPhoVisualState | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Partial<YoPhoVisualState>;
  const effects = Array.isArray(v.effects)
    ? v.effects
        .filter((e) => e && typeof e.id === "string")
        .map((e) => ({
          id: e.id as YoPhoMagicEffectId,
          enabled: Boolean(e.enabled),
          params: normalizeEffectParams(e.params, e.id as YoPhoMagicEffectId),
        }))
    : [];
  return createDefaultVisual({
    lighting: defaultLighting(v.lighting),
    grade: defaultColorGrade(v.grade),
    effects,
    motionPlaying: v.motionPlaying,
    motionLoop: v.motionLoop,
    parallaxEnabled: v.parallaxEnabled,
    primaryFormat: v.primaryFormat === "ALBUM_COVER" ? "ALBUM_COVER" : "TRADING_CARD",
    formatOverrides: v.formatOverrides ?? {},
  });
}

/** Starter-recipe helper — enabled effects with optional param tweaks. */
export function visualRecipe(
  ids: YoPhoMagicEffectId[],
  extras?: Partial<YoPhoVisualState>,
): YoPhoVisualState {
  return createDefaultVisual({
    ...extras,
    effects: ids.map((id) => ({
      id,
      enabled: true,
      params: defaultEffectParams(id),
    })),
  });
}
