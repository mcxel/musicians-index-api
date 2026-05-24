// MomentOrchestrator — Sits above all showmanship engines.
// Listens to live signals, fires monetization and engagement actions at emotional peaks.

export type MomentEvent =
  | "REACTION_SPIKE"
  | "CROWN_TRANSFER"
  | "CHAT_VELOCITY_HIGH"
  | "RETENTION_PEAK"
  | "ATTENTION_LOCK"
  | "SEAT_UPGRADE_SUCCESS"
  | "CHOREOGRAPHY_PEAK"
  | "TIP_RECEIVED"
  | "AUDIENCE_GROWTH";

export interface MomentSignal {
  event: MomentEvent;
  intensity: number; // 0–1
  timestamp: number;
  meta?: Record<string, unknown>;
}

export type MomentAction =
  | { type: "PULSE_SEAT_UPGRADE"; pressure: "low" | "medium" | "high"; label: string }
  | { type: "TRIGGER_SPONSOR_POP"; sponsorId?: string }
  | { type: "FOCUS_MEDIA_SURFACE"; slotIndex: number }
  | { type: "TIGHTEN_CAMERA"; intensity: number }
  | { type: "FLASH_XP_GAIN"; amount: number }
  | { type: "SHOW_SOCIAL_PROOF"; message: string };

export type MomentActionHandler = (action: MomentAction) => void;

// ── Trigger rule: when a signal passes a threshold, fire actions ──────────────

interface TriggerRule {
  event: MomentEvent;
  minIntensity: number;
  cooldownMs: number;
  actions: MomentAction[];
}

const DEFAULT_RULES: TriggerRule[] = [
  {
    event: "REACTION_SPIKE",
    minIntensity: 0.6,
    cooldownMs: 12000,
    actions: [
      { type: "PULSE_SEAT_UPGRADE", pressure: "high", label: "🔥 Reaction spike! Move closer now" },
      { type: "SHOW_SOCIAL_PROOF", message: "🔥 Room is on fire — people are moving up!" },
    ],
  },
  {
    event: "CROWN_TRANSFER",
    minIntensity: 0.5,
    cooldownMs: 20000,
    actions: [
      { type: "TRIGGER_SPONSOR_POP" },
      { type: "PULSE_SEAT_UPGRADE", pressure: "medium", label: "👑 Crown just changed — get closer" },
    ],
  },
  {
    event: "CHAT_VELOCITY_HIGH",
    minIntensity: 0.7,
    cooldownMs: 15000,
    actions: [
      { type: "PULSE_SEAT_UPGRADE", pressure: "medium", label: "💬 Everyone is reacting — don't miss it" },
      { type: "SHOW_SOCIAL_PROOF", message: "💬 Chat is going crazy right now" },
    ],
  },
  {
    event: "RETENTION_PEAK",
    minIntensity: 0.8,
    cooldownMs: 30000,
    actions: [
      { type: "TRIGGER_SPONSOR_POP" },
      { type: "FLASH_XP_GAIN", amount: 25 },
    ],
  },
  {
    event: "ATTENTION_LOCK",
    minIntensity: 0.8,
    cooldownMs: 10000,
    actions: [
      { type: "FOCUS_MEDIA_SURFACE", slotIndex: 0 },
      { type: "TIGHTEN_CAMERA", intensity: 0.7 },
    ],
  },
  {
    event: "SEAT_UPGRADE_SUCCESS",
    minIntensity: 0,
    cooldownMs: 5000,
    actions: [
      { type: "TRIGGER_SPONSOR_POP" },
      { type: "FLASH_XP_GAIN", amount: 50 },
      { type: "SHOW_SOCIAL_PROOF", message: "⬆ Someone just moved closer!" },
    ],
  },
  {
    event: "TIP_RECEIVED",
    minIntensity: 0,
    cooldownMs: 8000,
    actions: [
      { type: "SHOW_SOCIAL_PROOF", message: "💸 A tip just landed!" },
      { type: "FLASH_XP_GAIN", amount: 30 },
    ],
  },
  {
    event: "CHOREOGRAPHY_PEAK",
    minIntensity: 0.65,
    cooldownMs: 18000,
    actions: [
      { type: "PULSE_SEAT_UPGRADE", pressure: "high", label: "🎶 Peak moment — get to the front" },
      { type: "TIGHTEN_CAMERA", intensity: 0.9 },
    ],
  },
  {
    event: "AUDIENCE_GROWTH",
    minIntensity: 0.5,
    cooldownMs: 25000,
    actions: [
      { type: "SHOW_SOCIAL_PROOF", message: "👥 Audience is growing — room is filling up" },
      { type: "PULSE_SEAT_UPGRADE", pressure: "low", label: "👥 Room is filling — grab your spot" },
    ],
  },
];

// ── MomentOrchestrator class ───────────────────────────────────────────────────

export class MomentOrchestrator {
  private handlers: MomentActionHandler[] = [];
  private lastFired = new Map<MomentEvent, number>();
  private signalLog: MomentSignal[] = [];
  private rules: TriggerRule[];
  private momentumScore = 0; // 0–100 rolling intensity

  constructor(rules: TriggerRule[] = DEFAULT_RULES) {
    this.rules = rules;
  }

  // Register a handler that receives fired actions
  onAction(handler: MomentActionHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  // Feed a live signal into the orchestrator
  signal(event: MomentEvent, intensity: number, meta?: Record<string, unknown>): void {
    const s: MomentSignal = { event, intensity, timestamp: Date.now(), meta };
    this.signalLog = [...this.signalLog.slice(-99), s];

    const prevMomentum = this.momentumScore;
    this.updateMomentum(intensity);
    const delta = this.momentumScore - prevMomentum;

    // Pre-moment trigger: fire urgency during the build-up, not just at peak
    const DELTA_COOLDOWN_KEY = "__delta__" as MomentEvent;
    const lastDelta = this.lastFired.get(DELTA_COOLDOWN_KEY) ?? 0;
    if (delta > 8 && Date.now() - lastDelta > 10000) {
      this.lastFired.set(DELTA_COOLDOWN_KEY, Date.now());
      this.dispatch({ type: "PULSE_SEAT_UPGRADE", pressure: "high", label: "⚡ It's building — move now" });
    }

    let ruleFired = false;
    for (const rule of this.rules) {
      if (rule.event !== event) continue;
      if (intensity < rule.minIntensity) continue;
      const last = this.lastFired.get(event) ?? 0;
      if (Date.now() - last < rule.cooldownMs) continue;

      this.lastFired.set(event, Date.now());
      for (const action of rule.actions) {
        this.dispatch(action);
      }
      ruleFired = true;
    }

    // Auto-tick the closure cooldown counter whenever a real peak fires
    if (ruleFired) {
      // Lazy import to avoid circular dependency at module load time
      import("@/lib/showmanship/ClosureSequenceEngine")
        .then(({ getClosureEngine }) => { getClosureEngine().recordMomentPassed(); })
        .catch(() => { /* non-critical */ });
    }
  }

  // Convenience: signal from real-time room metrics
  ingestRoomMetrics(metrics: {
    reactionRate: number;     // reactions/sec
    chatMessagesPerSec: number;
    viewerRetentionPct: number; // 0–100
    tipCount: number;
    activeViewers: number;
  }): void {
    if (metrics.reactionRate > 2.5) {
      this.signal("REACTION_SPIKE", Math.min(metrics.reactionRate / 5, 1));
    }
    if (metrics.chatMessagesPerSec > 3) {
      this.signal("CHAT_VELOCITY_HIGH", Math.min(metrics.chatMessagesPerSec / 6, 1));
    }
    if (metrics.viewerRetentionPct > 75) {
      this.signal("RETENTION_PEAK", metrics.viewerRetentionPct / 100);
    }
    if (metrics.activeViewers > 20) {
      this.signal("AUDIENCE_GROWTH", Math.min(metrics.activeViewers / 100, 1));
    }
  }

  getMomentumScore(): number {
    return Math.round(this.momentumScore);
  }

  getSignalLog(): MomentSignal[] {
    return [...this.signalLog];
  }

  getRecentEvents(windowMs = 30000): MomentSignal[] {
    const cutoff = Date.now() - windowMs;
    return this.signalLog.filter(s => s.timestamp > cutoff);
  }

  // Pressure label for SeatUpgradeUI based on current room momentum
  getSeatUpgradePressureLabel(baseLabel: string): string {
    if (this.momentumScore > 75) return `⚠ You're missing the moment — ${baseLabel}`;
    if (this.momentumScore > 50) return `👑 Everyone is moving forward — ${baseLabel}`;
    if (this.momentumScore > 25) return `🔥 Room heating up — ${baseLabel}`;
    return baseLabel;
  }

  isMomentumHigh(): boolean {
    return this.momentumScore > 60;
  }

  dispatch(action: MomentAction): void {
    for (const h of this.handlers) {
      try { h(action); } catch { /* handler error should not break orchestrator */ }
    }
  }

  private updateMomentum(intensity: number): void {
    const prev = this.momentumScore;
    this.momentumScore = prev * 0.92 + intensity * 100 * 0.08;
    if (this.momentumScore < 0.5) this.momentumScore = 0;

    // Decay-based pressure: fire regret window as momentum slides off a peak
    const wasHigh = prev > 50;
    const nowMid = this.momentumScore >= 20 && this.momentumScore < 40;
    const DECAY_KEY = "__decay__" as MomentEvent;
    const lastDecay = this.lastFired.get(DECAY_KEY) ?? 0;
    if (wasHigh && nowMid && Date.now() - lastDecay > 18000) {
      this.lastFired.set(DECAY_KEY, Date.now());
      this.dispatch({ type: "PULSE_SEAT_UPGRADE", pressure: "low", label: "👀 You almost missed it" });
      this.dispatch({ type: "SHOW_SOCIAL_PROOF", message: "💨 The moment is fading — are you in?" });
    }
  }

  // Call this after a confirmed seat upgrade to chain the conversion loop
  notifySeatUpgrade(userId: string): void {
    this.signal("SEAT_UPGRADE_SUCCESS", 1, { userId });
    // Staggered chain: sponsor pop immediately, social proof after 1.2s
    this.dispatch({ type: "TRIGGER_SPONSOR_POP" });
    setTimeout(() => {
      this.dispatch({ type: "SHOW_SOCIAL_PROOF", message: "⬆ People are moving up fast" });
    }, 1200);
    setTimeout(() => {
      this.dispatch({ type: "FLASH_XP_GAIN", amount: 50 });
    }, 600);
  }
}

// Singleton for use across components without prop-drilling
let _globalOrchestrator: MomentOrchestrator | null = null;

export function getGlobalOrchestrator(): MomentOrchestrator {
  if (!_globalOrchestrator) _globalOrchestrator = new MomentOrchestrator();
  return _globalOrchestrator;
}

export function resetGlobalOrchestrator(): void {
  _globalOrchestrator = null;
}
