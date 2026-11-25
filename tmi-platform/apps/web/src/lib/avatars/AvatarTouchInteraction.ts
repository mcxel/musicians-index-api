/**
 * AvatarTouchInteraction — direct 3D mesh poke law (NO poke button).
 *
 * Short tap/click on the avatar mesh → zone hit → personality reaction.
 * Drag → camera orbit (caller must isolate gestures). Pinch → zoom.
 *
 * COMMIT=OFF · SAFE_TO_PUSH=NO
 */

import * as THREE from "three";

export type AvatarBodyZone =
  | "belly"
  | "cheek"
  | "nose"
  | "forehead"
  | "shoulder"
  | "arm"
  | "hand"
  | "leg"
  | "foot"
  | "head"
  | "torso"
  | "generic";

export type TouchEscalationTier =
  | "TICKLED"
  | "PLAYFUL"
  | "DODGING"
  | "FRUSTRATED";

export type TouchPersonalityMood =
  | "RELAXED"
  | "GIGGLY"
  | "PLAYFUL"
  | "DODGING"
  | "ATTITUDE"
  | "TIRED"
  | "CONFIDENT";

const ZONE_NAME_RULES: Array<{ zone: AvatarBodyZone; re: RegExp }> = [
  { zone: "nose", re: /nose|nostril|snout/i },
  { zone: "cheek", re: /cheek|jaw|face|lip|mouth|brow|eye/i },
  { zone: "forehead", re: /forehead|brow_?ridge|scalp/i },
  { zone: "belly", re: /belly|torso|abdomen|stomach|chest|spine|hip|pelvis|body|bobblehead_base/i },
  { zone: "shoulder", re: /shoulder|clavicle/i },
  { zone: "arm", re: /upperarm|lowerarm|forearm|elbow|arm(?!ature)/i },
  { zone: "hand", re: /hand|wrist|finger|thumb/i },
  { zone: "foot", re: /foot|ankle|toe/i },
  { zone: "leg", re: /thigh|calf|shin|knee|leg/i },
  { zone: "head", re: /head|skull|neck|ear/i },
];

/** Map intersection object + local hit point → canonical body zone. */
export function classifyAvatarBodyZone(
  object: THREE.Object3D,
  pointWorld?: THREE.Vector3,
): AvatarBodyZone {
  const names: string[] = [];
  let cur: THREE.Object3D | null = object;
  while (cur) {
    if (cur.name) names.push(cur.name);
    cur = cur.parent;
  }
  const joined = names.join(" ");
  for (const rule of ZONE_NAME_RULES) {
    if (rule.re.test(joined)) return rule.zone;
  }

  // Height heuristic on bobblehead (local-ish Y from root)
  if (pointWorld) {
    let root = object;
    while (root.parent && root.parent.type !== "Scene") root = root.parent;
    const local = root.worldToLocal(pointWorld.clone());
    const y = local.y;
    if (y > 1.05) return "forehead";
    if (y > 0.88) return "cheek";
    if (y > 0.72) return "nose";
    if (y > 0.35 && y < 0.7) return "belly";
    if (y <= 0.2) return "foot";
    if (y <= 0.35) return "leg";
  }
  return "generic";
}

export function isShortTapGesture(input: {
  downClientX: number;
  downClientY: number;
  upClientX: number;
  upClientY: number;
  downAtMs: number;
  upAtMs: number;
  maxMovePx?: number;
  maxDurationMs?: number;
}): boolean {
  const maxMove = input.maxMovePx ?? 8;
  const maxDur = input.maxDurationMs ?? 420;
  const dist = Math.hypot(
    input.upClientX - input.downClientX,
    input.upClientY - input.downClientY,
  );
  const dt = input.upAtMs - input.downAtMs;
  return dist <= maxMove && dt >= 0 && dt <= maxDur;
}

export interface TouchEscalationState {
  consecutivePokes: number;
  lastPokeAtMs: number;
  lastZone: AvatarBodyZone | null;
  mood: TouchPersonalityMood;
  tier: TouchEscalationTier;
}

export function createTouchEscalationState(): TouchEscalationState {
  return {
    consecutivePokes: 0,
    lastPokeAtMs: 0,
    lastZone: null,
    mood: "RELAXED",
    tier: "TICKLED",
  };
}

const STREAK_WINDOW_MS = 4500;
const RECOVERY_IDLE_MS = 3200;

export function stepTouchEscalation(
  state: TouchEscalationState,
  zone: AvatarBodyZone,
  nowMs = Date.now(),
): TouchEscalationState {
  const gap = nowMs - state.lastPokeAtMs;
  let consecutive = gap > STREAK_WINDOW_MS ? 1 : state.consecutivePokes + 1;
  let tier: TouchEscalationTier = "TICKLED";
  let mood: TouchPersonalityMood = "GIGGLY";
  if (consecutive >= 12) {
    tier = "FRUSTRATED";
    mood = "ATTITUDE";
  } else if (consecutive >= 7) {
    tier = "DODGING";
    mood = "DODGING";
  } else if (consecutive >= 3) {
    tier = "PLAYFUL";
    mood = "PLAYFUL";
  }
  return {
    consecutivePokes: consecutive,
    lastPokeAtMs: nowMs,
    lastZone: zone,
    mood,
    tier,
  };
}

export function recoverTouchEscalation(
  state: TouchEscalationState,
  nowMs = Date.now(),
): TouchEscalationState {
  if (!state.lastPokeAtMs) return state;
  if (nowMs - state.lastPokeAtMs < RECOVERY_IDLE_MS) return state;
  if (state.consecutivePokes === 0 && state.mood === "RELAXED") return state;
  return {
    consecutivePokes: 0,
    lastPokeAtMs: state.lastPokeAtMs,
    lastZone: state.lastZone,
    mood: "RELAXED",
    tier: "TICKLED",
  };
}

/** Soft belly indent — returns scale multiplier over [0,1] life (1→squash→1). */
export function bellySquashScale(life01: number): number {
  const t = Math.max(0, Math.min(1, life01));
  // quick indent then spring back
  if (t < 0.18) return 1 - (t / 0.18) * 0.14;
  const back = (t - 0.18) / 0.82;
  const ease = 1 - Math.pow(1 - back, 3);
  return 0.86 + 0.14 * ease;
}

export function cheekSquashScale(life01: number): number {
  const t = Math.max(0, Math.min(1, life01));
  if (t < 0.2) return 1 - (t / 0.2) * 0.08;
  return 0.92 + 0.08 * ((t - 0.2) / 0.8);
}

export const AVATAR_TOUCH_LAW = {
  pokeButtonAllowed: false,
  requiresMeshRaycast: true,
  shortTapIsPoke: true,
  dragIsCamera: true,
  pinchIsZoom: true,
} as const;
