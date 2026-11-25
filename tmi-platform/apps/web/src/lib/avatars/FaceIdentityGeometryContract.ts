/**
 * FaceIdentityGeometryContract — identity-preserving Mini-Me heads (owner directive 2026-11-19:
 * "two different people must not look like the same bobblehead with different skin colors and hairstyles").
 *
 * Audit (2026-11-19, real GLBs + code):
 *  - bobblehead_living_skin_v3 (male/female): head mesh is literally `Sphere`; it carries only 7 small
 *    identity targets (id_jaw_width … id_brow_shape, 1–4 cm deltas). No skull / face-length / forehead /
 *    cheekbone / ear / silhouette targets. bobblehead_v0, urban_cap_v1, BH-head-v2: ARKit-52 only.
 *  - Runtime: AvatarIdentityDeformationRuntime.shapeToIdentityMorphWeights expresses identity through
 *    ARKit EXPRESSION shapes (eyeWide, noseSneer, cheekPuff, jawForward…) — identity becomes a frozen
 *    expression, and faceWidth/faceLength/jawShape/foreheadHeight/ears change nothing. That breaks
 *    AvatarFaceIdentityContract law 2 and is why every head reads as the same round head.
 *  - LivingSkinMaterialPackage.SHAPE_COEFF_TO_IDENTITY_MORPH maps 7 coefficients to the id_ targets,
 *    but nothing applies it.
 *
 * This contract (reusing FaceIdentityShapeCoefficients — no second identity model):
 *   LAYER 1 IDENTITY GEOMETRY   id_* morph targets ONLY (never ARKit names), signed weights −1…1
 *   LAYER 2 STYLIZATION         caricature = exaggerate the person's OWN deviation from neutral;
 *                               head-to-body scale is uniform on that head (never a sphere template)
 *   LAYER 3 EXPRESSION/SPEECH   ARKit-52 only, added on top (AvatarFacialComposition)
 *   APPEARANCE / HAIR           separate (skin maps, certified hair/facial-hair assets)
 */

import type { FaceIdentityShapeCoefficients, FeatureConfidenceScores } from "@/lib/avatar/AvatarFaceIdentityContract";

/** Canonical identity target set v2. The first 7 already exist on living_skin_v3 (kept, never renamed). */
export const IDENTITY_TARGETS_V2 = [
  "id_jaw_width", "id_eye_spacing", "id_nose_width_shape", "id_cheek_fullness", "id_lip_fullness", "id_chin_shape", "id_brow_shape",
  // Silhouette / skull — what makes heads NOT all the same sphere.
  "id_skull_width", "id_skull_height", "id_skull_depth", "id_face_length", "id_forehead_height", "id_forehead_slope",
  "id_cheekbone_height", "id_cheekbone_width", "id_jaw_angle", "id_jaw_length", "id_chin_width", "id_chin_length", "id_chin_projection",
  // Features.
  "id_brow_ridge", "id_eye_height", "id_eye_size", "id_eye_tilt", "id_eye_depth", "id_eyelid_shape",
  "id_nose_length", "id_nose_bridge", "id_nose_projection", "id_nose_tip", "id_nostril_width",
  "id_mouth_width", "id_mouth_height", "id_upper_lip_shape", "id_lower_lip_shape",
  "id_ear_size", "id_ear_projection", "id_ear_position", "id_facial_fullness",
  // Natural asymmetry (signed: + = left side larger/higher).
  "id_asym_eye_height", "id_asym_brow", "id_asym_jaw", "id_asym_mouth_corner",
] as const;
export type IdentityTarget = (typeof IDENTITY_TARGETS_V2)[number];

/** Targets that define the head SILHOUETTE; certification requires real deltas on all of them. */
export const SILHOUETTE_TARGETS: readonly IdentityTarget[] = ["id_skull_width", "id_skull_height", "id_skull_depth", "id_face_length", "id_forehead_height", "id_jaw_width", "id_jaw_angle", "id_chin_shape", "id_cheekbone_width"];

type Coef = keyof FaceIdentityShapeCoefficients;
type Region = keyof FeatureConfidenceScores;

/** coefficient → (target, region). Every coefficient drives geometry; none drives an expression. */
const MAP: ReadonlyArray<[Coef, IdentityTarget, Region]> = [
  ["faceWidth", "id_skull_width", "overall"], ["faceLength", "id_face_length", "overall"], ["foreheadHeight", "id_forehead_height", "overall"],
  ["jawWidth", "id_jaw_width", "jaw"], ["jawShape", "id_jaw_angle", "jaw"], ["chinWidth", "id_chin_width", "jaw"], ["chinProjection", "id_chin_projection", "jaw"],
  ["chinLength", "id_chin_length", "jaw"], ["cheekWidth", "id_cheekbone_width", "jaw"], ["cheekProjection", "id_cheekbone_height", "jaw"],
  ["cheekFullness", "id_cheek_fullness", "jaw"], ["facialFullness", "id_facial_fullness", "overall"],
  ["eyeSpacing", "id_eye_spacing", "eyes"], ["eyeScale", "id_eye_size", "eyes"], ["eyeHeight", "id_eye_height", "eyes"], ["eyeTilt", "id_eye_tilt", "eyes"],
  ["eyeDepth", "id_eye_depth", "eyes"], ["eyelidOpenness", "id_eyelid_shape", "eyes"], ["browPosition", "id_brow_shape", "eyes"],
  ["noseWidth", "id_nose_width_shape", "nose"], ["noseLength", "id_nose_length", "nose"], ["noseProjection", "id_nose_projection", "nose"],
  ["noseBridgeWidth", "id_nose_bridge", "nose"], ["noseTipSize", "id_nose_tip", "nose"], ["nostrilWidth", "id_nostril_width", "nose"],
  ["mouthWidth", "id_mouth_width", "mouth"], ["mouthHeight", "id_mouth_height", "mouth"], ["upperLipShape", "id_upper_lip_shape", "mouth"],
  ["lowerLipShape", "id_lower_lip_shape", "mouth"], ["earSize", "id_ear_size", "overall"], ["earProjection", "id_ear_projection", "overall"], ["earPosition", "id_ear_position", "overall"],
];

export type IdentityWeights = Partial<Record<IdentityTarget, number>>;
const clamp1 = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * Identity geometry weights. Uncertain regions shrink toward NEUTRAL (0) — never toward an expression.
 * Lip fullness averages upper/lower (single existing target); asymmetry comes from explicit inputs.
 */
export function identityTargetWeights(shape: Partial<FaceIdentityShapeCoefficients>, confidence?: FeatureConfidenceScores | null, asymmetry: Partial<Record<"eyeHeight" | "brow" | "jaw" | "mouthCorner", number>> = {}): IdentityWeights {
  const conf = (r: Region) => (confidence ? Math.max(0, Math.min(1, confidence[r])) : 1);
  const w: IdentityWeights = {};
  for (const [coef, target, region] of MAP) {
    const v = shape[coef];
    if (typeof v === "number" && Number.isFinite(v) && v !== 0) w[target] = clamp1(v * conf(region));
  }
  const lips = [shape.upperLipFullness, shape.lowerLipFullness].filter((x): x is number => typeof x === "number");
  if (lips.length) w.id_lip_fullness = clamp1((lips.reduce((s, x) => s + x, 0) / lips.length) * conf("mouth"));
  const a: Array<[keyof typeof asymmetry, IdentityTarget]> = [["eyeHeight", "id_asym_eye_height"], ["brow", "id_asym_brow"], ["jaw", "id_asym_jaw"], ["mouthCorner", "id_asym_mouth_corner"]];
  for (const [k, t] of a) if (asymmetry[k]) w[t] = clamp1(asymmetry[k]! * conf("overall"));
  return w;
}

// ─── Stylization (caricature) ────────────────────────────────────────────────

/** OWNER DECISION 2026-11-19: default 1.85× enlargement of the person's OWN head; adjustable 1.0–2.5×. */
export const HEAD_TO_BODY_SCALE_RANGE: readonly [number, number] = [1.0, 2.5];
export const DEFAULT_HEAD_TO_BODY_SCALE = 1.85;
export const CARICATURE_GAIN = 0.6;

export type Stylization = { caricature: number; headToBodyScale: number };

/**
 * Caricature exaggerates the person's OWN deviations (a long face gets longer, a square jaw squarer).
 * It can never move a feature toward a shared template, so it can only increase how different two
 * people look. Head scale is uniform on the identity head — the silhouette survives enlargement.
 */
export function stylize(identity: IdentityWeights, s: Stylization): { weights: IdentityWeights; headScale: number } {
  const k = 1 + Math.max(0, Math.min(1, s.caricature)) * CARICATURE_GAIN;
  const weights: IdentityWeights = {};
  for (const [t, v] of Object.entries(identity) as Array<[IdentityTarget, number]>) weights[t] = clamp1(v * k);
  const headScale = Math.max(HEAD_TO_BODY_SCALE_RANGE[0], Math.min(HEAD_TO_BODY_SCALE_RANGE[1], s.headToBodyScale));
  return { weights, headScale };
}

/** Layer separation: identity weights may only name id_* targets; expressions may never name them. */
export function assertLayerSeparation(identity: Record<string, number>, expression: Record<string, number>): { ok: boolean; violations: string[] } {
  const ids = new Set<string>(IDENTITY_TARGETS_V2);
  const violations = [
    ...Object.keys(identity).filter((k) => !ids.has(k)).map((k) => `identity uses non-identity target ${k}`),
    ...Object.keys(expression).filter((k) => k.startsWith("id_")).map((k) => `expression writes identity target ${k}`),
  ];
  return { ok: violations.length === 0, violations };
}

// ─── Distinctness (the owner's acceptance standard) ──────────────────────────

/** Geometric distance between two people's heads. Skin, hair and outfits are deliberately excluded. */
export function headGeometryDistance(a: IdentityWeights, b: IdentityWeights): number {
  let s = 0;
  for (const t of IDENTITY_TARGETS_V2) s += ((a[t] ?? 0) - (b[t] ?? 0)) ** 2;
  return Math.sqrt(s);
}
/** Below this, two avatars are "the same head" no matter how different their skin/hair are. */
export const SAME_HEAD_THRESHOLD = 0.35;
export const silhouetteDistance = (a: IdentityWeights, b: IdentityWeights) => Math.sqrt(SILHOUETTE_TARGETS.reduce((s, t) => s + ((a[t] ?? 0) - (b[t] ?? 0)) ** 2, 0));

// ─── Scan consent, retention, manual path ────────────────────────────────────

export type FaceScanConsent = { consented: boolean; consentedAtMs: number | null; consentVersion: string | null };
export type StoredFaceIdentity = {
  /** Only derived, non-image data is kept long term. */
  coefficients: Partial<FaceIdentityShapeCoefficients>;
  manualOverrides: Partial<FaceIdentityShapeCoefficients>;
  source: "MANUAL_CREATION" | "GUIDED_SCAN" | "PHOTO_FALLBACK" | "STOCK_PRESET";
  /** Raw capture images: processing only, deleted after this window. */
  rawImagesDeleteAfterMs: number;
};
export const RAW_CAPTURE_MAX_RETENTION_MS = 24 * 60 * 60 * 1000;

/** Scanning needs explicit consent; manual creation never does. Manual corrections always win over the scan. */
export function resolveIdentityInput(input: { consent: FaceScanConsent; scanned: Partial<FaceIdentityShapeCoefficients> | null; manual: Partial<FaceIdentityShapeCoefficients> }):
  { ok: true; coefficients: Partial<FaceIdentityShapeCoefficients>; source: StoredFaceIdentity["source"] } | { ok: false; reason: "SCAN_WITHOUT_CONSENT" } {
  if (input.scanned && !input.consent.consented) return { ok: false, reason: "SCAN_WITHOUT_CONSENT" };
  return { ok: true, coefficients: { ...(input.scanned ?? {}), ...input.manual }, source: input.scanned ? "GUIDED_SCAN" : "MANUAL_CREATION" };
}

/** Deleting face data removes the scan-derived coefficients (manual edits optional) — the avatar falls back to manual/neutral, never errors. */
export function deleteFaceData(stored: StoredFaceIdentity, keepManual: boolean): StoredFaceIdentity {
  return { coefficients: {}, manualOverrides: keepManual ? stored.manualOverrides : {}, source: "MANUAL_CREATION", rawImagesDeleteAfterMs: 0 };
}
