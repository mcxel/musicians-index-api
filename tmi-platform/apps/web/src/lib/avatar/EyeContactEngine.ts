import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

export type GazeTarget = "performer" | "crowd" | "sponsor" | "camera" | "floor" | "random";

export interface EyeContactState {
  avatarId: string;
  gazeTarget: GazeTarget;
  gazeX: number;
  gazeY: number;
  blinkRate: number;
  intensity: number;
  updatedAt: string;
}

const states = new Map<string, EyeContactState>();

export function setGaze(avatarId: string, target: GazeTarget, x = 0.5, y = 0.5): EyeContactState {
  const lobbySignal = lobbyBehaviorEngine.getLobbySignals(1)[0];
  const requestedIntensity =
    (target === 'crowd' ? 0.9 : target === 'performer' ? 0.8 : 0.6) + ((lobbySignal?.retentionScore ?? 0) / 300);
  const intensityMutation = applySafeLearningMutation({
    engine: 'EyeContactEngine',
    targetId: avatarId.toLowerCase(),
    metric: 'gaze-intensity-pct',
    beforeValue: target === 'crowd' ? 0.9 : target === 'performer' ? 0.8 : 0.6,
    requestedValue: requestedIntensity,
    minValue: 0.2,
    maxValue: 1,
    confidence: lobbySignal ? 0.67 : 0.48,
    reason: 'camera awareness and gaze intensity adapt from lobby retention momentum',
  });

  const state: EyeContactState = {
    avatarId,
    gazeTarget: target,
    gazeX: Math.max(0, Math.min(1, x)),
    gazeY: Math.max(0, Math.min(1, y)),
    blinkRate: target === "camera" ? 0.25 : 0.15,
    intensity: intensityMutation.appliedValue,
    updatedAt: new Date().toISOString(),
  };
  states.set(avatarId, state);
  return state;
}

export function getGaze(avatarId: string): EyeContactState {
  return states.get(avatarId) ?? setGaze(avatarId, "random");
}

export function trackPerformer(avatarId: string): EyeContactState {
  return setGaze(avatarId, "performer", 0.5, 0.45);
}

export function scanCrowd(avatarId: string): EyeContactState {
  return setGaze(avatarId, "crowd", Math.random(), 0.5);
}

export function lookAtCamera(avatarId: string): EyeContactState {
  return setGaze(avatarId, "camera", 0.5, 0.5);
}

export function resetGaze(avatarId: string): void {
  states.delete(avatarId);
}
