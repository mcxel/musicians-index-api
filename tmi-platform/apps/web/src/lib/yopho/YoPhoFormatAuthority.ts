/**
 * YoPhoFormatAuthority.ts — canonical YoPho FORMAT authority (§5561–§5601).
 *
 * FORMAT = geometry only. Separate from LAYOUT (arrangement inside the
 * geometry) and from EXPORT (generated output). §5592–§5593.
 *
 *   TRADING_CARD → 5:7 portrait (physical 2.5×3.5in) → 1500×2100 target
 *   ALBUM_COVER  → 1:1 square                        → 3000×3000 target
 *
 * ONE canonical YoPho identity (§5572). The two formats are presentation
 * geometries of the SAME `cardId`; `primaryFormat` records which geometry the
 * creator designed first (§5573). Both formats remain exportable (§5574).
 *
 * This module is pure data/logic — no DOM, no Prisma, no publicPage coupling
 * (§5595). It maps onto the canonical `YoPhoCardDocument` aspect union
 * ("9:16"|"3:4"|"1:1") without inventing a parallel document model.
 */

import type {
  YoPhoCardDocument,
  YoPhoCanvasAspect,
  YoPhoCanvasSpec,
  YoPhoLayer,
} from "./YoPhoCardDocument";

// ─────────────────────────────────────────────────────────────────────────────
// Format canon
// ─────────────────────────────────────────────────────────────────────────────

export type YoPhoFormat = "TRADING_CARD" | "ALBUM_COVER";

export interface YoPhoFormatSpec {
  format: YoPhoFormat;
  /** Human label for the format-choice cards (§5561). */
  label: string;
  /** Physical/analog reference line. */
  physicalReference: string;
  /** CSS-style aspect ratio string. */
  aspectRatio: "5:7" | "1:1";
  /** width / height as a number (0.714… for 5:7, 1 for 1:1). */
  aspectValue: number;
  /** Canonical high-resolution export target (§5561). */
  targetWidth: number;
  targetHeight: number;
  /** Nearest existing YoPhoCardDocument canvas aspect (render-time geometry). */
  documentAspect: YoPhoCanvasAspect;
  orientation: "portrait" | "square";
}

export const YOPHO_FORMAT_TRADING_CARD: YoPhoFormatSpec = {
  format: "TRADING_CARD",
  label: "Trading Card",
  physicalReference: "2.5 × 3.5 in collectible card",
  aspectRatio: "5:7",
  aspectValue: 5 / 7,
  targetWidth: 1500,
  targetHeight: 2100,
  documentAspect: "3:4", // portrait; closest existing canvas geometry
  orientation: "portrait",
};

export const YOPHO_FORMAT_ALBUM_COVER: YoPhoFormatSpec = {
  format: "ALBUM_COVER",
  label: "Album Cover",
  physicalReference: "square music-release artwork",
  aspectRatio: "1:1",
  aspectValue: 1,
  targetWidth: 3000,
  targetHeight: 3000,
  documentAspect: "1:1",
  orientation: "square",
};

export const YOPHO_FORMATS: readonly YoPhoFormatSpec[] = [
  YOPHO_FORMAT_TRADING_CARD,
  YOPHO_FORMAT_ALBUM_COVER,
] as const;

export function getYoPhoFormat(format: YoPhoFormat): YoPhoFormatSpec {
  return format === "ALBUM_COVER" ? YOPHO_FORMAT_ALBUM_COVER : YOPHO_FORMAT_TRADING_CARD;
}

export function isYoPhoFormat(value: unknown): value is YoPhoFormat {
  return value === "TRADING_CARD" || value === "ALBUM_COVER";
}

/** The opposite geometry (§5574 — secondary format always still exists). */
export function counterpartFormat(format: YoPhoFormat): YoPhoFormat {
  return format === "TRADING_CARD" ? "ALBUM_COVER" : "TRADING_CARD";
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-format presentation overrides (§5578–§5580)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Presentation properties that may vary per format WITHOUT splitting the YoPho
 * identity. Shared content (artist/title/artwork/owner/id) never lives here.
 * All values are normalized 0–1 relative to the format canvas.
 */
export interface YoPhoFormatPresentation {
  /** Subject (person cutout) vertical anchor — §5578 example 0.42 vs 0.50. */
  subjectCenterYPct: number;
  /** Subject horizontal anchor. */
  subjectCenterXPct: number;
  /** Subject scale relative to canvas height. */
  subjectScalePct: number;
  /** Title block vertical anchor (lower-third on card, centered-low on cover). */
  titleYPct: number;
  /** Safe-area bottom fraction protected for branding. */
  safeAreaBottomPct: number;
}

export const YOPHO_FORMAT_PRESENTATION: Record<YoPhoFormat, YoPhoFormatPresentation> = {
  TRADING_CARD: {
    subjectCenterXPct: 0.5,
    subjectCenterYPct: 0.42,
    subjectScalePct: 0.62,
    titleYPct: 0.78,
    safeAreaBottomPct: 0.1,
  },
  ALBUM_COVER: {
    subjectCenterXPct: 0.5,
    subjectCenterYPct: 0.5,
    subjectScalePct: 0.7,
    titleYPct: 0.84,
    safeAreaBottomPct: 0.08,
  },
};

export function getFormatPresentation(format: YoPhoFormat): YoPhoFormatPresentation {
  return YOPHO_FORMAT_PRESENTATION[format];
}

/** Canvas spec for a format at a given render width (editor preview geometry). */
export function canvasSpecForFormat(format: YoPhoFormat, width: number): YoPhoCanvasSpec {
  const spec = getYoPhoFormat(format);
  const presentation = getFormatPresentation(format);
  const height = Math.round(width / spec.aspectValue);
  return {
    aspectRatio: spec.documentAspect,
    width,
    height,
    safeAreaBottomPct: presentation.safeAreaBottomPct,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Intelligent counterpart generation (§5575–§5576) — no blind auto-crop
// ─────────────────────────────────────────────────────────────────────────────

/** Layer bounds regions we reason about when recomposing (§5576). */
interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/**
 * Recompose a layer's normalized bounds from one format geometry to another
 * using region-aware rules — NOT a uniform center-crop. §5576.
 *
 * - Subject (PERSON_CUTOUT) is re-anchored to the target format's subject
 *   presentation (region-aware, keeps the subject fully in frame).
 * - Background/gradient/environment fill the frame (full-bleed).
 * - Text/quote re-anchor to the target title region.
 * - Branding/QR keep their locked footer band.
 */
function recomposeLayerBounds(
  layer: YoPhoLayer,
  from: YoPhoFormat,
  to: YoPhoFormat,
): YoPhoLayer["bounds"] {
  const toPres = getFormatPresentation(to);
  const type = layer.type;

  // Full-bleed layers always fill the target frame.
  if (
    type === "BACKGROUND_IMAGE" ||
    type === "BACKGROUND_VIDEO" ||
    type === "GRADIENT" ||
    type === "ENVIRONMENT" ||
    type === "UNDERLAY_EFFECT" ||
    type === "FOREGROUND_EFFECT"
  ) {
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  // Subject: re-anchor to the target's subject region (no crop of the subject).
  if (type === "PERSON_CUTOUT") {
    const scale = toPres.subjectScalePct;
    const w = scale * (getYoPhoFormat(to).aspectValue >= 1 ? 0.7 : 0.78);
    const h = scale;
    return {
      x: clamp01(toPres.subjectCenterXPct - w / 2),
      y: clamp01(toPres.subjectCenterYPct - h / 2),
      w,
      h,
    };
  }

  // Title / quote / audio meta → title region.
  if (type === "TEXT" || type === "QUOTE" || type === "AUDIO_META") {
    const w = 0.86;
    const h = 0.1;
    return {
      x: clamp01(0.5 - w / 2),
      y: clamp01(toPres.titleYPct - h / 2),
      w,
      h,
    };
  }

  // Branding / QR keep footer band.
  if (type === "SYSTEM_BRANDING" || type === "QR_CODE") {
    const h = toPres.safeAreaBottomPct;
    return { x: 0, y: clamp01(1 - h), w: 1, h };
  }

  // Default: carry existing bounds if present, else centered box.
  const existing: Region | undefined = layer.bounds;
  if (existing) return { ...existing };
  void from;
  return { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
}

/**
 * Build the per-format presentation of a canonical document. Returns a NEW
 * document view with recomposed canvas + layer bounds for `format`, sharing all
 * shared content (id/owner/layers/assets/audio/branding identity) by reference.
 * This is a presentation view — it never mutates the canonical document and
 * never creates a second YoPho identity. §5572/§5579/§5580.
 */
export function presentDocumentInFormat(
  doc: YoPhoCardDocument,
  format: YoPhoFormat,
  from?: YoPhoFormat,
): YoPhoCardDocument {
  const spec = getYoPhoFormat(format);
  const fromFormat = from ?? inferFormatFromCanvas(doc.canvas);
  const canvas: YoPhoCanvasSpec = {
    aspectRatio: spec.documentAspect,
    width: doc.canvas.width,
    height: Math.round(doc.canvas.width / spec.aspectValue),
    safeAreaBottomPct: getFormatPresentation(format).safeAreaBottomPct,
  };
  const layers = doc.layers.map((l) => ({
    ...l,
    bounds: recomposeLayerBounds(l, fromFormat, format),
  }));
  return {
    ...doc,
    canvas,
    layers,
    // Identity preserved — same id, owner, branding, content. updatedAt untouched.
  };
}

/** Infer the closest format from an existing canvas aspect (for migration). */
export function inferFormatFromCanvas(canvas: YoPhoCanvasSpec): YoPhoFormat {
  if (canvas.aspectRatio === "1:1") return "ALBUM_COVER";
  return "TRADING_CARD";
}

/** Export pixel size for a format (§5561 canonical targets). */
export function exportSizeForFormat(format: YoPhoFormat): { width: number; height: number } {
  const spec = getYoPhoFormat(format);
  return { width: spec.targetWidth, height: spec.targetHeight };
}
