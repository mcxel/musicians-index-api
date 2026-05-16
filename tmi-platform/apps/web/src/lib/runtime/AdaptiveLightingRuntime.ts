import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { CrowdEmotionState } from '@/lib/runtime/CrowdEmotionGraph';

export interface LightingState {
  roomId: ChatRoomId;
  intensity: number;
  pulseRate: number;
  hueShift: number;
  colorMode: 'ambient' | 'hype' | 'battle' | 'encore' | 'recovery';
  updatedAtMs: number;
}

const stateMap = new Map<ChatRoomId, LightingState>();

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function updateAdaptiveLighting(
  roomId: ChatRoomId,
  emotion: CrowdEmotionState,
  roomEnergy: number,
): LightingState {
  const intensity = clamp(Math.round(roomEnergy * 0.9 + emotion.hype * 0.2), 5, 100);
  const pulseRate = clamp(Math.round(0.4 + emotion.excitement / 50), 0, 5);
  const hueShift = clamp(Math.round(emotion.anticipation - emotion.boredom), -100, 100);

  const colorMode: LightingState['colorMode'] =
    emotion.hype > 75 ? 'encore' :
    emotion.excitement > 60 ? 'hype' :
    roomEnergy > 45 ? 'battle' :
    emotion.attentionCollapse > 45 ? 'recovery' : 'ambient';

  const next: LightingState = {
    roomId,
    intensity,
    pulseRate,
    hueShift,
    colorMode,
    updatedAtMs: Date.now(),
  };

  stateMap.set(roomId, next);
  return next;
}

export function getAdaptiveLighting(roomId: ChatRoomId): LightingState | undefined {
  return stateMap.get(roomId);
}
