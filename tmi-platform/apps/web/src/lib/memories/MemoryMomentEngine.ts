export type MemoryMoment = {
  id: string;
  userId: string;
  title: string;
  sourceType: "event" | "profile" | "ticket";
  sourceId: string;
  shared: boolean;
  createdAt: string;
};

const memoryStore = new Map<string, MemoryMoment[]>();

export function saveMemoryMoment(
  userId: string,
  title: string,
  sourceType: MemoryMoment["sourceType"],
  sourceId: string,
): MemoryMoment {
  const item: MemoryMoment = {
    id: `${userId}:${sourceType}:${Date.now()}`,
    userId,
    title,
    sourceType,
    sourceId,
    shared: false,
    createdAt: new Date().toISOString(),
  };

  const current = memoryStore.get(userId) ?? [];
  memoryStore.set(userId, [item, ...current]);
  return item;
}

export function listMemoryMoments(userId: string): MemoryMoment[] {
  return memoryStore.get(userId) ?? [];
}

export function shareMemoryMoment(userId: string, memoryId: string): MemoryMoment | null {
  const current = memoryStore.get(userId) ?? [];
  const next = current.map((entry) =>
    entry.id === memoryId ? { ...entry, shared: true } : entry,
  );
  memoryStore.set(userId, next);
  return next.find((entry) => entry.id === memoryId) ?? null;
}
