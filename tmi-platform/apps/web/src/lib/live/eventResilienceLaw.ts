/**
 * Event Engine Risk-to-Advantage Hardening — resilience + fault isolation glue.
 * One canonical engine; modules fail closed without terminating healthy sessions.
 */

export type EventHealthStatus = "healthy" | "degraded" | "paused" | "failed";

export type EventHealthSnapshot = {
  roomId: string;
  status: EventHealthStatus;
  automationActive: boolean;
  humanTakeoverAvailable: boolean;
  lastHeartbeatAtMs: number;
  reason?: string;
};

export type EventRecoveryAction =
  | "RETRY"
  | "RESTORE_QUEUE"
  | "PAUSE_AUTOMATION"
  | "HUMAN_TAKEOVER"
  | "HOLD";

const HEARTBEAT_STALE_MS = 15_000;
const heartbeats = new Map<string, number>();
const automationPaused = new Set<string>();
const admissionLocks = new Map<string, string>();

export function recordEventHeartbeat(roomId: string, atMs = Date.now()): void {
  heartbeats.set(roomId, atMs);
}

export function getEventHealth(roomId: string, nowMs = Date.now()): EventHealthSnapshot {
  const last = heartbeats.get(roomId) ?? 0;
  const stale = last === 0 || nowMs - last > HEARTBEAT_STALE_MS;
  const paused = automationPaused.has(roomId);
  if (paused) {
    return {
      roomId,
      status: "paused",
      automationActive: false,
      humanTakeoverAvailable: true,
      lastHeartbeatAtMs: last,
      reason: "Automation paused — authorized human takeover available",
    };
  }
  if (stale) {
    return {
      roomId,
      status: "degraded",
      automationActive: true,
      humanTakeoverAvailable: true,
      lastHeartbeatAtMs: last,
      reason: "Heartbeat stale",
    };
  }
  return {
    roomId,
    status: "healthy",
    automationActive: true,
    humanTakeoverAvailable: true,
    lastHeartbeatAtMs: last,
  };
}

export function recommendRecovery(health: EventHealthSnapshot): EventRecoveryAction {
  if (health.status === "healthy") return "HOLD";
  if (health.status === "paused") return "HUMAN_TAKEOVER";
  if (health.status === "degraded") return "RETRY";
  return "PAUSE_AUTOMATION";
}

export function pauseAutomationForHumanTakeover(roomId: string): void {
  automationPaused.add(roomId);
}

export function resumeAutomation(roomId: string): void {
  automationPaused.delete(roomId);
  recordEventHeartbeat(roomId);
}

/** Prevent duplicate stage admissions for the same participant/token. */
export function claimStageAdmissionOnce(
  roomId: string,
  admissionKey: string,
): { ok: boolean; reason: string } {
  const existing = admissionLocks.get(`${roomId}:${admissionKey}`);
  if (existing) {
    return { ok: false, reason: "Duplicate stage admission blocked" };
  }
  admissionLocks.set(`${roomId}:${admissionKey}`, admissionKey);
  return { ok: true, reason: "Admission claimed" };
}

/** Test / session reset helper — does not wipe live room records. */
export function resetEventResilienceForTests(): void {
  heartbeats.clear();
  automationPaused.clear();
  admissionLocks.clear();
}
