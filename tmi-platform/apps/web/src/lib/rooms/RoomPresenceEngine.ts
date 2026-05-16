import { listRoomMembers } from "./RoomJoinEngine";

export function getRoomPresence(roomId: string) {
  const members = listRoomMembers(roomId);
  return {
    roomId,
    occupancy: members.length,
    users: members.map((entry) => entry.userId),
  };
}
