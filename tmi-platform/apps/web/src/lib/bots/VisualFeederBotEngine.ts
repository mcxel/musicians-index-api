import type { FeederIdeaAssetType, VisualFeederIdea } from "@/lib/bots/AssetIdeaQueueEngine";

export type VisualWorkerSpecialty =
  | "bot face workers"
  | "artist portrait workers"
  | "performer portrait workers"
  | "fan avatar workers"
  | "venue skin workers"
  | "ticket art workers"
  | "sponsor ad workers"
  | "advertiser campaign workers"
  | "billboard workers"
  | "magazine cover workers"
  | "homepage hero workers"
  | "battle poster workers"
  | "motion portrait workers"
  | "scene/background workers";

export type VisualFeederWorker = {
  workerId: string;
  label: string;
  specialty: VisualWorkerSpecialty;
  currentJob: string | null;
  queueLoad: number;
  successRate: number;
  failureRate: number;
  lastCompletedAsset: string | null;
  performanceScore: number;
};

const workers: VisualFeederWorker[] = [
  { workerId: "w-bot-face", label: "Bot Face Worker", specialty: "bot face workers", currentJob: null, queueLoad: 0, successRate: 0.92, failureRate: 0.08, lastCompletedAsset: null, performanceScore: 91 },
  { workerId: "w-artist", label: "Artist Portrait Worker", specialty: "artist portrait workers", currentJob: null, queueLoad: 0, successRate: 0.89, failureRate: 0.11, lastCompletedAsset: null, performanceScore: 88 },
  { workerId: "w-performer", label: "Performer Portrait Worker", specialty: "performer portrait workers", currentJob: null, queueLoad: 0, successRate: 0.9, failureRate: 0.1, lastCompletedAsset: null, performanceScore: 89 },
  { workerId: "w-fan", label: "Fan Avatar Worker", specialty: "fan avatar workers", currentJob: null, queueLoad: 0, successRate: 0.91, failureRate: 0.09, lastCompletedAsset: null, performanceScore: 90 },
  { workerId: "w-venue", label: "Venue Skin Worker", specialty: "venue skin workers", currentJob: null, queueLoad: 0, successRate: 0.87, failureRate: 0.13, lastCompletedAsset: null, performanceScore: 84 },
  { workerId: "w-ticket", label: "Ticket Art Worker", specialty: "ticket art workers", currentJob: null, queueLoad: 0, successRate: 0.93, failureRate: 0.07, lastCompletedAsset: null, performanceScore: 92 },
  { workerId: "w-sponsor", label: "Sponsor Ad Worker", specialty: "sponsor ad workers", currentJob: null, queueLoad: 0, successRate: 0.88, failureRate: 0.12, lastCompletedAsset: null, performanceScore: 86 },
  { workerId: "w-advertiser", label: "Advertiser Campaign Worker", specialty: "advertiser campaign workers", currentJob: null, queueLoad: 0, successRate: 0.86, failureRate: 0.14, lastCompletedAsset: null, performanceScore: 83 },
  { workerId: "w-billboard", label: "Billboard Worker", specialty: "billboard workers", currentJob: null, queueLoad: 0, successRate: 0.9, failureRate: 0.1, lastCompletedAsset: null, performanceScore: 88 },
  { workerId: "w-magazine", label: "Magazine Cover Worker", specialty: "magazine cover workers", currentJob: null, queueLoad: 0, successRate: 0.9, failureRate: 0.1, lastCompletedAsset: null, performanceScore: 89 },
  { workerId: "w-homepage", label: "Homepage Hero Worker", specialty: "homepage hero workers", currentJob: null, queueLoad: 0, successRate: 0.91, failureRate: 0.09, lastCompletedAsset: null, performanceScore: 90 },
  { workerId: "w-battle", label: "Battle Poster Worker", specialty: "battle poster workers", currentJob: null, queueLoad: 0, successRate: 0.89, failureRate: 0.11, lastCompletedAsset: null, performanceScore: 87 },
  { workerId: "w-motion", label: "Motion Portrait Worker", specialty: "motion portrait workers", currentJob: null, queueLoad: 0, successRate: 0.85, failureRate: 0.15, lastCompletedAsset: null, performanceScore: 82 },
  { workerId: "w-scene", label: "Scene Worker", specialty: "scene/background workers", currentJob: null, queueLoad: 0, successRate: 0.88, failureRate: 0.12, lastCompletedAsset: null, performanceScore: 86 },
];

const ASSET_TO_SPECIALTY: Record<FeederIdeaAssetType, VisualWorkerSpecialty> = {
  "artist-portrait": "artist portrait workers",
  "venue-skin": "venue skin workers",
  "ticket-design": "ticket art workers",
  "sponsor-ad": "sponsor ad workers",
  "advertiser-campaign": "advertiser campaign workers",
  "battle-poster": "battle poster workers",
  "magazine-cover": "magazine cover workers",
  "homepage-hero": "homepage hero workers",
  "bot-face": "bot face workers",
  "host-animation": "motion portrait workers",
  "background": "scene/background workers",
  "scene": "scene/background workers",
  "motion-loop": "motion portrait workers",
};

export function listVisualFeederWorkers(): VisualFeederWorker[] {
  return workers;
}

export function assignWorkerForFeederIdea(idea: VisualFeederIdea): VisualFeederWorker | null {
  const specialty = ASSET_TO_SPECIALTY[idea.assetType];
  const candidates = workers
    .filter((worker) => worker.specialty === specialty)
    .sort((left, right) => left.queueLoad - right.queueLoad || right.performanceScore - left.performanceScore);

  const chosen = candidates[0];
  if (!chosen) return null;

  chosen.currentJob = idea.ideaId;
  chosen.queueLoad += 1;
  return chosen;
}

export function completeWorkerJob(workerId: string, assetLabel: string, success: boolean): VisualFeederWorker | null {
  const worker = workers.find((entry) => entry.workerId === workerId);
  if (!worker) return null;

  worker.currentJob = null;
  worker.queueLoad = Math.max(0, worker.queueLoad - 1);
  worker.lastCompletedAsset = assetLabel;

  if (success) {
    worker.successRate = Math.min(0.99, worker.successRate + 0.01);
    worker.failureRate = Math.max(0.01, worker.failureRate - 0.01);
    worker.performanceScore = Math.min(100, worker.performanceScore + 1);
  } else {
    worker.successRate = Math.max(0.5, worker.successRate - 0.02);
    worker.failureRate = Math.min(0.5, worker.failureRate + 0.02);
    worker.performanceScore = Math.max(10, worker.performanceScore - 2);
  }
  return worker;
}
