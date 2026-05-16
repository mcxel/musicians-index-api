import { platformLearningCore } from '@/lib/learning/PlatformLearningCore';
import { avatarBehaviorEngine as learningAvatarBehaviorEngine } from '@/lib/learning/AvatarBehaviorEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

export type AvatarBehaviorMode = "idle" | "follow" | "battle" | "stage" | "room" | "venue";

export type AvatarBehaviorState = {
  avatarId: string;
  mode: AvatarBehaviorMode;
  adaptiveScore: number;
  context?: Record<string, unknown>;
  updatedAt: number;
};

const behaviorMap = new Map<string, AvatarBehaviorState>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

export function startAvatarBehaviorEngine(avatarId: string): AvatarBehaviorState {
  const k = key(avatarId);
  const state =
    behaviorMap.get(k) ?? {
      avatarId: k,
      mode: "idle",
      adaptiveScore: 0,
      updatedAt: Date.now(),
    };
  behaviorMap.set(k, state);
  return { ...state };
}

export function updateAvatarBehavior(
  avatarId: string,
  mode: AvatarBehaviorMode,
  context?: Record<string, unknown>
): AvatarBehaviorState {
  const k = key(avatarId);
  const prev = startAvatarBehaviorEngine(k);
  const baseDelta = mode === prev.mode ? 1 : 5;
  const learnedSignal = learningAvatarBehaviorEngine
    .getAvatarSignals(50)
    .find((signal) => signal.avatarId === k);
  const requestedDelta = baseDelta + Math.round((learnedSignal?.engagementScore ?? 0) / 20);
  const mutation = applySafeLearningMutation({
    engine: 'AvatarBehaviorEngine',
    targetId: k,
    metric: 'adaptive-score-delta',
    beforeValue: baseDelta,
    requestedValue: requestedDelta,
    minValue: 1,
    maxValue: 12,
    confidence: learnedSignal ? 0.74 : 0.55,
    reason: 'avatar behavior adaptation from interaction history',
  });

  platformLearningCore.ingestEvent({
    type: 'avatar_action',
    userId: k,
    route: typeof context?.route === 'string' ? context.route : undefined,
    targetId: mode,
    context: {
      adaptiveScoreDelta: mutation.appliedValue,
      learningApplied: mutation.status === 'applied',
      mode,
    },
  });

  const next: AvatarBehaviorState = {
    avatarId: k,
    mode,
    context,
    adaptiveScore: prev.adaptiveScore + mutation.appliedValue,
    updatedAt: Date.now(),
  };
  behaviorMap.set(k, next);
  return next;
}

export function saveAvatarBehavior(avatarId: string): AvatarBehaviorState {
  return startAvatarBehaviorEngine(avatarId);
}

export function recoverAvatarBehavior(avatarId: string): AvatarBehaviorState {
  return startAvatarBehaviorEngine(avatarId);
}

export function repeatAvatarBehavior(avatarId: string): AvatarBehaviorState {
  const state = startAvatarBehaviorEngine(avatarId);
  return updateAvatarBehavior(avatarId, state.mode, state.context);
}

export function returnAvatarBehavior(avatarId: string): AvatarBehaviorState {
  return startAvatarBehaviorEngine(avatarId);
}

export function listAvatarBehaviorStates(): AvatarBehaviorState[] {
  return [...behaviorMap.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
