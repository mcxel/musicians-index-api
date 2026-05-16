// LiveStageEngine — performer queue, stage rotation, host mic control

export type PerformerStatus = "queued" | "on-stage" | "exiting" | "complete";

export type Performer = {
  id: string;
  name: string;
  genre: string;
  slotDurationSec: number;
  status: PerformerStatus;
  micHot: boolean;
  startedAt: number | null;
  completedAt: number | null;
};

export type StageState = {
  venueSlug: string;
  active: boolean;
  currentPerformer: Performer | null;
  queue: Performer[];
  completedRound: Performer[];
  spotlightIndex: number;
  hostMicHot: boolean;
  rotationCount: number;
};

const stageRegistry = new Map<string, StageState>();

export function getStageState(venueSlug: string): StageState {
  if (!stageRegistry.has(venueSlug)) {
    stageRegistry.set(venueSlug, {
      venueSlug,
      active: false,
      currentPerformer: null,
      queue: [],
      completedRound: [],
      spotlightIndex: 0,
      hostMicHot: false,
      rotationCount: 0,
    });
  }
  return stageRegistry.get(venueSlug)!;
}

export function activateStage(venueSlug: string): StageState {
  const state = getStageState(venueSlug);
  state.active = true;
  return state;
}

export function deactivateStage(venueSlug: string): StageState {
  const state = getStageState(venueSlug);
  state.active = false;
  state.hostMicHot = false;
  if (state.currentPerformer) {
    state.currentPerformer.status = "exiting";
    state.completedRound.push(state.currentPerformer);
    state.currentPerformer = null;
  }
  return state;
}

export function addPerformerToQueue(venueSlug: string, performer: Omit<Performer, "status" | "micHot" | "startedAt" | "completedAt">): StageState {
  const state = getStageState(venueSlug);
  state.queue.push({ ...performer, status: "queued", micHot: false, startedAt: null, completedAt: null });
  return state;
}

export function rotateToNextPerformer(venueSlug: string): StageState {
  const state = getStageState(venueSlug);
  if (state.currentPerformer) {
    state.currentPerformer.status = "complete";
    state.currentPerformer.completedAt = Date.now();
    state.completedRound.push(state.currentPerformer);
    state.currentPerformer = null;
  }
  const next = state.queue.shift();
  if (next) {
    next.status = "on-stage";
    next.micHot = true;
    next.startedAt = Date.now();
    state.currentPerformer = next;
    state.spotlightIndex += 1;
    state.rotationCount += 1;
  }
  return state;
}

export function toggleHostMic(venueSlug: string): boolean {
  const state = getStageState(venueSlug);
  state.hostMicHot = !state.hostMicHot;
  // When host mic is hot, performer mic cuts
  if (state.hostMicHot && state.currentPerformer) {
    state.currentPerformer.micHot = false;
  } else if (!state.hostMicHot && state.currentPerformer) {
    state.currentPerformer.micHot = true;
  }
  return state.hostMicHot;
}

export function listStageStates(): StageState[] {
  return Array.from(stageRegistry.values());
}
