import { randomUUID } from 'crypto';

export type MemoryVisibility = 'direct' | 'group' | 'public-room';

export interface SharedMemory {
  id: string;
  fromUserId: string;
  toUserId?: string;
  groupId?: string;
  roomId?: string;
  visibility: MemoryVisibility;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

const SHARED_MEMORIES = new Map<string, SharedMemory>();
const USER_MEMORY_INDEX = new Map<string, string[]>();

export class SocialMemorySharingEngine {
  static shareMemory(input: {
    fromUserId: string;
    toUserId?: string;
    groupId?: string;
    roomId?: string;
    visibility: MemoryVisibility;
    title: string;
    body: string;
    tags?: string[];
  }): SharedMemory {
    const memory: SharedMemory = {
      id: randomUUID(),
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      groupId: input.groupId,
      roomId: input.roomId,
      visibility: input.visibility,
      title: input.title,
      body: input.body,
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
    };

    SHARED_MEMORIES.set(memory.id, memory);
    this.indexUser(memory.fromUserId, memory.id);
    if (memory.toUserId) this.indexUser(memory.toUserId, memory.id);
    return memory;
  }

  static getById(memoryId: string): SharedMemory | null {
    return SHARED_MEMORIES.get(memoryId) || null;
  }

  static getForUser(userId: string, limit: number = 100): SharedMemory[] {
    const ids = USER_MEMORY_INDEX.get(userId) || [];
    return ids
      .map((id) => SHARED_MEMORIES.get(id))
      .filter(Boolean)
      .slice(-limit) as SharedMemory[];
  }

  static getForGroup(groupId: string): SharedMemory[] {
    return Array.from(SHARED_MEMORIES.values()).filter((m) => m.groupId === groupId);
  }

  static getForRoom(roomId: string): SharedMemory[] {
    return Array.from(SHARED_MEMORIES.values()).filter((m) => m.roomId === roomId);
  }

  static remove(memoryId: string, requesterId: string): boolean {
    const memory = SHARED_MEMORIES.get(memoryId);
    if (!memory) return false;
    if (memory.fromUserId !== requesterId) return false;
    SHARED_MEMORIES.delete(memoryId);
    return true;
  }

  private static indexUser(userId: string, memoryId: string): void {
    if (!USER_MEMORY_INDEX.has(userId)) USER_MEMORY_INDEX.set(userId, []);
    USER_MEMORY_INDEX.get(userId)!.push(memoryId);
  }
}

export default SocialMemorySharingEngine;
