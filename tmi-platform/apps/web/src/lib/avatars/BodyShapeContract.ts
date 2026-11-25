/**
 * BodyShapeContract — Mini-Me full-body 3D caricature, leg-based height and secondary motion
 * (owner directives 2026-11-19). Reuses AvatarRig/1.0 (no new skeleton) and the body targets that
 * ALREADY exist on bobblehead_living_skin_v3 (audited names below). Targets marked `pending` are in the
 * Anti-Gravity order (A3); until delivered their weight is reported as unrenderable, never faked.
 *
 * Layers: BODY morphs here · FACE fullness on face_* targets · IDENTITY geometry on id_* targets
 * (FaceIdentityGeometryContract) — a body/face-fullness change can never write an identity target.
 */

import type { LocomotionState } from "@/lib/world/MovementAuthority";

/** Body/face-fullness targets present on living_skin_v3 today (from the real GLB, 2026-11-19). */
export const EXISTING_BODY_TARGETS = new Set([
  "body_belly_fullness", "body_chest_fullness", "body_waist_width", "body_waist_taper", "body_hip_width", "body_shoulder_width",
  "body_frame_width", "body_arm_thickness", "body_thigh_thickness", "body_calf_thickness", "body_glute_fullness", "body_neck_proportions",
  "body_muscularity", "body_mass_extremely_slim", "body_mass_super_heavy",
]);

export type BodyControl =
  | "bellyFullness" | "bellyProjection" | "lowerBelly" | "waistWidth" | "waistSideFullness"
  | "chestFullness" | "torsoDepth" | "shoulderWidth" | "shoulderSlope" | "upperArmThickness" | "forearmThickness"
  | "neckFullness" | "cheekVolume" | "chinVolume" | "hipWidth" | "buttockVolume" | "thighThickness" | "calfThickness"
  | "muscularity" | "overallFullness";

/** control → morph target (+ whether it is a FACE fullness target). overallFullness is signed (slim ↔ heavy). */
export const BODY_CONTROL_TARGETS: Readonly<Record<BodyControl, { target: string; face?: true }>> = {
  bellyFullness: { target: "body_belly_fullness" }, bellyProjection: { target: "body_belly_projection" }, lowerBelly: { target: "body_belly_lower" },
  waistWidth: { target: "body_waist_width" }, waistSideFullness: { target: "body_waist_side_fullness" },
  chestFullness: { target: "body_chest_fullness" }, torsoDepth: { target: "body_torso_depth" },
  shoulderWidth: { target: "body_shoulder_width" }, shoulderSlope: { target: "body_shoulder_slope" },
  upperArmThickness: { target: "body_upperarm_thickness" }, forearmThickness: { target: "body_forearm_thickness" },
  neckFullness: { target: "body_neck_fullness" }, cheekVolume: { target: "face_cheek_volume", face: true }, chinVolume: { target: "face_chin_volume", face: true },
  hipWidth: { target: "body_hip_width" }, buttockVolume: { target: "body_glute_fullness" },
  thighThickness: { target: "body_thigh_thickness" }, calfThickness: { target: "body_calf_thickness" },
  muscularity: { target: "body_muscularity" }, overallFullness: { target: "body_mass_super_heavy" },
};

export type BodyShape = Partial<Record<BodyControl, number>> & { legHeight?: number; motionStyle?: SecondaryMotionPreset };

/** Validate a saved body shape: known controls only, each −1…1 (most are 0…1), no identity keys. */
export function validateBodyShape(raw: unknown): { ok: true; shape: BodyShape } | { ok: false; reason: string } {
  if (raw === undefined) return { ok: true, shape: {} };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: "BODY_NOT_OBJECT" };
  const out: BodyShape = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (k === "legHeight") { if (typeof v !== "number" || !Number.isFinite(v) || v < -1 || v > 1) return { ok: false, reason: "INVALID_LEG_HEIGHT" }; out.legHeight = v; continue; }
    if (k === "motionStyle") { if (!["NATURAL", "PLAYFUL", "EXTRA_BOUNCE", "NONE"].includes(String(v))) return { ok: false, reason: "INVALID_MOTION_STYLE" }; out.motionStyle = v as SecondaryMotionPreset; continue; }
    if (!(k in BODY_CONTROL_TARGETS)) return { ok: false, reason: `UNKNOWN_CONTROL:${k}` };
    const lo = k === "overallFullness" ? -1 : 0;
    if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > 1) return { ok: false, reason: `OUT_OF_RANGE:${k}` };
    out[k as BodyControl] = v;
  }
  return { ok: true, shape: out };
}

/**
 * Morph weights for the body + face-fullness layers. Mass is distributable (every region independent);
 * overallFullness < 0 drives the slim target. Weights for targets the current model does not have are
 * returned in `pendingTargets` (Anti-Gravity A3), never silently remapped onto another region.
 */
export function bodyMorphWeights(shape: BodyShape, available: ReadonlySet<string> = EXISTING_BODY_TARGETS): { weights: Record<string, number>; pendingTargets: string[] } {
  const weights: Record<string, number> = {};
  const pending: string[] = [];
  for (const [k, v] of Object.entries(shape) as Array<[string, unknown]>) {
    if (!(k in BODY_CONTROL_TARGETS) || typeof v !== "number" || v === 0) continue;
    let target = BODY_CONTROL_TARGETS[k as BodyControl].target;
    let w = v;
    if (k === "overallFullness" && v < 0) { target = "body_mass_extremely_slim"; w = -v; }
    if (!available.has(target)) { pending.push(target); continue; }
    weights[target] = w;
  }
  return { weights, pendingTargets: pending };
}

// ─── Height: legs first ──────────────────────────────────────────────────────

/** Canonical leg measurements of the base rig (metres); replaced by AG's certified values on delivery. */
export type LegRig = { thighM: number; shinM: number; ankleM: number };
export const MAX_LEG_CHANGE = 0.12; // ±12 % of leg length

export type HeightResult = {
  thighScale: number; shinScale: number; pelvisDeltaM: number; eyeHeightDeltaM: number; capsuleHeightDeltaM: number;
  strideScale: number; headScale: 1; torsoScale: 1;
};

/** Height changes ONLY thigh + shin bone length; pelvis, eyes and capsule move by the same delta; head/torso never scale. */
export function legHeight(legHeightControl: number, rig: LegRig): HeightResult {
  const k = 1 + Math.max(-1, Math.min(1, legHeightControl)) * MAX_LEG_CHANGE;
  const delta = (rig.thighM + rig.shinM) * (k - 1);
  return { thighScale: k, shinScale: k, pelvisDeltaM: delta, eyeHeightDeltaM: delta, capsuleHeightDeltaM: delta, strideScale: k, headScale: 1, torsoScale: 1 };
}

/** Seated alignment: pelvis goes to the seat's SitAnchor; feet stay on the floor if the shin can reach it. */
export function seatedFit(seatHeightM: number, rig: LegRig, h: HeightResult): { pelvisY: number; feetGrounded: boolean; footForwardM: number } {
  const lowerLeg = rig.shinM * h.shinScale + rig.ankleM;
  const feetGrounded = lowerLeg >= seatHeightM - 1e-6;
  // Longer legs than the seat height → knees come up / feet slide forward; shorter legs → feet dangle (honest).
  const footForwardM = feetGrounded ? Math.sqrt(Math.max(0, lowerLeg ** 2 - seatHeightM ** 2)) : 0;
  return { pelvisY: seatHeightM, feetGrounded, footForwardM };
}

// ─── Secondary motion ────────────────────────────────────────────────────────

export type SecondaryMotionPreset = "NONE" | "NATURAL" | "PLAYFUL" | "EXTRA_BOUNCE";
export type SpringRegion = "belly" | "cheeks" | "upperArms" | "thighs" | "clothing" | "hair" | "headBobble";
export type SpringParams = { stiffness: number; damping: number; amplitude: number };
const BASE: Record<Exclude<SecondaryMotionPreset, "NONE">, SpringParams> = {
  NATURAL: { stiffness: 180, damping: 18, amplitude: 0.35 },
  PLAYFUL: { stiffness: 120, damping: 10, amplitude: 0.7 },
  EXTRA_BOUNCE: { stiffness: 80, damping: 6, amplitude: 1 },
};

/**
 * Spring settings per region. Motion follows the actual morph VOLUME (physics: more mass, more sway),
 * capped; the user picks the style; reduced-motion → none. No sounds or "comedy" triggers are tied to
 * body size here or anywhere — only the user's own style choice changes the character of the motion.
 */
export function secondaryMotion(preset: SecondaryMotionPreset, reducedMotion: boolean, regionVolume: Partial<Record<SpringRegion, number>>): Partial<Record<SpringRegion, SpringParams>> {
  if (reducedMotion || preset === "NONE") return {};
  const b = BASE[preset];
  const out: Partial<Record<SpringRegion, SpringParams>> = {};
  for (const r of ["belly", "cheeks", "upperArms", "thighs", "clothing", "hair", "headBobble"] as SpringRegion[]) {
    const vol = Math.max(0, Math.min(1, regionVolume[r] ?? (r === "hair" || r === "clothing" || r === "headBobble" ? 0.5 : 0)));
    if (vol === 0) continue;
    out[r] = { stiffness: b.stiffness, damping: b.damping, amplitude: Math.min(1, b.amplitude * (0.3 + 0.7 * vol)) };
  }
  return out;
}

// ─── Live change timing (never teleport, respawn or remount) ─────────────────

const UNSAFE: ReadonlySet<LocomotionState> = new Set(["SIT_DOWN", "STAND_UP", "JUMP", "LAND", "MAKE_ROOM"]);
export const REBIND_STEPS = ["skeleton_bone_lengths", "collision_capsule", "foot_ik", "seat_alignment", "camera_eye_height", "clothing_fit"] as const;

/** When an equipped body change applies: now (with rebind), or at the next safe animation boundary. */
export function bodyChangeTiming(state: LocomotionState): { apply: "NOW" | "NEXT_SAFE_BOUNDARY"; rebind: readonly string[]; respawn: false; remountRoom: false } {
  return { apply: UNSAFE.has(state) ? "NEXT_SAFE_BOUNDARY" : "NOW", rebind: REBIND_STEPS, respawn: false, remountRoom: false };
}
