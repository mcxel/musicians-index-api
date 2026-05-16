export type CheckpointStatus = "pending" | "passed" | "failed" | "skipped";

export interface BotCheckpoint {
  checkpointId: string;
  taskId: string;
  botId: string;
  label: string;
  status: CheckpointStatus;
  note?: string;
  revenueGate: boolean;
  completedAt?: string;
}

export interface CheckpointLedgerSummary {
  taskId: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  completionPct: number;
  allGatesPassed: boolean;
}

const ledger = new Map<string, BotCheckpoint[]>();

function taskKey(taskId: string) { return `task:${taskId}`; }

function gen(): string {
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function registerCheckpoints(
  taskId: string,
  botId: string,
  checkpoints: Array<{ label: string; revenueGate?: boolean }>,
): BotCheckpoint[] {
  const entries: BotCheckpoint[] = checkpoints.map((c) => ({
    checkpointId: gen(),
    taskId,
    botId,
    label: c.label,
    status: "pending",
    revenueGate: c.revenueGate ?? false,
  }));
  ledger.set(taskKey(taskId), entries);
  return entries;
}

export function passCheckpoint(taskId: string, checkpointId: string, note?: string): BotCheckpoint | null {
  const entries = ledger.get(taskKey(taskId));
  if (!entries) return null;
  const idx = entries.findIndex((c) => c.checkpointId === checkpointId);
  if (idx < 0) return null;
  entries[idx] = { ...entries[idx], status: "passed", note, completedAt: new Date().toISOString() };
  return entries[idx];
}

export function failCheckpoint(taskId: string, checkpointId: string, note?: string): BotCheckpoint | null {
  const entries = ledger.get(taskKey(taskId));
  if (!entries) return null;
  const idx = entries.findIndex((c) => c.checkpointId === checkpointId);
  if (idx < 0) return null;
  entries[idx] = { ...entries[idx], status: "failed", note, completedAt: new Date().toISOString() };
  return entries[idx];
}

export function skipCheckpoint(taskId: string, checkpointId: string, reason?: string): BotCheckpoint | null {
  const entries = ledger.get(taskKey(taskId));
  if (!entries) return null;
  const idx = entries.findIndex((c) => c.checkpointId === checkpointId);
  if (idx < 0) return null;
  entries[idx] = { ...entries[idx], status: "skipped", note: reason };
  return entries[idx];
}

export function getCheckpoints(taskId: string): BotCheckpoint[] {
  return ledger.get(taskKey(taskId)) ?? [];
}

export function getCheckpointSummary(taskId: string): CheckpointLedgerSummary {
  const entries = ledger.get(taskKey(taskId)) ?? [];
  const passed  = entries.filter((c) => c.status === "passed").length;
  const failed  = entries.filter((c) => c.status === "failed").length;
  const pending = entries.filter((c) => c.status === "pending").length;
  const gates   = entries.filter((c) => c.revenueGate);
  return {
    taskId,
    total: entries.length,
    passed,
    failed,
    pending,
    completionPct: entries.length > 0 ? Math.round((passed / entries.length) * 100) : 0,
    allGatesPassed: gates.every((c) => c.status === "passed"),
  };
}

export function clearCheckpoints(taskId: string): void {
  ledger.delete(taskKey(taskId));
}
