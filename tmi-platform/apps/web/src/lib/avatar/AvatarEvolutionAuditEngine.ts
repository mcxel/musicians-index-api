/**
 * AvatarEvolutionAuditEngine
 * Immutable audit log for all avatar evolution events.
 * Every change visible to admins. No silent mutations. Rollback supported.
 */

export type AuditEventType =
  | "skill_xp_awarded"
  | "skill_leveled"
  | "visual_evolved"
  | "visual_rolled_back"
  | "behavior_tuned"
  | "tuning_reset"
  | "learning_record_created"
  | "safety_flag"
  | "feedback_received"
  | "memory_cleared"
  | "confidence_changed";

export interface AuditEntry {
  id: string;
  avatarId: string;
  eventType: AuditEventType;
  description: string;
  previousState: string;
  nextState: string;
  triggeredBy: "system" | "user" | "admin" | "learning" | "feedback";
  timestamp: number;
  safetyFlag: boolean;
  adminOnly: boolean;
}

const auditLog: AuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 2000;

let _seq = 0;
function makeId(): string {
  return `audit_${Date.now().toString(36)}_${(_seq++).toString(36)}`;
}

export function writeAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const full: AuditEntry = { ...entry, id: makeId(), timestamp: Date.now() };
  auditLog.unshift(full);
  if (auditLog.length > MAX_AUDIT_ENTRIES) auditLog.pop();
  return full;
}

export function getAuditLog(options?: {
  avatarId?: string;
  eventType?: AuditEventType;
  safetyFlagsOnly?: boolean;
  limit?: number;
}): AuditEntry[] {
  let results = auditLog;
  if (options?.avatarId) results = results.filter(e => e.avatarId === options.avatarId);
  if (options?.eventType) results = results.filter(e => e.eventType === options.eventType);
  if (options?.safetyFlagsOnly) results = results.filter(e => e.safetyFlag);
  return results.slice(0, options?.limit ?? 100);
}

export function getSafetyFlags(): AuditEntry[] {
  return auditLog.filter(e => e.safetyFlag);
}

export function getAvatarAuditSummary(avatarId: string): {
  totalEvents: number;
  safetyFlags: number;
  lastEvent: AuditEntry | null;
  skillLevels: number;
  visualEvolutions: number;
} {
  const entries = auditLog.filter(e => e.avatarId === avatarId);
  return {
    totalEvents: entries.length,
    safetyFlags: entries.filter(e => e.safetyFlag).length,
    lastEvent: entries[0] ?? null,
    skillLevels: entries.filter(e => e.eventType === "skill_leveled").length,
    visualEvolutions: entries.filter(e => e.eventType === "visual_evolved").length,
  };
}

export function getAllAvatarsSummary(): { avatarId: string; eventCount: number; lastActivity: number }[] {
  const map = new Map<string, { count: number; last: number }>();
  for (const e of auditLog) {
    const curr = map.get(e.avatarId) ?? { count: 0, last: 0 };
    map.set(e.avatarId, { count: curr.count + 1, last: Math.max(curr.last, e.timestamp) });
  }
  return [...map.entries()].map(([id, data]) => ({ avatarId: id, eventCount: data.count, lastActivity: data.last }));
}
