export interface PresenceState {
  userId: string;
  status: "online" | "away" | "offline";
  roomId?: string;
  updatedAt: string;
}

const presenceMap = new Map<string, PresenceState>();

export function setPresence(userId: string, status: PresenceState["status"], roomId?: string): PresenceState {
  const state: PresenceState = {
    userId,
    status,
    roomId,
    updatedAt: new Date().toISOString(),
  };
  presenceMap.set(userId, state);
  return state;
}

export function getPresence(userId: string): PresenceState | null {
  return presenceMap.get(userId) ?? null;
}
