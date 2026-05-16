export type VisualWorkerRecord = {
  workerId: string;
  name: string;
  specialty: string;
  paused: boolean;
  queueLoad: number;
  successRate: number;
  failureRate: number;
  activeTask: string | null;
  history: string[];
};

export type WorkerTaskInput = {
  requestId: string;
  assetKind: string;
  route: string;
  slotId?: string;
  ownerSystem: string;
};

const workerProfiles = [
  { workerId: "artist-worker", name: "artist worker", specialty: "artist portrait" },
  { workerId: "fan-worker", name: "fan worker", specialty: "fan avatar" },
  { workerId: "performer-worker", name: "performer worker", specialty: "performer portrait" },
  { workerId: "venue-worker", name: "venue worker", specialty: "venue skin" },
  { workerId: "ticket-worker", name: "ticket worker", specialty: "ticket art" },
  { workerId: "article-worker", name: "article worker", specialty: "article hero" },
  { workerId: "sponsor-worker", name: "sponsor worker", specialty: "sponsor ad" },
  { workerId: "advertiser-worker", name: "advertiser worker", specialty: "advertiser ad" },
  { workerId: "billboard-worker", name: "billboard worker", specialty: "billboard art" },
  { workerId: "homepage-worker", name: "homepage worker", specialty: "homepage hero" },
  { workerId: "magazine-worker", name: "magazine worker", specialty: "magazine art" },
  { workerId: "motion-worker", name: "motion worker", specialty: "motion loops" },
  { workerId: "scene-worker", name: "scene worker", specialty: "scene and background" },
  { workerId: "background-worker", name: "background worker", specialty: "background art" },
];

const workerState = new Map<string, { paused: boolean; history: string[] }>();
const workerOverrides = new Map<string, string>();

function scoreFailureRate(queueLoad: number): number {
  if (queueLoad >= 12) return 18;
  if (queueLoad >= 8) return 11;
  if (queueLoad >= 4) return 6;
  return 2;
}

function scoreSuccessRate(queueLoad: number, paused: boolean): number {
  if (paused) return 0;
  return Math.max(72, 99 - queueLoad * 2);
}

export function assignWorkerForTask(task: WorkerTaskInput): string {
  if (workerOverrides.has(task.requestId)) {
    return workerOverrides.get(task.requestId) as string;
  }

  const normalized = `${task.assetKind} ${task.route} ${task.slotId ?? ""}`.toLowerCase();
  if (normalized.includes("homepage")) return "homepage-worker";
  if (normalized.includes("article") || normalized.includes("magazine")) return "article-worker";
  if (normalized.includes("ticket")) return "ticket-worker";
  if (normalized.includes("billboard")) return "billboard-worker";
  if (normalized.includes("sponsor")) return "sponsor-worker";
  if (normalized.includes("advertiser")) return "advertiser-worker";
  if (normalized.includes("venue")) return "venue-worker";
  if (normalized.includes("performer")) return "performer-worker";
  if (normalized.includes("fan")) return "fan-worker";
  if (normalized.includes("motion")) return "motion-worker";
  if (normalized.includes("background") || normalized.includes("scene")) return "background-worker";
  return "artist-worker";
}

export function getWorkerRoster(tasks: WorkerTaskInput[] = []): VisualWorkerRecord[] {
  return workerProfiles.map((profile) => {
    const state = workerState.get(profile.workerId) ?? { paused: false, history: [] };
    const activeTask = tasks.find((task) => assignWorkerForTask(task) === profile.workerId) ?? null;
    const queueLoad = tasks.filter((task) => assignWorkerForTask(task) === profile.workerId).length;
    return {
      workerId: profile.workerId,
      name: profile.name,
      specialty: profile.specialty,
      paused: state.paused,
      queueLoad,
      successRate: scoreSuccessRate(queueLoad, state.paused),
      failureRate: scoreFailureRate(queueLoad),
      activeTask: activeTask ? `${activeTask.assetKind} → ${activeTask.slotId ?? activeTask.route}` : null,
      history: state.history.slice(-5),
    };
  });
}

export function pauseWorker(workerId: string): VisualWorkerRecord | null {
  const state = workerState.get(workerId) ?? { paused: false, history: [] };
  state.paused = true;
  state.history.push(`paused:${Date.now()}`);
  workerState.set(workerId, state);
  return getWorkerRoster().find((worker) => worker.workerId === workerId) ?? null;
}

export function resumeWorker(workerId: string): VisualWorkerRecord | null {
  const state = workerState.get(workerId) ?? { paused: false, history: [] };
  state.paused = false;
  state.history.push(`resumed:${Date.now()}`);
  workerState.set(workerId, state);
  return getWorkerRoster().find((worker) => worker.workerId === workerId) ?? null;
}

export function reassignTask(requestId: string, workerId: string): string {
  workerOverrides.set(requestId, workerId);
  const state = workerState.get(workerId) ?? { paused: false, history: [] };
  state.history.push(`assigned:${requestId}`);
  workerState.set(workerId, state);
  return workerId;
}

export function upgradePriority(requestId: string): string {
  const state = workerState.get("motion-worker") ?? { paused: false, history: [] };
  state.history.push(`priority-upgrade:${requestId}`);
  workerState.set("motion-worker", state);
  return requestId;
}

export function viewHistory(workerId: string): string[] {
  return (workerState.get(workerId) ?? { paused: false, history: [] }).history;
}

export function getActiveWorkerCount(): number {
  return getWorkerRoster().filter((worker) => !worker.paused).length;
}

export function normalizeQueueLoad(tasks: WorkerTaskInput[]): number {
  return tasks.length;
}
