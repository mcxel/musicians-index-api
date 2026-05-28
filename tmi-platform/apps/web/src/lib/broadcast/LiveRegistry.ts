export interface LiveEntry {
  userId: string;
  displayName: string;
  genre: string;
  role?: 'fan' | 'performer' | 'artist' | 'host' | 'admin';
  avatarUrl?: string;
  vibeState?: {
    underlay: string;
    overlay: string;
    strobeIntensity: number;
    spotlightMode: boolean;
    shaderQuality: 'low' | 'medium' | 'high';
  };
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

  setRoomVibe(roomId: string, vibeState: LiveEntry['vibeState']): void {
    if (!roomId || !vibeState) return;
    for (const entry of registry.values()) {
      if (entry.roomId === roomId) {
        entry.vibeState = vibeState;
      }
    }
  },

  getRoomVibe(roomId: string): LiveEntry['vibeState'] | null {
    for (const entry of registry.values()) {
      if (entry.roomId === roomId) return entry.vibeState ?? null;
    }
    return null;
  },

  count(): number {
    return registry.size;
  },
};
