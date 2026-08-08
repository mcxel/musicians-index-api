import type {
  BusinessCommsAgentId,
  CommitmentEvidence,
  CommitmentRecord,
  CommitmentStatus,
} from "./types";

const store = new Map<string, CommitmentRecord>();

function nextId(): string {
  return `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCommitment(input: {
  relationshipId: string;
  title: string;
  assignedAgentId: BusinessCommsAgentId;
  dueAt?: number;
}): CommitmentRecord {
  const now = Date.now();
  const record: CommitmentRecord = {
    id: nextId(),
    relationshipId: input.relationshipId,
    title: input.title,
    status: "open",
    dueAt: input.dueAt,
    createdAt: now,
    updatedAt: now,
    evidence: [],
    assignedAgentId: input.assignedAgentId,
  };
  store.set(record.id, record);
  return record;
}

export function appendCommitmentEvidence(
  commitmentId: string,
  evidence: Omit<CommitmentEvidence, "at"> & { at?: number },
): CommitmentRecord | undefined {
  const row = store.get(commitmentId);
  if (!row) return undefined;
  row.evidence.unshift({
    ...evidence,
    at: evidence.at ?? Date.now(),
  });
  row.updatedAt = Date.now();
  return row;
}

export function setCommitmentStatus(
  commitmentId: string,
  status: CommitmentStatus,
): CommitmentRecord | undefined {
  const row = store.get(commitmentId);
  if (!row) return undefined;
  row.status = status;
  row.updatedAt = Date.now();
  return row;
}

export function getCommitment(id: string): CommitmentRecord | undefined {
  return store.get(id);
}

export function listCommitments(filter?: {
  status?: CommitmentStatus;
  relationshipId?: string;
  limit?: number;
}): CommitmentRecord[] {
  let rows = [...store.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter?.relationshipId) rows = rows.filter((r) => r.relationshipId === filter.relationshipId);
  return rows.slice(0, filter?.limit ?? 100);
}

export function commitmentCountsByStatus(): Record<CommitmentStatus, number> {
  const base: Record<CommitmentStatus, number> = {
    open: 0,
    in_progress: 0,
    blocked: 0,
    awaiting_human: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const row of store.values()) {
    base[row.status] += 1;
  }
  return base;
}
