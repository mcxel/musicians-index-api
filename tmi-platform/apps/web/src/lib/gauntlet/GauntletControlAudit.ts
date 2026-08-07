/**
 * GauntletControlAudit — Observatory control actions (pause / extend / advance).
 * Append-only audit log for ops transparency.
 */

export type GauntletControlAction =
  | "PAUSE"
  | "RESUME"
  | "EXTEND_CLOCK"
  | "ADVANCE_PHASE"
  | "OPEN_ENTRY"
  | "CLOSE_ENTRY";

export type GauntletAuditEntry = {
  id: string;
  roomId: string;
  runId?: string;
  action: GauntletControlAction;
  actorId: string;
  detail?: string;
  at: number;
};

const auditLog: GauntletAuditEntry[] = [];
const MAX_ENTRIES = 200;

export function logGauntletControl(input: {
  roomId: string;
  runId?: string;
  action: GauntletControlAction;
  actorId: string;
  detail?: string;
}): GauntletAuditEntry {
  const entry: GauntletAuditEntry = {
    id: `gca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomId: input.roomId,
    runId: input.runId,
    action: input.action,
    actorId: input.actorId,
    detail: input.detail,
    at: Date.now(),
  };
  auditLog.unshift(entry);
  if (auditLog.length > MAX_ENTRIES) auditLog.length = MAX_ENTRIES;
  return entry;
}

export function getGauntletAuditLog(roomId?: string): GauntletAuditEntry[] {
  if (!roomId) return [...auditLog];
  return auditLog.filter((e) => e.roomId === roomId);
}

export function getGauntletControlCounts(roomId: string): {
  pause: number;
  extend: number;
  advance: number;
} {
  const rows = getGauntletAuditLog(roomId);
  return {
    pause: rows.filter((r) => r.action === "PAUSE" || r.action === "RESUME").length,
    extend: rows.filter((r) => r.action === "EXTEND_CLOCK").length,
    advance: rows.filter((r) => r.action === "ADVANCE_PHASE").length,
  };
}
