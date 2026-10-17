/**
 * AvatarFaceIdentityContract.ts — Canonical Avatar Face Identity Specification
 *
 * Laws:
 * 1. The selfie does not become the avatar. The selfie teaches the existing avatar
 *    how to look like that person.
 * 2. Identity shapes (persistent WHO) are strictly separated from ARKit-52 expression
 *    morphs (dynamic WHAT THE FACE IS DOING).
 * 3. Canonical 26-bone skeleton is NEVER altered.
 * 4. Normals derive from fitted 3D geometry and bounded micro-detail, NEVER raw shadows.
 * 5. Hair and facial hair V1 rank/select certified 3D assets rather than pasting texture on skull.
 * 6. Preserves canonical facial anchors for dynamic camera eye height (1P POV) and VR alignment.
 */

export interface FaceIdentityShapeCoefficients {
  faceWidth: number;
  faceLength: number;
  jawWidth: number;
  jawShape: number;
  chinWidth: number;
  chinProjection: number;
  cheekWidth: number;
  cheekProjection: number;
  foreheadHeight: number;
  eyeSpacing: number;
  eyeScale: number;
  eyeHeight: number;
  eyeTilt: number;
  browPosition: number;
  noseWidth: number;
  noseLength: number;
  noseProjection: number;
  noseBridgeWidth: number;
  noseTipSize: number;
  mouthWidth: number;
  mouthHeight: number;
  upperLipShape: number;
  lowerLipShape: number;
  /** Lip fullness: thin (−1) → very full (+1). Independent of mouthWidth. */
  upperLipFullness: number;
  lowerLipFullness: number;
  lipWidth: number;
  earSize: number;
  earProjection: number;
  earPosition: number;
  /** Morphology additions per TMI Global Avatar Identity & Body Diversity Law */
  eyeDepth?: number;
  eyelidOpenness?: number;
  noseBridgeHeight?: number;
  noseTipAngle?: number;
  nostrilWidth?: number;
  cheekFullness?: number;
  chinLength?: number;
  earShape?: number;
  facialFullness?: number;
}

export interface FaceAppearanceParameters {
  skinHex: string;
  skinSubsurfaceHex: string;
  eyeColorHex: string;
  browColorHex: string;
  lipColorHex: string;
  hairRecommendationId?: string;
  facialHairRecommendationId?: string;
  /** Normalized likeness blending factor (default presentation range 0.55 - 0.90) */
  likenessStrength: number;
}

export interface FacialAnchors {
  leftEye: [number, number, number];
  rightEye: [number, number, number];
  eyeCenter: [number, number, number];
  nose: [number, number, number];
  mouth: [number, number, number];
  chin: [number, number, number];
  headTop: [number, number, number];
  earL: [number, number, number];
  earR: [number, number, number];
}

export interface FeatureConfidenceScores {
  eyes: number;   // 0.0 - 1.0
  nose: number;   // 0.0 - 1.0
  mouth: number;  // 0.0 - 1.0
  jaw: number;    // 0.0 - 1.0
  skin: number;   // 0.0 - 1.0
  overall: number;// 0.0 - 1.0
}

export type FaceCaptureSource = "STOCK_PRESET" | "MANUAL_CREATION" | "GUIDED_SCAN" | "PHOTO_FALLBACK";

export interface QualityValidationReport {
  passed: boolean;
  faceDetected: boolean;
  faceCentered: boolean;
  adequateLight: boolean;
  lowBlur: boolean;
  eyesVisible: boolean;
  headPoseValid: boolean;
  frontFrameValid: boolean;
  leftFrameValid: boolean;
  rightFrameValid: boolean;
  feedbackMessage?: string;
}

export interface AvatarFaceIdentityProfile {
  identityId: string;
  userId: string;
  revision: number;
  baseAvatarId: string;
  captureSource: FaceCaptureSource;
  shapeCoefficients: FaceIdentityShapeCoefficients;
  appearance: FaceAppearanceParameters;
  anchors: FacialAnchors;
  confidence: FeatureConfidenceScores;
  semanticFeatherAssetId?: string;
  approvedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/** Certified safe coefficient clamp limits to prevent rig destruction or mesh tearing */
export const SHAPE_COEFFICIENT_SAFE_BOUNDS: Record<keyof FaceIdentityShapeCoefficients, [number, number]> = {
  faceWidth: [-0.65, 0.65],
  faceLength: [-0.60, 0.60],
  jawWidth: [-0.70, 0.70],
  jawShape: [-0.75, 0.75],
  chinWidth: [-0.60, 0.60],
  chinProjection: [-0.55, 0.55],
  cheekWidth: [-0.65, 0.65],
  cheekProjection: [-0.60, 0.60],
  foreheadHeight: [-0.50, 0.50],
  eyeSpacing: [-0.55, 0.55],
  eyeScale: [-0.45, 0.45],
  eyeHeight: [-0.45, 0.45],
  eyeTilt: [-0.40, 0.40],
  browPosition: [-0.50, 0.50],
  noseWidth: [-0.60, 0.60],
  noseLength: [-0.55, 0.55],
  noseProjection: [-0.50, 0.50],
  noseBridgeWidth: [-0.55, 0.55],
  noseTipSize: [-0.55, 0.55],
  mouthWidth: [-0.65, 0.65],
  mouthHeight: [-0.55, 0.55],
  upperLipShape: [-0.55, 0.55],
  lowerLipShape: [-0.55, 0.55],
  upperLipFullness: [-0.85, 0.95],
  lowerLipFullness: [-0.85, 0.95],
  lipWidth: [-0.65, 0.65],
  earSize: [-0.70, 0.85],
  earProjection: [-0.60, 0.75],
  earPosition: [-0.50, 0.50],
  eyeDepth: [-0.50, 0.50],
  eyelidOpenness: [-0.60, 0.60],
  noseBridgeHeight: [-0.55, 0.55],
  noseTipAngle: [-0.50, 0.50],
  nostrilWidth: [-0.55, 0.55],
  cheekFullness: [-0.65, 0.65],
  chinLength: [-0.60, 0.60],
  earShape: [-0.50, 0.50],
  facialFullness: [-0.70, 0.70],
};

/** Clamps all coefficients into verified safe deformation ranges */
export function clampShapeCoefficients(
  raw: Partial<FaceIdentityShapeCoefficients>,
): FaceIdentityShapeCoefficients {
  const result: any = {};
  for (const key of Object.keys(SHAPE_COEFFICIENT_SAFE_BOUNDS) as Array<keyof FaceIdentityShapeCoefficients>) {
    const [min, max] = SHAPE_COEFFICIENT_SAFE_BOUNDS[key];
    const val = raw[key] ?? 0;
    result[key] = Math.max(min, Math.min(max, val));
  }
  return result as FaceIdentityShapeCoefficients;
}


/** Current production face-fit version — never silently mutate approved Avatars. */
export const FACE_FIT_VERSION = "faceFit_v1.0.0";
export const LANDMARK_VERSION = "landmark_canvas_v1";
export const APPEARANCE_FIT_VERSION = "appearance_v1.0.0";
export const RIG_FACE_VERSION = "arkit_compat_v1";

export type FaceCorrectionCategory =
  | "FACE_SHAPE" | "JAW" | "CHIN" | "CHEEKS" | "FOREHEAD"
  | "EYES" | "EYEBROWS" | "NOSE" | "MOUTH" | "LIPS" | "EARS"
  | "SKIN_APPEARANCE" | "HAIRLINE" | "HAIR" | "FACIAL_HAIR"
  | "HEAD_SCALE" | "FACE_POSITION" | "TEXTURE" | "LIGHTING"
  | "LANDMARK" | "SEGMENTATION" | "OTHER";

export function computeShapeCorrectionDelta(
  initial: FaceIdentityShapeCoefficients,
  approved: FaceIdentityShapeCoefficients,
): Partial<Record<keyof FaceIdentityShapeCoefficients, number>> {
  const delta: Partial<Record<keyof FaceIdentityShapeCoefficients, number>> = {};
  for (const key of Object.keys(SHAPE_COEFFICIENT_SAFE_BOUNDS) as Array<keyof FaceIdentityShapeCoefficients>) {
    const d = (approved[key] ?? 0) - (initial[key] ?? 0);
    if (Math.abs(d) >= 0.02) delta[key] = Math.round(d * 1000) / 1000;
  }
  return delta;
}

export function shapeDeltaToCorrectionCategories(
  delta: Partial<Record<keyof FaceIdentityShapeCoefficients, number>>,
): FaceCorrectionCategory[] {
  const cats = new Set<FaceCorrectionCategory>();
  for (const key of Object.keys(delta) as Array<keyof FaceIdentityShapeCoefficients>) {
    if (/jaw|chin/i.test(String(key))) cats.add("JAW");
    else if (/cheek/i.test(String(key))) cats.add("CHEEKS");
    else if (/forehead|faceLength|faceWidth/i.test(String(key))) cats.add("FACE_SHAPE");
    else if (/eye/i.test(String(key))) cats.add("EYES");
    else if (/brow/i.test(String(key))) cats.add("EYEBROWS");
    else if (/nose/i.test(String(key))) cats.add("NOSE");
    else if (/Lip|lip/i.test(String(key))) cats.add("LIPS");
    else if (/mouth/i.test(String(key))) cats.add("MOUTH");
    else if (/ear/i.test(String(key))) cats.add("EARS");
    else cats.add("OTHER");
  }
  return [...cats];
}
