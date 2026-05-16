export interface RoomMembership {
  roomId: string;
  userId: string;
  joinedAt: string;
}

const roomMembers = new Map<string, Map<string, RoomMembership>>();

export function joinRoom(roomId: string, userId: string): RoomMembership {
  if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Map());
  const membership: RoomMembership = {
    roomId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  roomMembers.get(roomId)?.set(userId, membership);
  return membership;
}

export function leaveRoom(roomId: string, userId: string): void {
  roomMembers.get(roomId)?.delete(userId);
}

export function listRoomMembers(roomId: string): RoomMembership[] {
  return [...(roomMembers.get(roomId)?.values() ?? [])];
}
