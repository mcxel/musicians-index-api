// DEV ONLY — in-memory shard store. Resets on server restart.
export interface MemoryShard {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export class ProfileMemoryEngine {
  private static memoryStore = new Map<string, MemoryShard[]>();

  static async captureSessionShard(
    userId: string,
    sessionId: string,
    metadata: Record<string, unknown>,
  ): Promise<MemoryShard> {
    const key = userId.trim().toLowerCase();
    const existing = this.memoryStore.get(key) ?? [];

    const duplicate = existing.find((s) => s.sessionId === sessionId);
    if (duplicate) return duplicate;

    const shard: MemoryShard = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: key,
      sessionId,
      timestamp: Date.now(),
      metadata,
    };
    this.memoryStore.set(key, [shard, ...existing]);
    return shard;
  }

  static listUserShards(userId: string): MemoryShard[] {
    return [...(this.memoryStore.get(userId.trim().toLowerCase()) ?? [])];
  }

  static hasSessionShard(userId: string, sessionId: string): boolean {
    const shards = this.memoryStore.get(userId.trim().toLowerCase()) ?? [];
    return shards.some((s) => s.sessionId === sessionId);
  }
}
