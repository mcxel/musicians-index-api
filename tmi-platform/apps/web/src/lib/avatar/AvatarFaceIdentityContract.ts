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
  faceWidth: number;       // Clamped [-1.0, 1.0]
  faceLength: number;      // Clamped [-1.0, 1.0]
  jawWidth: number;        // Clamped [-1.0, 1.0]
  jawShape: number;        // Clamped [-1.0, 1.0]
  chinWidth: number;       // Clamped [-1.0, 1.0]
  chinProjection: number;  // Clamped [-1.0, 1.0]
  cheekWidth: number;      // Clamped [-1.0, 1.0]
  cheekProjection: number; // Clamped [-1.0, 1.0]
  foreheadHeight: number;  // Clamped [-1.0, 1.0]
  eyeSpacing: number;      // Clamped [-1.0, 1.0]
  eyeScale: number;        // Clamped [-1.0, 1.0]
  browPosition: number;    // Clamped [-1.0, 1.0]
  noseWidth: number;       // Clamped [-1.0, 1.0]
  noseLength: number;      // Clamped [-1.0, 1.0]
  noseProjection: number;  // Clamped [-1.0, 1.0]
  mouthWidth: number;      // Clamped [-1.0, 1.0]
  upperLipShape: number;   // Clamped [-1.0, 1.0]
  lowerLipShape: number;   // Clamped [-1.0, 1.0]
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

export type FaceCaptureSource = "GUIDED_SCAN" | "PHOTO_FALLBACK";

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
  browPosition: [-0.50, 0.50],
  noseWidth: [-0.60, 0.60],
  noseLength: [-0.55, 0.55],
  noseProjection: [-0.50, 0.50],
  mouthWidth: [-0.65, 0.65],
  upperLipShape: [-0.55, 0.55],
  lowerLipShape: [-0.55, 0.55],
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
