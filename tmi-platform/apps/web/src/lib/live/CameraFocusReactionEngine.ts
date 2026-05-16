import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import { getRoomPopulation } from "@/lib/rooms/RoomPopulationEngine";
import { getCrowdMomentum } from "@/lib/live/crowdMomentumEngine";
import type { CrowdIntentType } from "@/lib/rooms/CrowdIntentEngine";
import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { visualEvolutionEngine } from '@/lib/learning/VisualEvolutionEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CameraFocusMode =
  | "wide"        // full crowd/stage view
  | "performer"   // locked on active performer
  | "crowd"       // reaction sweep across audience
  | "host"        // host close-up
  | "battle"      // two-shot battle framing
  | "celebration" // confetti / winner moment
  | "spotlight";  // single performer isolation

export type CameraFocusPlan = {
  roomId: ChatRoomId;
  mode: CameraFocusMode;
  targetUserId?: string;
  intensityScore: number;   // 0–100, drives zoom/blur/shake
  durationMs: number;       // how long to hold this cut
  triggerIntent?: CrowdIntentType;
  shotDirective?: "zoom-performer" | "center-frame" | "pan-tip-target" | "wide-sweep" | "side-rail-glance";
  timestampMs: number;
};

export type CameraFocusState = {
  current: CameraFocusPlan;
  queue: CameraFocusPlan[];
  lastReactionMs: number;
};

// ─── Intent → Camera mode map ─────────────────────────────────────────────────

const INTENT_CAMERA_MODE: Partial<Record<CrowdIntentType, CameraFocusMode>> = {
  hype:        "crowd",
  react:       "crowd",
  encore:      "performer",
  challenge:   "battle",
  vote:        "wide",
  tip:         "spotlight",
  request:     "performer",
  boo:         "wide",
  question: "host",
};

// ─── Duration heuristics ──────────────────────────────────────────────────────

const MODE_DURATION_MS: Record<CameraFocusMode, number> = {
  wide:        8_000,
  performer:   6_000,
  crowd:       4_000,
  host:        5_000,
  battle:      10_000,
  celebration: 8_000,
  spotlight:   6_000,
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new Map<ChatRoomId, CameraFocusState>();

function defaultPlan(roomId: ChatRoomId, now: number): CameraFocusPlan {
  return {
    roomId,
    mode: "wide",
    intensityScore: 20,
    durationMs: MODE_DURATION_MS.wide,
    timestampMs: now,
  };
}

function getOrInit(roomId: ChatRoomId): CameraFocusState {
  if (!registry.has(roomId)) {
    const now = Date.now();
    registry.set(roomId, {
      current: defaultPlan(roomId, now),
      queue: [],
      lastReactionMs: now,
    });
  }
  return registry.get(roomId)!;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the recommended camera focus plan for a room based on current
 * population snapshot + crowd momentum. Pure computation, no side effects.
 */
export function computeCameraFocus(roomId: ChatRoomId, now: number): CameraFocusPlan {
  const pop = getRoomPopulation(roomId);
  const momentum = getCrowdMomentum(roomId);

  let mode: CameraFocusMode = "wide";
  let intensity = 20;

  const heat = pop.heatLevel;
  const hype = momentum?.current ?? heat;
  const lobbySignal = lobbyBehaviorEngine.getLobbySignals(30).find((item) => item.lobbyId === roomId);
  const visualSignal = visualEvolutionEngine.analyzeVisualVariants(30)[0];

  if (heat >= 85 || hype >= 85) {
    mode = "celebration";
    intensity = 90;
  } else if (heat >= 65) {
    mode = "performer";
    intensity = Math.round(heat * 0.9);
  } else if (heat >= 40) {
    mode = "crowd";
    intensity = Math.round(heat * 0.75);
  } else if (pop.performerCount > 1) {
    mode = "battle";
    intensity = 50;
  } else {
    mode = "wide";
    intensity = Math.max(15, Math.round(heat * 0.4));
  }

  const durationMutation = applySafeLearningMutation({
    engine: 'CameraFocusReactionEngine',
    targetId: roomId,
    metric: 'camera-cut-duration-ms',
    beforeValue: MODE_DURATION_MS[mode],
    requestedValue: MODE_DURATION_MS[mode] + Math.round((lobbySignal?.retentionScore ?? 0) * 8),
    minValue: 1500,
    maxValue: 14000,
    confidence: lobbySignal ? 0.72 : 0.5,
    reason: 'camera cut pacing adapts from room retention and engagement timing',
  });

  const intensityMutation = applySafeLearningMutation({
    engine: 'CameraFocusReactionEngine',
    targetId: roomId,
    metric: 'camera-intensity-score',
    beforeValue: Math.min(100, intensity),
    requestedValue: Math.min(100, intensity + Math.round((visualSignal?.performanceScore ?? 0) / 6)),
    minValue: 10,
    maxValue: 100,
    confidence: visualSignal ? 0.66 : 0.49,
    reason: 'camera focus intensity adapts using visual performance feedback',
  });

  return {
    roomId,
    mode,
    intensityScore: intensityMutation.appliedValue,
    durationMs: durationMutation.appliedValue,
    timestampMs: now,
  };
}

/**
 * Get the active camera focus plan for a room.
 * Auto-advances the queue if the current plan has expired.
 */
export function getCameraFocusPlan(roomId: ChatRoomId): CameraFocusPlan {
  const state = getOrInit(roomId);
  const now = Date.now();
  const elapsed = now - state.current.timestampMs;

  if (elapsed >= state.current.durationMs && state.queue.length > 0) {
    state.current = state.queue.shift()!;
    state.current.timestampMs = now;
  }

  return { ...state.current };
}

/**
 * Tick the camera engine: recomputes focus from population + momentum and
 * enqueues a new plan if the current one is expiring soon.
 */
export function tickCameraFocus(roomId: ChatRoomId): CameraFocusPlan {
  const state = getOrInit(roomId);
  const now = Date.now();
  const elapsed = now - state.current.timestampMs;
  const remaining = state.current.durationMs - elapsed;

  if (remaining < 1_500 && state.queue.length === 0) {
    const next = computeCameraFocus(roomId, now);
    state.queue.push(next);
  }

  if (elapsed >= state.current.durationMs) {
    state.current = state.queue.shift() ?? computeCameraFocus(roomId, now);
    state.current.timestampMs = now;
  }

  return { ...state.current };
}

/**
 * Immediately override camera focus based on a crowd intent event.
 * Used when a high-strength intent should cut the camera NOW.
 * Only fires a cut if strength exceeds the threshold for an interrupt.
 */
export function triggerCameraReaction(
  roomId: ChatRoomId,
  intent: CrowdIntentType,
  strength: number,
  targetUserId?: string,
): CameraFocusPlan | null {
  if (strength < 40) return null;

  const mode = INTENT_CAMERA_MODE[intent] ?? "crowd";
  const now = Date.now();
  const state = getOrInit(roomId);

  const plan: CameraFocusPlan = {
    roomId,
    mode,
    targetUserId,
    intensityScore: Math.min(100, strength),
    durationMs: Math.round(MODE_DURATION_MS[mode] * (strength / 100)),
    triggerIntent: intent,
    timestampMs: now,
  };

  // High-strength intents (challenge/tip/encore) jump the queue
  if (strength >= 70) {
    state.current = plan;
  } else {
    state.queue.push(plan);
  }

  state.lastReactionMs = now;
  return { ...plan };
}

/**
 * Reset camera to default wide shot (post-show cleanup).
 */
export function resetCameraFocus(roomId: ChatRoomId): void {
  const now = Date.now();
  registry.set(roomId, {
    current: defaultPlan(roomId, now),
    queue: [],
    lastReactionMs: now,
  });
}

/**
 * Extended evaluator for cinematic focus rules while preserving existing camera logic.
 * Rules:
 * - high heat => performer zoom
 * - battle spike => center frame
 * - tip spike => pan to tip target
 * - crowd burst => wide sweep
 * - queue join => side rail glance
 */
export function evaluateCameraFocus(roomId: ChatRoomId): CameraFocusPlan {
  const now = Date.now();
  const base = computeCameraFocus(roomId, now);
  const pop = getRoomPopulation(roomId);
  const momentum = getCrowdMomentum(roomId);
  const hype = momentum?.current ?? pop.heatLevel;

  if (pop.heatLevel >= 90) {
    return {
      ...base,
      mode: "performer",
      shotDirective: "zoom-performer",
      intensityScore: Math.max(base.intensityScore, 92),
      durationMs: Math.max(3_500, Math.round(base.durationMs * 0.75)),
      timestampMs: now,
    };
  }

  if (pop.performerCount > 1 && hype >= 75) {
    return {
      ...base,
      mode: "battle",
      shotDirective: "center-frame",
      intensityScore: Math.max(base.intensityScore, 80),
      durationMs: Math.max(4_000, Math.round(base.durationMs * 0.85)),
      timestampMs: now,
    };
  }

  if (intentHintTipSpike(roomId) || ((momentum.samples[momentum.samples.length - 1]?.reactionRate ?? 0) >= 60)) {
    return {
      ...base,
      mode: "spotlight",
      shotDirective: "pan-tip-target",
      intensityScore: Math.max(base.intensityScore, 70),
      durationMs: Math.max(3_500, Math.round(base.durationMs * 0.8)),
      timestampMs: now,
    };
  }

  if (hype >= 68) {
    return {
      ...base,
      mode: "crowd",
      shotDirective: "wide-sweep",
      intensityScore: Math.max(base.intensityScore, 65),
      durationMs: Math.max(3_200, Math.round(base.durationMs * 0.8)),
      timestampMs: now,
    };
  }

  if (pop.queueDepth >= 12) {
    return {
      ...base,
      mode: "wide",
      shotDirective: "side-rail-glance",
      intensityScore: Math.max(base.intensityScore, 45),
      durationMs: Math.max(2_800, Math.round(base.durationMs * 0.65)),
      timestampMs: now,
    };
  }

  return { ...base, timestampMs: now };
}

function intentHintTipSpike(roomId: ChatRoomId): boolean {
  const state = getOrInit(roomId);
  return state.current.triggerIntent === "tip" || state.queue.some((q) => q.triggerIntent === "tip");
}

/**
 * Force an immediate camera shift from intent or explicit plan.
 */
export function triggerCameraShift(
  roomId: ChatRoomId,
  intent: CrowdIntentType,
  strength: number,
  targetUserId?: string,
): CameraFocusPlan {
  const shifted = triggerCameraReaction(roomId, intent, strength, targetUserId);
  if (shifted) return shifted;

  const fallback = evaluateCameraFocus(roomId);
  const state = getOrInit(roomId);
  state.current = { ...fallback, triggerIntent: intent, timestampMs: Date.now() };
  return { ...state.current };
}

/**
 * Hard lock camera to performer focus for a short deterministic window.
 */
export function lockPerformerFocus(
  roomId: ChatRoomId,
  performerUserId?: string,
  durationMs: number = MODE_DURATION_MS.performer,
): CameraFocusPlan {
  const now = Date.now();
  const state = getOrInit(roomId);
  const plan: CameraFocusPlan = {
    roomId,
    mode: "performer",
    targetUserId: performerUserId,
    intensityScore: 82,
    durationMs: Math.max(2_000, durationMs),
    shotDirective: "zoom-performer",
    timestampMs: now,
  };
  state.current = plan;
  return { ...plan };
}
