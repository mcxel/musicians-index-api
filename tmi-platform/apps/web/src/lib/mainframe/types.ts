/**
 * Mainframe coordination contracts — thin architecture home for Platform Core.
 *
 * Documents request flow + ownership. Does NOT execute business logic.
 * Frameworks own runtime; Mainframe only routes / audits / recovers.
 */

export type CertificationStatus =
  | "DRAFT"
  | "TESTING"
  | "CERTIFIED"
  | "DEPRECATED";

/** Who is acting on a coordinated request */
export type ActorKind =
  | "USER"
  | "ADMIN"
  | "BOT"
  | "SYSTEM"
  | "FRAMEWORK"
  | "SCHEDULER";

export interface ActorContext {
  actorId: string;
  kind: ActorKind;
  role?: string;
  sessionId?: string;
  /** Honest label for Observatory — never impersonate */
  displayLabel?: string;
}

export interface PermissionGrant {
  permission: string;
  granted: boolean;
  reason?: string;
}

export interface RuntimeContext {
  roomId?: string;
  venueId?: string;
  experienceId?: string;
  mode?: string;
  locale?: string;
  reducedMotion?: boolean;
  captionsEnabled?: boolean;
  correlationId?: string;
}

/** Canonical record ownership — which registry/engine owns the truth */
export interface CanonicalRecordRef {
  domain: string;
  recordId: string;
  ownerFrameworkId: string;
  sourcePath?: string;
}

export interface FrameworkRouteTarget {
  frameworkId: string;
  capability?: string;
  handlerHint?: string;
}

export interface AuditHook {
  eventName: string;
  at: number;
  actor: ActorContext;
  frameworkId?: string;
  detail?: Record<string, unknown>;
}

export interface TelemetryHook {
  metric: string;
  value?: number | string | boolean;
  tags?: Record<string, string>;
  at: number;
}

export interface RecoveryNote {
  code: string;
  message: string;
  suggestedAction?: string;
  rollbackStrategy?: string;
}

/**
 * Coordinated request envelope — documents flow:
 * Actor → Permissions → RuntimeContext → Framework route → Audit/Telemetry
 */
export interface MainframeRequest {
  requestId: string;
  at: number;
  actor: ActorContext;
  action: string;
  target: FrameworkRouteTarget;
  runtime?: RuntimeContext;
  permissions?: PermissionGrant[];
  recordRefs?: CanonicalRecordRef[];
  payload?: Record<string, unknown>;
}

export interface MainframeResponse {
  requestId: string;
  ok: boolean;
  routedTo?: string;
  result?: Record<string, unknown>;
  audit?: AuditHook;
  telemetry?: TelemetryHook[];
  recovery?: RecoveryNote[];
  error?: string;
}

/** Optional handler registered by a framework — Mainframe never invents handlers */
export type FrameworkHandler = (
  request: MainframeRequest
) => MainframeResponse | Promise<MainframeResponse>;
