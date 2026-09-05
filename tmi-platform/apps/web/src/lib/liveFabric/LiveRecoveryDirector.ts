/**
 * LiveRecoveryDirector.ts — Detection / severity / retry / fallback / telemetry codes
 */

import type {
  RecoveryCodeDefinition,
  RecoveryIncident,
  RecoverySeverity,
} from "./contracts/RecoveryContracts";
import { LIVE_RECOVERY_CONTRACT_VERSION } from "./contracts/RecoveryContracts";
import type { ObservatoryTelemetryEvent } from "./contracts/ObservatoryContracts";

export const RECOVERY_CODE_CATALOG: Record<string, RecoveryCodeDefinition> = {
  "MEDIA-CAM-LOSS": {
    code: "MEDIA-CAM-LOSS",
    prefix: "MEDIA",
    severity: "HIGH",
    retryable: true,
    maxRetries: 3,
    fallbackAction: "DEMOTE_SOURCE",
    telemetryCategory: "MEDIA",
  },
  "MEDIA-MIC-LOSS": {
    code: "MEDIA-MIC-LOSS",
    prefix: "MEDIA",
    severity: "HIGH",
    retryable: true,
    maxRetries: 3,
    fallbackAction: "RECONNECT_SOURCE",
    telemetryCategory: "MEDIA",
  },
  "MEDIA-BUDGET-OOM": {
    code: "MEDIA-BUDGET-OOM",
    prefix: "MEDIA",
    severity: "HIGH",
    retryable: false,
    maxRetries: 0,
    fallbackAction: "PARK_FRAME",
    telemetryCategory: "BUDGET",
  },
  "LIVE-PUBLISH-FAIL": {
    code: "LIVE-PUBLISH-FAIL",
    prefix: "LIVE",
    severity: "FATAL",
    retryable: true,
    maxRetries: 2,
    fallbackAction: "END_SESSION",
    telemetryCategory: "LIFECYCLE",
  },
  "LIVE-DUP-END": {
    code: "LIVE-DUP-END",
    prefix: "LIVE",
    severity: "LOW",
    retryable: false,
    maxRetries: 0,
    fallbackAction: "NONE",
    telemetryCategory: "LIFECYCLE",
  },
  "CAST-LOST": {
    code: "CAST-LOST",
    prefix: "CAST",
    severity: "MEDIUM",
    retryable: true,
    maxRetries: 2,
    fallbackAction: "DROP_CAST",
    telemetryCategory: "MEDIA",
  },
  "VENUE-RENDER-STALL": {
    code: "VENUE-RENDER-STALL",
    prefix: "VENUE",
    severity: "MEDIUM",
    retryable: true,
    maxRetries: 3,
    fallbackAction: "SWITCH_LAYOUT",
    telemetryCategory: "MEDIA",
  },
  "DISC-HOST-LEFT": {
    code: "DISC-HOST-LEFT",
    prefix: "DISC",
    severity: "HIGH",
    retryable: false,
    maxRetries: 0,
    fallbackAction: "END_SESSION",
    telemetryCategory: "LIFECYCLE",
  },
  "DISC-RIGHTS-LOSS": {
    code: "DISC-RIGHTS-LOSS",
    prefix: "DISC",
    severity: "FATAL",
    retryable: false,
    maxRetries: 0,
    fallbackAction: "DEMOTE_SOURCE",
    telemetryCategory: "RIGHTS",
  },
  "NET-DROP": {
    code: "NET-DROP",
    prefix: "NET",
    severity: "HIGH",
    retryable: true,
    maxRetries: 5,
    fallbackAction: "RECONNECT_SOURCE",
    telemetryCategory: "RECOVERY",
  },
  "NET-HANDOFF": {
    code: "NET-HANDOFF",
    prefix: "NET",
    severity: "MEDIUM",
    retryable: true,
    maxRetries: 3,
    fallbackAction: "RECONNECT_SOURCE",
    telemetryCategory: "RECOVERY",
  },
};

export class LiveRecoveryDirector {
  private readonly incidents: RecoveryIncident[] = [];
  private readonly telemetry: ObservatoryTelemetryEvent[] = [];
  private readonly retryCounts = new Map<string, number>();

  constructor(
    private readonly sessionId: string,
    private generation = 1
  ) {}

  public getContractVersion(): string {
    return LIVE_RECOVERY_CONTRACT_VERSION;
  }

  public setGeneration(generation: number): void {
    this.generation = generation;
  }

  public detect(
    code: string,
    message: string,
    opts?: { sourceId?: string; mediaClockMs?: number; revision?: number }
  ): RecoveryIncident {
    const def = RECOVERY_CODE_CATALOG[code];
    const severity: RecoverySeverity = def?.severity ?? "MEDIUM";
    const key = `${code}:${opts?.sourceId ?? "*"}`;
    const retryCount = this.retryCounts.get(key) ?? 0;

    const incident: RecoveryIncident = {
      incidentId: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId: this.sessionId,
      generation: this.generation,
      code,
      severity,
      detectedAtMs: Date.now(),
      sourceId: opts?.sourceId,
      retryCount,
      resolved: false,
      fallbackApplied: false,
      message,
    };

    let fallbackAction: string | undefined;
    let fallbackApplied = false;
    if (def) {
      if (def.retryable && retryCount < def.maxRetries) {
        this.retryCounts.set(key, retryCount + 1);
        incident.retryCount = retryCount + 1;
        fallbackAction = "RETRY";
        fallbackApplied = true;
      } else {
        fallbackAction = def.fallbackAction;
        fallbackApplied = def.fallbackAction !== "NONE";
        incident.resolved = def.fallbackAction !== "NONE";
      }
      incident.fallbackAction = fallbackAction;
      incident.fallbackApplied = fallbackApplied;
    }

    this.incidents.push(incident);
    this.telemetry.push({
      eventId: `tel-${incident.incidentId}`,
      sessionId: this.sessionId,
      generation: this.generation,
      revision: opts?.revision ?? 0,
      category: (def?.telemetryCategory as ObservatoryTelemetryEvent["category"]) ?? "RECOVERY",
      code,
      severity:
        severity === "FATAL"
          ? "CRITICAL"
          : severity === "HIGH"
            ? "ERROR"
            : severity === "MEDIUM"
              ? "WARN"
              : "INFO",
      message,
      payload: { sourceId: opts?.sourceId, fallbackAction, fallbackApplied },
      issuedAtMs: Date.now(),
      mediaClockMs: opts?.mediaClockMs ?? 0,
    });

    return { ...incident };
  }

  public listIncidents(): RecoveryIncident[] {
    return this.incidents.map((i) => ({ ...i }));
  }

  public drainTelemetry(): ObservatoryTelemetryEvent[] {
    return this.telemetry.splice(0, this.telemetry.length);
  }
}
