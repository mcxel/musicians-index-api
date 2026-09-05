/**
 * FunctionHealthRegistry — canonical function/command health ledger (NO ORPHAN FUNCTIONALITY law).
 * Every production function: REAL CALLER → REAL AUTHORIZATION → REAL RUNTIME → REAL RESULT → VERIFIABLE.
 */

export type PowerState = "ON" | "OFF" | "DEGRADED" | "IMPLEMENTED_NOT_INTEGRATED";
export type DetailState =
  | "ACTIVE+CANONICAL"
  | "HARVEST+REHOME"
  | "DUPLICATE"
  | "ORPHAN"
  | "DEAD"
  | "TEST-ONLY"
  | "DEV-ONLY"
  | "SYSTEM-ONLY"
  | "UNKNOWN";

export type CallerType =
  | "button"
  | "system-trigger"
  | "api-route"
  | "event-handler"
  | "workspace-opener"
  | "panel-opener"
  | "route-navigate";

export interface FunctionHealthRecord {
  functionId: string;
  commandId?: string;
  owner: string;
  sourceFile: string;
  callerCount: number;
  callerTypes: CallerType[];
  surfaceIds: string[];
  systemTriggerIds: string[];
  requiredCapability?: string;
  dependencies: string[];
  expectedOutcome: string;
  lastInvocation?: string;
  lastSuccess?: string;
  lastFailure?: string;
  powerState: PowerState;
  detailState: DetailState;
}

const REGISTRY = new Map<string, FunctionHealthRecord>();

export function registerFunctionHealth(record: FunctionHealthRecord): void {
  REGISTRY.set(record.functionId, { ...record });
}

export function registerCommandHealth(
  commandId: string,
  partial: Omit<FunctionHealthRecord, "functionId" | "commandId"> & { functionId?: string },
): void {
  const functionId = partial.functionId ?? commandId;
  const existing = REGISTRY.get(functionId);
  REGISTRY.set(functionId, {
    functionId,
    commandId,
    owner: partial.owner,
    sourceFile: partial.sourceFile,
    callerCount: partial.callerCount ?? existing?.callerCount ?? 0,
    callerTypes: partial.callerTypes ?? existing?.callerTypes ?? [],
    surfaceIds: partial.surfaceIds ?? existing?.surfaceIds ?? [],
    systemTriggerIds: partial.systemTriggerIds ?? existing?.systemTriggerIds ?? [],
    requiredCapability: partial.requiredCapability ?? existing?.requiredCapability,
    dependencies: partial.dependencies ?? existing?.dependencies ?? [],
    expectedOutcome: partial.expectedOutcome,
    lastInvocation: partial.lastInvocation ?? existing?.lastInvocation,
    lastSuccess: partial.lastSuccess ?? existing?.lastSuccess,
    lastFailure: partial.lastFailure ?? existing?.lastFailure,
    powerState: partial.powerState,
    detailState: partial.detailState,
  });
}

export function getFunctionHealth(functionId: string): FunctionHealthRecord | undefined {
  return REGISTRY.get(functionId);
}

export function getFunctionHealthByCommand(commandId: string): FunctionHealthRecord | undefined {
  for (const record of REGISTRY.values()) {
    if (record.commandId === commandId) return record;
  }
  return undefined;
}

export function listFunctionHealth(): FunctionHealthRecord[] {
  return Array.from(REGISTRY.values());
}

export function recordFunctionInvocation(functionId: string, success: boolean): void {
  const record = REGISTRY.get(functionId);
  if (!record) return;
  const now = new Date().toISOString();
  record.lastInvocation = now;
  if (success) {
    record.lastSuccess = now;
    if (record.powerState === "DEGRADED") record.powerState = "ON";
  } else {
    record.lastFailure = now;
    record.powerState = "DEGRADED";
  }
}

export function incrementFunctionCaller(
  functionId: string,
  callerType: CallerType,
  surfaceId?: string,
): void {
  const record = REGISTRY.get(functionId);
  if (!record) return;
  record.callerCount += 1;
  if (!record.callerTypes.includes(callerType)) {
    record.callerTypes = [...record.callerTypes, callerType];
  }
  if (surfaceId && !record.surfaceIds.includes(surfaceId)) {
    record.surfaceIds = [...record.surfaceIds, surfaceId];
  }
}

export function setFunctionPowerState(functionId: string, powerState: PowerState): void {
  const record = REGISTRY.get(functionId);
  if (record) record.powerState = powerState;
}

export function getFunctionHealthCounts(): {
  total: number;
  on: number;
  off: number;
  degraded: number;
  notIntegrated: number;
  orphan: number;
} {
  const all = listFunctionHealth();
  return {
    total: all.length,
    on: all.filter((r) => r.powerState === "ON").length,
    off: all.filter((r) => r.powerState === "OFF").length,
    degraded: all.filter((r) => r.powerState === "DEGRADED").length,
    notIntegrated: all.filter((r) => r.powerState === "IMPLEMENTED_NOT_INTEGRATED").length,
    orphan: all.filter((r) => r.detailState === "ORPHAN" || r.callerCount === 0).length,
  };
}

/** Admin SYSTEMS hook — export snapshot for observatory mount. */
export function exportFunctionHealthSnapshot(): {
  generatedAt: string;
  counts: ReturnType<typeof getFunctionHealthCounts>;
  records: FunctionHealthRecord[];
} {
  return {
    generatedAt: new Date().toISOString(),
    counts: getFunctionHealthCounts(),
    records: listFunctionHealth(),
  };
}
