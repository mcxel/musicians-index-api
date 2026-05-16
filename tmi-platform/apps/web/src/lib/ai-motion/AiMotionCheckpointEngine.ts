export type MotionCheckpoint = {
  checkpointId: string;
  name: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
};

const checkpoints = new Map<string, MotionCheckpoint>();

function id(): string {
  return `mcp_${Math.random().toString(36).slice(2, 11)}`;
}

export function saveMotionCheckpoint(input: Omit<MotionCheckpoint, "checkpointId" | "createdAt" | "updatedAt">): MotionCheckpoint {
  const now = Date.now();
  const checkpoint: MotionCheckpoint = { ...input, checkpointId: id(), createdAt: now, updatedAt: now };
  checkpoints.set(checkpoint.checkpointId, checkpoint);
  return checkpoint;
}

export function resumeMotionCheckpoint(checkpointId: string): MotionCheckpoint | null {
  return checkpoints.get(checkpointId) ?? null;
}

export function listMotionCheckpoints(): MotionCheckpoint[] {
  return [...checkpoints.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
