import { getRoomPresence } from "@/lib/rooms/RoomPresenceEngine";

export function getLobbyPreviewRuntime(roomIds: string[]) {
  return roomIds.map((roomId) => getRoomPresence(roomId));
}
