/**
 * FaceScanIdentityEngine — bounded parametric fit onto the EXISTING canonical Avatar.
 *
 * NOT a second avatar system. Capture → quality → appearance/shape parameters →
 * AvatarFaceIdentityProfile → same bobblehead rig / Creation Center draft.
 *
 * No MediaPipe / ML landmark mesh rebuild. Image analysis is canvas-local and
 * produces clamped shape + appearance that the same AvatarRig already renders.
 */

import {
  clampShapeCoefficients,
  type AvatarFaceIdentityProfile,
  type FaceAppearanceParameters,
  type FaceCaptureSource,
  type FaceIdentityShapeCoefficients,
  type FeatureConfidenceScores,
  type FacialAnchors,
  type QualityValidationReport,
} from "@/lib/avatar/AvatarFaceIdentityContract";
import {
  FAN_SKIN_TONE_CONTINUUM,
  persistFanSkinT,
  sampleFanSkinTone,
} from "@/lib/avatars/FanCosmeticCatalog";
import {
  persistFaceIdentityProfile,
  readPersistedBobbleheadBaseId,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import { patchCanonicalAvatarDraft } from "@/lib/avatars/CanonicalAvatarDraft";

export type LODTier = "near" | "medium" | "far" | "ultra-far";

/** Legacy LOD material profile — still used by crowd near-field PBR hints. */
export interface FaceScanProfile {
  userId: string;
  baseMeshUrl: string;
  pbrMaterials: {
    skinRoughness: number;
    subsurfaceColor: string;
    metalness: number;
  };
  clothPhysicsEnabled: boolean;
  isRendered360: boolean;
}

export type FaceScanFitStatus =
  | "idle"
  | "analyzing"
  | "quality_failed"
  | "fitted"
  | "approved"
  | "error";

export interface FaceScanImageStats {
  width: number;
  height: number;
  avgR: number;
  avgG: number;
  avgB: number;
  skinHex: string;
  luminance: number;
  luminanceVariance: number;
  skinLikeRatio: number;
  upperLuma: number;
  midLuma: number;
  lowerLuma: number;
  midHorizontalSpread: number;
  browDarkness: number;
  lipWarmth: number;
}

export interface FaceScanFitResult {
  status: FaceScanFitStatus;
  profile: AvatarFaceIdentityProfile | null;
  quality: QualityValidationReport;
  skinT: number;
  draftPatch: { skinT: number };
  feedbackMessage: string;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function toHex(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, "0");
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function luma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function hexDistance(a: string, b: string): number {
  const parse = (h: string) => {
    const s = h.replace("#", "");
    return [
      parseInt(s.slice(0, 2), 16),
      parseInt(s.slice(2, 4), 16),
      parseInt(s.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return Math.hypot(ar - br, ag - bg, ab - bb);
}

export function skinHexToContinuumT(skinHex: string): number {
  let best = FAN_SKIN_TONE_CONTINUUM[0]!;
  let bestD = Infinity;
  for (const stop of FAN_SKIN_TONE_CONTINUUM) {
    const d = hexDistance(skinHex, stop.hex);
    if (d < bestD) {
      bestD = d;
      best = stop;
    }
  }
  return best.t;
}

function isSkinLike(r: number, g: number, b: number): boolean {
  if (r < 40 || g < 20 || b < 10) return false;
  if (r < g - 15 || r < b - 10) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 12) return false;
  const L = luma(r, g, b);
  return L > 0.08 && L < 0.92;
}

export function analyzeImageData(imageData: ImageData): FaceScanImageStats {
  const { width, height, data } = imageData;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let skinN = 0;
  let totalSampled = 0;
  let lumaSum = 0;
  let lumaSq = 0;
  let upperLuma = 0;
  let upperN = 0;
  let midLuma = 0;
  let midN = 0;
  let lowerLuma = 0;
  let lowerN = 0;
  let midXWeighted = 0;
  let midXSq = 0;
  let browDarkAcc = 0;
  let browN = 0;
  let lipWarmAcc = 0;
  let lipN = 0;

  const cx = width * 0.5;
  const cy = height * 0.42;
  const rx = width * 0.28;
  const ry = height * 0.36;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 96));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny > 1) continue;
      const i = (y * width + x) * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const L = luma(r, g, b);
      totalSampled++;
      lumaSum += L;
      lumaSq += L * L;

      const band = y / height;
      if (band < 0.38) {
        upperLuma += L;
        upperN++;
        if (L < 0.35) {
          browDarkAcc += 1 - L;
          browN++;
        }
      } else if (band < 0.62) {
        midLuma += L;
        midN++;
        midXWeighted += x;
        midXSq += x * x;
      } else {
        lowerLuma += L;
        lowerN++;
        if (isSkinLike(r, g, b) && r > g + 8) {
          lipWarmAcc += (r - g) / 255;
          lipN++;
        }
      }

      if (isSkinLike(r, g, b)) {
        skinN++;
        sumR += r;
        sumG += g;
        sumB += b;
      }
    }
  }

  const n = Math.max(1, skinN);
  const avgR = sumR / n;
  const avgG = sumG / n;
  const avgB = sumB / n;
  const meanL = totalSampled ? lumaSum / totalSampled : 0.5;
  const variance = totalSampled
    ? Math.max(0, lumaSq / totalSampled - meanL * meanL)
    : 0;
  const midMeanX = midN ? midXWeighted / midN : cx;
  const midVarX = midN ? Math.max(0, midXSq / midN - midMeanX * midMeanX) : 0;
  const midHorizontalSpread = Math.sqrt(midVarX) / Math.max(1, width);

  return {
    width,
    height,
    avgR,
    avgG,
    avgB,
    skinHex: rgbToHex(avgR, avgG, avgB),
    luminance: meanL,
    luminanceVariance: variance,
    skinLikeRatio: totalSampled ? skinN / totalSampled : 0,
    upperLuma: upperN ? upperLuma / upperN : meanL,
    midLuma: midN ? midLuma / midN : meanL,
    lowerLuma: lowerN ? lowerLuma / lowerN : meanL,
    midHorizontalSpread,
    browDarkness: browN ? browDarkAcc / browN : 0.3,
    lipWarmth: lipN ? lipWarmAcc / lipN : 0.05,
  };
}

export async function analyzeDataUrl(dataUrl: string): Promise<FaceScanImageStats> {
  if (typeof document === "undefined") {
    throw new Error("Face scan analysis requires a browser canvas");
  }
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const maxSide = 320;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  canvas.width = Math.max(32, Math.round(img.width * scale));
  canvas.height = Math.max(32, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return analyzeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode face capture"));
    img.src = dataUrl;
  });
}

export function evaluateCaptureQuality(stats: FaceScanImageStats): QualityValidationReport {
  const faceDetected = stats.skinLikeRatio >= 0.12;
  const adequateLight = stats.luminance >= 0.18 && stats.luminance <= 0.88;
  const lowBlur = stats.luminanceVariance >= 0.004;
  const faceCentered = stats.skinLikeRatio >= 0.18;
  const eyesVisible = stats.upperLuma > 0.05 && stats.midLuma > 0.05;
  const headPoseValid = Math.abs(stats.upperLuma - stats.lowerLuma) < 0.55;
  const passed =
    faceDetected && adequateLight && lowBlur && faceCentered && eyesVisible && headPoseValid;

  let feedbackMessage: string | undefined;
  if (!faceDetected) feedbackMessage = "No clear face region detected — center your face and retry.";
  else if (!adequateLight) feedbackMessage = "Lighting too dark or blown out — face a softer light.";
  else if (!lowBlur) feedbackMessage = "Image too flat/blurry — hold still and recapture.";
  else if (!faceCentered) feedbackMessage = "Move closer so your face fills the oval guide.";
  else feedbackMessage = "Capture quality OK — fitting likeness to your Avatar.";

  return {
    passed,
    faceDetected,
    faceCentered,
    adequateLight,
    lowBlur,
    eyesVisible,
    headPoseValid,
    frontFrameValid: passed,
    leftFrameValid: true,
    rightFrameValid: true,
    feedbackMessage,
  };
}

export function deriveShapeCoefficients(stats: FaceScanImageStats): FaceIdentityShapeCoefficients {
  const faceWidth = (stats.midHorizontalSpread - 0.12) * 4;
  const faceLength = (stats.lowerLuma - stats.upperLuma) * 1.8;
  const jawWidth = faceWidth * 0.85 + (stats.lowerLuma - 0.45) * 0.6;
  const cheekWidth = (stats.midLuma - 0.4) * 1.2;
  const foreheadHeight = (stats.upperLuma - stats.midLuma) * 1.4;
  const eyeScale = (0.55 - Math.abs(stats.midLuma - 0.45)) * 0.8;
  const eyeSpacing = faceWidth * 0.35;
  const noseWidth = faceWidth * 0.25 + (stats.avgR / 255 - 0.5) * 0.3;
  const noseLength = faceLength * 0.4;
  const mouthWidth = faceWidth * 0.45 + stats.lipWarmth * 2;
  const browPosition = (stats.browDarkness - 0.35) * 1.2;
  const chinProjection = (stats.lowerLuma - 0.42) * 0.9;
  const upperLipShape = stats.lipWarmth * 1.5 - 0.15;
  const lowerLipShape = stats.lipWarmth * 1.2 - 0.1;

  const lipFull = stats.lipWarmth * 2.2 - 0.2;
  return clampShapeCoefficients({
    faceWidth,
    faceLength,
    jawWidth,
    jawShape: jawWidth * 0.5,
    chinWidth: jawWidth * 0.7,
    chinProjection,
    cheekWidth,
    cheekProjection: cheekWidth * 0.6,
    foreheadHeight,
    eyeSpacing,
    eyeScale,
    eyeHeight: eyeScale * 0.4,
    eyeTilt: (stats.upperLuma - stats.midLuma) * 0.3,
    browPosition,
    noseWidth,
    noseLength,
    noseProjection: noseLength * 0.5,
    noseBridgeWidth: noseWidth * 0.7,
    noseTipSize: noseWidth * 0.5 + noseLength * 0.2,
    mouthWidth,
    mouthHeight: lipFull * 0.35,
    upperLipShape,
    lowerLipShape,
    upperLipFullness: lipFull * 0.85,
    lowerLipFullness: lipFull,
    lipWidth: mouthWidth * 0.6,
    earSize: faceWidth * 0.25,
    earProjection: faceWidth * 0.15,
    earPosition: foreheadHeight * 0.2,
  });
}

export function deriveAppearance(stats: FaceScanImageStats): FaceAppearanceParameters {
  const skin = sampleFanSkinTone(skinHexToContinuumT(stats.skinHex));
  const subsurface = rgbToHex(
    Math.min(255, stats.avgR * 1.08),
    Math.min(255, stats.avgG * 0.95),
    Math.min(255, stats.avgB * 0.9),
  );
  const eyeColorHex =
    stats.luminance > 0.55 ? "#4A3728" : stats.luminance > 0.35 ? "#2C1810" : "#1A0F0A";
  const browColorHex = stats.browDarkness > 0.45 ? "#1A120C" : "#3D2914";
  const lipColorHex = rgbToHex(
    Math.min(255, stats.avgR * 0.92 + 40),
    Math.min(255, stats.avgG * 0.55 + 20),
    Math.min(255, stats.avgB * 0.55 + 25),
  );

  let hairRecommendationId = "hair_crop_textured";
  if (stats.browDarkness > 0.55 && stats.upperLuma < 0.28) hairRecommendationId = "hair_buzz";
  else if (stats.upperLuma > 0.55) hairRecommendationId = "hair_fade_short";
  else if (stats.avgR < 90) hairRecommendationId = "hair_afro_mini";

  return {
    skinHex: skin.hex,
    skinSubsurfaceHex: subsurface,
    eyeColorHex,
    browColorHex,
    lipColorHex,
    hairRecommendationId,
    likenessStrength: 0.72,
  };
}

function defaultAnchors(): FacialAnchors {
  return {
    leftEye: [-0.032, 1.12, 0.06],
    rightEye: [0.032, 1.12, 0.06],
    eyeCenter: [0, 1.12, 0.06],
    nose: [0, 1.05, 0.08],
    mouth: [0, 0.98, 0.07],
    chin: [0, 0.9, 0.05],
    headTop: [0, 1.35, 0],
    earL: [-0.08, 1.08, 0],
    earR: [0.08, 1.08, 0],
  };
}

function confidenceFromQuality(
  quality: QualityValidationReport,
  stats: FaceScanImageStats,
): FeatureConfidenceScores {
  const base = quality.passed ? 0.72 : 0.35;
  return {
    eyes: clamp01(base + (quality.eyesVisible ? 0.1 : -0.2)),
    nose: clamp01(base),
    mouth: clamp01(base + stats.lipWarmth),
    jaw: clamp01(base + stats.midHorizontalSpread),
    skin: clamp01(0.5 + stats.skinLikeRatio),
    overall: clamp01(base + stats.skinLikeRatio * 0.2),
  };
}

export function buildFaceIdentityProfile(opts: {
  userId: string;
  stats: FaceScanImageStats;
  quality: QualityValidationReport;
  captureSource?: FaceCaptureSource;
  baseAvatarId?: string;
  prior?: AvatarFaceIdentityProfile | null;
}): AvatarFaceIdentityProfile {
  const now = Date.now();
  const shapeCoefficients = deriveShapeCoefficients(opts.stats);
  const appearance = deriveAppearance(opts.stats);
  return {
    identityId: opts.prior?.identityId ?? `face_id_${opts.userId}_${now.toString(36)}`,
    userId: opts.userId,
    revision: (opts.prior?.revision ?? 0) + 1,
    baseAvatarId: opts.baseAvatarId ?? readPersistedBobbleheadBaseId(),
    captureSource: opts.captureSource ?? "GUIDED_SCAN",
    shapeCoefficients,
    appearance,
    anchors: defaultAnchors(),
    confidence: confidenceFromQuality(opts.quality, opts.stats),
    approvedAt: null,
    createdAt: opts.prior?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function fitFaceScanToCanonicalAvatar(opts: {
  imageDataUrl: string;
  userId?: string;
  captureSource?: FaceCaptureSource;
  applyDraftPreview?: boolean;
}): Promise<FaceScanFitResult> {
  try {
    const stats = await analyzeDataUrl(opts.imageDataUrl);
    const quality = evaluateCaptureQuality(stats);
    if (!quality.passed) {
      return {
        status: "quality_failed",
        profile: null,
        quality,
        skinT: skinHexToContinuumT(stats.skinHex),
        draftPatch: { skinT: skinHexToContinuumT(stats.skinHex) },
        feedbackMessage: quality.feedbackMessage ?? "Capture quality failed",
      };
    }

    const userId = opts.userId ?? "fan_local";
    const profile = buildFaceIdentityProfile({
      userId,
      stats,
      quality,
      captureSource: opts.captureSource,
    });
    const skinT = skinHexToContinuumT(profile.appearance.skinHex);

    persistFaceIdentityProfile(profile);
    if (opts.applyDraftPreview !== false) {
      persistFanSkinT(skinT);
      patchCanonicalAvatarDraft({
        skinT,
        ...(profile.appearance.hairRecommendationId
          ? { equippedCosmeticIds: [profile.appearance.hairRecommendationId] }
          : {}),
      });
    }

    return {
      status: "fitted",
      profile,
      quality,
      skinT,
      draftPatch: { skinT },
      feedbackMessage:
        "Likeness fitted to your Avatar. Orbit to inspect, then Accept & Equip or Adjust.",
    };
  } catch (err) {
    return {
      status: "error",
      profile: null,
      quality: {
        passed: false,
        faceDetected: false,
        faceCentered: false,
        adequateLight: false,
        lowBlur: false,
        eyesVisible: false,
        headPoseValid: false,
        frontFrameValid: false,
        leftFrameValid: false,
        rightFrameValid: false,
        feedbackMessage: err instanceof Error ? err.message : "Face scan failed",
      },
      skinT: 0.5,
      draftPatch: { skinT: 0.5 },
      feedbackMessage: err instanceof Error ? err.message : "Face scan failed",
    };
  }
}

export function approveFaceIdentityFit(profile: AvatarFaceIdentityProfile): AvatarFaceIdentityProfile {
  const approved: AvatarFaceIdentityProfile = {
    ...profile,
    approvedAt: Date.now(),
    updatedAt: Date.now(),
    revision: profile.revision + 1,
  };
  persistFaceIdentityProfile(approved);
  const skinT = skinHexToContinuumT(approved.appearance.skinHex);
  persistFanSkinT(skinT);
  patchCanonicalAvatarDraft({ skinT });
  return approved;
}

export function shapeCoefficientsToRigMorph(shape: FaceIdentityShapeCoefficients): {
  bobbleheadRatioDelta: number;
  bodyHeight: number;
  bodyMass: number;
  headScaleX: number;
  headScaleY: number;
} {
  return {
    bobbleheadRatioDelta: shape.faceWidth * 0.08 + shape.cheekWidth * 0.04,
    bodyHeight: 50 + shape.faceLength * 12,
    bodyMass: 50 + shape.jawWidth * 14 + shape.cheekWidth * 8,
    headScaleX: 1 + shape.faceWidth * 0.12 + shape.jawWidth * 0.06,
    headScaleY: 1 + shape.faceLength * 0.1 + shape.foreheadHeight * 0.06,
  };
}

export class FaceScanIdentityEngine {
  private activeIdentities: Map<string, FaceScanProfile> = new Map();
  private lastFit: FaceScanFitResult | null = null;

  async processScan(
    imageDataUrl: string,
    opts?: { userId?: string; captureSource?: FaceCaptureSource },
  ): Promise<FaceScanFitResult> {
    const result = await fitFaceScanToCanonicalAvatar({
      imageDataUrl,
      userId: opts?.userId,
      captureSource: opts?.captureSource,
      applyDraftPreview: true,
    });
    this.lastFit = result;
    return result;
  }

  getLastFit(): FaceScanFitResult | null {
    return this.lastFit;
  }

  approveLastFit(): AvatarFaceIdentityProfile | null {
    if (!this.lastFit?.profile) return null;
    const approved = approveFaceIdentityFit(this.lastFit.profile);
    this.lastFit = { ...this.lastFit, status: "approved", profile: approved };
    return approved;
  }

  public upgradeToCinematicIdentity(
    userId: string,
    meshUrl: string,
    lodTier: LODTier,
  ): FaceScanProfile {
    const isNearField = lodTier === "near";
    const isMidField = lodTier === "medium";
    const profile: FaceScanProfile = {
      userId,
      baseMeshUrl: meshUrl,
      pbrMaterials: {
        skinRoughness: isNearField ? 0.45 : 0.8,
        subsurfaceColor: isNearField ? "#e0ac98" : "#000000",
        metalness: isMidField || isNearField ? 0.35 : 0.0,
      },
      clothPhysicsEnabled: isNearField,
      isRendered360: isNearField || isMidField,
    };
    this.activeIdentities.set(userId, profile);
    return profile;
  }

  public applyEnvironmentLighting(_userId: string, _stageColorHex: string, _intensity: number) {
    // Lighting is applied by the venue renderer; identity params stay on the profile.
  }

  public getIdentity(userId: string): FaceScanProfile | undefined {
    return this.activeIdentities.get(userId);
  }
}

export const faceScanIdentityEngine = new FaceScanIdentityEngine();
