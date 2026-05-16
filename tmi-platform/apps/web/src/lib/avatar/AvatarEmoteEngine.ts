import { emoteLearningEngine } from '@/lib/learning/EmoteLearningEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';
import { platformLearningCore } from '@/lib/learning/PlatformLearningCore';

export type AvatarReactionState = "neutral" | "happy" | "hyped" | "focused" | "celebrating";

export type AvatarEmoteRecord = {
  emoteId: string;
  avatarId: string;
  emote: string;
  reactionState: AvatarReactionState;
  animationRef: string;
  triggeredAt: number;
};

export type AvatarEmoteState = {
  avatarId: string;
  cooldownUntil: number;
  recent: AvatarEmoteRecord[];
};

const emoteStateMap = new Map<string, AvatarEmoteState>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

function id(): string {
  return `ave_${Math.random().toString(36).slice(2, 10)}`;
}

export function startAvatarEmoteEngine(avatarId: string): AvatarEmoteState {
  const k = key(avatarId);
  const state =
    emoteStateMap.get(k) ?? {
      avatarId: k,
      cooldownUntil: 0,
      recent: [],
    };
  emoteStateMap.set(k, state);
  return { ...state, recent: [...state.recent] };
}

export function updateAvatarEmoteEngine(
  avatarId: string,
  updater: (state: AvatarEmoteState) => AvatarEmoteState
): AvatarEmoteState {
  const current = startAvatarEmoteEngine(avatarId);
  const next = updater({ ...current, recent: [...current.recent] });
  emoteStateMap.set(key(avatarId), next);
  return { ...next, recent: [...next.recent] };
}

export function triggerAvatarEmote(input: {
  avatarId: string;
  emote: string;
  reactionState: AvatarReactionState;
  animationRef: string;
  cooldownMs?: number;
}): { ok: boolean; state: AvatarEmoteState; record?: AvatarEmoteRecord } {
  const k = key(input.avatarId);
  const now = Date.now();
  const state = startAvatarEmoteEngine(k);

  if (state.cooldownUntil > now) {
    return { ok: false, state };
  }

  const record: AvatarEmoteRecord = {
    emoteId: id(),
    avatarId: k,
    emote: input.emote,
    reactionState: input.reactionState,
    animationRef: input.animationRef,
    triggeredAt: now,
  };

  const emoteSignal = emoteLearningEngine
    .getTopEmotes(40)
    .find((signal) => signal.emoteId === input.emote || signal.emoteId === input.animationRef);

  const cooldownMutation = applySafeLearningMutation({
    engine: 'AvatarEmoteEngine',
    targetId: k,
    metric: 'emote-cooldown-ms',
    beforeValue: input.cooldownMs ?? 1200,
    requestedValue: Math.round((input.cooldownMs ?? 1200) * (emoteSignal && emoteSignal.responseScore > 70 ? 0.8 : 1.05)),
    minValue: 300,
    maxValue: 4000,
    confidence: emoteSignal ? 0.73 : 0.52,
    reason: 'emote pacing adapts from learned response quality',
  });

  const next: AvatarEmoteState = {
    avatarId: k,
    cooldownUntil: now + cooldownMutation.appliedValue,
    recent: [record, ...state.recent].slice(0, 100),
  };

  emoteStateMap.set(k, next);

  platformLearningCore.ingestEvent({
    type: 'emote',
    userId: k,
    targetId: input.emote,
    context: {
      reactionState: input.reactionState,
      animationRef: input.animationRef,
      cooldownMs: cooldownMutation.appliedValue,
      learningApplied: cooldownMutation.status === 'applied',
    },
  });

  return { ok: true, state: { ...next, recent: [...next.recent] }, record };
}

export function saveAvatarEmoteState(avatarId: string): AvatarEmoteState {
  return startAvatarEmoteEngine(avatarId);
}

export function recoverAvatarEmoteState(avatarId: string): AvatarEmoteState {
  return startAvatarEmoteEngine(avatarId);
}

export function repeatAvatarEmoteState(avatarId: string): AvatarEmoteState {
  return startAvatarEmoteEngine(avatarId);
}

export function returnAvatarEmoteState(avatarId: string): AvatarEmoteState {
  return startAvatarEmoteEngine(avatarId);
}
