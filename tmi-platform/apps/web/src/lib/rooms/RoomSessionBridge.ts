/**
 * RoomSessionBridge — in-memory shared session state.
 *
 * When a fan leaps into a live room, the room page registers their presence here.
 * The performer's dashboard reads it to show live audience count and active sessions.
 * Server-side module — safe to import in both server and client components.
 */

export interface RoomPresence {
  sessionId: string;
  userId: string;
  roomId: string;
  role: 'fan' | 'performer' | 'bot';
  joinedAtMs: number;
  zone?: string;
}

const presenceMap = new Map<string, RoomPresence>();  // key = sessionId

export function registerPresence(presence: RoomPresence): void {
  presenceMap.set(presence.sessionId, presence);
  console.log(`[RoomSessionBridge] +presence sid=${presence.sessionId} room=${presence.roomId} role=${presence.role}`);
}

export function removePresence(sessionId: string): void {
  presenceMap.delete(sessionId);
}

export function getPresenceInRoom(roomId: string): RoomPresence[] {
  return Array.from(presenceMap.values()).filter((p) => p.roomId === roomId);
}

export function getFanCountInRoom(roomId: string): number {
  return getPresenceInRoom(roomId).filter((p) => p.role === 'fan').length;
}

export function isPerformerLiveInRoom(roomId: string): boolean {
  return getPresenceInRoom(roomId).some((p) => p.role === 'performer');
}
