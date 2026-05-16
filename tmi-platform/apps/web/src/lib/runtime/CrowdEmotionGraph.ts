import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { LiveReactionSnapshot } from '@/lib/live/LiveReactionEngine';

export interface CrowdEmotionState {
  roomId: ChatRoomId;
  excitement: number;
  boredom: number;
  anticipation: number;
  hype: number;
  attentionCollapse: number;
  updatedAtMs: number;
}

const graph = new Map<ChatRoomId, CrowdEmotionState>();

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function getOrInit(roomId: ChatRoomId): CrowdEmotionState {
  if (!graph.has(roomId)) {
    graph.set(roomId, {
      roomId,
      excitement: 10,
      boredom: 20,
      anticipation: 15,
      hype: 10,
      attentionCollapse: 0,
      updatedAtMs: Date.now(),
    });
  }
  return graph.get(roomId)!;
}

export function updateCrowdEmotionGraph(input: {
  roomId: ChatRoomId;
  momentumCurrent: number;
  roomEnergy: number;
  reactionSnapshot?: LiveReactionSnapshot;
}): CrowdEmotionState {
  const state = getOrInit(input.roomId);
  const votes = input.reactionSnapshot?.leadingTargetVotes ?? 0;
  const totalSignals = input.reactionSnapshot?.totalSignals ?? 0;

  const excitement = clamp(Math.round(input.momentumCurrent * 0.45 + input.roomEnergy * 0.35 + votes * 1.4));
  const hype = clamp(Math.round(input.momentumCurrent * 0.55 + totalSignals * 0.8));
  const boredom = clamp(100 - Math.round(input.roomEnergy * 0.6 + input.momentumCurrent * 0.3));
  const anticipation = clamp(Math.round((votes + totalSignals) * 0.5 + input.roomEnergy * 0.2));
  const attentionCollapse = clamp(Math.round((boredom * 0.65) - (hype * 0.4)));

  const next: CrowdEmotionState = {
    roomId: input.roomId,
    excitement,
    boredom,
    anticipation,
    hype,
    attentionCollapse,
    updatedAtMs: Date.now(),
  };

  graph.set(input.roomId, next);
  return next;
}

export function getCrowdEmotionState(roomId: ChatRoomId): CrowdEmotionState {
  return { ...getOrInit(roomId) };
}

export function getCrowdEmotionSnapshot(): CrowdEmotionState[] {
  return [...graph.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}
