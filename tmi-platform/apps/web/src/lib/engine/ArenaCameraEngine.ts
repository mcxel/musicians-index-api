export type CameraMode = 'IDLE_STAGE' | 'CROWD_SWEEP' | 'SPOTLIGHT_FOCUS';

export interface CameraState {
  mode: CameraMode;
  /** CSS transform string for pseudo-360 parallax */
  transform: string;
  /** 0–1 opacity of crowd overlay */
  crowdOpacity: number;
  /** true while an active sweep is running */
  sweeping: boolean;
}

type CameraListener = (state: CameraState) => void;

const MIN_STAGE_DWELL_MS = 60_000;
const MAX_SWEEP_DURATION_MS = 4_000;
const SWEEP_COOLDOWN_MS = 15_000;
const MICRO_NUDGE_PX = 4;

let mode: CameraMode = 'IDLE_STAGE';
let lastSweepEnd = 0;
let lastStageEntry = Date.now();
let sweepTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<CameraListener>();

function buildState(sweeping: boolean): CameraState {
  const transform =
    mode === 'CROWD_SWEEP'
      ? `translateX(${sweeping ? -18 : 0}px) translateZ(0)`
      : mode === 'SPOTLIGHT_FOCUS'
        ? 'scale(1.04) translateZ(0)'
        : 'translateX(0) translateZ(0)';

  const crowdOpacity =
    mode === 'SPOTLIGHT_FOCUS' ? 0.5 : mode === 'CROWD_SWEEP' ? 0.9 : 0.75;

  return { mode, transform, crowdOpacity, sweeping };
}

function emit(sweeping = false): void {
  const state = buildState(sweeping);
  listeners.forEach((fn) => fn(state));
}

function canSweep(): boolean {
  const now = Date.now();
  if (now - lastStageEntry < MIN_STAGE_DWELL_MS) return false;
  if (now - lastSweepEnd < SWEEP_COOLDOWN_MS) return false;
  return true;
}

export const ArenaCameraEngine = {
  getState(): CameraState {
    return buildState(false);
  },

  getMode(): CameraMode {
    return mode;
  },

  /** Enter a crowd sweep if constraints allow. Resolves when sweep completes. */
  requestSweep(): boolean {
    if (!canSweep()) return false;
    if (mode === 'SPOTLIGHT_FOCUS') return false;

    const prevMode = mode;
    mode = 'CROWD_SWEEP';
    emit(true);

    const duration = 2500 + Math.random() * (MAX_SWEEP_DURATION_MS - 2500);
    sweepTimer = setTimeout(() => {
      lastSweepEnd = Date.now();
      mode = prevMode;
      emit(false);
      sweepTimer = null;
    }, duration);

    return true;
  },

  /** Lock camera onto spotlight target. Pass false to release. */
  setSpotlightFocus(active: boolean): void {
    if (active) {
      if (sweepTimer) {
        clearTimeout(sweepTimer);
        sweepTimer = null;
      }
      mode = 'SPOTLIGHT_FOCUS';
    } else {
      mode = 'IDLE_STAGE';
      lastStageEntry = Date.now();
    }
    emit(false);
  },

  /** Micro-nudge on crowd reaction burst — slight parallax shift */
  reactionNudge(): void {
    if (mode !== 'IDLE_STAGE') return;
    const offsetX = (Math.random() - 0.5) * MICRO_NUDGE_PX * 2;
    const state: CameraState = {
      mode,
      transform: `translateX(${offsetX}px) translateZ(0)`,
      crowdOpacity: 0.78,
      sweeping: false,
    };
    listeners.forEach((fn) => fn(state));
    // Snap back after 400ms
    setTimeout(() => emit(false), 400);
  },

  resetToStage(): void {
    if (sweepTimer) clearTimeout(sweepTimer);
    sweepTimer = null;
    mode = 'IDLE_STAGE';
    lastStageEntry = Date.now();
    emit(false);
  },

  subscribe(fn: CameraListener): () => void {
    listeners.add(fn);
    fn(buildState(false)); // immediate current state
    return () => listeners.delete(fn);
  },
};
