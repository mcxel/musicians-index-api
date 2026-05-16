import { listQueueRequests } from './AiVisualQueueEngine';
import {
  assignWorkerForTask,
  getWorkerRoster,
  type WorkerTaskInput,
} from './VisualWorkerControlEngine';

export type VisualWorkerSpecialtyRecord = {
  workerId: string;
  workerName: string;
  specialty: string;
  compatibleKinds: string[];
  assignedJobs: number;
  failureExposure: number;
  utilizationPercent: number;
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

function specialtyToKinds(specialty: string): string[] {
  const normalized = specialty.toLowerCase();
  if (normalized.includes('artist')) return ['artist-profile-art', 'show-poster'];
  if (normalized.includes('fan')) return ['avatar-prop', 'avatar-clothing'];
  if (normalized.includes('performer')) return ['artist-profile-art', 'battle-poster'];
  if (normalized.includes('venue')) return ['venue-skin', 'show-poster'];
  if (normalized.includes('ticket')) return ['ticket-art', 'prize-card'];
  if (normalized.includes('article') || normalized.includes('magazine'))
    return ['article-thumbnail', 'magazine-cover'];
  if (normalized.includes('sponsor')) return ['sponsor-ad', 'billboard-art'];
  if (normalized.includes('advertiser')) return ['sponsor-ad', 'billboard-art'];
  if (normalized.includes('homepage')) return ['homepage-hero-art', 'battle-poster'];
  if (normalized.includes('motion')) return ['instrument', 'show-poster'];
  if (normalized.includes('scene') || normalized.includes('background'))
    return ['venue-skin', 'battle-poster'];
  return ['artist-profile-art'];
}

export function listVisualWorkerSpecialties(): VisualWorkerSpecialtyRecord[] {
  const queue = listQueueRequests();
  const tasks = toTasks();
  const roster = getWorkerRoster(tasks);
  const totalJobs = Math.max(1, tasks.length);

  return roster
    .map((worker) => {
      const assignedJobs = tasks.filter(
        (task) => assignWorkerForTask(task) === worker.workerId
      ).length;
      const failureExposure = queue.filter(
        (request) =>
          request.status === 'failed' &&
          assignWorkerForTask({
            requestId: request.requestId,
            assetKind: request.assetKind,
            route: request.route,
            slotId: request.slotId,
            ownerSystem: request.ownerSystem,
          }) === worker.workerId
      ).length;

      return {
        workerId: worker.workerId,
        workerName: worker.name,
        specialty: worker.specialty,
        compatibleKinds: specialtyToKinds(worker.specialty),
        assignedJobs,
        failureExposure,
        utilizationPercent: Math.round((assignedJobs / totalJobs) * 100),
      };
    })
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent);
}

export function getVisualWorkerSpecialtySummary(): {
  overloadedWorkers: number;
  underusedWorkers: number;
  balancedWorkers: number;
} {
  const all = listVisualWorkerSpecialties();
  return {
    overloadedWorkers: all.filter((item) => item.utilizationPercent > 20).length,
    underusedWorkers: all.filter((item) => item.utilizationPercent < 5).length,
    balancedWorkers: all.filter(
      (item) => item.utilizationPercent >= 5 && item.utilizationPercent <= 20
    ).length,
  };
}
