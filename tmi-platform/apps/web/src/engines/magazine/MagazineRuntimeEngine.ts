export type MagazineRuntimePhase = "holding" | "starburst" | "flipping" | "settling";

export type MagazineSceneId = "home-1" | "home-1-2" | "home-2" | "home-3" | "home-4" | "home-5";

export type MagazineRuntimeScene = {
  id: MagazineSceneId;
  durationMs: number;
  nextSceneId: MagazineSceneId;
};

export type MagazineTransitionTimings = {
  starburstMs: number;
  flipMs: number;
  settleMs: number;
};

export const MAGAZINE_V1_TRANSITION_MS: MagazineTransitionTimings = {
  starburstMs: 420,
  flipMs: 820,
  settleMs: 420,
};

export const MAGAZINE_V1_SCENE_REGISTRY: Record<MagazineSceneId, MagazineRuntimeScene> = {
  "home-1":   { id: "home-1",   durationMs: 30000, nextSceneId: "home-1-2" },
  "home-1-2": { id: "home-1-2", durationMs: 30000, nextSceneId: "home-2"   },
  "home-2":   { id: "home-2",   durationMs: 60000, nextSceneId: "home-3"   },
  "home-3":   { id: "home-3",   durationMs: 60000, nextSceneId: "home-4"   },
  "home-4":   { id: "home-4",   durationMs: 60000, nextSceneId: "home-5"   },
  "home-5":   { id: "home-5",   durationMs: 60000, nextSceneId: "home-1"   },
};

export const MASTER_RESET_TIMINGS: MagazineTransitionTimings = {
  starburstMs: 900,
  flipMs: 1200,
  settleMs: 600,
};

type MagazineRuntimeCallbacks = {
  onPhaseChange: (phase: MagazineRuntimePhase) => void;
  onAdvance: (nextSceneId: MagazineSceneId) => void;
};

type MagazineRuntimeEngineOptions = {
  scene: MagazineRuntimeScene;
  timings?: Partial<MagazineTransitionTimings>;
} & MagazineRuntimeCallbacks;

export class MagazineRuntimeEngine {
  private readonly scene: MagazineRuntimeScene;
  private readonly callbacks: MagazineRuntimeCallbacks;
  private readonly timings: MagazineTransitionTimings;
  private holdTimer: number | null = null;
  private transitionTimers: number[] = [];
  private running = false;

  constructor(options: MagazineRuntimeEngineOptions) {
    this.scene = options.scene;
    this.callbacks = {
      onPhaseChange: options.onPhaseChange,
      onAdvance: options.onAdvance,
    };
    this.timings = {
      starburstMs: options.timings?.starburstMs ?? MAGAZINE_V1_TRANSITION_MS.starburstMs,
      flipMs: options.timings?.flipMs ?? MAGAZINE_V1_TRANSITION_MS.flipMs,
      settleMs: options.timings?.settleMs ?? MAGAZINE_V1_TRANSITION_MS.settleMs,
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.callbacks.onPhaseChange("holding");
    this.holdTimer = window.setTimeout(() => {
      this.runTransition();
    }, this.scene.durationMs);
  }

  stop() {
    this.running = false;
    this.clearTimers();
  }

  interrupt() {
    this.stop();
    this.callbacks.onPhaseChange("holding");
  }

  private runTransition() {
    if (!this.running) return;

    this.callbacks.onPhaseChange("starburst");

    this.transitionTimers.push(
      window.setTimeout(() => {
        if (!this.running) return;
        this.callbacks.onPhaseChange("flipping");
      }, this.timings.starburstMs)
    );

    this.transitionTimers.push(
      window.setTimeout(() => {
        if (!this.running) return;
        this.callbacks.onPhaseChange("settling");
      }, this.timings.starburstMs + this.timings.flipMs)
    );

    this.transitionTimers.push(
      window.setTimeout(() => {
        if (!this.running) return;
        this.callbacks.onAdvance(this.scene.nextSceneId);
      }, this.timings.starburstMs + this.timings.flipMs + this.timings.settleMs)
    );
  }

  private clearTimers() {
    if (this.holdTimer !== null) {
      window.clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    for (const timer of this.transitionTimers) {
      window.clearTimeout(timer);
    }
    this.transitionTimers = [];
  }
}
