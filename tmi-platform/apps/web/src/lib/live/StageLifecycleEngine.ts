/**
 * StageLifecycleEngine
 * Coordinates: STAGE_PREP → COUNTDOWN → CURTAIN_PART → LIGHTING_SNAP → CAMERA_LIVE
 * Intermission: CAMERA_LIVE → (arm countdown) → CURTAIN_CLOSE → INTERMISSION → CURTAIN_PART → CAMERA_LIVE
 * END: → CURTAIN_CLOSE → ENDED
 *
 * PerformanceState (canonical product surface — not CSS-inferred):
 *   PREPARING | LIVE | INTERMISSION | ENDING | ENDED
 */

export type StageState =
  | "STAGE_PREP"
  | "COUNTDOWN"
  | "CURTAIN_PART"
  | "LIGHTING_SNAP"
  | "CAMERA_LIVE"
  | "INTERMISSION"
  | "CURTAIN_CLOSE"
  | "ENDED";

/** Product-facing performance states — do not infer from CSS alone. */
export type PerformanceState =
  | "PREPARING"
  | "LIVE"
  | "INTERMISSION"
  | "ENDING"
  | "ENDED";

export interface StageConfig {
  curtainDurationMs: number;
  countdownSeconds: number;
  lightingTransitionMs: number;
  /** Instant GO LIVE open duration (1.2–1.8s). */
  goLiveCurtainMs: number;
  /** Intermission close / resume open duration. */
  intermissionCurtainMs: number;
}

export interface IntermissionAnalytics {
  intermissionStartedAt: number | null;
  intermissionEndedAt: number | null;
  durationMs: number | null;
  adOpportunityCreated: boolean;
  adOpportunityPlayed: boolean;
  adOpportunityCompleted: boolean;
  resumeSuccess: boolean | null;
  lastAdCampaignId: string | null;
}

export interface StageSnapshot {
  state: StageState;
  previous: StageState | null;
  countdownRemaining: number | null;
  enteredAt: number;
  config: StageConfig;
  /** Cancelable arm before curtains close for intermission. */
  intermissionArmRemaining: number | null;
  /** Close destination: intermission keeps session; end tears down show. */
  closeTarget: "intermission" | "end" | null;
  analytics: IntermissionAnalytics;
  resumeError: string | null;
  audienceMicMuted: boolean;
}

export type StageListener = (snapshot: StageSnapshot) => void;

const DEFAULT_CONFIG: StageConfig = {
  curtainDurationMs: 4000,
  countdownSeconds: 10,
  lightingTransitionMs: 800,
  goLiveCurtainMs: 1500,
  intermissionCurtainMs: 1400,
};

const EMPTY_ANALYTICS: IntermissionAnalytics = {
  intermissionStartedAt: null,
  intermissionEndedAt: null,
  durationMs: null,
  adOpportunityCreated: false,
  adOpportunityPlayed: false,
  adOpportunityCompleted: false,
  resumeSuccess: null,
  lastAdCampaignId: null,
};

let current: StageSnapshot = {
  state: "STAGE_PREP",
  previous: null,
  countdownRemaining: null,
  enteredAt: Date.now(),
  config: { ...DEFAULT_CONFIG },
  intermissionArmRemaining: null,
  closeTarget: null,
  analytics: { ...EMPTY_ANALYTICS },
  resumeError: null,
  audienceMicMuted: false,
};

const listeners = new Set<StageListener>();
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let intermissionArmTimer: ReturnType<typeof setInterval> | null = null;
let curtainAnimTimer: ReturnType<typeof setTimeout> | null = null;
let lightingTimer: ReturnType<typeof setTimeout> | null = null;

function clearCurtainTimers() {
  if (curtainAnimTimer) {
    clearTimeout(curtainAnimTimer);
    curtainAnimTimer = null;
  }
  if (lightingTimer) {
    clearTimeout(lightingTimer);
    lightingTimer = null;
  }
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn({ ...current, analytics: { ...current.analytics }, config: { ...current.config } });
    } catch {
      /* isolated */
    }
  });
}

function transition(next: StageState, patch?: Partial<StageSnapshot>) {
  current = {
    ...current,
    ...patch,
    previous: current.state,
    state: next,
    enteredAt: Date.now(),
    countdownRemaining:
      next === "COUNTDOWN"
        ? (patch?.countdownRemaining ?? current.config.countdownSeconds)
        : next === current.state
          ? current.countdownRemaining
          : null,
  };
  notify();
}

export function mapStageToPerformanceState(state: StageState): PerformanceState {
  switch (state) {
    case "CAMERA_LIVE":
      return "LIVE";
    case "INTERMISSION":
      return "INTERMISSION";
    case "CURTAIN_CLOSE":
      return current.closeTarget === "intermission" ? "INTERMISSION" : "ENDING";
    case "ENDED":
      return "ENDED";
    default:
      return "PREPARING";
  }
}

export function getPerformanceState(): PerformanceState {
  return mapStageToPerformanceState(current.state);
}

export function configureStage(config: Partial<StageConfig>) {
  current = { ...current, config: { ...current.config, ...config } };
}

export function getStageSnapshot(): StageSnapshot {
  return {
    ...current,
    analytics: { ...current.analytics },
    config: { ...current.config },
  };
}

export function subscribeStage(fn: StageListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function startCountdown(): void {
  if (current.state !== "STAGE_PREP") return;
  transition("COUNTDOWN");

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
  if (current.state !== "COUNTDOWN") return;
  clearCurtainTimers();
  transition("CURTAIN_PART");

  curtainAnimTimer = setTimeout(() => {
    transition("LIGHTING_SNAP");
    lightingTimer = setTimeout(() => {
      transition("CAMERA_LIVE", { resumeError: null, audienceMicMuted: false });
    }, current.config.lightingTransitionMs);
  }, current.config.curtainDurationMs);
}

/**
 * Instant GO LIVE — call only when bootstrap READY (self + venue + HUD).
 * Curtain open 1.2–1.8s (or shorter when prefers-reduced-motion).
 */
export function openCurtainForInstantGoLive(opts?: { reducedMotion?: boolean }): void {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  clearCurtainTimers();

  if (current.state === "CAMERA_LIVE") return;
  if (current.state === "INTERMISSION") return;

  const openMs = opts?.reducedMotion
    ? 320
    : Math.min(1800, Math.max(1200, current.config.goLiveCurtainMs));

  configureStage({
    curtainDurationMs: openMs,
    goLiveCurtainMs: openMs,
    lightingTransitionMs: opts?.reducedMotion ? 80 : 200,
    countdownSeconds: 0,
  });

  if (
    current.state === "CURTAIN_PART" ||
    current.state === "LIGHTING_SNAP"
  ) {
    transition("CAMERA_LIVE", { resumeError: null, audienceMicMuted: false, closeTarget: null });
    return;
  }

  transition("CURTAIN_PART", { closeTarget: null, resumeError: null });
  curtainAnimTimer = setTimeout(() => {
    transition("LIGHTING_SNAP");
    lightingTimer = setTimeout(() => {
      transition("CAMERA_LIVE", { resumeError: null, audienceMicMuted: false });
    }, current.config.lightingTransitionMs);
  }, current.config.curtainDurationMs);
}

function clearIntermissionArm() {
  if (intermissionArmTimer) {
    clearInterval(intermissionArmTimer);
    intermissionArmTimer = null;
  }
  current = { ...current, intermissionArmRemaining: null };
}

/**
 * Arm INTERMISSION with optional cancelable countdown (default 3s).
 * Does NOT end the live session — preserves liveSessionId / roomId / WebRTC.
 */
export function requestIntermission(opts?: { countdownSeconds?: number }): void {
  if (current.state !== "CAMERA_LIVE") return;
  clearIntermissionArm();
  const sec = Math.max(0, opts?.countdownSeconds ?? 3);

  if (sec === 0) {
    commitIntermissionClose();
    return;
  }

  current = { ...current, intermissionArmRemaining: sec, resumeError: null };
  notify();

  intermissionArmTimer = setInterval(() => {
    const left = (current.intermissionArmRemaining ?? 1) - 1;
    if (left <= 0) {
      clearIntermissionArm();
      notify();
      commitIntermissionClose();
      return;
    }
    current = { ...current, intermissionArmRemaining: left };
    notify();
  }, 1000);
}

export function cancelIntermissionArm(): void {
  if (current.intermissionArmRemaining == null) return;
  clearIntermissionArm();
  notify();
}

function commitIntermissionClose(): void {
  if (current.state !== "CAMERA_LIVE" && current.state !== "CURTAIN_PART") return;
  clearCurtainTimers();
  const closeMs = current.config.intermissionCurtainMs;
  configureStage({ curtainDurationMs: closeMs });
  transition("CURTAIN_CLOSE", {
    closeTarget: "intermission",
    audienceMicMuted: true,
  });

  curtainAnimTimer = setTimeout(() => {
    const startedAt = Date.now();
    current = {
      ...current,
      state: "INTERMISSION",
      previous: "CURTAIN_CLOSE",
      enteredAt: startedAt,
      closeTarget: "intermission",
      audienceMicMuted: true,
      analytics: {
        ...current.analytics,
        intermissionStartedAt: startedAt,
        intermissionEndedAt: null,
        durationMs: null,
        resumeSuccess: null,
      },
    };
    notify();
  }, closeMs);
}

/** Legacy one-shot — arms 0s countdown then closes. */
export function triggerIntermission(): void {
  requestIntermission({ countdownSeconds: 0 });
}

export function markIntermissionAdOpportunity(payload: {
  created?: boolean;
  played?: boolean;
  completed?: boolean;
  campaignId?: string | null;
}): void {
  current = {
    ...current,
    analytics: {
      ...current.analytics,
      adOpportunityCreated:
        payload.created ?? current.analytics.adOpportunityCreated,
      adOpportunityPlayed: payload.played ?? current.analytics.adOpportunityPlayed,
      adOpportunityCompleted:
        payload.completed ?? current.analytics.adOpportunityCompleted,
      lastAdCampaignId:
        payload.campaignId !== undefined
          ? payload.campaignId
          : current.analytics.lastAdCampaignId,
    },
  };
  notify();
}

export type ResumeMediaCheck = {
  ok: boolean;
  error?: string;
};

/**
 * RESUME — same session. Opens curtains only if media check passes.
 * On failure: keep curtains closed, surface resumeError for RETRY.
 */
export function resumeFromIntermission(
  mediaCheck?: () => ResumeMediaCheck | Promise<ResumeMediaCheck>,
): void {
  void (async () => {
    if (current.state !== "INTERMISSION") return;

    let check: ResumeMediaCheck = { ok: true };
    try {
      check = mediaCheck ? await mediaCheck() : { ok: true };
    } catch (err) {
      check = {
        ok: false,
        error: err instanceof Error ? err.message : "Resume media check failed.",
      };
    }

    if (!check.ok) {
      current = {
        ...current,
        resumeError: check.error ?? "Resume media failed — curtains stay closed.",
        analytics: { ...current.analytics, resumeSuccess: false },
      };
      notify();
      return;
    }

    clearCurtainTimers();
    const openMs = current.config.intermissionCurtainMs;
    configureStage({ curtainDurationMs: openMs, lightingTransitionMs: 200 });
    transition("CURTAIN_PART", {
      closeTarget: null,
      resumeError: null,
      audienceMicMuted: false,
    });

    curtainAnimTimer = setTimeout(() => {
      transition("LIGHTING_SNAP");
      lightingTimer = setTimeout(() => {
        const endedAt = Date.now();
        const started = current.analytics.intermissionStartedAt;
        current = {
          ...current,
          state: "CAMERA_LIVE",
          previous: "LIGHTING_SNAP",
          enteredAt: endedAt,
          audienceMicMuted: false,
          resumeError: null,
          closeTarget: null,
          analytics: {
            ...current.analytics,
            intermissionEndedAt: endedAt,
            durationMs: started != null ? endedAt - started : null,
            resumeSuccess: true,
          },
        };
        notify();
      }, current.config.lightingTransitionMs);
    }, openMs);
  })();
}

export function closeCurtainAndEnd(): void {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  clearIntermissionArm();
  clearCurtainTimers();
  transition("CURTAIN_CLOSE", { closeTarget: "end" });
  curtainAnimTimer = setTimeout(() => transition("ENDED", { closeTarget: null }), current.config.curtainDurationMs);
}

export function resetStage(config?: Partial<StageConfig>): void {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  clearIntermissionArm();
  clearCurtainTimers();
  current = {
    state: "STAGE_PREP",
    previous: null,
    countdownRemaining: null,
    enteredAt: Date.now(),
    config: { ...DEFAULT_CONFIG, ...(config ?? {}) },
    intermissionArmRemaining: null,
    closeTarget: null,
    analytics: { ...EMPTY_ANALYTICS },
    resumeError: null,
    audienceMicMuted: false,
  };
  notify();
}

export function isLive(): boolean {
  return current.state === "CAMERA_LIVE";
}

export function isIntermission(): boolean {
  return current.state === "INTERMISSION";
}
