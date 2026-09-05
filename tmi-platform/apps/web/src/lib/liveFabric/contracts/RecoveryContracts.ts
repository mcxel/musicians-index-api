/**
 * RecoveryContracts.ts — MEDIA / LIVE / CAST / VENUE / DISC / NET recovery codes
 */

import { FABRIC_CONTRACT_VERSIONS } from "./ContractVersions";

export type RecoverySeverity = "LOW" | "MEDIUM" | "HIGH" | "FATAL";

export type RecoveryCodePrefix =
  | "MEDIA"
  | "LIVE"
  | "CAST"
  | "VENUE"
  | "DISC"
  | "NET";

export interface RecoveryCodeDefinition {
  code: string;
  prefix: RecoveryCodePrefix;
  severity: RecoverySeverity;
  retryable: boolean;
  maxRetries: number;
  fallbackAction:
    | "NONE"
    | "RECONNECT_SOURCE"
    | "DEMOTE_SOURCE"
    | "SWITCH_LAYOUT"
    | "DROP_CAST"
    | "END_SESSION"
    | "PARK_FRAME";
  telemetryCategory: string;
}

export interface RecoveryIncident {
  incidentId: string;
  sessionId: string;
  generation: number;
  code: string;
  severity: RecoverySeverity;
  detectedAtMs: number;
  sourceId?: string;
  retryCount: number;
  resolved: boolean;
  /** True when a fallback/retry path was engaged. */
  fallbackApplied: boolean;
  fallbackAction?: string;
  message: string;
}

export const LIVE_RECOVERY_CONTRACT_VERSION = FABRIC_CONTRACT_VERSIONS.LIVE_RECOVERY;
