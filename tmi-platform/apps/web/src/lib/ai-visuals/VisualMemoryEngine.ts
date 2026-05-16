export type VisualMemoryEntry = {
  memoryId: string;
  promptSignature: string;
  style: string;
  placementRoute: string;
  placementSlotId?: string;
  successful: boolean;
  score: number;
  createdAt: number;
};

const memory = new Map<string, VisualMemoryEntry>();

function id(): string {
  return `vmem_${Math.random().toString(36).slice(2, 11)}`;
}

export function rememberVisualOutcome(
  input: Omit<VisualMemoryEntry, "memoryId" | "createdAt">
): VisualMemoryEntry {
  const entry: VisualMemoryEntry = {
    ...input,
    memoryId: id(),
    createdAt: Date.now(),
  };
  memory.set(entry.memoryId, entry);
  return entry;
}

export function listVisualMemory(): VisualMemoryEntry[] {
  return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function findSuccessfulByStyle(style: string): VisualMemoryEntry[] {
  return listVisualMemory().filter((m) => m.style === style && m.successful);
}
