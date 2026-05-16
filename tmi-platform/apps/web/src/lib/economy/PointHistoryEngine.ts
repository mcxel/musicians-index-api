export interface PointHistoryEntry {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  createdAt: string;
}

const history = new Map<string, PointHistoryEntry[]>();

export function pushPointHistory(userId: string, delta: number, reason: string): PointHistoryEntry {
  const entry: PointHistoryEntry = {
    id: `${userId}:${Date.now()}`,
    userId,
    delta,
    reason,
    createdAt: new Date().toISOString(),
  };

  const current = history.get(userId) ?? [];
  history.set(userId, [entry, ...current]);
  return entry;
}

export function listPointHistory(userId: string): PointHistoryEntry[] {
  return history.get(userId) ?? [];
}
