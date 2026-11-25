/**
 * YoPho card composition state — style + scene + custom BG/text + Phase A document fields.
 * Persists to localStorage for drawer preview. Canonical scene document is YoPhoCardDocument.
 */

import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import type { YoPhoSceneId } from "./YoPhoScenePack";
import type { YoPhoMagicEffectId } from "./YoPhoMagicEffects";
import type { YoPhoCardDocument, YoPhoCardKind, YoPhoRarityLabel } from "./YoPhoCardDocument";
import type { YoPhoMediaModule } from "./YoPhoMediaModule";
import type { YoPhoVisualState } from "./YoPhoVisualRuntime";
import {
  createDefaultVisual,
  enabledMagicEffectIds,
  hydrateVisualFromMagicIds,
  parseVisual,
} from "./YoPhoVisualRuntime";
import type { YoPhoFormat } from "./YoPhoFormatAuthority";

export type TextOverlayPosition = "top" | "center" | "bottom";

/** Motor-card hook lengths: existing 2–7 + longer presets 5|8|10|12|15|20 */
export type YoPhoMotionDurationSec = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 15 | 20;

export const YOPHO_MOTION_DURATIONS: YoPhoMotionDurationSec[] = [
  2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20,
];

/** Max source take length we accept for upload (seconds) — card loops a hook */
export const YOPHO_MOTION_SOURCE_MAX_SEC = 60;

export interface YoPhoMotionClip {
  sourceUrl: string | null;
  durationSec: YoPhoMotionDurationSec;
  /** Trim start within source (seconds) */
  hookStartSec: number;
  mimeType?: string | null;
}

export interface YoPhoTextOverlay {
  text: string;
  fontSize: number;
  color: string;
  position: TextOverlayPosition;
  outline: boolean;
}

export interface YoPhoCompositionBranding {
  enabled: boolean;
  heightPct: number;
  showQr: boolean;
  qrTarget: "card" | "profile";
  label: string;
  rarity?: YoPhoRarityLabel;
  showEditionBadge?: boolean;
  editionBadge?: string | null;
}

export interface YoPhoCompositionCanvas {
  aspectRatio: "9:16" | "3:4" | "1:1";
  width: number;
  height: number;
  safeAreaBottomPct: number;
}

export type YoPhoCanvasLayerKind =
  | "base_background"
  | "background"
  | "image"
  | "cutout"
  | "logo"
  | "prop"
  | "motion";

export type YoPhoCanvasMediaType = "image" | "video";

export type YoPhoCanvasObjectFit = "contain" | "cover" | "fill";

export interface YoPhoCanvasLayerTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  objectFit: YoPhoCanvasObjectFit;
  focalX: number;
  focalY: number;
}

export interface YoPhoCanvasLayerPlayback {
  loop: boolean;
  muted: boolean;
  hookStartSec: number;
  durationSec: YoPhoMotionDurationSec;
  autoplay: boolean;
}

export interface YoPhoCanvasLayer {
  id: string;
  kind: YoPhoCanvasLayerKind;
  label: string;
  mediaType: YoPhoCanvasMediaType;
  /** Canonical Media Locker / MediaAsset id — preferred over a copied binary */
  mediaAssetId: string | null;
  /** Durable playable URL from canonical storage. Video must not be data:/blob: when saved. */
  srcUrl: string | null;
  posterUrl: string | null;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  transform: YoPhoCanvasLayerTransform;
  formatOverrides?: Partial<Record<YoPhoFormat, Partial<YoPhoCanvasLayerTransform>>>;
  playback?: YoPhoCanvasLayerPlayback;
}

export interface YoPhoCardComposition {
  styleId: YoPhoStudioStyleId;
  sceneId: YoPhoSceneId;
  /** Custom background — data URL or https URL; overrides scene backdrop when set */
  customBgUrl: string | null;
  textOverlay: YoPhoTextOverlay;
  /** Extra collage slot images (honest empty if missing) */
  collageUrls: (string | null)[];
  /** Freeform canvas layers — images, extra backgrounds, cutouts, motion (MP4). */
  canvasLayers?: YoPhoCanvasLayer[];
  /** Last published interactive card id (same browser) */
  cardId?: string | null;
  /** Attached playlist for interactive Next Track */
  playlistId?: string | null;
  /** Optional media modules (playlist / song / motto). Does not consume image slots. */
  mediaModules?: YoPhoMediaModule[] | null;
  /** Motor card motion clip (loop hook) */
  motion?: YoPhoMotionClip | null;
  /** Toggleable magic effect presets (underlay / foreground) — derived from visual when present */
  magicEffects?: YoPhoMagicEffectId[];
  /** Canonical lighting / effect / grade / format-override state (§6257–§6281) */
  visual?: YoPhoVisualState;
  /** Geometry the creator designed first */
  primaryFormat?: YoPhoFormat;
  /** One canonical identity card per account */
  isCanonical?: boolean;
  /** Edition / promotional title when not canonical */
  editionTitle?: string | null;
  /** Document kind mirror for editor */
  kind?: YoPhoCardKind;
  /** Display-only collectible label — no marketplace */
  rarity?: YoPhoRarityLabel;
  brandingFooter?: YoPhoCompositionBranding;
  canvas?: YoPhoCompositionCanvas;
  /** Last built scene document (JSON source of truth for publish) */
  documentJson?: YoPhoCardDocument | null;
  updatedAt: string;
}

export function defaultMotionClip(): YoPhoMotionClip {
  return {
    sourceUrl: null,
    durationSec: 4,
    hookStartSec: 0,
    mimeType: null,
  };
}

export const TMI_TEXT_COLORS = ["#FFFFFF", "#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88"] as const;

export function defaultTextOverlay(year = String(new Date().getFullYear())): YoPhoTextOverlay {
  return {
    text: year,
    fontSize: 28,
    color: "#FFD700",
    position: "bottom",
    outline: true,
  };
}

export function createDefaultComposition(): YoPhoCardComposition {
  return {
    styleId: "classic",
    sceneId: "neon_stage",
    customBgUrl: null,
    textOverlay: defaultTextOverlay(),
    collageUrls: [null, null, null],
    canvasLayers: [],
    cardId: null,
    playlistId: null,
    mediaModules: [],
    motion: defaultMotionClip(),
    magicEffects: [],
    visual: createDefaultVisual(),
    primaryFormat: "TRADING_CARD",
    isCanonical: false,
    editionTitle: null,
    kind: "MEMORY_EDITION",
    rarity: "STANDARD",
    brandingFooter: {
      enabled: true,
      heightPct: 0.1,
      showQr: true,
      qrTarget: "card",
      label: "TMI × YoPho",
      rarity: "STANDARD",
      showEditionBadge: true,
      editionBadge: null,
    },
    canvas: {
      aspectRatio: "9:16",
      width: 360,
      height: 640,
      safeAreaBottomPct: 0.1,
    },
    documentJson: null,
    updatedAt: new Date().toISOString(),
  };
}

function storageKey(role: string, userKey: string): string {
  return `tmi_yopho_card_comp_${role}_${userKey}`;
}

export function loadCardComposition(role: string, userKey: string): YoPhoCardComposition {
  if (typeof window === "undefined") return createDefaultComposition();
  try {
    const raw = localStorage.getItem(storageKey(role, userKey));
    if (!raw) return createDefaultComposition();
    const parsed = JSON.parse(raw) as Partial<YoPhoCardComposition>;
    const base = createDefaultComposition();
    const duration = parsed.motion?.durationSec;
    const safeDuration =
      typeof duration === "number" &&
      (YOPHO_MOTION_DURATIONS as number[]).includes(duration)
        ? (duration as YoPhoMotionDurationSec)
        : base.motion!.durationSec;
    return {
      ...base,
      ...parsed,
      textOverlay: { ...base.textOverlay, ...(parsed.textOverlay ?? {}) },
      collageUrls: Array.isArray(parsed.collageUrls)
        ? [...parsed.collageUrls, null, null, null].slice(0, 3)
        : base.collageUrls,
      canvasLayers: hydrateCanvasLayers(parsed),
      motion: {
        ...defaultMotionClip(),
        ...(parsed.motion ?? {}),
        durationSec: safeDuration,
      },
      visual: mergeLoadedVisual(parsed),
      magicEffects: enabledMagicEffectIds(mergeLoadedVisual(parsed)),
      primaryFormat:
        parsed.primaryFormat === "ALBUM_COVER" ? "ALBUM_COVER" : parsed.visual?.primaryFormat ?? "TRADING_CARD",
      rarity: parsed.rarity === "RARE" ? "RARE" : "STANDARD",
      kind:
        parsed.kind === "MOMENT_SNAPSHOT"
          ? "MEMORY_EDITION"
          : parsed.kind ?? base.kind,
      brandingFooter: { ...base.brandingFooter!, ...(parsed.brandingFooter ?? {}) },
      canvas: { ...base.canvas!, ...(parsed.canvas ?? {}) },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createDefaultComposition();
  }
}

function mergeLoadedVisual(parsed: Partial<YoPhoCardComposition>): YoPhoVisualState {
  const fromField = parseVisual(parsed.visual);
  return hydrateVisualFromMagicIds(
    Array.isArray(parsed.magicEffects) ? parsed.magicEffects : fromField ? enabledMagicEffectIds(fromField) : [],
    fromField,
  );
}

/** Always persist visual + derived magicEffects together so reload keeps lighting/FX. */
export function withSyncedVisual(comp: YoPhoCardComposition): YoPhoCardComposition {
  const visual = hydrateVisualFromMagicIds(comp.magicEffects, comp.visual ?? createDefaultVisual());
  return {
    ...comp,
    visual,
    magicEffects: enabledMagicEffectIds(visual),
    primaryFormat: comp.primaryFormat ?? visual.primaryFormat,
  };
}

export function saveCardComposition(
  role: string,
  userKey: string,
  comp: YoPhoCardComposition,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storageKey(role, userKey),
      JSON.stringify({
        ...sanitizeCompositionForPersist(withSyncedVisual(comp)),
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* quota / private mode — preview still works in memory */
  }
}

export function defaultCanvasTransform(
  kind: YoPhoCanvasLayerKind = "image",
): YoPhoCanvasLayerTransform {
  const fullBleed = kind === "base_background" || kind === "background";
  return {
    x: 0,
    y: 0,
    scale: fullBleed ? 1 : 0.72,
    rotation: 0,
    opacity: 1,
    objectFit: fullBleed ? "cover" : "contain",
    focalX: 0.5,
    focalY: 0.5,
  };
}

export function defaultCanvasPlayback(): YoPhoCanvasLayerPlayback {
  return {
    loop: true,
    muted: true,
    hookStartSec: 0,
    durationSec: 4,
    autoplay: true,
  };
}

export function createCanvasLayerId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `ycl_${Date.now().toString(36)}_${rand}`;
}

export function createCanvasLayer(
  kind: YoPhoCanvasLayerKind,
  input: Partial<YoPhoCanvasLayer> & { srcUrl?: string | null } = {},
): YoPhoCanvasLayer {
  const mediaType: YoPhoCanvasMediaType = input.mediaType ?? (kind === "motion" ? "video" : "image");
  return {
    id: input.id ?? createCanvasLayerId(),
    kind,
    label: input.label ?? kind.replace("_", " "),
    mediaType,
    mediaAssetId: input.mediaAssetId ?? null,
    srcUrl: input.srcUrl ?? null,
    posterUrl: input.posterUrl ?? null,
    zIndex: input.zIndex ?? 10,
    visible: input.visible ?? true,
    locked: input.locked ?? false,
    transform: { ...defaultCanvasTransform(kind), ...(input.transform ?? {}) },
    formatOverrides: input.formatOverrides,
    playback: mediaType === "video" ? { ...defaultCanvasPlayback(), ...(input.playback ?? {}) } : input.playback,
  };
}

function isTransientMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("blob:") || url.startsWith("data:");
}

/** Video must persist as a canonical asset URL, never a blob or embedded data URL. */
export function isPersistableLayerSrc(layer: YoPhoCanvasLayer): boolean {
  const url = layer.srcUrl?.trim() ?? "";
  if (!url) return Boolean(layer.mediaAssetId);
  if (layer.mediaType === "video" && isTransientMediaUrl(url)) return false;
  return true;
}

export function persistableCanvasLayers(layers: YoPhoCanvasLayer[] | undefined): YoPhoCanvasLayer[] {
  return (layers ?? []).map((layer) => {
    if (layer.mediaType !== "video") return layer;
    if (isPersistableLayerSrc(layer)) return layer;
    return { ...layer, srcUrl: null };
  });
}

export function sanitizeCompositionForPersist(comp: YoPhoCardComposition): YoPhoCardComposition {
  const canvasLayers = persistableCanvasLayers(comp.canvasLayers);
  const motion = comp.motion
    ? {
        ...comp.motion,
        sourceUrl:
          comp.motion.sourceUrl && isTransientMediaUrl(comp.motion.sourceUrl)
            ? null
            : comp.motion.sourceUrl,
      }
    : comp.motion;
  return {
    ...comp,
    canvasLayers,
    motion,
    collageUrls: collageUrlsFromLayers(canvasLayers, comp.collageUrls),
    customBgUrl: baseBackgroundUrl(canvasLayers) ?? comp.customBgUrl,
  };
}

export function listCanvasLayers(comp: YoPhoCardComposition): YoPhoCanvasLayer[] {
  return [...(comp.canvasLayers ?? [])].sort((a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id));
}

export function countImageBudgetLayers(layers: YoPhoCanvasLayer[] | undefined): number {
  return (layers ?? []).filter((layer) => Boolean(layer.srcUrl || layer.mediaAssetId)).length;
}

export function addCanvasLayer(
  comp: YoPhoCardComposition,
  layer: YoPhoCanvasLayer,
  maxImages: number,
): YoPhoCardComposition | null {
  const current = listCanvasLayers(comp);
  if (countImageBudgetLayers(current) >= maxImages && (layer.srcUrl || layer.mediaAssetId)) {
    return null;
  }
  const maxZ = current.reduce((z, item) => Math.max(z, item.zIndex), 0);
  const nextLayer = { ...layer, zIndex: layer.zIndex || maxZ + 1 };
  const canvasLayers = [...current, nextLayer];
  return {
    ...comp,
    canvasLayers,
    customBgUrl:
      nextLayer.kind === "base_background" && nextLayer.mediaType === "image"
        ? nextLayer.srcUrl
        : comp.customBgUrl,
    collageUrls: collageUrlsFromLayers(canvasLayers, comp.collageUrls),
    updatedAt: new Date().toISOString(),
  };
}

export function updateCanvasLayer(
  comp: YoPhoCardComposition,
  layerId: string,
  patch: Partial<YoPhoCanvasLayer>,
): YoPhoCardComposition {
  const canvasLayers = listCanvasLayers(comp).map((layer) =>
    layer.id === layerId ? { ...layer, ...patch, transform: { ...layer.transform, ...(patch.transform ?? {}) } } : layer,
  );
  return {
    ...comp,
    canvasLayers,
    customBgUrl: baseBackgroundUrl(canvasLayers) ?? comp.customBgUrl,
    collageUrls: collageUrlsFromLayers(canvasLayers, comp.collageUrls),
    updatedAt: new Date().toISOString(),
  };
}

export function removeCanvasLayer(comp: YoPhoCardComposition, layerId: string): YoPhoCardComposition {
  const canvasLayers = listCanvasLayers(comp).filter((layer) => layer.id !== layerId);
  return {
    ...comp,
    canvasLayers,
    customBgUrl: baseBackgroundUrl(canvasLayers),
    collageUrls: collageUrlsFromLayers(canvasLayers, [null, null, null]),
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateCanvasLayer(
  comp: YoPhoCardComposition,
  layerId: string,
  maxImages: number,
): YoPhoCardComposition | null {
  const source = listCanvasLayers(comp).find((layer) => layer.id === layerId);
  if (!source) return null;
  return addCanvasLayer(
    comp,
    {
      ...source,
      id: createCanvasLayerId(),
      label: `${source.label} copy`,
      locked: false,
    },
    maxImages,
  );
}

export function reorderCanvasLayer(
  comp: YoPhoCardComposition,
  layerId: string,
  direction: "forward" | "backward" | "front" | "back",
): YoPhoCardComposition {
  const layers = listCanvasLayers(comp);
  const index = layers.findIndex((layer) => layer.id === layerId);
  if (index < 0) return comp;
  const current = layers[index]!;
  if (direction === "front") {
    const maxZ = Math.max(...layers.map((layer) => layer.zIndex));
    return updateCanvasLayer(comp, layerId, { zIndex: maxZ + 1 });
  }
  if (direction === "back") {
    const minZ = Math.min(...layers.map((layer) => layer.zIndex));
    return updateCanvasLayer(comp, layerId, { zIndex: minZ - 1 });
  }
  const neighbor = layers[direction === "forward" ? index + 1 : index - 1];
  if (!neighbor) return comp;
  const swapped = layers.map((layer) => {
    if (layer.id === current.id) return { ...layer, zIndex: neighbor.zIndex };
    if (layer.id === neighbor.id) return { ...layer, zIndex: current.zIndex };
    return layer;
  });
  return { ...comp, canvasLayers: swapped, updatedAt: new Date().toISOString() };
}

export function resolveLayerTransform(
  layer: YoPhoCanvasLayer,
  format: YoPhoFormat,
): YoPhoCanvasLayerTransform {
  const override = layer.formatOverrides?.[format];
  return { ...layer.transform, ...(override ?? {}) };
}

export function setLayerFormatOverride(
  comp: YoPhoCardComposition,
  layerId: string,
  format: YoPhoFormat,
  patch: Partial<YoPhoCanvasLayerTransform>,
): YoPhoCardComposition {
  const layer = listCanvasLayers(comp).find((item) => item.id === layerId);
  if (!layer) return comp;
  return updateCanvasLayer(comp, layerId, {
    formatOverrides: {
      ...(layer.formatOverrides ?? {}),
      [format]: { ...(layer.formatOverrides?.[format] ?? {}), ...patch },
    },
  });
}

export function hydrateCanvasLayers(parsed: Partial<YoPhoCardComposition>): YoPhoCanvasLayer[] {
  if (Array.isArray(parsed.canvasLayers) && parsed.canvasLayers.length > 0) {
    return persistableCanvasLayers(parsed.canvasLayers.map((layer) => createCanvasLayer(layer.kind, layer)));
  }
  const migrated: YoPhoCanvasLayer[] = [];
  if (parsed.customBgUrl) {
    migrated.push(
      createCanvasLayer("base_background", {
        label: "Base background",
        srcUrl: parsed.customBgUrl,
        zIndex: 1,
        transform: defaultCanvasTransform("base_background"),
      }),
    );
  }
  (parsed.collageUrls ?? []).forEach((url, index) => {
    if (!url) return;
    migrated.push(
      createCanvasLayer("image", {
        label: `Image ${index + 1}`,
        srcUrl: url,
        zIndex: 10 + index,
      }),
    );
  });
  if (parsed.motion?.sourceUrl && !isTransientMediaUrl(parsed.motion.sourceUrl)) {
    migrated.push(
      createCanvasLayer("motion", {
        label: "Motion",
        srcUrl: parsed.motion.sourceUrl,
        mediaType: "video",
        zIndex: 20,
        playback: {
          ...defaultCanvasPlayback(),
          hookStartSec: parsed.motion.hookStartSec,
          durationSec: parsed.motion.durationSec,
        },
      }),
    );
  }
  return migrated;
}

function collageUrlsFromLayers(
  layers: YoPhoCanvasLayer[],
  fallback: (string | null)[],
): (string | null)[] {
  const images = layers
    .filter((layer) => layer.mediaType === "image" && layer.kind !== "base_background" && layer.srcUrl)
    .map((layer) => layer.srcUrl);
  if (images.length === 0) return [...fallback, null, null, null].slice(0, 3);
  return [...images, null, null, null].slice(0, 3);
}

function baseBackgroundUrl(layers: YoPhoCanvasLayer[]): string | null {
  const base = [...layers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .find((layer) => layer.kind === "base_background" && layer.srcUrl);
  return base?.srcUrl ?? null;
}
