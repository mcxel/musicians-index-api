import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export interface HomeTimelineState {
  roomId: ChatRoomId;
  homeId: 'home-1' | 'home-1-2' | 'home-2' | 'home-3' | 'home-4' | 'home-5';
  timelineAuthorityOwner: string;
  phase: 'boot' | 'preload' | 'transition' | 'steady' | 'downgraded';
  progress: number;
  updatedAtMs: number;
}

const timelines = new Map<string, HomeTimelineState>();

function key(roomId: ChatRoomId, homeId: HomeTimelineState['homeId']): string {
  return `${roomId}::${homeId}`;
}

export function setHomeTimelineAuthority(input: {
  roomId: ChatRoomId;
  homeId: HomeTimelineState['homeId'];
  ownerId: string;
  phase: HomeTimelineState['phase'];
  progress: number;
}): HomeTimelineState {
  const state: HomeTimelineState = {
    roomId: input.roomId,
    homeId: input.homeId,
    timelineAuthorityOwner: input.ownerId,
    phase: input.phase,
    progress: Math.max(0, Math.min(1, input.progress)),
    updatedAtMs: Date.now(),
  };
  timelines.set(key(input.roomId, input.homeId), state);
  return state;
}

export function synchronizeHomePair(roomId: ChatRoomId, primary: 'home-1', secondary: 'home-1-2') {
  const p = timelines.get(key(roomId, primary));
  const s = timelines.get(key(roomId, secondary));
  if (!p || !s) {
    return { synchronized: false, reason: 'missing-timeline' as const };
  }

  const delta = Math.abs(p.progress - s.progress);
  if (delta > 0.08) {
    const corrected = { ...s, progress: p.progress, phase: 'transition' as const, updatedAtMs: Date.now() };
    timelines.set(key(roomId, secondary), corrected);
  }

  return {
    synchronized: true,
    progressDelta: delta,
    corrected: delta > 0.08,
  };
}

export function getHomeSyncGovernorState(roomId: ChatRoomId) {
  return [...timelines.values()].filter((state) => state.roomId === roomId).sort((a, b) => a.homeId.localeCompare(b.homeId));
}

export function runHomeEmergencyDowngrade(roomId: ChatRoomId) {
  const affected = getHomeSyncGovernorState(roomId).map((state) => {
    const downgraded: HomeTimelineState = {
      ...state,
      phase: 'downgraded',
      updatedAtMs: Date.now(),
    };
    timelines.set(key(roomId, state.homeId), downgraded);
    return downgraded;
  });

  return {
    roomId,
    affectedHomes: affected.length,
    states: affected,
  };
}
