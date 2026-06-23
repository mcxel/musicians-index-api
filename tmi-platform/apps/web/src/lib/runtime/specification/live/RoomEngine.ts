export interface RoomEngine {
  createRoom(input: { hostId: string; mode: string; title: string }): Promise<{ roomId: string }>;
  closeRoom(roomId: string): Promise<void>;
}
