export type MotionMemoryEntry = {
  memoryId: string;
  promptSignature: string;
  motionType: string;
  durationSeconds: number;
  successful: boolean;
  score: number;
  createdAt: number;
};

const memory = new Map<string, MotionMemoryEntry>();

function id(): string {
  return `mmem_${Math.random().toString(36).slice(2, 11)}`;
}

export function rememberMotionOutcome(
  input: Omit<MotionMemoryEntry, "memoryId" | "createdAt">
): MotionMemoryEntry {
  const entry: MotionMemoryEntry = {
    ...input,
    memoryId: id(),
    createdAt: Date.now(),
  };
  memory.set(entry.memoryId, entry);
  return entry;
}

export function listMotionMemory(): MotionMemoryEntry[] {
  return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
}
