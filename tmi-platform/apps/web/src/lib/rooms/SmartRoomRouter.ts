/**
 * SmartRoomRouter — V1
 *
 * Routes users only to ALIVE rooms.
 * Priority: alive + low-audience (seed) → momentum (hot) → stable (mid)
 * Never routes to dead rooms (no activity, no heat).
 *
 * Alive Signal:
 *   heatLevel > 12  OR  hypeScore > 20
 *
 * Moment Score:
 *   hypeScore(0.3) + heatLevel(0.25) + reactionRate(0.2) + queueBonus + seedBonus
 */

import { getRoomPopulation } from '@/lib/rooms/RoomPopulationEngine';
import { getIntentSummary } from '@/lib/rooms/CrowdIntentEngine';
import { listRoomMembers } from '@/lib/rooms/RoomJoinEngine';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export const ROUTABLE_ROOMS: ChatRoomId[] = [
  'cypher-arena',
  'monthly-idol',
  'monday-night-stage',
  'deal-or-feud',
  'name-that-tune',
  'circle-squares',
  'venue-room',
];

export type RoomCategory = 'seed' | 'hot' | 'mid' | 'dead';

export type ScoredRoom = {
  roomId: ChatRoomId;
  score: number;
  category: RoomCategory;
  memberCount: number;
  heatLevel: number;
  hypeScore: number;
  isAlive: boolean;
};

export function isRoomAlive(heatLevel: number, hypeScore: number): boolean {
  return heatLevel > 12 || hypeScore > 20;
}

export function scoreRoom(roomId: ChatRoomId): ScoredRoom {
  const pop = getRoomPopulation(roomId);
  const intent = getIntentSummary(roomId, Date.now());
  const members = listRoomMembers(roomId);

  const memberCount = members.length;
  const { heatLevel, queueDepth, reactionRate } = pop;
  const { hypeScore } = intent;
  const alive = isRoomAlive(heatLevel, hypeScore);

  if (!alive) {
    return { roomId, score: 0, category: 'dead', memberCount, heatLevel, hypeScore, isAlive: false };
  }

  const score =
    hypeScore * 0.30 +
    heatLevel * 0.25 +
    reactionRate * 0.20 +
    (queueDepth > 0 ? 15 : 0) +
    (memberCount <= 5 ? 10 : 0); // seed bonus for low-audience rooms

  const category: RoomCategory =
    memberCount <= 5 ? 'seed' :
    heatLevel >= 55 || hypeScore >= 60 ? 'hot' :
    'mid';

  return { roomId, score, category, memberCount, heatLevel, hypeScore, isAlive: true };
}

function pick<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Returns the best room ID to route a user into.
 * 50% chance → alive + low-audience (seed)
 * 30% chance → high-momentum (hot)
 * 20% chance → stable mid rooms
 */
export function getSmartRoom(): ChatRoomId {
  const scored = ROUTABLE_ROOMS.map(scoreRoom).filter((r) => r.isAlive);

  if (scored.length === 0) return 'cypher-arena'; // safe fallback

  const seed = scored.filter((r) => r.category === 'seed');
  const hot  = scored.filter((r) => r.category === 'hot');
  const mid  = scored.filter((r) => r.category === 'mid');

  const roll = Math.random();

  if (seed.length && roll < 0.50) return pick(seed)!.roomId;
  if (hot.length  && roll < 0.80) return pick(hot)!.roomId;
  if (mid.length)                  return pick(mid)!.roomId;

  // tiebreak: highest score
  return scored.sort((a, b) => b.score - a.score)[0]!.roomId;
}

/**
 * Returns a lightweight snapshot of all room states for dashboard display.
 */
export function getAllRoomSnapshots(): ScoredRoom[] {
  return ROUTABLE_ROOMS.map(scoreRoom);
}
