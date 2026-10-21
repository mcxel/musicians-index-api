/**
 * ChromaSegmentationRuntime — LIVE CAMERA → CUTOUT → VENUE COMPOSITION.
 * Binds to VenuePresentationExecution. NOT a second WebRTC / venue orchestrator.
 *
 * Cutout methods (first-class): CHROMA_KEY | AI_SUBJECT_CUTOUT | REAL_BACKGROUND
 * AI cutout requires a bound segmentation backend — never claim ready if absent.
 *
 * Presentation mode switches MUST preserve the same MediaStream / peer connection.
 */

import type { ChromaQualityState, StagePerformerPresentationMode } from "@/lib/experience/TmiRealityGameWorldConvergence";
import type { VenuePanelCompositionKind } from "@/lib/venue/VenuePresentationFabric";

export const CHROMA_RUNTIME_OWNER = "ChromaSegmentationRuntime" as const;

export type ChromaCutoutMethod = "CHROMA_KEY" | "AI_SUBJECT_CUTOUT" | "REAL_BACKGROUND";

export type ChromaCompositionLayout =
  | "HD_VIDEO_PANEL"
  | "ONE_PERFORMER_CHROMA"
  | "BATTLE_DUAL_CHROMA"
  | "BATTLE_MIXED_PANEL_CHROMA"
  | "CYPHER_PARTICIPANT_CHROMA";

export type ChromaDeviceTier = "HIGH" | "MEDIUM" | "LOW" | "UNSUPPORTED";

export type ChromaSegmentationBackend =
  | "CHROMA_KEY_CANVAS"
  | "AI_SUBJECT_UNBOUND"
  | "NONE";

export type ChromaKeyParams = {
  keyColor: "GREEN" | "BLUE";
  /** 0–1 RGB distance tolerance */
  tolerance: number;
  /** 0–1 edge softness */
  edgeSoftness: number;
  /** 0–1 green/blue spill suppression */
  spill: number;
  /** 0–1 alpha feather */
  feather: number;
};

export type ChromaGroundingParams = {
  /** Contact shadow opacity under feet */
  contactShadowOpacity: number;
  contactShadowBlurPx: number;
  contactShadowScaleX: number;
  /** Soft light match onto keyed subject (0–1) */
  lightMatchStrength: number;
  lightMatchWarmth: number;
  /** Footline as fraction of composite height (ground contact) */
  footlineY: number;
};

export type ChromaFullBodyGuard = {
  /** Prefer contain framing — never crop instruments/feet by default */
  instrumentSafe: true;
  fullBodyPreferred: true;
  minVisibleFootFraction: number;
  forbidAggressiveTopCrop: true;
};

export type ChromaSlotCompositePlan = {
  slotId: string;
  participantId: string | null;
  method: ChromaCutoutMethod;
  useChroma: boolean;
  /** When false, slot shows honest HD video panel / still / empty */
  fallbackToVideoPanel: boolean;
};

export type ChromaRuntimeSnapshot = {
  owner: typeof CHROMA_RUNTIME_OWNER;
  backend: ChromaSegmentationBackend;
  /** True only when a real compositing path can run (keyer and/or AI). */
  runtimeReady: boolean;
  quality: ChromaQualityState;
  cutoutMethod: ChromaCutoutMethod;
  layout: ChromaCompositionLayout;
  deviceTier: ChromaDeviceTier;
  keyParams: ChromaKeyParams;
  grounding: ChromaGroundingParams;
  fullBody: ChromaFullBodyGuard;
  slots: ChromaSlotCompositePlan[];
  entitled: boolean;
  /** Presentation mode after entitlement + quality + layout */
  presentationMode: StagePerformerPresentationMode;
  /** Always true — mode switch must not remount WebRTC */
  preservesWebRtcSession: true;
  aiCutoutStatus: "UNBOUND" | "AVAILABLE" | "DEGRADED";
  notes: string[];
};

export const DEFAULT_CHROMA_KEY_PARAMS: ChromaKeyParams = {
  keyColor: "GREEN",
  tolerance: 0.32,
  edgeSoftness: 0.18,
  spill: 0.45,
  feather: 0.22,
};

export const DEFAULT_CHROMA_GROUNDING: ChromaGroundingParams = {
  contactShadowOpacity: 0.42,
  contactShadowBlurPx: 18,
  contactShadowScaleX: 0.55,
  lightMatchStrength: 0.28,
  lightMatchWarmth: 0.12,
  footlineY: 0.92,
};

export const DEFAULT_FULL_BODY_GUARD: ChromaFullBodyGuard = {
  instrumentSafe: true,
  fullBodyPreferred: true,
  minVisibleFootFraction: 0.08,
  forbidAggressiveTopCrop: true,
};

/** Probe AI subject segmentation — honest: no MediaPipe/TFJS bound in this repo yet. */
export function probeAiSubjectSegmentationBackend(): {
  available: boolean;
  backend: ChromaSegmentationBackend;
  status: ChromaRuntimeSnapshot["aiCutoutStatus"];
} {
  return {
    available: false,
    backend: "AI_SUBJECT_UNBOUND",
    status: "UNBOUND",
  };
}

export function resolveChromaDeviceTier(input?: {
  hardwareConcurrency?: number;
  deviceMemoryGb?: number;
  reducedMotion?: boolean;
  forceTier?: ChromaDeviceTier;
}): ChromaDeviceTier {
  if (input?.forceTier) return input.forceTier;
  if (input?.reducedMotion) return "LOW";
  const cores = input?.hardwareConcurrency ?? 4;
  const mem = input?.deviceMemoryGb ?? 4;
  if (cores <= 2 || mem <= 2) return "LOW";
  if (cores <= 4 || mem <= 4) return "MEDIUM";
  return "HIGH";
}

export function deviceTierDegradesQuality(
  tier: ChromaDeviceTier,
  preferred: ChromaQualityState,
): ChromaQualityState {
  if (tier === "UNSUPPORTED") return "STANDARD_VIDEO_FALLBACK";
  if (tier === "LOW") {
    if (preferred === "CHROMA_READY" || preferred === "SEGMENTATION_READY") {
      return "SEGMENTATION_DEGRADED";
    }
  }
  if (tier === "MEDIUM" && preferred === "CHROMA_READY") {
    return "SEGMENTATION_READY";
  }
  return preferred;
}

export function resolveChromaCompositionLayout(input: {
  panelComposition: VenuePanelCompositionKind;
  entitledSlots: boolean[];
  cutoutMethod: ChromaCutoutMethod;
  quality: ChromaQualityState;
}): ChromaCompositionLayout {
  const chromaOk =
    input.cutoutMethod !== "REAL_BACKGROUND" &&
    (input.quality === "CHROMA_READY" || input.quality === "SEGMENTATION_READY");

  if (!chromaOk || input.entitledSlots.every((e) => !e)) {
    return "HD_VIDEO_PANEL";
  }

  if (input.panelComposition === "BATTLE_DUAL_MIXED") {
    const [a, b] = input.entitledSlots;
    if (a && b) return "BATTLE_DUAL_CHROMA";
    if (a || b) return "BATTLE_MIXED_PANEL_CHROMA";
    return "HD_VIDEO_PANEL";
  }

  if (input.panelComposition === "CYPHER_COLLABORATIVE_ROWS") {
    return "CYPHER_PARTICIPANT_CHROMA";
  }

  return "ONE_PERFORMER_CHROMA";
}

export function presentationModeSwitchPreservesWebRtcSession(): true {
  return true;
}

/**
 * Pure chroma-key alpha for one pixel (sRGB 0–255).
 * Returns alpha 0–1 where 0 = fully keyed out (background).
 */
export function computeChromaKeyAlpha(
  r: number,
  g: number,
  b: number,
  params: ChromaKeyParams = DEFAULT_CHROMA_KEY_PARAMS,
): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  let chromaDist: number;
  if (params.keyColor === "GREEN") {
    // Green dominance vs red/blue
    chromaDist = gn - Math.max(rn, bn);
  } else {
    chromaDist = bn - Math.max(rn, gn);
  }
  const soft = Math.max(0.001, params.edgeSoftness);
  const edge0 = params.tolerance - soft;
  const edge1 = params.tolerance + soft * 0.5;
  // High green dominance → low alpha (transparent)
  if (chromaDist <= edge0) return 1;
  if (chromaDist >= edge1) return 0;
  const t = (chromaDist - edge0) / (edge1 - edge0);
  const feathered = 1 - t;
  return Math.min(1, Math.max(0, feathered * (1 - params.feather * t)));
}

/** Apply spill suppression toward neutral on remaining subject pixels. */
export function applySpillSuppression(
  r: number,
  g: number,
  b: number,
  alpha: number,
  params: ChromaKeyParams = DEFAULT_CHROMA_KEY_PARAMS,
): { r: number; g: number; b: number } {
  if (alpha < 0.02 || params.spill <= 0) return { r, g, b };
  if (params.keyColor === "GREEN" && g > r && g > b) {
    const spillAmt = Math.min(1, ((g - Math.max(r, b)) / 255) * params.spill);
    const ng = g - (g - (r + b) / 2) * spillAmt;
    return { r, g: Math.max(0, Math.min(255, ng)), b };
  }
  if (params.keyColor === "BLUE" && b > r && b > g) {
    const spillAmt = Math.min(1, ((b - Math.max(r, g)) / 255) * params.spill);
    const nb = b - (b - (r + g) / 2) * spillAmt;
    return { r, g, b: Math.max(0, Math.min(255, nb)) };
  }
  return { r, g, b };
}

/**
 * Key an RGBA buffer in place (alpha channel rewritten).
 * length must be width*height*4. Returns mean subject coverage 0–1.
 */
export function applyChromaKeyToRgba(
  data: Uint8ClampedArray | Uint8Array,
  params: ChromaKeyParams = DEFAULT_CHROMA_KEY_PARAMS,
): { meanAlpha: number; opaquePixelCount: number } {
  let sum = 0;
  let opaque = 0;
  const pixels = Math.floor(data.length / 4);
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    const r = data[o]!;
    const g = data[o + 1]!;
    const b = data[o + 2]!;
    let a = computeChromaKeyAlpha(r, g, b, params);
    const col = applySpillSuppression(r, g, b, a, params);
    data[o] = col.r;
    data[o + 1] = col.g;
    data[o + 2] = col.b;
    data[o + 3] = Math.round(a * 255);
    sum += a;
    if (a > 0.5) opaque += 1;
  }
  return { meanAlpha: pixels ? sum / pixels : 0, opaquePixelCount: opaque };
}

/** Infer quality from key coverage — empty/all-key = fallback. */
export function inferChromaQualityFromCoverage(meanAlpha: number): ChromaQualityState {
  if (meanAlpha < 0.02) return "STANDARD_VIDEO_FALLBACK";
  if (meanAlpha > 0.92) return "STANDARD_VIDEO_FALLBACK"; // almost nothing keyed
  if (meanAlpha < 0.08 || meanAlpha > 0.85) return "SEGMENTATION_DEGRADED";
  return "CHROMA_READY";
}

export function buildChromaSlotPlans(input: {
  layout: ChromaCompositionLayout;
  slots: Array<{ slotId: string; participantId: string | null; entitled: boolean }>;
  cutoutMethod: ChromaCutoutMethod;
}): ChromaSlotCompositePlan[] {
  return input.slots.map((s, index) => {
    let useChroma = false;
    if (input.layout === "HD_VIDEO_PANEL" || input.cutoutMethod === "REAL_BACKGROUND") {
      useChroma = false;
    } else if (input.layout === "BATTLE_MIXED_PANEL_CHROMA") {
      // Prefer chroma on first entitled corner only when mixed
      useChroma = s.entitled && index === input.slots.findIndex((x) => x.entitled);
    } else if (input.layout === "BATTLE_DUAL_CHROMA" || input.layout === "ONE_PERFORMER_CHROMA") {
      useChroma = s.entitled && Boolean(s.participantId);
    } else if (input.layout === "CYPHER_PARTICIPANT_CHROMA") {
      useChroma = s.entitled && Boolean(s.participantId);
    }
    return {
      slotId: s.slotId,
      participantId: s.participantId,
      method: useChroma ? input.cutoutMethod : "REAL_BACKGROUND",
      useChroma,
      fallbackToVideoPanel: !useChroma,
    };
  });
}

export function resolveChromaRuntimeSnapshot(input: {
  entitled: boolean;
  panelComposition: VenuePanelCompositionKind;
  slots: Array<{ slotId: string; participantId: string | null; entitled?: boolean }>;
  cutoutMethod?: ChromaCutoutMethod;
  preferredQuality?: ChromaQualityState;
  deviceTier?: ChromaDeviceTier;
  keyParams?: Partial<ChromaKeyParams>;
  forceAiAvailable?: boolean;
}): ChromaRuntimeSnapshot {
  const notes: string[] = [];
  const ai = input.forceAiAvailable
    ? { available: true, backend: "CHROMA_KEY_CANVAS" as const, status: "AVAILABLE" as const }
    : probeAiSubjectSegmentationBackend();

  let method: ChromaCutoutMethod = input.cutoutMethod ?? "CHROMA_KEY";
  if (method === "AI_SUBJECT_CUTOUT" && !ai.available) {
    notes.push("AI_SUBJECT_CUTOUT unbound — falling back to CHROMA_KEY canvas keyer");
    method = "CHROMA_KEY";
  }

  const deviceTier = input.deviceTier ?? resolveChromaDeviceTier();
  let quality = deviceTierDegradesQuality(
    deviceTier,
    input.preferredQuality ?? (input.entitled ? "CHROMA_READY" : "STANDARD_VIDEO_FALLBACK"),
  );

  if (!input.entitled) {
    quality = "STANDARD_VIDEO_FALLBACK";
    notes.push("Not entitled — HD video panel only");
  }

  const backend: ChromaSegmentationBackend =
    method === "CHROMA_KEY" && input.entitled && quality !== "STANDARD_VIDEO_FALLBACK"
      ? "CHROMA_KEY_CANVAS"
      : method === "AI_SUBJECT_CUTOUT" && ai.available
        ? "CHROMA_KEY_CANVAS"
        : input.entitled
          ? "AI_SUBJECT_UNBOUND"
          : "NONE";

  const runtimeReady =
    input.entitled &&
    backend === "CHROMA_KEY_CANVAS" &&
    (quality === "CHROMA_READY" || quality === "SEGMENTATION_READY");

  if (quality === "SEGMENTATION_DEGRADED") {
    notes.push("Device/quality degraded — presentation falls back to video panel");
  }

  const entitledFlags = input.slots.map((s) =>
    Boolean(input.entitled && (s.entitled !== false) && s.participantId),
  );
  const layout = resolveChromaCompositionLayout({
    panelComposition: input.panelComposition,
    entitledSlots: entitledFlags.length ? entitledFlags : [input.entitled],
    cutoutMethod: method,
    quality: runtimeReady ? quality : "STANDARD_VIDEO_FALLBACK",
  });

  const slotPlans = buildChromaSlotPlans({
    layout,
    slots: input.slots.map((s, i) => ({
      slotId: s.slotId,
      participantId: s.participantId,
      entitled: entitledFlags[i] ?? false,
    })),
    cutoutMethod: method,
  });

  const presentationMode: StagePerformerPresentationMode =
    runtimeReady && layout !== "HD_VIDEO_PANEL"
      ? "STAGE_CHROMA_PERFORMER"
      : "STAGE_VIDEO_PANEL";

  return {
    owner: CHROMA_RUNTIME_OWNER,
    backend,
    runtimeReady,
    quality: runtimeReady ? quality : layout === "HD_VIDEO_PANEL" ? quality : "STANDARD_VIDEO_FALLBACK",
    cutoutMethod: method,
    layout,
    deviceTier,
    keyParams: { ...DEFAULT_CHROMA_KEY_PARAMS, ...input.keyParams },
    grounding: { ...DEFAULT_CHROMA_GROUNDING },
    fullBody: { ...DEFAULT_FULL_BODY_GUARD },
    slots: slotPlans,
    entitled: input.entitled,
    presentationMode,
    preservesWebRtcSession: true,
    aiCutoutStatus: ai.status,
    notes,
  };
}

/** Composite subject over stage underlay with contact shadow + light match (canvas 2D). */
export function compositeChromaSubjectOntoStage(input: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Already-keyed ImageData (premultiplied-ish via alpha) */
  subject: ImageData;
  underlayCssColor?: string;
  grounding?: ChromaGroundingParams;
  fullBody?: ChromaFullBodyGuard;
}): void {
  const g = input.grounding ?? DEFAULT_CHROMA_GROUNDING;
  const fb = input.fullBody ?? DEFAULT_FULL_BODY_GUARD;
  const { ctx, width, height } = input;

  ctx.save();
  ctx.fillStyle = input.underlayCssColor ?? "#0a0614";
  ctx.fillRect(0, 0, width, height);

  // Contact shadow at footline
  const footY = height * g.footlineY;
  const shadowW = width * g.contactShadowScaleX;
  const shadowX = (width - shadowW) / 2;
  ctx.save();
  ctx.filter = `blur(${g.contactShadowBlurPx}px)`;
  ctx.fillStyle = `rgba(0,0,0,${g.contactShadowOpacity})`;
  ctx.beginPath();
  ctx.ellipse(width / 2, footY, shadowW / 2, Math.max(4, height * 0.025), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Full-body contain draw — instrument-safe (no aggressive top crop)
  const padTop = fb.forbidAggressiveTopCrop ? height * 0.04 : 0;
  const padBottom = height * fb.minVisibleFootFraction;
  const drawH = height - padTop - padBottom;
  const drawW = width;
  const tmp = document.createElement("canvas");
  tmp.width = input.subject.width;
  tmp.height = input.subject.height;
  const tctx = tmp.getContext("2d");
  if (tctx) {
    tctx.putImageData(input.subject, 0, 0);
    if (g.lightMatchStrength > 0) {
      ctx.save();
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(tmp, 0, padTop, drawW, drawH);
    if (g.lightMatchStrength > 0) {
      ctx.globalCompositeOperation = "source-atop";
      const warmth = g.lightMatchWarmth;
      ctx.fillStyle = `rgba(255, ${Math.round(220 - warmth * 40)}, ${Math.round(180 - warmth * 60)}, ${g.lightMatchStrength * 0.35})`;
      ctx.fillRect(0, padTop, drawW, drawH);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Node/test-safe composite metrics without DOM canvas. */
export function measureGroundingLayout(
  width: number,
  height: number,
  grounding: ChromaGroundingParams = DEFAULT_CHROMA_GROUNDING,
  fullBody: ChromaFullBodyGuard = DEFAULT_FULL_BODY_GUARD,
): {
  footlineY: number;
  shadowCenterX: number;
  shadowWidth: number;
  subjectDrawTop: number;
  subjectDrawHeight: number;
  instrumentSafe: true;
} {
  const padTop = fullBody.forbidAggressiveTopCrop ? height * 0.04 : 0;
  const padBottom = height * fullBody.minVisibleFootFraction;
  return {
    footlineY: height * grounding.footlineY,
    shadowCenterX: width / 2,
    shadowWidth: width * grounding.contactShadowScaleX,
    subjectDrawTop: padTop,
    subjectDrawHeight: height - padTop - padBottom,
    instrumentSafe: true,
  };
}
