import { joinRoom, leaveRoom } from "./RoomJoinEngine";

export function transferUserBetweenRooms(userId: string, fromRoomId: string, toRoomId: string) {
  leaveRoom(fromRoomId, userId);
  return joinRoom(toRoomId, userId);
}
