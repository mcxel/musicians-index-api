/**
 * YoPhoCardDocument — canonical scene-document for living layered identity cards.
 * Phase A: JSON document is source of truth; PNG/WebM remain non-interactive teasers.
 *
 * Rule: one CANONICAL_IDENTITY card per account conceptually;
 * editions are separate docs linked by ownerKey.
 */

import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import type { YoPhoSceneId } from "./YoPhoScenePack";
import type { YoPhoMagicEffectId } from "./YoPhoMagicEffects";
import {
  createDefaultComposition,
  defaultMotionClip,
  defaultTextOverlay,
  type YoPhoCardComposition,
  type YoPhoMotionClip,
  type YoPhoMotionDurationSec,
  type YoPhoTextOverlay,
} from "./YoPhoCardComposition";
import type { YoPhoCardRole, YoPhoNowPlaying } from "./YoPhoCardRegistry";

/** Card document kinds — canonical identity vs edition variants */
export type YoPhoCardKind =
  | "CANONICAL_IDENTITY"
  | "PROMOTIONAL_EDITION"
  | "MEMORY_EDITION"
  | "SCENE_EDITION"
  /** @deprecated prefer MEMORY_EDITION */
  | "MOMENT_SNAPSHOT";

export type YoPhoRoleTemplate = "FAN_IDENTITY" | "PERFORMER_IDENTITY";

/** Display-only collectible label — no ownership ledger / marketplace */
export type YoPhoRarityLabel = "STANDARD" | "RARE";

/**
 * Implementable Phase A layer types.
 * Maps to UI: Scene→ENVIRONMENT/BG, Effects→UNDERLAY/FOREGROUND, Identity→PERSON_CUTOUT/TEXT…
 */
export type YoPhoLayerType =
  | "BACKGROUND_IMAGE"
  | "BACKGROUND_VIDEO"
  | "GRADIENT"
  | "ENVIRONMENT"
  | "UNDERLAY_EFFECT"
  | "PERSON_CUTOUT"
  | "PROP"
  | "TEXT"
  | "QUOTE"
  | "FOREGROUND_EFFECT"
  | "SYSTEM_BRANDING"
  | "QR_CODE"
  | "AUDIO_META";

export type YoPhoCanvasAspect = "9:16" | "3:4" | "1:1";

export interface YoPhoLayerBounds {
  /** Normalized 0–1 relative to canvas */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface YoPhoCanvasSpec {
  aspectRatio: YoPhoCanvasAspect;
  width: number;
  height: number;
  /** Protected branding band — creator content stays above (0.08–0.12) */
  safeAreaBottomPct: number;
}

export interface YoPhoLayerBase {
  id: string;
  type: YoPhoLayerType;
  zIndex: number;
  visible: boolean;
  opacity?: number;
  /** SYSTEM_BRANDING / QR_CODE always locked — not user-deletable */
  locked?: boolean;
  bounds?: YoPhoLayerBounds;
  asset?: { url: string; mime?: string | null };
  style?: Record<string, string | number | boolean | null>;
  mask?: string | null;
}

export interface YoPhoEnvironmentLayer extends YoPhoLayerBase {
  type: "ENVIRONMENT";
  sceneId: YoPhoSceneId;
  styleId: YoPhoStudioStyleId;
}

export interface YoPhoBackgroundImageLayer extends YoPhoLayerBase {
  type: "BACKGROUND_IMAGE";
  /** Custom BG overrides scene backdrop when visible + asset set */
  customBgUrl: string | null;
}

export interface YoPhoBackgroundVideoLayer extends YoPhoLayerBase {
  type: "BACKGROUND_VIDEO";
  videoUrl: string | null;
}

export interface YoPhoGradientLayer extends YoPhoLayerBase {
  type: "GRADIENT";
  css: string;
}

export interface YoPhoUnderlayEffectLayer extends YoPhoLayerBase {
  type: "UNDERLAY_EFFECT";
  effectId: YoPhoMagicEffectId;
}

export interface YoPhoPersonCutoutLayer extends YoPhoLayerBase {
  type: "PERSON_CUTOUT";
  subjectUrl: string;
  motion: YoPhoMotionClip | null;
}

export interface YoPhoPropLayer extends YoPhoLayerBase {
  type: "PROP";
  propId: string;
  label: string;
}

export interface YoPhoForegroundEffectLayer extends YoPhoLayerBase {
  type: "FOREGROUND_EFFECT";
  effectId: YoPhoMagicEffectId;
}

export interface YoPhoTextLayer extends YoPhoLayerBase {
  type: "TEXT";
  textOverlay: YoPhoTextOverlay;
}

export interface YoPhoQuoteLayer extends YoPhoLayerBase {
  type: "QUOTE";
  quote: string;
}

export interface YoPhoSystemBrandingLayer extends YoPhoLayerBase {
  type: "SYSTEM_BRANDING";
  footer: YoPhoBrandingFooterConfig;
}

export interface YoPhoQrCodeLayer extends YoPhoLayerBase {
  type: "QR_CODE";
  qrTarget: "card" | "profile";
}

export interface YoPhoAudioMetaLayer extends YoPhoLayerBase {
  type: "AUDIO_META";
  nowPlaying: YoPhoNowPlaying | null;
}

export type YoPhoLayer =
  | YoPhoEnvironmentLayer
  | YoPhoBackgroundImageLayer
  | YoPhoBackgroundVideoLayer
  | YoPhoGradientLayer
  | YoPhoUnderlayEffectLayer
  | YoPhoPersonCutoutLayer
  | YoPhoPropLayer
  | YoPhoForegroundEffectLayer
  | YoPhoTextLayer
  | YoPhoQuoteLayer
  | YoPhoSystemBrandingLayer
  | YoPhoQrCodeLayer
  | YoPhoAudioMetaLayer;

export interface YoPhoBrandingFooterConfig {
  enabled: boolean;
  /** Fraction of card height (0.08–0.12) */
  heightPct: number;
  showQr: boolean;
  qrTarget: "card" | "profile";
  label: string;
  /** Honest display label only — not a market claim */
  rarity?: YoPhoRarityLabel;
  showEditionBadge?: boolean;
  editionBadge?: string | null;
}

export interface YoPhoPlaybackConfig {
  durationSec: YoPhoMotionDurationSec;
  loop: boolean;
  pauseReact: boolean;
  kenBurnsWhenStill: boolean;
}

/** Interaction stubs — Phase A wiring points */
export interface YoPhoInteractionsStub {
  tapEnlarge: boolean;
  pauseReact: boolean;
  nextTrack: boolean;
  tipCta: boolean;
  liveCta: boolean;
  bookingCta: boolean;
  fanClubCta: boolean;
  quoteModule: boolean;
  favoritesModule: boolean;
  playlistModule: boolean;
}

export interface YoPhoCardDocument {
  schemaVersion: 1;
  id: string;
  ownerKey: string;
  kind: YoPhoCardKind;
  roleTemplate: YoPhoRoleTemplate;
  title: string;
  /** At most one canonical identity card per account (store helpers) */
  isCanonical: boolean;
  /** Display-only rarity — no ledger / trading */
  rarity: YoPhoRarityLabel;
  displayName: string;
  slug?: string;
  canvas: YoPhoCanvasSpec;
  layers: YoPhoLayer[];
  audio: YoPhoNowPlaying | null;
  playback: YoPhoPlaybackConfig;
  brandingFooter: YoPhoBrandingFooterConfig;
  interactions: YoPhoInteractionsStub;
  /** Lock policy — present only when card has been locked by owner */
  lockPolicy?: import("./YoCardLockEngine").YoCardLockPolicy;
  /** Triptych depth config — 2 or 3 flanking portrait images for parallax bg */
  triptych?: import("./YoPhoTriptychPresets").YoPhoTriptychConfig;
  createdAt: string;
  updatedAt: string;
}

export const YOPHO_LAYER_Z: Record<YoPhoLayerType, number> = {
  GRADIENT: 0,
  ENVIRONMENT: 1,
  BACKGROUND_IMAGE: 2,
  BACKGROUND_VIDEO: 3,
  UNDERLAY_EFFECT: 10,
  PERSON_CUTOUT: 20,
  PROP: 30,
  FOREGROUND_EFFECT: 40,
  TEXT: 50,
  QUOTE: 55,
  AUDIO_META: 60,
  SYSTEM_BRANDING: 100,
  QR_CODE: 101,
};

export const DEFAULT_CANVAS_9x16: YoPhoCanvasSpec = {
  aspectRatio: "9:16",
  width: 360,
  height: 640,
  safeAreaBottomPct: 0.1,
};

export const DEFAULT_BRANDING_FOOTER: YoPhoBrandingFooterConfig = {
  enabled: true,
  heightPct: 0.1,
  showQr: true,
  qrTarget: "card",
  label: "TMI × YoPho",
  rarity: "STANDARD",
  showEditionBadge: true,
  editionBadge: null,
};

const UNDERLAY_EFFECTS: YoPhoMagicEffectId[] = ["fog", "smoke", "neon_glow", "light_leak"];
const FOREGROUND_EFFECTS: YoPhoMagicEffectId[] = ["rain", "snow", "confetti"];

function roleToTemplate(role: YoPhoCardRole): YoPhoRoleTemplate {
  return role === "performer" ? "PERFORMER_IDENTITY" : "FAN_IDENTITY";
}

export function normalizeCardKind(kind: YoPhoCardKind | string | undefined): YoPhoCardKind {
  if (kind === "MOMENT_SNAPSHOT") return "MEMORY_EDITION";
  if (
    kind === "CANONICAL_IDENTITY" ||
    kind === "PROMOTIONAL_EDITION" ||
    kind === "MEMORY_EDITION" ||
    kind === "SCENE_EDITION"
  ) {
    return kind;
  }
  return "MEMORY_EDITION";
}

export function defaultInteractionsForRole(role: YoPhoCardRole): YoPhoInteractionsStub {
  const performer = role === "performer";
  return {
    tapEnlarge: true,
    pauseReact: true,
    nextTrack: true,
    tipCta: performer,
    liveCta: performer,
    bookingCta: performer,
    fanClubCta: performer,
    quoteModule: !performer,
    favoritesModule: !performer,
    playlistModule: true,
  };
}

export function sortLayers(layers: YoPhoLayer[]): YoPhoLayer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id));
}

export function getActiveMagicEffects(doc: YoPhoCardDocument): YoPhoMagicEffectId[] {
  const out: YoPhoMagicEffectId[] = [];
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    if (layer.type === "UNDERLAY_EFFECT" || layer.type === "FOREGROUND_EFFECT") {
      out.push(layer.effectId);
    }
  }
  return out;
}

export function layersFromComposition(opts: {
  comp: YoPhoCardComposition;
  subjectUrl: string;
  moodTitle?: string | null;
  momentTag?: string | null;
  quote?: string | null;
  audio?: YoPhoNowPlaying | null;
  branding?: YoPhoBrandingFooterConfig;
  rarity?: YoPhoRarityLabel;
}): YoPhoLayer[] {
  const { comp, subjectUrl } = opts;
  const rarity = opts.rarity ?? comp.rarity ?? "STANDARD";
  const branding: YoPhoBrandingFooterConfig = {
    ...DEFAULT_BRANDING_FOOTER,
    ...(opts.branding ?? {}),
    rarity,
    editionBadge:
      opts.branding?.editionBadge ??
      (comp.isCanonical ? "CANONICAL" : comp.editionTitle ?? opts.momentTag ?? null),
  };
  const effects = comp.magicEffects ?? [];
  const layers: YoPhoLayer[] = [
    {
      id: "environment",
      type: "ENVIRONMENT",
      zIndex: YOPHO_LAYER_Z.ENVIRONMENT,
      visible: true,
      sceneId: comp.sceneId,
      styleId: comp.styleId,
    },
    {
      id: "bg_image",
      type: "BACKGROUND_IMAGE",
      zIndex: YOPHO_LAYER_Z.BACKGROUND_IMAGE,
      visible: Boolean(comp.customBgUrl),
      customBgUrl: comp.customBgUrl,
      asset: comp.customBgUrl ? { url: comp.customBgUrl } : undefined,
    },
  ];

  for (const effectId of effects.filter((e) => UNDERLAY_EFFECTS.includes(e))) {
    layers.push({
      id: `underlay_${effectId}`,
      type: "UNDERLAY_EFFECT",
      zIndex: YOPHO_LAYER_Z.UNDERLAY_EFFECT,
      visible: true,
      effectId,
    });
  }

  layers.push({
    id: "person",
    type: "PERSON_CUTOUT",
    zIndex: YOPHO_LAYER_Z.PERSON_CUTOUT,
    visible: true,
    subjectUrl,
    asset: { url: subjectUrl },
    motion: comp.motion ?? defaultMotionClip(),
  });

  for (const effectId of effects.filter((e) => FOREGROUND_EFFECTS.includes(e))) {
    layers.push({
      id: `fg_${effectId}`,
      type: "FOREGROUND_EFFECT",
      zIndex: YOPHO_LAYER_Z.FOREGROUND_EFFECT,
      visible: true,
      effectId,
    });
  }

  layers.push({
    id: "text",
    type: "TEXT",
    zIndex: YOPHO_LAYER_Z.TEXT,
    visible: Boolean(comp.textOverlay?.text?.trim()),
    textOverlay: comp.textOverlay ?? defaultTextOverlay(),
  });

  if (opts.quote?.trim()) {
    layers.push({
      id: "quote",
      type: "QUOTE",
      zIndex: YOPHO_LAYER_Z.QUOTE,
      visible: true,
      quote: opts.quote.trim(),
    });
  }

  layers.push({
    id: "audio_meta",
    type: "AUDIO_META",
    zIndex: YOPHO_LAYER_Z.AUDIO_META,
    visible: Boolean(opts.audio?.title || opts.audio?.audioUrl || opts.audio?.playlistId),
    nowPlaying: opts.audio ?? null,
  });

  layers.push({
    id: "branding",
    type: "SYSTEM_BRANDING",
    zIndex: YOPHO_LAYER_Z.SYSTEM_BRANDING,
    visible: branding.enabled,
    locked: true,
    footer: branding,
    bounds: { x: 0, y: 1 - branding.heightPct, w: 1, h: branding.heightPct },
  });

  layers.push({
    id: "qr",
    type: "QR_CODE",
    zIndex: YOPHO_LAYER_Z.QR_CODE,
    visible: branding.showQr,
    locked: true,
    qrTarget: branding.qrTarget,
  });

  return sortLayers(layers);
}

export function compositionToDocument(
  comp: YoPhoCardComposition,
  meta: {
    id?: string;
    ownerKey: string;
    role: YoPhoCardRole;
    displayName: string;
    slug?: string;
    subjectUrl: string;
    title?: string;
    kind?: YoPhoCardKind;
    isCanonical?: boolean;
    rarity?: YoPhoRarityLabel;
    moodTitle?: string | null;
    momentTag?: string | null;
    quote?: string | null;
    audio?: YoPhoNowPlaying | null;
    createdAt?: string;
  },
): YoPhoCardDocument {
  const now = new Date().toISOString();
  const roleTemplate = roleToTemplate(meta.role);
  const motion = comp.motion ?? defaultMotionClip();
  const rarity = meta.rarity ?? comp.rarity ?? "STANDARD";
  const branding: YoPhoBrandingFooterConfig = {
    ...DEFAULT_BRANDING_FOOTER,
    ...(comp.brandingFooter ?? {}),
    enabled: true,
    heightPct: Math.min(0.12, Math.max(0.08, comp.brandingFooter?.heightPct ?? 0.1)),
    rarity,
    showEditionBadge: true,
    editionBadge:
      meta.isCanonical || comp.isCanonical
        ? "CANONICAL"
        : meta.title ?? comp.editionTitle ?? meta.momentTag ?? null,
  };

  const rawKind =
    meta.kind ??
    (meta.isCanonical || comp.isCanonical ? "CANONICAL_IDENTITY" : comp.kind ?? "MEMORY_EDITION");
  const kind = normalizeCardKind(rawKind);

  return {
    schemaVersion: 1,
    id: meta.id ?? comp.cardId ?? `ydoc_${Date.now().toString(36)}`,
    ownerKey: meta.ownerKey,
    kind,
    roleTemplate,
    title: meta.title ?? comp.editionTitle ?? `${meta.displayName} · Who I Am Right Now`,
    isCanonical: meta.isCanonical ?? Boolean(comp.isCanonical),
    rarity,
    displayName: meta.displayName,
    slug: meta.slug,
    canvas: { ...DEFAULT_CANVAS_9x16, ...(comp.canvas ?? {}) },
    layers: layersFromComposition({
      comp,
      subjectUrl: meta.subjectUrl,
      moodTitle: meta.moodTitle,
      momentTag: meta.momentTag,
      quote: meta.quote,
      audio: meta.audio,
      branding,
      rarity,
    }),
    audio: meta.audio ?? null,
    playback: {
      durationSec: motion.durationSec,
      loop: true,
      pauseReact: true,
      kenBurnsWhenStill: true,
    },
    brandingFooter: branding,
    interactions: defaultInteractionsForRole(meta.role),
    createdAt: meta.createdAt ?? now,
    updatedAt: now,
  };
}

export function documentToComposition(doc: YoPhoCardDocument): YoPhoCardComposition {
  const base = createDefaultComposition();
  const env = doc.layers.find((l): l is YoPhoEnvironmentLayer => l.type === "ENVIRONMENT");
  const bg = doc.layers.find((l): l is YoPhoBackgroundImageLayer => l.type === "BACKGROUND_IMAGE");
  const person = doc.layers.find((l): l is YoPhoPersonCutoutLayer => l.type === "PERSON_CUTOUT");
  const text = doc.layers.find((l): l is YoPhoTextLayer => l.type === "TEXT");
  const effects = getActiveMagicEffects(doc);

  return {
    ...base,
    styleId: env?.styleId ?? base.styleId,
    sceneId: env?.sceneId ?? base.sceneId,
    customBgUrl: bg?.customBgUrl ?? null,
    textOverlay: text?.textOverlay ?? base.textOverlay,
    cardId: doc.id,
    playlistId: doc.audio?.playlistId ?? null,
    motion: person?.motion ?? defaultMotionClip(),
    magicEffects: effects,
    isCanonical: doc.isCanonical,
    editionTitle: doc.title,
    kind: doc.kind,
    rarity: doc.rarity,
    brandingFooter: doc.brandingFooter,
    canvas: doc.canvas,
    documentJson: doc,
    updatedAt: doc.updatedAt,
  };
}

/** Toggle a magic effect on/off (maps to underlay/foreground layers). */
export function toggleMagicEffect(
  effects: YoPhoMagicEffectId[],
  effectId: YoPhoMagicEffectId,
): YoPhoMagicEffectId[] {
  return effects.includes(effectId)
    ? effects.filter((e) => e !== effectId)
    : [...effects, effectId];
}

const CANONICAL_KEY = (ownerKey: string) => `tmi_yopho_canonical_${ownerKey}`;

export function getCanonicalCardId(ownerKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CANONICAL_KEY(ownerKey));
  } catch {
    return null;
  }
}

export function setCanonicalCardId(ownerKey: string, cardId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CANONICAL_KEY(ownerKey), cardId);
  } catch {
    /* ignore */
  }
}

export function markDocumentCanonical(
  doc: YoPhoCardDocument,
  ownerKey: string,
): YoPhoCardDocument {
  setCanonicalCardId(ownerKey, doc.id);
  return {
    ...doc,
    isCanonical: true,
    kind: "CANONICAL_IDENTITY",
    brandingFooter: {
      ...doc.brandingFooter,
      editionBadge: "CANONICAL",
      showEditionBadge: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateAsEdition(
  doc: YoPhoCardDocument,
  editionTitle: string,
  kind: YoPhoCardKind = "PROMOTIONAL_EDITION",
): YoPhoCardDocument {
  const now = new Date().toISOString();
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const nextKind = normalizeCardKind(kind === "CANONICAL_IDENTITY" ? "PROMOTIONAL_EDITION" : kind);
  return {
    ...doc,
    id: `yc_${Date.now().toString(36)}_${rand}`,
    kind: nextKind,
    isCanonical: false,
    title: editionTitle.trim() || `${doc.title} · Edition`,
    brandingFooter: {
      ...doc.brandingFooter,
      editionBadge: editionTitle.trim() || "EDITION",
      showEditionBadge: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

/** Role module hints for editor (Rule 26). */
export function roleModuleHints(role: YoPhoCardRole): string {
  return role === "performer"
    ? "Performer: use your real photo / live identity. No avatar wardrobe. Scene + effects frame you — they don’t replace you."
    : "Fan: creative freedom — scenes, effects, quotes, and playful editions welcome. This is your living collectible, not a press kit.";
}
