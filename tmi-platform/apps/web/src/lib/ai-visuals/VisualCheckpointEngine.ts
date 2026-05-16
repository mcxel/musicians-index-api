export type VisualCheckpoint = {
  checkpointId: string;
  name: string;
  progress: number;
  metadata?: Record<string, string | number | boolean>;
  createdAt: number;
  updatedAt: number;
};

const checkpoints = new Map<string, VisualCheckpoint>();

function id(): string {
  return `vcp_${Math.random().toString(36).slice(2, 11)}`;
}

export function saveCheckpoint(
  input: Omit<VisualCheckpoint, "checkpointId" | "createdAt" | "updatedAt">
): VisualCheckpoint {
  const now = Date.now();
  const checkpoint: VisualCheckpoint = {
    ...input,
    checkpointId: id(),
    createdAt: now,
    updatedAt: now,
  };
  checkpoints.set(checkpoint.checkpointId, checkpoint);
  return checkpoint;
}

export function resumeCheckpoint(checkpointId: string): VisualCheckpoint | null {
  return checkpoints.get(checkpointId) ?? null;
}

export function listCheckpoints(): VisualCheckpoint[] {
  return [...checkpoints.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
