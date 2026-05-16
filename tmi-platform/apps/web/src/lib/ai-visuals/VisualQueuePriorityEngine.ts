import {
  listQueueRequests,
  type VisualQueuePriority,
  type VisualQueueRequest,
} from './AiVisualQueueEngine';

export type VisualQueuePriorityRecord = {
  requestId: string;
  route: string;
  ownerSystem: string;
  assetKind: string;
  currentPriority: VisualQueuePriority;
  recommendedPriority: VisualQueuePriority;
  priorityScore: number;
  reason: string;
  failureCount: number;
};

function scorePriorityValue(priority: VisualQueuePriority): number {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function evaluateRouteBoost(route: string): number {
  if (route.startsWith('/home')) return 4;
  if (route.startsWith('/admin')) return 3;
  if (route.startsWith('/tickets') || route.startsWith('/events') || route.startsWith('/battles'))
    return 2;
  return 1;
}

function recommendPriority(request: VisualQueueRequest): {
  priority: VisualQueuePriority;
  reason: string;
  score: number;
} {
  const base = scorePriorityValue(request.priority);
  const routeBoost = evaluateRouteBoost(request.route);
  const failureBoost = request.attempts >= 2 ? 2 : request.attempts >= 1 ? 1 : 0;
  const score = base + routeBoost + failureBoost;

  if (score >= 9) return { priority: 'critical', reason: 'high-value-route-and-retry-risk', score };
  if (score >= 7) return { priority: 'high', reason: 'priority-route-or-repeat-failure', score };
  if (score >= 5) return { priority: 'medium', reason: 'standard-work-item', score };
  return { priority: 'low', reason: 'background-work-item', score };
}

export function listVisualQueuePriorityRecords(): VisualQueuePriorityRecord[] {
  return listQueueRequests()
    .map((request) => {
      const recommendation = recommendPriority(request);
      return {
        requestId: request.requestId,
        route: request.route,
        ownerSystem: request.ownerSystem,
        assetKind: request.assetKind,
        currentPriority: request.priority,
        recommendedPriority: recommendation.priority,
        priorityScore: recommendation.score,
        reason: recommendation.reason,
        failureCount: request.attempts,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getCriticalVisualQueueItems(): VisualQueuePriorityRecord[] {
  return listVisualQueuePriorityRecords().filter((item) => item.recommendedPriority === 'critical');
}

export function getVisualQueuePrioritySummary(): {
  critical: number;
  high: number;
  medium: number;
  low: number;
} {
  const all = listVisualQueuePriorityRecords();
  return {
    critical: all.filter((item) => item.recommendedPriority === 'critical').length,
    high: all.filter((item) => item.recommendedPriority === 'high').length,
    medium: all.filter((item) => item.recommendedPriority === 'medium').length,
    low: all.filter((item) => item.recommendedPriority === 'low').length,
  };
}
