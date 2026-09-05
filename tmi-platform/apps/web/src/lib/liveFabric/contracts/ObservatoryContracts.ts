/**
 * ObservatoryContracts.ts — Telemetry + command authority (contracts only this phase)
 */

export type ObservatorySeverity = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface ObservatoryTelemetryEvent {
  eventId: string;
  sessionId: string;
  generation: number;
  revision: number;
  category:
    | "LIFECYCLE"
    | "MEDIA"
    | "AUDIO"
    | "RIGHTS"
    | "RECOVERY"
    | "BUDGET"
    | "MODERATION"
    | "COMMAND";
  code: string;
  severity: ObservatorySeverity;
  message: string;
  payload?: Record<string, unknown>;
  issuedAtMs: number;
  mediaClockMs: number;
}

/**
 * Observatory commands MUST be authorized, audited, session-bound, revision-checked.
 * Contracts only — no production Observatory wiring this phase.
 */
export interface ObservatoryCommandAuthority {
  authorized: boolean;
  audited: boolean;
  sessionBound: boolean;
  revisionChecked: boolean;
  operatorId: string;
  authorityScope: "READ" | "SUGGEST" | "EXECUTE";
  auditTrailId: string;
}

export interface ObservatoryCommandEnvelope<T = unknown> {
  commandId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  issuedAtMs: number;
  type: string;
  payload: T;
  authority: ObservatoryCommandAuthority;
}

export function isObservatoryCommandAuthorized(
  cmd: ObservatoryCommandEnvelope
): { ok: boolean; reason?: string } {
  const a = cmd.authority;
  if (!a.authorized) return { ok: false, reason: "NOT_AUTHORIZED" };
  if (!a.audited) return { ok: false, reason: "NOT_AUDITED" };
  if (!a.sessionBound) return { ok: false, reason: "NOT_SESSION_BOUND" };
  if (!a.revisionChecked) return { ok: false, reason: "REVISION_NOT_CHECKED" };
  if (a.authorityScope === "READ") return { ok: false, reason: "READ_SCOPE_CANNOT_EXECUTE" };
  return { ok: true };
}
