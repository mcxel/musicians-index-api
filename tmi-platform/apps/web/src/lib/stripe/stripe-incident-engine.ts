import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';
import { getEventsSince } from '@/lib/stripe/stripe-telemetry-store';

export type StripeIncidentSeverity = 'INFO' | 'WARN' | 'CRITICAL' | 'LOCKDOWN';
export type StripeIncidentCode =
  | 'webhook_failures_spike'
  | 'payment_pipeline_upgrade_missing'
  | 'replay_spike_payout_paused'
  | 'payout_queue_resumed';

export type StripeIncident = {
  id: string;
  code: StripeIncidentCode;
  severity: StripeIncidentSeverity;
  message: string;
  timestamp: number;
  meta: Record<string, unknown>;
};

export type StripePayoutResumeAudit = {
  id: string;
  timestamp: number;
  actorEmail: string;
  actorRole: string;
  actorName: string;
  reason: string;
  previousPauseReason: string;
};

const INCIDENT_LIMIT = 100;
const FAILURE_WINDOW_MS = 5 * 60 * 1000;
const FAILURE_THRESHOLD = 3;
const REPLAY_WINDOW_MS = 10 * 60 * 1000;
const REPLAY_THRESHOLD = 5;
const RESUME_AUDIT_LIMIT = 100;

const incidents: StripeIncident[] = [];
const resumeAudits: StripePayoutResumeAudit[] = [];
const cooldownUntilByCode = new Map<StripeIncidentCode, number>();

let payoutQueuePaused = false;
let payoutQueuePausedAt: number | null = null;
let payoutQueuePauseReason = '';

function inCooldown(code: StripeIncidentCode, now: number): boolean {
  return (cooldownUntilByCode.get(code) ?? 0) > now;
}

function setCooldown(code: StripeIncidentCode, now: number, ttlMs: number): void {
  cooldownUntilByCode.set(code, now + ttlMs);
}

function recordIncident(input: {
  code: StripeIncidentCode;
  severity: StripeIncidentSeverity;
  message: string;
  meta?: Record<string, unknown>;
}): StripeIncident {
  const incident: StripeIncident = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    code: input.code,
    severity: input.severity,
    message: input.message,
    timestamp: Date.now(),
    meta: input.meta ?? {},
  };
  incidents.unshift(incident);
  if (incidents.length > INCIDENT_LIMIT) incidents.length = INCIDENT_LIMIT;

  emitAdminLiveEvent({
    type: 'alert',
    message: `[STRIPE INCIDENT] ${incident.message}`,
    meta: {
      code: incident.code,
      severity: incident.severity,
    },
  });

  return incident;
}

function countWebhookFailuresInWindow(now: number): number {
  const since = now - FAILURE_WINDOW_MS;
  const failureKinds = new Set([
    'invalid_signature_rejected',
    'malformed_payload_rejected',
    'upstream_failure',
    'upstream_timeout',
  ]);
  return getEventsSince(since).filter((e) => failureKinds.has(e.kind)).length;
}

function countReplaySignalsInWindow(now: number): number {
  const since = now - REPLAY_WINDOW_MS;
  const replayKinds = new Set(['duplicate_event_rejected', 'replay_attack_detected']);
  return getEventsSince(since).filter((e) => replayKinds.has(e.kind)).length;
}

export function evaluateStripeIncident(eventKind: string, meta: Record<string, unknown>): void {
  const now = Date.now();

  const failureCount = countWebhookFailuresInWindow(now);
  if (failureCount >= FAILURE_THRESHOLD && !inCooldown('webhook_failures_spike', now)) {
    recordIncident({
      code: 'webhook_failures_spike',
      severity: 'WARN',
      message: `Webhook failures reached ${failureCount} in last 5 minutes`,
      meta: { failureCount },
    });
    setCooldown('webhook_failures_spike', now, 5 * 60 * 1000);
  }

  if (eventKind === 'webhook_verified' && meta.eventType === 'checkout.session.completed' && meta.userUpgraded !== true) {
    if (!inCooldown('payment_pipeline_upgrade_missing', now)) {
      recordIncident({
        code: 'payment_pipeline_upgrade_missing',
        severity: 'CRITICAL',
        message: 'Payment succeeded but user tier upgrade did not complete',
        meta: {
          eventType: meta.eventType,
          userUpgraded: meta.userUpgraded ?? false,
        },
      });
      setCooldown('payment_pipeline_upgrade_missing', now, 3 * 60 * 1000);
    }
  }

  const replayCount = countReplaySignalsInWindow(now);
  if (replayCount >= REPLAY_THRESHOLD && !payoutQueuePaused) {
    payoutQueuePaused = true;
    payoutQueuePausedAt = now;
    payoutQueuePauseReason = `Replay/duplicate spike (${replayCount} in 10 minutes)`;

    recordIncident({
      code: 'replay_spike_payout_paused',
      severity: 'LOCKDOWN',
      message: `Payout queue paused due to replay spike (${replayCount} in 10 minutes)`,
      meta: { replayCount },
    });
  }
}

export function isStripePayoutQueuePaused(): boolean {
  return payoutQueuePaused;
}

export function resumeStripePayoutQueue(params: {
  actorEmail: string;
  actorRole: string;
  actorName?: string;
  reason: string;
}): { resumed: boolean; audit: StripePayoutResumeAudit | null } {
  if (!payoutQueuePaused) {
    return { resumed: false, audit: null };
  }

  const audit: StripePayoutResumeAudit = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    actorName: params.actorName ?? params.actorEmail.split('@')[0] ?? 'admin',
    reason: params.reason,
    previousPauseReason: payoutQueuePauseReason,
  };

  payoutQueuePaused = false;
  payoutQueuePausedAt = null;
  payoutQueuePauseReason = '';

  resumeAudits.unshift(audit);
  if (resumeAudits.length > RESUME_AUDIT_LIMIT) resumeAudits.length = RESUME_AUDIT_LIMIT;

  recordIncident({
    code: 'payout_queue_resumed',
    severity: 'INFO',
    message: `Payout queue resumed by ${audit.actorName}`,
    meta: {
      actorEmail: audit.actorEmail,
      actorRole: audit.actorRole,
      reason: audit.reason,
    },
  });

  return { resumed: true, audit };
}

export function getStripeIncidentStatus(): {
  payoutQueuePaused: boolean;
  payoutQueuePausedAt: number | null;
  payoutQueuePauseReason: string;
  recentIncidents: StripeIncident[];
  recentResumeAudits: StripePayoutResumeAudit[];
} {
  return {
    payoutQueuePaused,
    payoutQueuePausedAt,
    payoutQueuePauseReason,
    recentIncidents: incidents.slice(0, 5),
    recentResumeAudits: resumeAudits.slice(0, 5),
  };
}
