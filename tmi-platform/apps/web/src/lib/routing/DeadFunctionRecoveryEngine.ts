export type DeadFunctionCategory =
  | "missing-import" | "empty-export" | "stub-function" | "broken-chain"
  | "missing-consumer" | "orphaned-engine";

export interface DeadFunctionRecord {
  functionId: string;
  filePath: string;
  functionName: string;
  category: DeadFunctionCategory;
  description: string;
  suggestedFix: string;
  priority: "low" | "medium" | "high";
  resolved: boolean;
  registeredAt: string;
  resolvedAt?: string;
}

const records: DeadFunctionRecord[] = [];

function gen(): string {
  return `dfr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function registerDeadFunction(
  filePath: string,
  functionName: string,
  category: DeadFunctionCategory,
  description: string,
  suggestedFix: string,
  priority: DeadFunctionRecord["priority"] = "medium",
): DeadFunctionRecord {
  const existing = records.find((r) => r.filePath === filePath && r.functionName === functionName);
  if (existing && !existing.resolved) return existing;

  const record: DeadFunctionRecord = {
    functionId: gen(),
    filePath,
    functionName,
    category,
    description,
    suggestedFix,
    priority,
    resolved: false,
    registeredAt: new Date().toISOString(),
  };
  records.unshift(record);
  return record;
}

export function resolveDeadFunction(functionId: string): boolean {
  const idx = records.findIndex((r) => r.functionId === functionId);
  if (idx < 0) return false;
  records[idx] = { ...records[idx], resolved: true, resolvedAt: new Date().toISOString() };
  return true;
}

export function getUnresolved(): DeadFunctionRecord[] {
  return records.filter((r) => !r.resolved);
}

export function getByCategory(category: DeadFunctionCategory): DeadFunctionRecord[] {
  return records.filter((r) => r.category === category && !r.resolved);
}

export function getHighPriority(): DeadFunctionRecord[] {
  return records.filter((r) => r.priority === "high" && !r.resolved);
}

export function getRecoveryReport(): { total: number; unresolved: number; byCategory: Partial<Record<DeadFunctionCategory, number>> } {
  const unresolved = records.filter((r) => !r.resolved);
  const byCategory: Partial<Record<DeadFunctionCategory, number>> = {};
  for (const r of unresolved) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  return { total: records.length, unresolved: unresolved.length, byCategory };
}
