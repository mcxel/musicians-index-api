/**
 * MemoryWallEngine.ts
 *
 * Manages memory wall content for fans, artists, performers, venues.
 * Supports photos, videos, screenshots, achievements, ticket stubs, battle wins, cypher moments, meet-and-greets.
 * Purpose: Create personal media history that users can look back on.
 */

export interface MemoryItem {
  memoryId: string;
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  contentType:
    | 'photo'
    | 'video'
    | 'screenshot'
    | 'achievement'
    | 'ticket-stub'
    | 'battle-win'
    | 'cypher-moment'
    | 'meet-and-greet'
    | 'event-attendance'
    | 'merchandise'
    | 'nft';
  contentUrl: string;
  thumbnail?: string;
  title: string;
  description?: string;
  relatedEntityId?: string; // e.g., artist ID for fan meeting artist
  relatedEntityType?: string;
  tags: string[];
  pinnedAt?: number; // null = not pinned, timestamp = pinned
  createdAt: number;
  source: 'user-uploaded' | 'system-captured' | 'ai-generated' | 'imported';
  isPublic: boolean;
  likes: number;
  shares: number;
  displayOrder: number;
}

export interface MemoryWallConfig {
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  maxItems: number;
  autoArchiveAfterDays: number;
  allowPublicSharing: boolean;
  memoryWallRoute: string;
}

export interface MemoryWallStats {
  totalMemories: number;
  pinnedMemories: number;
  photoCount: number;
  videoCount: number;
  achievementCount: number;
  ticketStubCount: number;
  lastUpdated: number;
}

// In-memory registries
const memoryWalls = new Map<string, MemoryItem[]>();
const memoryWallConfigs = new Map<string, MemoryWallConfig>();

/**
 * Creates or initializes memory wall for entity.
 */
export function initializeMemoryWall(input: {
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  maxItems?: number;
  autoArchiveAfterDays?: number;
  allowPublicSharing?: boolean;
}): string {
  const wallKey = `${input.entityType}-${input.entityId}`;

  const config: MemoryWallConfig = {
    entityId: input.entityId,
    entityType: input.entityType,
    maxItems: input.maxItems ?? 500,
    autoArchiveAfterDays: input.autoArchiveAfterDays ?? 730,
    allowPublicSharing: input.allowPublicSharing ?? true,
    memoryWallRoute: `/${input.entityType}/${input.entityId}/memory`,
  };

  memoryWallConfigs.set(wallKey, config);

  if (!memoryWalls.has(wallKey)) {
    memoryWalls.set(wallKey, []);
  }

  return wallKey;
}

/**
 * Adds memory to wall (without mutation at read-time).
 */
export function addMemoryToWall(input: {
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  contentType: MemoryItem['contentType'];
  contentUrl: string;
  thumbnail?: string;
  title: string;
  description?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  tags?: string[];
  source: 'user-uploaded' | 'system-captured' | 'ai-generated' | 'imported';
  isPublic?: boolean;
}): string {
  const wallKey = `${input.entityType}-${input.entityId}`;
  const wall = memoryWalls.get(wallKey) ?? [];

  const memoryId = `mem-${Date.now()}-${Math.random()}`;

  const memory: MemoryItem = {
    memoryId,
    entityId: input.entityId,
    entityType: input.entityType,
    contentType: input.contentType,
    contentUrl: input.contentUrl,
    thumbnail: input.thumbnail,
    title: input.title,
    description: input.description,
    relatedEntityId: input.relatedEntityId,
    relatedEntityType: input.relatedEntityType,
    tags: input.tags ?? [],
    createdAt: Date.now(),
    source: input.source,
    isPublic: input.isPublic ?? true,
    likes: 0,
    shares: 0,
    displayOrder: wall.length,
  };

  wall.push(memory);
  memoryWalls.set(wallKey, wall);

  return memoryId;
}

/**
 * Lists all memories for entity (non-mutating).
 */
export function listMemoriesForEntity(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue'
): MemoryItem[] {
  const wallKey = `${entityType}-${entityId}`;
  return memoryWalls.get(wallKey) ?? [];
}

/**
 * Lists pinned memories (most important ones).
 */
export function listPinnedMemories(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue'
): MemoryItem[] {
  return listMemoriesForEntity(entityId, entityType)
    .filter((m) => m.pinnedAt !== undefined && m.pinnedAt !== null)
    .sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0));
}

/**
 * Pins a memory to the top.
 */
export function pinMemory(memoryId: string): void {
  for (const memories of memoryWalls.values()) {
    const memory = memories.find((m) => m.memoryId === memoryId);
    if (memory) {
      memory.pinnedAt = Date.now();
      break;
    }
  }
}

/**
 * Unpins a memory.
 */
export function unpinMemory(memoryId: string): void {
  for (const memories of memoryWalls.values()) {
    const memory = memories.find((m) => m.memoryId === memoryId);
    if (memory) {
      memory.pinnedAt = undefined;
      break;
    }
  }
}

/**
 * Records interaction with memory.
 */
export function recordMemoryInteraction(memoryId: string, interactionType: 'like' | 'share'): void {
  for (const memories of memoryWalls.values()) {
    const memory = memories.find((m) => m.memoryId === memoryId);
    if (memory) {
      if (interactionType === 'like') {
        memory.likes += 1;
      } else if (interactionType === 'share') {
        memory.shares += 1;
      }
      break;
    }
  }
}

/**
 * Gets memory wall stats (non-mutating).
 */
export function getMemoryWallStats(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue'
): MemoryWallStats {
  const memories = listMemoriesForEntity(entityId, entityType);

  return {
    totalMemories: memories.length,
    pinnedMemories: memories.filter((m) => m.pinnedAt !== undefined && m.pinnedAt !== null).length,
    photoCount: memories.filter((m) => m.contentType === 'photo').length,
    videoCount: memories.filter((m) => m.contentType === 'video').length,
    achievementCount: memories.filter((m) => m.contentType === 'achievement').length,
    ticketStubCount: memories.filter((m) => m.contentType === 'ticket-stub').length,
    lastUpdated: memories.length > 0 ? Math.max(...memories.map((m) => m.createdAt)) : Date.now(),
  };
}

/**
 * Lists memories by type.
 */
export function listMemoriesByType(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue',
  contentType: MemoryItem['contentType']
): MemoryItem[] {
  return listMemoriesForEntity(entityId, entityType).filter((m) => m.contentType === contentType);
}

/**
 * Gets top memories by engagement.
 */
export function getTopMemories(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue',
  limit: number = 10
): MemoryItem[] {
  return listMemoriesForEntity(entityId, entityType)
    .sort((a, b) => b.likes + b.shares - (a.likes + a.shares))
    .slice(0, limit);
}

/**
 * Gets memory wall report for admin.
 */
export function getMemoryWallReport(): {
  totalWalls: number;
  totalMemories: number;
  memoryBreakdown: Record<string, number>;
} {
  let totalMemories = 0;
  const memoryBreakdown: Record<string, number> = {};

  for (const memories of memoryWalls.values()) {
    totalMemories += memories.length;
    memories.forEach((m) => {
      memoryBreakdown[m.contentType] = (memoryBreakdown[m.contentType] ?? 0) + 1;
    });
  }

  return {
    totalWalls: memoryWalls.size,
    totalMemories,
    memoryBreakdown,
  };
}
