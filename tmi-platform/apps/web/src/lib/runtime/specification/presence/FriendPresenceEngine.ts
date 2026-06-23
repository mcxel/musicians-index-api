export interface FriendPresence {
  userId: string;
  friendId: string;
  status: "online" | "offline" | "in-room";
  roomId?: string;
}

export interface FriendPresenceEngine {
  listFriendPresence(userId: string): Promise<FriendPresence[]>;
}
