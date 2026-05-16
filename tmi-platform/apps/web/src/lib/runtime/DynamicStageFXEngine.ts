import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { PerformanceLifecycleState } from '@/lib/runtime/PerformanceStateMachine';
import type { CrowdEmotionState } from '@/lib/runtime/CrowdEmotionGraph';

export interface StageFXState {
  roomId: ChatRoomId;
  fog: number;
  confetti: boolean;
  lasers: number;
  pyrotechnics: boolean;
  overlayIntensity: number;
  screenShake: number;
  transition: 'none' | 'cinematic-cut' | 'peak-blast' | 'cooldown-fade';
  updatedAtMs: number;
}

const fxMap = new Map<ChatRoomId, StageFXState>();

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function updateDynamicStageFX(input: {
  roomId: ChatRoomId;
  performanceState: PerformanceLifecycleState;
  emotion: CrowdEmotionState;
  roomEnergy: number;
}): StageFXState {
  const fog = clamp(Math.round(input.roomEnergy * 0.6), 0, 100);
  const lasers = clamp(Math.round(input.emotion.hype * 0.9), 0, 100);
  const overlayIntensity = clamp(Math.round((input.emotion.excitement + input.roomEnergy) / 2), 0, 100);
  const screenShake = clamp(Math.round((input.emotion.hype - input.emotion.boredom) / 4), 0, 20);

  const confetti = input.performanceState === 'CROWD_PEAK' || input.performanceState === 'ENCORE';
  const pyrotechnics = input.performanceState === 'CROWD_PEAK' && input.emotion.hype > 80;

  const transition: StageFXState['transition'] =
    input.performanceState === 'INTRO_BUILDUP' ? 'cinematic-cut' :
    input.performanceState === 'CROWD_PEAK' ? 'peak-blast' :
    input.performanceState === 'LOBBY_RECOVERY' ? 'cooldown-fade' : 'none';

  const next: StageFXState = {
    roomId: input.roomId,
    fog,
    confetti,
    lasers,
    pyrotechnics,
    overlayIntensity,
    screenShake,
    transition,
    updatedAtMs: Date.now(),
  };

  fxMap.set(input.roomId, next);
  return next;
}

export function getDynamicStageFX(roomId: ChatRoomId): StageFXState | undefined {
  return fxMap.get(roomId);
}
