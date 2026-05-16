import { listQueueRequests, retryFailed, type VisualQueueRequest } from './AiVisualQueueEngine';
import {
  escalateVisualFailure,
  listVisualFailureMemory,
  markVisualRetry,
} from './VisualFailureMemoryEngine';

export type VisualRetryAction = 'retry' | 'escalate' | 'none';

export type VisualRetryDecision = {
  requestId: string;
  action: VisualRetryAction;
  reason: string;
  attempts: number;
  maxAttempts: number;
  failureReason: string;
  recommendedOwner: 'worker' | 'team-lead' | 'mc' | 'big-ace';
};

const decisionLog = new Map<string, VisualRetryDecision>();

function buildDecision(request: VisualQueueRequest): VisualRetryDecision {
  const failureReason = request.failureReason ?? 'unknown-failure';

  if (request.status !== 'failed') {
    return {
      requestId: request.requestId,
      action: 'none',
      reason: 'request-not-failed',
      attempts: request.attempts,
      maxAttempts: request.maxAttempts,
      failureReason,
      recommendedOwner: 'worker',
    };
  }

  if (request.attempts < request.maxAttempts) {
    return {
      requestId: request.requestId,
      action: 'retry',
      reason: 'within-retry-budget',
      attempts: request.attempts,
      maxAttempts: request.maxAttempts,
      failureReason,
      recommendedOwner: request.attempts >= 2 ? 'team-lead' : 'worker',
    };
  }

  return {
    requestId: request.requestId,
    action: 'escalate',
    reason: 'retry-limit-reached',
    attempts: request.attempts,
    maxAttempts: request.maxAttempts,
    failureReason,
    recommendedOwner: request.attempts >= request.maxAttempts + 1 ? 'big-ace' : 'mc',
  };
}

export function previewVisualRetryDecisions(): VisualRetryDecision[] {
  const failures = listQueueRequests().filter((request) => request.status === 'failed');
  return failures
    .map((request) => {
      return buildDecision(request);
    })
    .sort((a, b) => b.attempts - a.attempts);
}

export function executeVisualRetryCycle(): { retried: string[]; escalated: string[] } {
  const decisions = previewVisualRetryDecisions();
  const retried: string[] = [];
  const escalated: string[] = [];

  decisionLog.clear();

  decisions.forEach((decision) => {
    decisionLog.set(decision.requestId, decision);

    if (decision.action === 'retry') {
      const updated = retryFailed(decision.requestId);
      if (updated) {
        retried.push(decision.requestId);
        markVisualRetry(decision.requestId, 'queued-for-retry');
      }
      return;
    }

    if (decision.action === 'escalate') {
      escalated.push(decision.requestId);
      escalateVisualFailure(decision.requestId, decision.reason);
    }
  });

  return { retried, escalated };
}

export function listVisualRetryDecisionLog(): VisualRetryDecision[] {
  return [...decisionLog.values()].sort((a, b) => b.attempts - a.attempts);
}

export function getVisualRetrySummary(): {
  pendingFailures: number;
  openFailures: number;
  retryable: number;
  escalationRequired: number;
} {
  const pendingFailures = listQueueRequests().filter(
    (request) => request.status === 'failed'
  ).length;
  const decisions = listQueueRequests()
    .filter((request) => request.status === 'failed')
    .map((request) => buildDecision(request));
  const failures = listVisualFailureMemory();

  return {
    pendingFailures,
    openFailures: failures.filter(
      (item) => item.resolution === 'open' || item.resolution === 'retrying'
    ).length,
    retryable: decisions.filter((item) => item.action === 'retry').length,
    escalationRequired: decisions.filter((item) => item.action === 'escalate').length,
  };
}
