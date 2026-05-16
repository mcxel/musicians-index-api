/**
 * PoseVariationRuntime
 * Manages runtime pose variations for avatars and performers.
 * Generates pose sequences, idle loops, and performance-state blends.
 */

export type PoseCategory = "idle" | "performance" | "reaction" | "social" | "victory" | "defeat" | "gesture" | "transition";
export type EmotionalState = "neutral" | "excited" | "confident" | "nervous" | "triumphant" | "tired" | "playful" | "intense";

export interface PoseVariation {
  poseId: string;
  category: PoseCategory;
  emotionalState: EmotionalState;
  label: string;
  durationMs: number;
  transitionMs: number;        // blend time to this pose
  weight: number;              // selection weight 0-1
  joints: Record<string, number[]>;  // joint name → [x, y, z, rotation]
  mirrorable: boolean;
  requiresMotionRig: boolean;
}

export interface PoseRuntimeState {
  entityId: string;
  currentPose: PoseVariation | null;
  previousPose: PoseVariation | null;
  blendProgress: number;        // 0-1
  emotionalState: EmotionalState;
  poseHistory: string[];        // last 20 poseIds
  idleVariationIndex: number;
  lastTransitionAt: number | null;
}

const IDLE_POSES: PoseVariation[] = [
  { poseId: "idle_stand_01", category: "idle", emotionalState: "neutral",    label: "Standing relaxed",  durationMs: 4000, transitionMs: 600,  weight: 1.0, joints: {}, mirrorable: true,  requiresMotionRig: false },
  { poseId: "idle_sway_01",  category: "idle", emotionalState: "neutral",    label: "Gentle sway",       durationMs: 6000, transitionMs: 800,  weight: 0.6, joints: {}, mirrorable: true,  requiresMotionRig: true  },
  { poseId: "idle_look_01",  category: "idle", emotionalState: "playful",    label: "Looking around",    durationMs: 3000, transitionMs: 400,  weight: 0.4, joints: {}, mirrorable: false, requiresMotionRig: false },
];

const PERFORMANCE_POSES: PoseVariation[] = [
  { poseId: "perf_mic_01",   category: "performance", emotionalState: "confident", label: "Mic drop stance", durationMs: 0, transitionMs: 400, weight: 1.0, joints: {}, mirrorable: false, requiresMotionRig: true  },
  { poseId: "perf_hype_01",  category: "performance", emotionalState: "excited",   label: "Hype jump",       durationMs: 1200, transitionMs: 200, weight: 0.7, joints: {}, mirrorable: true, requiresMotionRig: true  },
  { poseId: "perf_flow_01",  category: "performance", emotionalState: "intense",   label: "Flow state",      durationMs: 0, transitionMs: 600, weight: 0.8, joints: {}, mirrorable: false, requiresMotionRig: true  },
];

const ALL_POSES = [...IDLE_POSES, ...PERFORMANCE_POSES];

const poseStates = new Map<string, PoseRuntimeState>();
type PoseListener = (state: PoseRuntimeState) => void;
const poseListeners = new Map<string, Set<PoseListener>>();

function selectIdlePose(index: number): PoseVariation {
  return IDLE_POSES[index % IDLE_POSES.length];
}

function selectByState(emotional: EmotionalState, category: PoseCategory): PoseVariation {
  const matches = ALL_POSES.filter(p => p.category === category && p.emotionalState === emotional);
  if (matches.length === 0) return ALL_POSES[0];
  const total = matches.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * total;
  for (const p of matches) { rand -= p.weight; if (rand <= 0) return p; }
  return matches[0];
}

function notify(entityId: string, state: PoseRuntimeState): void {
  poseListeners.get(entityId)?.forEach(l => l(state));
}

export function initPoseRuntime(entityId: string, emotional: EmotionalState = "neutral"): PoseRuntimeState {
  const state: PoseRuntimeState = {
    entityId, currentPose: selectIdlePose(0), previousPose: null,
    blendProgress: 1, emotionalState: emotional,
    poseHistory: [], idleVariationIndex: 0, lastTransitionAt: null,
  };
  poseStates.set(entityId, state);
  return state;
}

export function transitionToPose(entityId: string, poseId: string): PoseRuntimeState {
  const current = poseStates.get(entityId) ?? initPoseRuntime(entityId);
  const pose = ALL_POSES.find(p => p.poseId === poseId);
  if (!pose) return current;

  const updated: PoseRuntimeState = {
    ...current,
    previousPose: current.currentPose,
    currentPose: pose,
    blendProgress: 0,
    poseHistory: [poseId, ...current.poseHistory].slice(0, 20),
    lastTransitionAt: Date.now(),
  };
  poseStates.set(entityId, updated);
  notify(entityId, updated);
  return updated;
}

export function setEmotionalState(entityId: string, emotional: EmotionalState, category: PoseCategory = "idle"): PoseRuntimeState {
  const current = poseStates.get(entityId) ?? initPoseRuntime(entityId);
  const pose = selectByState(emotional, category);
  const updated: PoseRuntimeState = { ...current, emotionalState: emotional, previousPose: current.currentPose, currentPose: pose, blendProgress: 0, lastTransitionAt: Date.now() };
  poseStates.set(entityId, updated);
  notify(entityId, updated);
  return updated;
}

export function tickBlend(entityId: string, elapsedMs: number): PoseRuntimeState {
  const current = poseStates.get(entityId) ?? initPoseRuntime(entityId);
  const blendSpeed = current.currentPose ? 1000 / current.currentPose.transitionMs : 1;
  const progress = Math.min(1, current.blendProgress + (elapsedMs / 1000) * blendSpeed);
  const updated = { ...current, blendProgress: progress };
  poseStates.set(entityId, updated);
  return updated;
}

export function cycleIdlePose(entityId: string): PoseRuntimeState {
  const current = poseStates.get(entityId) ?? initPoseRuntime(entityId);
  const nextIdx = (current.idleVariationIndex + 1) % IDLE_POSES.length;
  const pose = selectIdlePose(nextIdx);
  const updated: PoseRuntimeState = { ...current, idleVariationIndex: nextIdx, previousPose: current.currentPose, currentPose: pose, blendProgress: 0, lastTransitionAt: Date.now() };
  poseStates.set(entityId, updated);
  notify(entityId, updated);
  return updated;
}

export function getPoseRuntime(entityId: string): PoseRuntimeState | null {
  return poseStates.get(entityId) ?? null;
}

export function subscribeToPoseRuntime(entityId: string, listener: PoseListener): () => void {
  if (!poseListeners.has(entityId)) poseListeners.set(entityId, new Set());
  poseListeners.get(entityId)!.add(listener);
  const current = poseStates.get(entityId);
  if (current) listener(current);
  return () => poseListeners.get(entityId)?.delete(listener);
}

export function getAvailablePoses(category?: PoseCategory): PoseVariation[] {
  return category ? ALL_POSES.filter(p => p.category === category) : ALL_POSES;
}
