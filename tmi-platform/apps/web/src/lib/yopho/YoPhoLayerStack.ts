/**
 * YoPhoLayerStack — dimensional (z-order) layer helpers for YoPho cards.
 * Layers stack behind/in front via zIndex — not side-by-side collage only.
 */

import type { PortraitLayer, YoPhoPortraitBlueprint } from "./YoPhoPortraitEngine";
import { clonePortraitBlueprint } from "./YoPhoPortraitEngine";

export interface YoPhoStackLayerRef {
  id: string;
  layer: PortraitLayer;
  /** Where the layer lives on the blueprint */
  slot: "primary" | "secondary";
  secondaryIndex?: number;
}

/** Flat list of all image layers sorted back→front (ascending zIndex). */
export function listStackLayers(bp: YoPhoPortraitBlueprint): YoPhoStackLayerRef[] {
  const refs: YoPhoStackLayerRef[] = [
    { id: bp.primaryLayer.id, layer: bp.primaryLayer, slot: "primary" },
    ...bp.secondaryLayers.map((layer, secondaryIndex) => ({
      id: layer.id,
      layer,
      slot: "secondary" as const,
      secondaryIndex,
    })),
  ];
  return refs.sort((a, b) => a.layer.zIndex - b.layer.zIndex);
}

export function createEmptyStackLayer(zIndex: number, label?: string): PortraitLayer {
  return {
    id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    imageUrl: "",
    label: label ?? `Layer ${zIndex}`,
    role: zIndex <= 1 ? "primary" : "secondary",
    facing: "center",
    scale: 1,
    xOffset: 0,
    yOffset: 0,
    rotation: 0,
    blendMode: "normal",
    opacity: 1,
    edgeSoftness: 4,
    preserveHairEdges: true,
    zIndex,
  };
}

/** Total image/layer slots currently on the card (including empty placeholders). */
export function countStackLayers(bp: YoPhoPortraitBlueprint): number {
  return 1 + bp.secondaryLayers.length;
}

export function updateLayerById(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  patch: Partial<PortraitLayer>,
): YoPhoPortraitBlueprint {
  const next = clonePortraitBlueprint(bp);
  if (next.primaryLayer.id === layerId) {
    next.primaryLayer = { ...next.primaryLayer, ...patch };
  } else {
    next.secondaryLayers = next.secondaryLayers.map((l) =>
      l.id === layerId ? { ...l, ...patch } : l,
    );
  }
  next.updatedAt = new Date().toISOString();
  next.activePortraitsCount =
    [next.primaryLayer, ...next.secondaryLayers].filter((l) => Boolean(l.imageUrl?.trim())).length;
  return next;
}

/**
 * Move layer one step toward front (higher z) or back (lower z).
 * Swaps zIndex with neighbor so relative order stays contiguous.
 */
export function reorderStackLayer(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  direction: "forward" | "back",
): YoPhoPortraitBlueprint {
  const sorted = listStackLayers(bp);
  const idx = sorted.findIndex((r) => r.id === layerId);
  if (idx < 0) return bp;
  const swapWith = direction === "forward" ? idx + 1 : idx - 1;
  if (swapWith < 0 || swapWith >= sorted.length) return bp;

  const a = sorted[idx]!;
  const b = sorted[swapWith]!;
  let next = updateLayerById(bp, a.id, { zIndex: b.layer.zIndex });
  next = updateLayerById(next, b.id, { zIndex: a.layer.zIndex });
  return next;
}

export function bringLayerToFront(bp: YoPhoPortraitBlueprint, layerId: string): YoPhoPortraitBlueprint {
  const sorted = listStackLayers(bp);
  if (!sorted.length) return bp;
  const maxZ = Math.max(...sorted.map((r) => r.layer.zIndex));
  return updateLayerById(bp, layerId, { zIndex: maxZ + 1 });
}

export function sendLayerToBack(bp: YoPhoPortraitBlueprint, layerId: string): YoPhoPortraitBlueprint {
  const sorted = listStackLayers(bp);
  if (!sorted.length) return bp;
  const minZ = Math.min(...sorted.map((r) => r.layer.zIndex));
  return updateLayerById(bp, layerId, { zIndex: minZ - 1 });
}

/** Add a new empty layer if under capacity. Returns null if at limit. */
export function addStackLayer(
  bp: YoPhoPortraitBlueprint,
  maxImages: number,
): YoPhoPortraitBlueprint | null {
  if (countStackLayers(bp) >= maxImages) return null;
  const maxZ = Math.max(
    bp.primaryLayer.zIndex,
    ...bp.secondaryLayers.map((l) => l.zIndex),
    0,
  );
  const layer = createEmptyStackLayer(maxZ + 1, `Layer ${countStackLayers(bp) + 1}`);
  const next = clonePortraitBlueprint(bp);
  // Keep first slot as primary; additional slots are secondary (stacked by zIndex)
  if (!next.primaryLayer.imageUrl?.trim() && next.secondaryLayers.length === 0) {
    next.primaryLayer = { ...layer, role: "primary", zIndex: 1 };
  } else {
    next.secondaryLayers = [...next.secondaryLayers, { ...layer, role: "secondary" }];
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

export function removeStackLayer(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
): YoPhoPortraitBlueprint {
  // Never remove the last remaining layer — clear its image instead
  if (bp.primaryLayer.id === layerId) {
    if (bp.secondaryLayers.length === 0) {
      return updateLayerById(bp, layerId, { imageUrl: "", label: "Working image" });
    }
    // Promote highest-z secondary to primary
    const sorted = [...bp.secondaryLayers].sort((a, b) => b.zIndex - a.zIndex);
    const promoted = sorted[0]!;
    const rest = bp.secondaryLayers.filter((l) => l.id !== promoted.id);
    const next = clonePortraitBlueprint(bp);
    next.primaryLayer = { ...promoted, role: "primary" };
    next.secondaryLayers = rest;
    next.updatedAt = new Date().toISOString();
    next.activePortraitsCount = [next.primaryLayer, ...next.secondaryLayers].filter((l) =>
      Boolean(l.imageUrl?.trim()),
    ).length;
    return next;
  }
  const next = clonePortraitBlueprint(bp);
  next.secondaryLayers = next.secondaryLayers.filter((l) => l.id !== layerId);
  next.updatedAt = new Date().toISOString();
  next.activePortraitsCount = [next.primaryLayer, ...next.secondaryLayers].filter((l) =>
    Boolean(l.imageUrl?.trim()),
  ).length;
  return next;
}

/** Apply texture/filter patch to one layer's owning blueprint (composition-level texture for now). */
export function setActiveLayerImage(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  imageUrl: string,
  label?: string,
): YoPhoPortraitBlueprint {
  return updateLayerById(bp, layerId, {
    imageUrl,
    ...(label ? { label } : {}),
  });
}

/** Canvas position / scale clamps (matches PortraitLayer docs). */
export const YOPHO_LAYER_X_MIN = -100;
export const YOPHO_LAYER_X_MAX = 100;
export const YOPHO_LAYER_Y_MIN = -100;
export const YOPHO_LAYER_Y_MAX = 100;
export const YOPHO_LAYER_SCALE_MIN = 0.2;
export const YOPHO_LAYER_SCALE_MAX = 3;
export const YOPHO_LAYER_ROTATION_MIN = -180;
export const YOPHO_LAYER_ROTATION_MAX = 180;
export const YOPHO_NUDGE_XY_STEP = 8;
export const YOPHO_NUDGE_SCALE_STEP = 0.05;
export const YOPHO_NUDGE_ROTATION_STEP = 5;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function getLayerById(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
): PortraitLayer | null {
  if (bp.primaryLayer.id === layerId) return bp.primaryLayer;
  return bp.secondaryLayers.find((l) => l.id === layerId) ?? null;
}

/**
 * Nudge active layer on canvas (X/Y). FREE single-image cards included.
 * Positive dx = right, positive dy = down (CSS translate).
 */
export function nudgeLayerPosition(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  dx: number,
  dy: number,
): YoPhoPortraitBlueprint {
  const layer = getLayerById(bp, layerId);
  if (!layer) return bp;
  return updateLayerById(bp, layerId, {
    xOffset: clamp(layer.xOffset + dx, YOPHO_LAYER_X_MIN, YOPHO_LAYER_X_MAX),
    yOffset: clamp(layer.yOffset + dy, YOPHO_LAYER_Y_MIN, YOPHO_LAYER_Y_MAX),
  });
}

/** Scale + / − on one layer. */
export function nudgeLayerScale(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  dScale: number,
): YoPhoPortraitBlueprint {
  const layer = getLayerById(bp, layerId);
  if (!layer) return bp;
  return updateLayerById(bp, layerId, {
    scale: clamp(
      Math.round((layer.scale + dScale) * 100) / 100,
      YOPHO_LAYER_SCALE_MIN,
      YOPHO_LAYER_SCALE_MAX,
    ),
  });
}

/** Rotate one layer in degrees. */
export function nudgeLayerRotation(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
  dRotation: number,
): YoPhoPortraitBlueprint {
  const layer = getLayerById(bp, layerId);
  if (!layer) return bp;
  return updateLayerById(bp, layerId, {
    rotation: clamp(layer.rotation + dRotation, YOPHO_LAYER_ROTATION_MIN, YOPHO_LAYER_ROTATION_MAX),
  });
}

/** Reset X/Y/scale to defaults for one layer (rotation/zIndex unchanged). */
export function resetLayerTransform(
  bp: YoPhoPortraitBlueprint,
  layerId: string,
): YoPhoPortraitBlueprint {
  return updateLayerById(bp, layerId, {
    xOffset: 0,
    yOffset: 0,
    scale: 1,
  });
}
