export type SignOffStatus = "pending" | "approved" | "rejected" | "escalated";

export interface TaskSignOff {
  signOffId: string;
  taskId: string;
  signedOffBy: string;
  role: string;
  status: SignOffStatus;
  note?: string;
  checklistVerified: boolean;
  revenueGateCleared: boolean;
  signedAt: string;
  resolvedAt?: string;
}

const signOffs = new Map<string, TaskSignOff>();
const taskSignOffs = new Map<string, string[]>();

function gen(): string {
  return `sof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function requestSignOff(
  taskId: string,
  signedOffBy: string,
  role: string,
  opts: { note?: string; checklistVerified?: boolean; revenueGateCleared?: boolean } = {},
): TaskSignOff {
  const record: TaskSignOff = {
    signOffId: gen(),
    taskId,
    signedOffBy,
    role,
    status: "pending",
    note: opts.note,
    checklistVerified: opts.checklistVerified ?? false,
    revenueGateCleared: opts.revenueGateCleared ?? false,
    signedAt: new Date().toISOString(),
  };
  signOffs.set(record.signOffId, record);
  const list = taskSignOffs.get(taskId) ?? [];
  list.unshift(record.signOffId);
  taskSignOffs.set(taskId, list);
  return record;
}

export function approveSignOff(signOffId: string, note?: string): TaskSignOff | null {
  const s = signOffs.get(signOffId);
  if (!s) return null;
  const next: TaskSignOff = { ...s, status: "approved", note: note ?? s.note, resolvedAt: new Date().toISOString() };
  signOffs.set(signOffId, next);
  return next;
}

export function rejectSignOff(signOffId: string, note: string): TaskSignOff | null {
  const s = signOffs.get(signOffId);
  if (!s) return null;
  const next: TaskSignOff = { ...s, status: "rejected", note, resolvedAt: new Date().toISOString() };
  signOffs.set(signOffId, next);
  return next;
}

export function escalateSignOff(signOffId: string): TaskSignOff | null {
  const s = signOffs.get(signOffId);
  if (!s) return null;
  const next: TaskSignOff = { ...s, status: "escalated", resolvedAt: new Date().toISOString() };
  signOffs.set(signOffId, next);
  return next;
}

export function isTaskSignedOff(taskId: string): boolean {
  const ids = taskSignOffs.get(taskId) ?? [];
  return ids.some((id) => signOffs.get(id)?.status === "approved");
}

export function getTaskSignOffs(taskId: string): TaskSignOff[] {
  return (taskSignOffs.get(taskId) ?? []).map((id) => signOffs.get(id)!).filter(Boolean);
}
