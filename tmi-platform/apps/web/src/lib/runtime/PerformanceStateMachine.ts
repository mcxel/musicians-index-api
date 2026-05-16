import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { CrowdEmotionState } from '@/lib/runtime/CrowdEmotionGraph';

export type PerformanceLifecycleState =
  | 'BACKSTAGE'
  | 'CURTAIN_CLOSED'
  | 'INTRO_BUILDUP'
  | 'ACTIVE_PERFORMANCE'
  | 'CROWD_PEAK'
  | 'ENCORE'
  | 'EXIT_STATE'
  | 'POST_SHOW_REPLAY'
  | 'LOBBY_RECOVERY';

export interface PerformanceStateRecord {
  roomId: ChatRoomId;
  state: PerformanceLifecycleState;
  changedAtMs: number;
  reason: string;
}

const registry = new Map<ChatRoomId, PerformanceStateRecord>();

function now(): number {
  return Date.now();
}

export function getPerformanceState(roomId: ChatRoomId): PerformanceStateRecord {
  return (
    registry.get(roomId) ?? {
      roomId,
      state: 'BACKSTAGE',
      changedAtMs: now(),
      reason: 'init',
    }
  );
}

export function setPerformanceState(
  roomId: ChatRoomId,
  state: PerformanceLifecycleState,
  reason: string,
): PerformanceStateRecord {
  const next: PerformanceStateRecord = {
    roomId,
    state,
    reason,
    changedAtMs: now(),
  };
  registry.set(roomId, next);
  return next;
}

export function advancePerformanceState(
  roomId: ChatRoomId,
  emotion: CrowdEmotionState,
  roomEnergy: number,
): PerformanceStateRecord {
  const current = getPerformanceState(roomId);

  if (current.state === 'BACKSTAGE' && emotion.anticipation > 20) {
    return setPerformanceState(roomId, 'CURTAIN_CLOSED', 'anticipation-rising');
  }
  if (current.state === 'CURTAIN_CLOSED' && emotion.anticipation > 30) {
    return setPerformanceState(roomId, 'INTRO_BUILDUP', 'intro-sequence');
  }
  if (current.state === 'INTRO_BUILDUP' && roomEnergy > 30) {
    return setPerformanceState(roomId, 'ACTIVE_PERFORMANCE', 'energy-ready');
  }
  if (current.state === 'ACTIVE_PERFORMANCE' && emotion.hype > 70) {
    return setPerformanceState(roomId, 'CROWD_PEAK', 'hype-peak');
  }
  if (current.state === 'CROWD_PEAK' && emotion.excitement > 85) {
    return setPerformanceState(roomId, 'ENCORE', 'encore-demand');
  }
  if ((current.state === 'ENCORE' || current.state === 'CROWD_PEAK') && emotion.boredom > 45) {
    return setPerformanceState(roomId, 'EXIT_STATE', 'energy-decay');
  }
  if (current.state === 'EXIT_STATE') {
    return setPerformanceState(roomId, 'POST_SHOW_REPLAY', 'post-show-capture');
  }
  if (current.state === 'POST_SHOW_REPLAY' && emotion.attentionCollapse > 30) {
    return setPerformanceState(roomId, 'LOBBY_RECOVERY', 'recover-loop');
  }

  return current;
}
