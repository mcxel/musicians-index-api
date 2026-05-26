export interface LiveEntry {
  userId: string;
  displayName: string;
  genre: string;
  startedAt: number;
  viewerCount: number;
  roomId?: string;
}

const registry = new Map<string, LiveEntry>();

export const LiveRegistry = {
  register(entry: Omit<LiveEntry, 'startedAt'>): LiveEntry {
    const live: LiveEntry = { ...entry, startedAt: Date.now() };
    registry.set(entry.userId, live);
    return live;
  },

  unregister(userId: string): void {
    registry.delete(userId);
  },

  isLive(userId: string): boolean {
    return registry.has(userId);
  },

  getEntry(userId: string): LiveEntry | null {
    return registry.get(userId) ?? null;
  },

  getLiveUsers(): LiveEntry[] {
    return Array.from(registry.values()).sort((a, b) => b.viewerCount - a.viewerCount);
  },

  incrementViewers(userId: string, delta = 1): void {
    const entry = registry.get(userId);
    if (entry) entry.viewerCount = Math.max(0, entry.viewerCount + delta);
  },

  count(): number {
    return registry.size;
  },
};
