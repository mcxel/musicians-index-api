import { listQueueRequests, type VisualQueueRequest } from './AiVisualQueueEngine';
import { assignWorkerForTask } from './VisualWorkerControlEngine';

export type VisualFailureResolution = 'open' | 'retrying' | 'resolved' | 'escalated';

export type VisualFailureMemoryRecord = {
  requestId: string;
  route: string;
  slotId: string | null;
  assignedWorker: string;
  failureReason: string;
  firstFailedAt: number;
  lastFailedAt: number;
  failureCount: number;
  retryCount: number;
  resolution: VisualFailureResolution;
  resolutionNote: string | null;
};

export type VisualFailureEventType = 'failed-job' | 'stalled-job' | 'corrupt-asset';

export type VisualFailureRecord = {
  jobId: string;
  targetRoute: string;
  reason: string;
  retryCount: number;
  firstFailedAt: number;
  lastFailedAt: number;
  resolved: boolean;
  escalated: boolean;
};

const failureMemory = new Map<string, VisualFailureMemoryRecord>();

function toWorkerId(request: VisualQueueRequest): string {
  return assignWorkerForTask({
    requestId: request.requestId,
    assetKind: request.assetKind,
    route: request.route,
    slotId: request.slotId,
    ownerSystem: request.ownerSystem,
  });
}

function toFailureReason(request: VisualQueueRequest): string {
  return request.failureReason ?? 'unknown-failure';
}

export function recordVisualFailureEvent(
  request: VisualQueueRequest,
  eventType: VisualFailureEventType = 'failed-job'
): VisualFailureMemoryRecord {
  const now = Date.now();
  const existing = failureMemory.get(request.requestId);
  const eventReason =
    eventType === 'corrupt-asset'
      ? 'corrupt-asset'
      : eventType === 'stalled-job'
      ? 'stalled-job'
      : toFailureReason(request);

  const next: VisualFailureMemoryRecord = {
    requestId: request.requestId,
    route: request.route,
    slotId: request.slotId ?? null,
    assignedWorker: toWorkerId(request),
    failureReason: eventReason,
    firstFailedAt: existing?.firstFailedAt ?? now,
    lastFailedAt: now,
    failureCount: (existing?.failureCount ?? 0) + 1,
    retryCount: existing?.retryCount ?? 0,
    resolution: existing?.resolution === 'resolved' ? 'open' : existing?.resolution ?? 'open',
    resolutionNote: existing?.resolutionNote ?? null,
  };

  failureMemory.set(request.requestId, next);
  return next;
}

export function rememberVisualFailure(request: VisualQueueRequest): VisualFailureMemoryRecord {
  return recordVisualFailureEvent(
    request,
    request.status === 'failed' ? 'failed-job' : 'stalled-job'
  );
}

export function markVisualRetry(
  requestId: string,
  note?: string
): VisualFailureMemoryRecord | null {
  const existing = failureMemory.get(requestId);
  if (!existing) return null;

  const next: VisualFailureMemoryRecord = {
    ...existing,
    retryCount: existing.retryCount + 1,
    lastFailedAt: Date.now(),
    resolution: 'retrying',
    resolutionNote: note ?? existing.resolutionNote,
  };

  failureMemory.set(requestId, next);
  return next;
}

export function resolveVisualFailure(
  requestId: string,
  note?: string
): VisualFailureMemoryRecord | null {
  const existing = failureMemory.get(requestId);
  if (!existing) return null;

  const next: VisualFailureMemoryRecord = {
    ...existing,
    resolution: 'resolved',
    resolutionNote: note ?? 'resolved',
    lastFailedAt: Date.now(),
  };

  failureMemory.set(requestId, next);
  return next;
}

export function escalateVisualFailure(
  requestId: string,
  note?: string
): VisualFailureMemoryRecord | null {
  const existing = failureMemory.get(requestId);
  if (!existing) return null;

  const next: VisualFailureMemoryRecord = {
    ...existing,
    resolution: 'escalated',
    resolutionNote: note ?? 'retry-limit-reached',
    lastFailedAt: Date.now(),
  };

  failureMemory.set(requestId, next);
  return next;
}

export function syncVisualFailureMemoryFromQueue(): VisualFailureMemoryRecord[] {
  return listLiveFailureRecordsFromQueue();
}

export function listVisualFailureMemory(): VisualFailureMemoryRecord[] {
  return [...failureMemory.values()].sort((a, b) => b.lastFailedAt - a.lastFailedAt);
}

export function listLiveFailureRecordsFromQueue(): VisualFailureMemoryRecord[] {
  const liveFailures = listQueueRequests().filter(
    (request) => request.status === 'failed' || request.status === 'cancelled'
  );

  return liveFailures
    .map((request) => {
      const existing = failureMemory.get(request.requestId);
      const observedFailures = Math.max(request.attempts, existing?.failureCount ?? 0, 1);
      const observedRetries = Math.max(observedFailures - 1, existing?.retryCount ?? 0, 0);

      return {
        requestId: request.requestId,
        route: request.route,
        slotId: request.slotId ?? null,
        assignedWorker: existing?.assignedWorker ?? toWorkerId(request),
        failureReason: request.failureReason ?? existing?.failureReason ?? 'unknown-failure',
        firstFailedAt: existing?.firstFailedAt ?? request.updatedAt,
        lastFailedAt: Math.max(existing?.lastFailedAt ?? 0, request.updatedAt),
        failureCount: observedFailures,
        retryCount: observedRetries,
        resolution: existing?.resolution ?? 'open',
        resolutionNote: existing?.resolutionNote ?? null,
      } satisfies VisualFailureMemoryRecord;
    })
    .sort((a, b) => b.lastFailedAt - a.lastFailedAt);
}

export function summarizeVisualFailureRecords(records: VisualFailureMemoryRecord[]): {
  open: number;
  retrying: number;
  escalated: number;
  resolved: number;
  total: number;
} {
  return {
    open: records.filter((item) => item.resolution === 'open').length,
    retrying: records.filter((item) => item.resolution === 'retrying').length,
    escalated: records.filter((item) => item.resolution === 'escalated').length,
    resolved: records.filter((item) => item.resolution === 'resolved').length,
    total: records.length,
  };
}

export function getVisualFailureSummary(): {
  open: number;
  retrying: number;
  escalated: number;
  resolved: number;
  total: number;
} {
  return summarizeVisualFailureRecords(listVisualFailureMemory());
}
