/**
 * HostPropEngine
 * Manages Bebo's stage props: hook, lasso, cane, vacuum, magnet, spotlight, trapdoor, etc.
 */

export type HostProp =
  | "hook"
  | "lasso"
  | "cane"
  | "vacuum"
  | "magnet"
  | "yoink-stick"
  | "boxing-glove"
  | "fishing-rod"
  | "spotlight-pull"
  | "trapdoor"
  | "confetti-cannon"
  | "megaphone"
  | "scoreboard"
  | "timer-clock"
  | "crown"
  | "elimination-buzzer";

export type PropAction =
  | "deploy"       // bring prop on stage
  | "aim"          // aim at target
  | "activate"     // fire / use
  | "retract"      // pull back
  | "hide";        // remove from stage

export interface PropState {
  prop: HostProp;
  isVisible: boolean;
  isActive: boolean;
  targetUserId?: string;
  cooldownUntil: number;
}

export interface PropEvent {
  hostId: string;
  prop: HostProp;
  action: PropAction;
  targetUserId?: string;
  effectLabel: string;
  timestamp: number;
}

const PROP_COOLDOWNS: Record<HostProp, number> = {
  hook:              4000,
  lasso:             5000,
  cane:              3000,
  vacuum:            6000,
  magnet:            4000,
  "yoink-stick":     3000,
  "boxing-glove":    5000,
  "fishing-rod":     7000,
  "spotlight-pull":  4000,
  trapdoor:          8000,
  "confetti-cannon": 3000,
  megaphone:         2000,
  scoreboard:        1000,
  "timer-clock":     1000,
  crown:             3000,
  "elimination-buzzer": 5000,
};

const PROP_EFFECTS: Record<HostProp, string> = {
  hook:              "Hooked off stage!",
  lasso:             "Lassoed back in!",
  cane:              "Gently tapped off!",
  vacuum:            "Vacuumed away!",
  magnet:            "Magnetically pulled!",
  "yoink-stick":     "YOINKED!",
  "boxing-glove":    "KO'd off stage!",
  "fishing-rod":     "Reeled in!",
  "spotlight-pull":  "Spotlight on you!",
  trapdoor:          "TRAPDOOR!",
  "confetti-cannon": "Confetti blast!",
  megaphone:         "ANNOUNCEMENT!",
  scoreboard:        "Scoreboard revealed!",
  "timer-clock":     "Clock started!",
  crown:             "CROWNED!",
  "elimination-buzzer": "BUZZER!",
};

export class HostPropEngine {
  private static _instance: HostPropEngine | null = null;

  private _props: Map<string, Map<HostProp, PropState>> = new Map();
  private _eventLog: PropEvent[] = [];
  private _listeners: Set<(event: PropEvent) => void> = new Set();

  static getInstance(): HostPropEngine {
    if (!HostPropEngine._instance) {
      HostPropEngine._instance = new HostPropEngine();
    }
    return HostPropEngine._instance;
  }

  registerHost(hostId: string): void {
    if (this._props.has(hostId)) return;
    const propMap = new Map<HostProp, PropState>();
    const allProps: HostProp[] = [
      "hook", "lasso", "cane", "vacuum", "magnet", "yoink-stick",
      "boxing-glove", "fishing-rod", "spotlight-pull", "trapdoor",
      "confetti-cannon", "megaphone", "scoreboard", "timer-clock",
      "crown", "elimination-buzzer",
    ];
    for (const p of allProps) {
      propMap.set(p, { prop: p, isVisible: false, isActive: false, cooldownUntil: 0 });
    }
    this._props.set(hostId, propMap);
  }

  // ── Prop control ───────────────────────────────────────────────────────────

  useProp(hostId: string, prop: HostProp, targetUserId?: string): PropEvent | null {
    const propMap = this._props.get(hostId);
    if (!propMap) return null;

    const state = propMap.get(prop)!;
    if (Date.now() < state.cooldownUntil) return null;

    state.isVisible = true;
    state.isActive = true;
    state.targetUserId = targetUserId;
    state.cooldownUntil = Date.now() + PROP_COOLDOWNS[prop];

    const event: PropEvent = {
      hostId,
      prop,
      action: "activate",
      targetUserId,
      effectLabel: PROP_EFFECTS[prop],
      timestamp: Date.now(),
    };

    this._eventLog.push(event);
    for (const cb of this._listeners) cb(event);

    // Auto-retract
    setTimeout(() => {
      state.isActive = false;
      state.isVisible = false;
    }, 2000);

    return event;
  }

  eliminateContestant(hostId: string, userId: string): PropEvent | null {
    return this.useProp(hostId, "hook", userId);
  }

  crownWinner(hostId: string, userId: string): PropEvent | null {
    return this.useProp(hostId, "crown", userId);
  }

  buzzElimination(hostId: string): PropEvent | null {
    return this.useProp(hostId, "elimination-buzzer");
  }

  fireConfetti(): PropEvent | null {
    const hostId = [...(this._props.keys())][0];
    if (!hostId) return null;
    return this.useProp(hostId, "confetti-cannon");
  }

  getCooldownMs(hostId: string, prop: HostProp): number {
    const remaining = (this._props.get(hostId)?.get(prop)?.cooldownUntil ?? 0) - Date.now();
    return Math.max(0, remaining);
  }

  isOnCooldown(hostId: string, prop: HostProp): boolean {
    return this.getCooldownMs(hostId, prop) > 0;
  }

  getAvailableProps(hostId: string): HostProp[] {
    const propMap = this._props.get(hostId);
    if (!propMap) return [];
    return [...propMap.entries()]
      .filter(([, state]) => Date.now() >= state.cooldownUntil)
      .map(([prop]) => prop);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  onPropEvent(cb: (event: PropEvent) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  getEventLog(limit = 50): PropEvent[] {
    return this._eventLog.slice(-limit);
  }
}

export const hostPropEngine = HostPropEngine.getInstance();
