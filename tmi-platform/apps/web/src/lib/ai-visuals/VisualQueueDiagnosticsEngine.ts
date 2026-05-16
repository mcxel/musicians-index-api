import { listDeployments } from "./VisualDeploymentEngine";
import { listGeneratedAssets } from "./AiGeneratedAssetRegistry";
import { listQualityReports } from "./VisualQualityAuthorityEngine";
import { listQueueRequests } from "./AiVisualQueueEngine";
import { listVisualSlots, type VisualSlot } from "../visuals/TmiVisualSlotRegistry";
import { assignWorkerForTask, getWorkerRoster, type WorkerTaskInput } from "./VisualWorkerControlEngine";
import { resolveDestinationByRoute } from "./VisualDestinationMapEngine";

export type VisualCommandJobStatus =
  | "queued"
  | "active"
  | "generating"
  | "scoring"
  | "approved"
  | "deploying"
  | "deployed"
  | "failed"
  | "stalled"
  | "retrying"
  | "cancelled";

export type VisualCommandJob = {
  jobId: string;
  assetType: string;
  visualType: string;
  accountType: string;
  targetPage: string;
  targetRoute: string;
  targetSlot: string;
  targetAccount: string;
  assignedWorker: string;
  status: VisualCommandJobStatus;
  priority: string;
  timeWaiting: string;
  timeRunning: string;
  failureCount: number;
  failureReason: string | null;
  deploymentTarget: string;
  currentImage: string | null;
  completedImage: string | null;
  failedImage: string | null;
  replacementImage: string | null;
  motionSeed: string | null;
  latestAssetId: string | null;
};

export type VisualQueueDiagnosticsSnapshot = {
  summary: {
    queued: number;
    active: number;
    failed: number;
    completed: number;
    coveragePercent: number;
    motionReadyPercent: number;
    placeholderLeaks: number;
    weakAssets: number;
  };
  jobs: VisualCommandJob[];
  slotMap: VisualSlot[];
  workerTasks: WorkerTaskInput[];
  workerRoster: ReturnType<typeof getWorkerRoster>;
  generatedAssets: ReturnType<typeof listGeneratedAssets>;
  deployments: ReturnType<typeof listDeployments>;
  qualityReports: ReturnType<typeof listQualityReports>;
};

function formatAge(start: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function isPlaceholderRef(ref: string): boolean {
  return /placeholder|stub|temp|dummy|stock|example\.com/i.test(ref);
}

function mapStatus(status: string, attempts: number, maxAttempts: number): VisualCommandJobStatus {
  if (status === "generating") return "active";
  if (status === "approved") return "scoring";
  if (status === "deployed") return "deployed";
  if (status === "failed" && attempts >= maxAttempts) return "stalled";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";
  if (status === "queued" && attempts > 0) return "retrying";
  return "queued";
}

function inferPage(route: string): string {
  if (route.includes("/artists/")) return "artist profile";
  if (route.includes("/performers/")) return "performer profile";
  if (route.includes("/fan/")) return "fan profile";
  if (route.includes("/venues/")) return "venue page";
  if (route.includes("/tickets/")) return "ticket page";
  if (route.includes("/articles/")) return "article page";
  if (route.includes("/events/")) return "event page";
  if (route.includes("/billboard/")) return "billboard page";
  if (route.includes("/sponsors/")) return "sponsor page";
  if (route.includes("/advertisers/")) return "advertiser page";
  if (route.includes("/home/")) return "homepage";
  if (route.includes("/magazine")) return "magazine";
  return "admin surface";
}

function inferAccountType(route: string, ownerSystem: string): string {
  if (ownerSystem.includes("artist")) return "artist";
  if (ownerSystem.includes("fan")) return "fan";
  if (ownerSystem.includes("venue")) return "venue";
  if (ownerSystem.includes("ticket")) return "ticket";
  if (ownerSystem.includes("sponsor")) return "sponsor";
  if (ownerSystem.includes("advertiser")) return "advertiser";
  if (ownerSystem.includes("magazine")) return "magazine";
  if (route.includes("/home/")) return "homepage";
  return "bot";
}

function buildPreviewImages(route: string, component: string): {
  currentImage: string | null;
  completedImage: string | null;
  failedImage: string | null;
  replacementImage: string | null;
  motionSeed: string | null;
  latestAssetId: string | null;
} {
  const generatedAssets = listGeneratedAssets();
  const latest = generatedAssets
    .filter((asset) => asset.targetRoute === route || asset.targetComponent === component)
    .sort((a, b) => b.createdAt - a.createdAt)[0] ?? generatedAssets.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

  const failed = generatedAssets
    .filter((asset) => asset.status === "replaced" && (asset.targetRoute === route || asset.targetComponent === component))
    .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

  return {
    currentImage: latest?.outputRef ?? null,
    completedImage: latest?.status === "approved" || latest?.status === "active" ? latest.outputRef ?? null : null,
    failedImage: failed?.outputRef ?? null,
    replacementImage: latest?.replacementOf ?? null,
    motionSeed: latest?.tags.find((tag) => tag.includes("motion")) ?? latest?.assetId ?? null,
    latestAssetId: latest?.assetId ?? null,
  };
}

export function getVisualQueueDiagnosticsSnapshot(): VisualQueueDiagnosticsSnapshot {
  const queue = listQueueRequests();
  const slots = listVisualSlots();
  const generatedAssets = listGeneratedAssets();
  const deployments = listDeployments();
  const qualityReports = listQualityReports();

  const workerTasks: WorkerTaskInput[] = queue.map((request) => ({
    requestId: request.requestId,
    assetKind: request.assetKind,
    route: request.route,
    slotId: request.slotId,
    ownerSystem: request.ownerSystem,
  }));

  const workerRoster = getWorkerRoster(workerTasks);

  const jobs: VisualCommandJob[] = queue.map((request) => {
    const destination = resolveDestinationByRoute(request.route);
    const preview = buildPreviewImages(request.route, request.component);
    const matchingSlot = slots.find((slot) => slot.slotId === request.slotId);
    const assignedWorker = assignWorkerForTask({
      requestId: request.requestId,
      assetKind: request.assetKind,
      route: request.route,
      slotId: request.slotId,
      ownerSystem: request.ownerSystem,
    });

    return {
      jobId: request.requestId,
      assetType: request.aiAssetType,
      visualType: request.assetKind,
      accountType: inferAccountType(request.route, request.ownerSystem),
      targetPage: inferPage(request.route),
      targetRoute: request.route,
      targetSlot: request.slotId ?? matchingSlot?.slotId ?? destination.slotName,
      targetAccount: request.ownerSystem,
      assignedWorker,
      status: mapStatus(request.status, request.attempts, request.maxAttempts),
      priority: request.priority,
      timeWaiting: formatAge(request.createdAt),
      timeRunning: request.status === "generating" ? formatAge(request.updatedAt) : "0s",
      failureCount: request.attempts,
      failureReason: request.failureReason ?? null,
      deploymentTarget: request.slotId ?? destination.slotName,
      currentImage: preview.currentImage,
      completedImage: preview.completedImage,
      failedImage: preview.failedImage,
      replacementImage: preview.replacementImage,
      motionSeed: preview.motionSeed,
      latestAssetId: preview.latestAssetId,
    };
  });

  const queued = jobs.filter((job) => job.status === "queued" || job.status === "retrying").length;
  const active = jobs.filter((job) => job.status === "active" || job.status === "generating" || job.status === "scoring" || job.status === "deploying").length;
  const failed = jobs.filter((job) => job.status === "failed" || job.status === "stalled").length;
  const completed = jobs.filter((job) => job.status === "approved" || job.status === "deployed").length;

  const placeholderLeaks = slots.filter((slot) => slot.images.some((image: string) => isPlaceholderRef(image))).length;
  const weakAssets = qualityReports.filter((report) => report.score < 70).length;
  const motionReadyPercent = generatedAssets.length === 0 ? 0 : Math.round((generatedAssets.filter((asset) => asset.tags.some((tag) => tag.includes("motion")) || asset.assetType === "animation-storyboard").length / generatedAssets.length) * 100);
  const coveragePercent = slots.length === 0 ? 100 : Math.round(((slots.length - slots.filter((slot) => slot.images.length === 0).length) / slots.length) * 100);

  return {
    summary: {
      queued,
      active,
      failed,
      completed,
      coveragePercent,
      motionReadyPercent,
      placeholderLeaks,
      weakAssets,
    },
    jobs,
    slotMap: slots,
    workerTasks,
    workerRoster,
    generatedAssets,
    deployments,
    qualityReports,
  };
}

export function getVisualCommandJobById(jobId: string): VisualCommandJob | null {
  return getVisualQueueDiagnosticsSnapshot().jobs.find((job) => job.jobId === jobId) ?? null;
}
