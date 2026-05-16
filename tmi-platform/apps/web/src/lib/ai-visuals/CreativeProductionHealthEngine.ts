import { listGeneratedAssets } from "./AiGeneratedAssetRegistry";
import { listQualityReports } from "./VisualQualityAuthorityEngine";
import { listQueueRequests } from "./AiVisualQueueEngine";
import { listVisualSlots } from "../visuals/TmiVisualSlotRegistry";
import { getWorkerRoster, type WorkerTaskInput } from "./VisualWorkerControlEngine";

export type CreativeProductionHealthSnapshot = {
  coveragePercent: number;
  missingVisuals: number;
  placeholderLeaks: number;
  weakVisuals: number;
  failedJobs: number;
  slowWorkers: number;
  queueOverload: number;
  motionBacklog: number;
  deploymentBacklog: number;
  motionReadyPercent: number;
};

function motionReadyCount(): number {
  return listGeneratedAssets().filter((asset) => asset.tags.some((tag) => tag.includes("motion")) || asset.assetType === "animation-storyboard").length;
}

function isPlaceholderRef(ref: string): boolean {
  return /placeholder|stub|temp|dummy|stock|example\.com/i.test(ref);
}

export function getCreativeProductionHealthSnapshot(): CreativeProductionHealthSnapshot {
  const queue = listQueueRequests();
  const assets = listGeneratedAssets();
  const quality = listQualityReports();
  const workerTasks: WorkerTaskInput[] = queue.map((request) => ({
    requestId: request.requestId,
    assetKind: request.assetKind,
    route: request.route,
    slotId: request.slotId,
    ownerSystem: request.ownerSystem,
  }));
  const workers = getWorkerRoster(workerTasks);

  const slots = listVisualSlots();
  const missingVisuals = slots.filter((slot) => slot.images.length === 0).length;
  const placeholderLeaks = slots.filter((slot) => slot.images.some((image: string) => isPlaceholderRef(image))).length;
  const weakVisuals = quality.filter((report) => report.score < 70).length;
  const failedJobs = queue.filter((request) => request.status === "failed").length;
  const slowWorkers = workers.filter((worker) => worker.queueLoad >= 8 || worker.failureRate >= 10).length;
  const queueOverload = queue.filter((request) => request.status === "queued" || request.status === "generating").length;
  const motionBacklog = assets.filter((asset) => !asset.tags.some((tag) => tag.includes("motion")) && (asset.assetType === "image" || asset.assetType === "poster" || asset.assetType === "background" || asset.assetType === "room-skin")).length;
  const deploymentBacklog = queue.filter((request) => request.status === "approved").length;
  const coveragePercent = slots.length === 0 ? 100 : Math.round(((slots.length - missingVisuals) / slots.length) * 100);
  const motionReadyPercent = assets.length === 0 ? 0 : Math.round((motionReadyCount() / assets.length) * 100);

  return {
    coveragePercent,
    missingVisuals,
    placeholderLeaks,
    weakVisuals,
    failedJobs,
    slowWorkers,
    queueOverload,
    motionBacklog,
    deploymentBacklog,
    motionReadyPercent,
  };
}
