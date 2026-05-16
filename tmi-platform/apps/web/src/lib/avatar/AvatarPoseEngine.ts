import { battleInterestEngine } from '@/lib/learning/BattleInterestEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';
import { platformLearningCore } from '@/lib/learning/PlatformLearningCore';

export type AvatarPose =
  | "idle"
  | "battle"
  | "stage"
  | "lobby"
  | "dance"
  | "celebration"
  | "victory"
  | "sponsor"
  | "sponsor-stage"
  | "sponsor-lobby";

export type AvatarPoseState = {
  avatarId: string;
  pose: AvatarPose;
  changedAt: number;
};

const poseMap = new Map<string, AvatarPoseState>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

export function setAvatarPose(avatarId: string, pose: AvatarPose): AvatarPoseState {
  const k = key(avatarId);
  const battleSignal = battleInterestEngine.getBattleSignals(15)[0];
  const requestedBattleBias = pose === 'battle' ? 1 + Math.round((battleSignal?.hypeScore ?? 0) / 40) : 1;
  const biasMutation = applySafeLearningMutation({
    engine: 'AvatarPoseEngine',
    targetId: k,
    metric: 'battle-stance-bias',
    beforeValue: 1,
    requestedValue: requestedBattleBias,
    minValue: 1,
    maxValue: 4,
    confidence: battleSignal ? 0.7 : 0.5,
    reason: 'pose intensity adapts from battle interest trends',
  });

  const state: AvatarPoseState = {
    avatarId: k,
    pose: pose === 'battle' && biasMutation.appliedValue >= 3 ? 'victory' : pose,
    changedAt: Date.now(),
  };
  poseMap.set(state.avatarId, state);

  platformLearningCore.ingestEvent({
    type: 'avatar_action',
    userId: k,
    targetId: state.pose,
    context: {
      battleBias: biasMutation.appliedValue,
      learningApplied: biasMutation.status === 'applied',
    },
  });

  return state;
}

export function getAvatarPose(avatarId: string): AvatarPoseState {
  return (
    poseMap.get(key(avatarId)) ?? {
      avatarId: key(avatarId),
      pose: "idle",
      changedAt: Date.now(),
    }
  );
}

export function setAvatarPoseAlias(
  avatarId: string,
  alias: "combat" | "showtime" | "party" | "sponsor"
): AvatarPoseState {
  const pose: AvatarPose =
    alias === "combat"
      ? "battle"
      : alias === "showtime"
      ? "stage"
      : alias === "party"
      ? "dance"
      : "sponsor";
  return setAvatarPose(avatarId, pose);
}

export function startAvatarPoseEngine(avatarId: string): AvatarPoseState {
  return getAvatarPose(avatarId);
}

export function updateAvatarPoseEngine(avatarId: string, pose: AvatarPose): AvatarPoseState {
  return setAvatarPose(avatarId, pose);
}

export function saveAvatarPoseEngine(avatarId: string): AvatarPoseState {
  return getAvatarPose(avatarId);
}

export function recoverAvatarPoseEngine(avatarId: string): AvatarPoseState {
  return getAvatarPose(avatarId);
}

export function repeatAvatarPoseEngine(avatarId: string): AvatarPoseState {
  const current = getAvatarPose(avatarId);
  return setAvatarPose(avatarId, current.pose);
}

export function returnAvatarPoseEngine(avatarId: string): AvatarPoseState {
  return getAvatarPose(avatarId);
}
