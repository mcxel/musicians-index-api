export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

const requests = new Map<string, FriendRequest>();

export function createFriendRequest(fromUserId: string, toUserId: string): FriendRequest {
  const id = `${fromUserId}:${toUserId}:${Date.now()}`;
  const request: FriendRequest = {
    id,
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  requests.set(id, request);
  return request;
}

export function updateFriendRequestStatus(id: string, status: FriendRequest["status"]): FriendRequest | null {
  const request = requests.get(id);
  if (!request) return null;
  const updated = { ...request, status };
  requests.set(id, updated);
  return updated;
}

export function listFriendRequestsForUser(userId: string): FriendRequest[] {
  return [...requests.values()].filter((entry) => entry.toUserId === userId || entry.fromUserId === userId);
}
