/**
 * HostPoseEngine
 * Random and triggered pose variation for hosts while idle or reacting.
 */

export type HostPose =
  | "standing-neutral"
  | "leaning-left"
  | "leaning-right"
  | "arms-crossed"
  | "hands-on-hips"
  | "one-hand-raised"
  | "both-hands-raised"
  | "laughing"
  | "thinking"
  | "dancing-left"
  | "dancing-right"
  | "bow"
  | "shrug"
  | "pointing-forward"
  | "reading-clipboard"
  | "surprised"
  | "clapping";

export type PoseTrigger =
  | "idle"
  | "funny-moment"
  | "dramatic-moment"
  | "winner"
  | "elimination"
  | "audience-reaction"
  | "score-reveal"
  | "commercial-break"
  | "show-open"
  | "show-close";

export interface PoseState {
  hostId: string;
  currentPose: HostPose;
  prevPose: HostPose;
  lockedUntil: number;
  trigger: PoseTrigger;
}

const TRIGGER_POSES: Record<PoseTrigger, HostPose[]> = {
  idle: ["standing-neutral", "leaning-left", "leaning-right", "arms-crossed", "hands-on-hips", "thinking"],
  "funny-moment": ["laughing", "shrug", "surprised"],
  "dramatic-moment": ["arms-crossed", "pointing-forward", "one-hand-raised"],
  winner: ["both-hands-raised", "clapping", "dancing-left"],
  elimination: ["pointing-forward", "one-hand-raised", "shrug"],
  "audience-reaction": ["both-hands-raised", "clapping", "dancing-right"],
  "score-reveal": ["reading-clipboard", "surprised", "one-hand-raised"],
  "commercial-break": ["leaning-left", "leaning-right", "hands-on-hips"],
  "show-open": ["both-hands-raised", "dancing-left", "pointing-forward"],
  "show-close": ["bow", "clapping", "both-hands-raised"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HostPoseEngine {
  private static _instance: HostPoseEngine | null = null;

  private _states: Map<string, PoseState> = new Map();
  private _listeners: Set<(hostId: string, pose: HostPose) => void> = new Set();
  private _autoTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  static getInstance(): HostPoseEngine {
    if (!HostPoseEngine._instance) {
      HostPoseEngine._instance = new HostPoseEngine();
    }
    return HostPoseEngine._instance;
  }

  registerHost(hostId: string, initialPose: HostPose = "standing-neutral"): void {
    this._states.set(hostId, {
      hostId,
      currentPose: initialPose,
      prevPose: initialPose,
      lockedUntil: 0,
      trigger: "idle",
    });
  }

  // ── Pose control ───────────────────────────────────────────────────────────

  setPose(hostId: string, pose: HostPose, trigger: PoseTrigger = "idle", lockMs = 2000): void {
    const state = this._states.get(hostId);
    if (!state) return;
    if (Date.now() < state.lockedUntil && trigger === "idle") return;
    state.prevPose = state.currentPose;
    state.currentPose = pose;
    state.trigger = trigger;
    state.lockedUntil = Date.now() + lockMs;
    for (const cb of this._listeners) cb(hostId, pose);
  }

  triggerPose(hostId: string, trigger: PoseTrigger): void {
    const options = TRIGGER_POSES[trigger] ?? TRIGGER_POSES.idle;
    const pose = pick(options);
    const lockMs = trigger === "idle" ? 4000 : 2500;
    this.setPose(hostId, pose, trigger, lockMs);
  }

  randomIdle(hostId: string): void {
    this.triggerPose(hostId, "idle");
  }

  // ── Auto-variation ────────────────────────────────────────────────────────

  startAutoVariation(hostId: string, intervalMs = 10000): void {
    this.stopAutoVariation(hostId);
    const timer = setInterval(() => {
      const state = this._states.get(hostId);
      if (state && state.trigger === "idle") {
        this.randomIdle(hostId);
      }
    }, intervalMs);
    this._autoTimers.set(hostId, timer);
  }

  stopAutoVariation(hostId: string): void {
    const timer = this._autoTimers.get(hostId);
    if (timer) {
      clearInterval(timer);
      this._autoTimers.delete(hostId);
    }
  }

  // ── State access ───────────────────────────────────────────────────────────

  getState(hostId: string): PoseState | null {
    return this._states.get(hostId) ?? null;
  }

  getCurrentPose(hostId: string): HostPose {
    return this._states.get(hostId)?.currentPose ?? "standing-neutral";
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (hostId: string, pose: HostPose) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }
}

export const hostPoseEngine = HostPoseEngine.getInstance();
