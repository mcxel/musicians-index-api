/**
 * StageLifecycleEngine
 * Coordinates: STAGE_PREP → COUNTDOWN → CURTAIN_PART → LIGHTING_SNAP → CAMERA_LIVE
 */

export type StageState =
  | 'STAGE_PREP'      // Performer pre-flight, curtain closed
  | 'COUNTDOWN'       // Visible countdown to open
  | 'CURTAIN_PART'    // Curtain opening animation
  | 'LIGHTING_SNAP'   // House lights shift + spotlight snap
  | 'CAMERA_LIVE'     // Full live mode, audience sees performer
  | 'INTERMISSION'    // Between sets
  | 'CURTAIN_CLOSE'   // Curtain closing
  | 'ENDED';          // Show over

export interface StageConfig {
  curtainDurationMs: number;  // how long curtain opening takes
  countdownSeconds: number;   // countdown from this number
  lightingTransitionMs: number;
}

export interface StageSnapshot {
  state: StageState;
  previous: StageState | null;
  countdownRemaining: number | null;
  enteredAt: number;
  config: StageConfig;
}

export type StageListener = (snapshot: StageSnapshot) => void;

const DEFAULT_CONFIG: StageConfig = {
  curtainDurationMs: 4000,
  countdownSeconds: 10,
  lightingTransitionMs: 800,
};

let current: StageSnapshot = {
  state: 'STAGE_PREP',
  previous: null,
  countdownRemaining: null,
  enteredAt: Date.now(),
  config: { ...DEFAULT_CONFIG },
};

const listeners = new Set<StageListener>();
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((fn) => {
    try { fn({ ...current }); } catch { /* isolated */ }
  });
}

function transition(next: StageState) {
  current = {
    ...current,
    previous: current.state,
    state: next,
    enteredAt: Date.now(),
    countdownRemaining: next === 'COUNTDOWN' ? current.config.countdownSeconds : null,
  };
  notify();
}

// ── Public API ────────────────────────────────────────────────────────────────

export function configureStage(config: Partial<StageConfig>) {
  current = { ...current, config: { ...current.config, ...config } };
}

export function getStageSnapshot(): StageSnapshot {
  return { ...current };
}

export function subscribeStage(fn: StageListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function startCountdown(): void {
  if (current.state !== 'STAGE_PREP') return;
  transition('COUNTDOWN');

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    if (current.countdownRemaining === null) return;

    if (current.countdownRemaining <= 1) {
      clearInterval(countdownTimer!);
      countdownTimer = null;
      openCurtain();
      return;
    }

    current = { ...current, countdownRemaining: current.countdownRemaining - 1 };
    notify();
  }, 1000);
}

export function openCurtain(): void {
  if (current.state !== 'COUNTDOWN') return;
  transition('CURTAIN_PART');

  setTimeout(() => {
    transition('LIGHTING_SNAP');
    setTimeout(() => {
      transition('CAMERA_LIVE');
    }, current.config.lightingTransitionMs);
  }, current.config.curtainDurationMs);
}

export function triggerIntermission(): void {
  if (current.state !== 'CAMERA_LIVE') return;
  transition('INTERMISSION');
}

export function resumeFromIntermission(): void {
  if (current.state !== 'INTERMISSION') return;
  transition('CAMERA_LIVE');
}

export function closeCurtainAndEnd(): void {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  transition('CURTAIN_CLOSE');
  setTimeout(() => transition('ENDED'), current.config.curtainDurationMs);
}

export function resetStage(config?: Partial<StageConfig>): void {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  current = {
    state: 'STAGE_PREP',
    previous: null,
    countdownRemaining: null,
    enteredAt: Date.now(),
    config: { ...DEFAULT_CONFIG, ...(config ?? {}) },
  };
  notify();
}

export function isLive(): boolean {
  return current.state === 'CAMERA_LIVE';
}
