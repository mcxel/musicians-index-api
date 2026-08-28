/**
 * OrphanDetection — ORPHAN-001..008 error family + audit engine (NO ORPHAN FUNCTIONALITY law).
 */

import {
  listFunctionHealth,
  type DetailState,
  type FunctionHealthRecord,
  type PowerState,
} from "./FunctionHealthRegistry";
import { SHELL_BUTTON_COMMANDS, type ButtonCommandDefinition } from "./ButtonCommandRegistry";

export const ORPHAN_ERROR_FAMILY = {
  ORPHAN_001: "Function exported with zero registered callers",
  ORPHAN_002: "Command registered with zero button or trigger binding",
  ORPHAN_003: "Button visible in production with no commandId mapping",
  ORPHAN_004: "Command has handler but produces no verifiable outcome",
  ORPHAN_005: "Duplicate commandId registered under multiple surfaces",
  ORPHAN_006: "System-only function missing registered trigger",
  ORPHAN_007: "Function marked ON but powerState is OFF or DEGRADED",
  ORPHAN_008: "Backend implemented with no UI integration path",
} as const;

export type OrphanErrorCode = keyof typeof ORPHAN_ERROR_FAMILY;

export interface OrphanFinding {
  code: OrphanErrorCode;
  targetId: string;
  message: string;
  classification: DetailState;
  sourceFile?: string;
  surfaceId?: string;
}

export interface OrphanAuditResult {
  auditedAt: string;
  findings: OrphanFinding[];
  counts: {
    orphans: number;
    wired: number;
    off: number;
    unknown: number;
    buttonsWithoutCommand: number;
    commandsWithoutCaller: number;
  };
}

export function classifyFunction(record: FunctionHealthRecord): DetailState {
  if (record.detailState !== "UNKNOWN") return record.detailState;
  if (record.powerState === "OFF" || record.powerState === "IMPLEMENTED_NOT_INTEGRATED") {
    return record.systemTriggerIds.length > 0 ? "SYSTEM-ONLY" : "DEAD";
  }
  if (record.callerCount === 0) return "ORPHAN";
  return "ACTIVE+CANONICAL";
}

function auditCommandsWithoutCallers(commands: ButtonCommandDefinition[]): OrphanFinding[] {
  const findings: OrphanFinding[] = [];
  const byCommandId = new Map<string, ButtonCommandDefinition[]>();

  for (const cmd of commands) {
    const list = byCommandId.get(cmd.commandId) ?? [];
    list.push(cmd);
    byCommandId.set(cmd.commandId, list);
  }

  for (const [commandId, defs] of byCommandId) {
    if (defs.length > 1) {
      findings.push({
        code: "ORPHAN_005",
        targetId: commandId,
        message: `Duplicate commandId on ${defs.length} surfaces`,
        classification: "DUPLICATE",
        sourceFile: defs.map((d) => d.sourceFile).join(", "),
      });
    }

    const health = listFunctionHealth().find((r) => r.commandId === commandId);
    if (!health || health.callerCount === 0) {
      findings.push({
        code: "ORPHAN_002",
        targetId: commandId,
        message: ORPHAN_ERROR_FAMILY.ORPHAN_002,
        classification: health?.detailState ?? "ORPHAN",
        sourceFile: defs[0]?.sourceFile,
        surfaceId: defs[0]?.surface,
      });
    }
  }

  return findings;
}

function auditFunctionsWithoutCallers(records: FunctionHealthRecord[]): OrphanFinding[] {
  const findings: OrphanFinding[] = [];

  for (const record of records) {
    const classification = classifyFunction(record);

    if (record.callerCount === 0 && record.powerState === "ON") {
      findings.push({
        code: "ORPHAN_001",
        targetId: record.functionId,
        message: ORPHAN_ERROR_FAMILY.ORPHAN_001,
        classification: "ORPHAN",
        sourceFile: record.sourceFile,
      });
    }

    if (
      record.powerState === "IMPLEMENTED_NOT_INTEGRATED" &&
      record.detailState !== "SYSTEM-ONLY"
    ) {
      findings.push({
        code: "ORPHAN_008",
        targetId: record.functionId,
        message: ORPHAN_ERROR_FAMILY.ORPHAN_008,
        classification: "DEV-ONLY",
        sourceFile: record.sourceFile,
      });
    }

    if (
      record.detailState === "SYSTEM-ONLY" &&
      record.systemTriggerIds.length === 0
    ) {
      findings.push({
        code: "ORPHAN_006",
        targetId: record.functionId,
        message: ORPHAN_ERROR_FAMILY.ORPHAN_006,
        classification: "SYSTEM-ONLY",
        sourceFile: record.sourceFile,
      });
    }

    if (record.powerState === "ON" && classification === "ORPHAN") {
      findings.push({
        code: "ORPHAN_007",
        targetId: record.functionId,
        message: ORPHAN_ERROR_FAMILY.ORPHAN_007,
        classification: "ORPHAN",
        sourceFile: record.sourceFile,
      });
    }

    if (classification === "UNKNOWN") {
      findings.push({
        code: "ORPHAN_001",
        targetId: record.functionId,
        message: "Unclassified function health record",
        classification: "UNKNOWN",
        sourceFile: record.sourceFile,
      });
    }
  }

  return findings;
}

export function auditOrphanFunctions(
  commands: ButtonCommandDefinition[] = SHELL_BUTTON_COMMANDS,
): OrphanAuditResult {
  const records = listFunctionHealth();
  const commandFindings = auditCommandsWithoutCallers(commands);
  const functionFindings = auditFunctionsWithoutCallers(records);
  const findings = [...commandFindings, ...functionFindings];

  const wiredCommands = new Set(
    records.filter((r) => r.commandId && r.callerCount > 0).map((r) => r.commandId),
  );
  const registeredCommandIds = new Set(commands.map((c) => c.commandId));
  const commandsWithoutCaller = [...registeredCommandIds].filter((id) => !wiredCommands.has(id)).length;

  const buttonsWithoutCommand = commands.filter(
    (c) => !c.buttonId || !c.expectedOutcome,
  ).length;

  return {
    auditedAt: new Date().toISOString(),
    findings,
    counts: {
      orphans: findings.filter((f) => f.classification === "ORPHAN").length,
      wired: records.filter((r) => r.callerCount > 0 && r.powerState === "ON").length,
      off: records.filter((r) => r.powerState === "OFF").length,
      unknown: findings.filter((f) => f.classification === "UNKNOWN").length,
      buttonsWithoutCommand,
      commandsWithoutCaller,
    },
  };
}

export function resolvePowerStateForButton(
  commandId: string,
  fallback: PowerState = "ON",
): PowerState {
  const record = listFunctionHealth().find((r) => r.commandId === commandId);
  if (!record) return fallback;
  return record.powerState;
}
