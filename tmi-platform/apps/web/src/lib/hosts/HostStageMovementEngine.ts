/**
 * HostStageMovementEngine
 * Controls host body movement across the stage: walking, pointing, reactions, celebrations.
 */

export type StageZone =
  | "center"
  | "left"
  | "right"
  | "front"
  | "back"
  | "contestant-left"
  | "contestant-right"
  | "judge-panel"
  | "exit";

export type MovementType =
  | "walk"
  | "run"
  | "strut"
  | "slide"
  | "teleport";

export type StageGesture =
  | "point-left"
  | "point-right"
  | "point-up"
  | "point-audience"
  | "arms-out"
  | "arms-crossed"
  | "hands-hip"
  | "thumbs-up"
  | "facepalm"
  | "spin"
  | "bow"
  | "shrug"
  | "push-away"
  | "pull-back"
  | "beckoning"
  | "celebrate"
  | "step-back"
  | "lean-in"
  | "head-shake"
  | "head-nod";

export type IdleVariant =
  | "standing"
  | "leaning"
  | "arms-crossed"
  | "laughing"
  | "dancing"
  | "thinking"
  | "tapping-foot";

export interface StagePosition {
  zone: StageZone;
  x: number; // 0–1 normalized left-right
  y: number; // 0–1 normalized front-back
}

export interface MovementCommand {
  id: string;
  hostId: string;
  from: StagePosition;
  to: StagePosition;
  movementType: MovementType;
  durationMs: number;
  gesture?: StageGesture;
  enqueuedAt: number;
}

export interface MovementState {
  hostId: string;
  currentPosition: StagePosition;
  isMoving: boolean;
  currentGesture: StageGesture | null;
  currentIdle: IdleVariant;
  lastMovedAt: number;
}

const ZONE_POSITIONS: Record<StageZone, StagePosition> = {
  center:           { zone: "center",           x: 0.5,  y: 0.5 },
  left:             { zone: "left",             x: 0.15, y: 0.5 },
  right:            { zone: "right",            x: 0.85, y: 0.5 },
  front:            { zone: "front",            x: 0.5,  y: 0.9 },
  back:             { zone: "back",             x: 0.5,  y: 0.1 },
  "contestant-left":  { zone: "contestant-left",  x: 0.25, y: 0.6 },
  "contestant-right": { zone: "contestant-right", x: 0.75, y: 0.6 },
  "judge-panel":    { zone: "judge-panel",      x: 0.5,  y: 0.15 },
  exit:             { zone: "exit",             x: 1.0,  y: 0.5 },
};

function walkDuration(from: StagePosition, to: StagePosition, movementType: MovementType): number {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const speeds: Record<MovementType, number> = {
    walk: 1200,
    run: 500,
    strut: 2000,
    slide: 800,
    teleport: 0,
  };
  return Math.round(dist * speeds[movementType]) + 200;
}

export class HostStageMovementEngine {
  private static _instance: HostStageMovementEngine | null = null;

  private _states: Map<string, MovementState> = new Map();
  private _queues: Map<string, MovementCommand[]> = new Map();
  private _listeners: Set<(hostId: string, state: MovementState) => void> = new Set();
  private _idleTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  static getInstance(): HostStageMovementEngine {
    if (!HostStageMovementEngine._instance) {
      HostStageMovementEngine._instance = new HostStageMovementEngine();
    }
    return HostStageMovementEngine._instance;
  }

  // ── Host registration ─────────────────────────────────────────────────────

  registerHost(hostId: string, startZone: StageZone = "center"): MovementState {
    const state: MovementState = {
      hostId,
      currentPosition: { ...ZONE_POSITIONS[startZone] },
      isMoving: false,
      currentGesture: null,
      currentIdle: "standing",
      lastMovedAt: Date.now(),
    };
    this._states.set(hostId, state);
    this._queues.set(hostId, []);
    this._scheduleIdleVariation(hostId);
    return state;
  }

  getState(hostId: string): MovementState | null {
    return this._states.get(hostId) ?? null;
  }

  // ── Movement commands ──────────────────────────────────────────────────────

  moveTo(
    hostId: string,
    targetZone: StageZone,
    movementType: MovementType = "walk",
    gesture?: StageGesture,
  ): MovementCommand | null {
    const state = this._states.get(hostId);
    if (!state) return null;

    const to = { ...ZONE_POSITIONS[targetZone] };
    const duration = walkDuration(state.currentPosition, to, movementType);

    const cmd: MovementCommand = {
      id: Math.random().toString(36).slice(2),
      hostId,
      from: { ...state.currentPosition },
      to,
      movementType,
      durationMs: duration,
      gesture,
      enqueuedAt: Date.now(),
    };

    if (!state.isMoving) {
      this._executeMovement(cmd);
    } else {
      this._queues.get(hostId)?.push(cmd);
    }

    return cmd;
  }

  gesture(hostId: string, gesture: StageGesture, durationMs = 1500): void {
    const state = this._states.get(hostId);
    if (!state) return;
    state.currentGesture = gesture;
    this._emit(hostId, state);
    setTimeout(() => {
      const s = this._states.get(hostId);
      if (s) {
        s.currentGesture = null;
        this._emit(hostId, s);
      }
    }, durationMs);
  }

  setIdle(hostId: string, variant: IdleVariant): void {
    const state = this._states.get(hostId);
    if (!state || state.isMoving) return;
    state.currentIdle = variant;
    this._emit(hostId, state);
  }

  // ── Prebuilt choreography ─────────────────────────────────────────────────

  walkToContestant(hostId: string, side: "left" | "right"): void {
    const zone = side === "left" ? "contestant-left" : "contestant-right";
    this.moveTo(hostId, zone, "walk", "point-audience");
  }

  celebrateWinner(hostId: string): void {
    this.moveTo(hostId, "center", "strut");
    setTimeout(() => this.gesture(hostId, "celebrate", 2000), 600);
    setTimeout(() => this.gesture(hostId, "arms-out", 1500), 2800);
  }

  eliminateContestant(hostId: string, side: "left" | "right"): void {
    const zone = side === "left" ? "contestant-left" : "contestant-right";
    this.moveTo(hostId, zone, "walk", "point-left");
    setTimeout(() => this.gesture(hostId, "push-away", 1200), 800);
    setTimeout(() => this.moveTo(hostId, "center", "walk"), 2200);
  }

  openShow(hostId: string): void {
    this.moveTo(hostId, "front", "strut");
    setTimeout(() => this.gesture(hostId, "arms-out", 2000), 1000);
  }

  closeShow(hostId: string): void {
    this.moveTo(hostId, "center", "walk");
    setTimeout(() => this.gesture(hostId, "bow", 1500), 800);
    setTimeout(() => this.moveTo(hostId, "exit", "strut"), 2500);
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (hostId: string, state: MovementState) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _executeMovement(cmd: MovementCommand): void {
    const state = this._states.get(cmd.hostId);
    if (!state) return;

    state.isMoving = true;
    if (cmd.gesture) state.currentGesture = cmd.gesture;
    this._emit(cmd.hostId, state);

    if (cmd.movementType !== "teleport") {
      setTimeout(() => this._completeMovement(cmd), cmd.durationMs);
    } else {
      this._completeMovement(cmd);
    }
  }

  private _completeMovement(cmd: MovementCommand): void {
    const state = this._states.get(cmd.hostId);
    if (!state) return;
    state.currentPosition = { ...cmd.to };
    state.isMoving = false;
    state.currentGesture = null;
    state.lastMovedAt = Date.now();
    this._emit(cmd.hostId, state);

    const next = this._queues.get(cmd.hostId)?.shift();
    if (next) this._executeMovement(next);
  }

  private _scheduleIdleVariation(hostId: string): void {
    const delay = 8000 + Math.random() * 12000;
    const timer = setTimeout(() => {
      const state = this._states.get(hostId);
      if (state && !state.isMoving) {
        const idles: IdleVariant[] = ["standing", "leaning", "arms-crossed", "laughing", "dancing", "thinking", "tapping-foot"];
        state.currentIdle = idles[Math.floor(Math.random() * idles.length)];
        this._emit(hostId, state);
      }
      this._scheduleIdleVariation(hostId);
    }, delay);
    this._idleTimers.set(hostId, timer);
  }

  private _emit(hostId: string, state: MovementState): void {
    for (const cb of this._listeners) cb(hostId, state);
  }
}

export const hostStageMovementEngine = HostStageMovementEngine.getInstance();
