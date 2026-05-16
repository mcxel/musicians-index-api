import { listQueueRequests } from './AiVisualQueueEngine';
import { getWorkerRoster, type WorkerTaskInput } from './VisualWorkerControlEngine';

export type VisualWorkerHealthStatus = 'green' | 'yellow' | 'red';

export type VisualWorkerHealthRecord = {
  workerId: string;
  name: string;
  specialty: string;
  queueLoad: number;
  successRate: number;
  failureRate: number;
  healthScore: number;
  status: VisualWorkerHealthStatus;
  fatigue: 'low' | 'medium' | 'high';
  activeTask: string | null;
};

function toTasks(): WorkerTaskInput[] {
  return listQueueRequests().map((request) => ({
    requestId: request.requestId,
    assetKind: request.assetKind,
    route: request.route,
    slotId: request.slotId,
    ownerSystem: request.ownerSystem,
  }));
}

function computeHealthScore(input: {
  successRate: number;
  failureRate: number;
  queueLoad: number;
  paused: boolean;
}): number {
  if (input.paused) return 0;
  const loadPenalty = Math.min(35, input.queueLoad * 4);
  const failurePenalty = Math.min(40, input.failureRate * 1.5);
  return Math.max(0, Math.round(input.successRate - loadPenalty - failurePenalty));
}

function resolveStatus(score: number): VisualWorkerHealthStatus {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

function resolveFatigue(queueLoad: number): 'low' | 'medium' | 'high' {
  if (queueLoad >= 8) return 'high';
  if (queueLoad >= 4) return 'medium';
  return 'low';
}

export function listVisualWorkerHealthRecords(): VisualWorkerHealthRecord[] {
  const roster = getWorkerRoster(toTasks());

  return roster
    .map((worker) => {
      const healthScore = computeHealthScore({
        successRate: worker.successRate,
        failureRate: worker.failureRate,
        queueLoad: worker.queueLoad,
        paused: worker.paused,
      });

      return {
        workerId: worker.workerId,
        name: worker.name,
        specialty: worker.specialty,
        queueLoad: worker.queueLoad,
        successRate: worker.successRate,
        failureRate: worker.failureRate,
        healthScore,
        status: resolveStatus(healthScore),
        fatigue: resolveFatigue(worker.queueLoad),
        activeTask: worker.activeTask,
      };
    })
    .sort((a, b) => a.healthScore - b.healthScore);
}

export type WorkerHealthSnapshot = {
  workerId: string;
  successfulJobs: number;
  failedJobs: number;
  averageTimeMs: number;
  fatigueLevel: number;
  healthStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL_FAILURE';
};

export function getVisualWorkerHealthSummary(): {
  green: number;
  yellow: number;
  red: number;
  averageHealth: number;
} {
  const all = listVisualWorkerHealthRecords();
  const averageHealth =
    all.length === 0
      ? 0
      : Math.round(all.reduce((sum, item) => sum + item.healthScore, 0) / all.length);

  return {
    green: all.filter((item) => item.status === 'green').length,
    yellow: all.filter((item) => item.status === 'yellow').length,
    red: all.filter((item) => item.status === 'red').length,
    averageHealth,
  };
}
