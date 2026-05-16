export type AvatarMemory = {
  memoryId: string;
  avatarId: string;
  title: string;
  notes?: string;
  tags: string[];
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

const avatarMemoryMap = new Map<string, AvatarMemory[]>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

function id(): string {
  return `avm_${Math.random().toString(36).slice(2, 10)}`;
}

export function saveAvatarMemory(input: {
  avatarId: string;
  title: string;
  notes?: string;
  tags?: string[];
}): AvatarMemory {
  const avatarId = key(input.avatarId);
  const now = Date.now();
  const memory: AvatarMemory = {
    memoryId: id(),
    avatarId,
    title: input.title,
    notes: input.notes,
    tags: input.tags ?? [],
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  const list = avatarMemoryMap.get(avatarId) ?? [];
  list.unshift(memory);
  avatarMemoryMap.set(avatarId, list.slice(0, 300));
  return memory;
}

export function recallAvatarMemories(avatarId: string, includeArchived = false): AvatarMemory[] {
  const list = avatarMemoryMap.get(key(avatarId)) ?? [];
  return includeArchived ? [...list] : list.filter((m) => !m.archived);
}

export function archiveAvatarMemory(avatarId: string, memoryId: string): AvatarMemory | null {
  const k = key(avatarId);
  const list = avatarMemoryMap.get(k) ?? [];
  const idx = list.findIndex((m) => m.memoryId === memoryId);
  if (idx < 0) return null;
  const next = { ...list[idx], archived: true, updatedAt: Date.now() };
  list[idx] = next;
  avatarMemoryMap.set(k, list);
  return next;
}

export function tagAvatarMemory(avatarId: string, memoryId: string, tag: string): AvatarMemory | null {
  const k = key(avatarId);
  const list = avatarMemoryMap.get(k) ?? [];
  const idx = list.findIndex((m) => m.memoryId === memoryId);
  if (idx < 0) return null;
  const tags = Array.from(new Set([...list[idx].tags, tag]));
  const next = { ...list[idx], tags, updatedAt: Date.now() };
  list[idx] = next;
  avatarMemoryMap.set(k, list);
  return next;
}
