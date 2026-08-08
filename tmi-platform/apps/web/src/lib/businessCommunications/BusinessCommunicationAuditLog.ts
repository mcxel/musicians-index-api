import type { BusinessCommsAuditEntry, BusinessCommsAction, BusinessCommsAgentId } from "./types";

const log: BusinessCommsAuditEntry[] = [];

function nextId(): string {
  return `bca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordBusinessCommsAudit(input: Omit<BusinessCommsAuditEntry, "id" | "at">): BusinessCommsAuditEntry {
  const entry: BusinessCommsAuditEntry = {
    ...input,
    id: nextId(),
    at: Date.now(),
  };
  log.unshift(entry);
  if (log.length > 2000) log.length = 2000;
  return entry;
}

export function listBusinessCommsAudit(limit = 100): BusinessCommsAuditEntry[] {
  return log.slice(0, Math.max(1, limit));
}

export function auditForThread(threadId: string, limit = 50): BusinessCommsAuditEntry[] {
  return log.filter((e) => e.threadId === threadId).slice(0, limit);
}

export function summarizeAuditSince(sinceMs: number): {
  total: number;
  byAction: Partial<Record<BusinessCommsAction, number>>;
  byAgent: Partial<Record<BusinessCommsAgentId, number>>;
} {
  const slice = log.filter((e) => e.at >= sinceMs);
  const byAction: Partial<Record<BusinessCommsAction, number>> = {};
  const byAgent: Partial<Record<BusinessCommsAgentId, number>> = {};
  for (const e of slice) {
    byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    byAgent[e.agentId] = (byAgent[e.agentId] ?? 0) + 1;
  }
  return { total: slice.length, byAction, byAgent };
}
