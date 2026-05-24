// ClosureSequenceEngine — "Lock → Reward → Fade → Foreshadow" ritual.
// Runs at the end of a peak moment to encode memory, distribute rewards,
// normalize energy, and plant the hook that brings people back.

import { getGlobalOrchestrator } from "@/lib/showmanship/MomentOrchestrator";
import {
  getForeshadowLine,
  getRewardLabel,
  recordMomentCarried,
  recordCrownWitnessed,
  type FactionId,
} from "@/lib/showmanship/RivalryMemoryEngine";

export type ClosurePhase = "lock" | "reward" | "fade" | "foreshadow" | "idle";

export interface ClosureSequenceState {
  phase: ClosurePhase;
  lockMessage: string;
  rewardLines: Array<{ userId: string; label: string; xp: number }>;
  foreshadowLine: string;
  startedAt: number;
}

export type ClosureStateListener = (state: ClosureSequenceState) => void;

// ── Timing constants ──────────────────────────────────────────────────────────
const LOCK_DURATION_MS      = 2200;
const REWARD_DURATION_MS    = 4500;
const FADE_DURATION_MS      = 3500;
const FORESHADOW_DELAY_MS   = 10000; // 10s after fade starts — "not immediately"
const FORESHADOW_DISPLAY_MS = 4000;

// ── Engine ────────────────────────────────────────────────────────────────────

export class ClosureSequenceEngine {
  private listeners: ClosureStateListener[] = [];
  private running = false;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private momentsSinceLastRitual = 0;  // how many non-ritual peaks have passed
  private readonly MIN_MOMENTS_BETWEEN_RITUALS = 2; // Gemini directive: never back-to-back

  onStateChange(listener: ClosureStateListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit(state: ClosureSequenceState): void {
    for (const l of this.listeners) {
      try { l(state); } catch { /* listener error must not abort sequence */ }
    }
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(setTimeout(fn, ms));
  }

  abort(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    this.running = false;
    this.emit({ phase: "idle", lockMessage: "", rewardLines: [], foreshadowLine: "", startedAt: Date.now() });
  }

  // Call after each non-ritual peak moment so the cooldown counter ticks
  recordMomentPassed(): void {
    this.momentsSinceLastRitual += 1;
  }

  canRunRitual(): boolean {
    return !this.running && this.momentsSinceLastRitual >= this.MIN_MOMENTS_BETWEEN_RITUALS;
  }

  // Main entry point — call when a peak moment ends
  // Returns false and no-ops if cooldown hasn't elapsed
  run(params: {
    triggerUserId: string;         // who triggered / crowned
    topContributorIds?: string[];  // up to 3 "carried that moment" users
    winnerFactionId?: FactionId;
    loserFactionId?: FactionId;
    roomId?: string;
    xpBurst?: number;              // XP for top contributors (default 75)
    consolationXp?: number;        // XP for everyone else (default 20)
    force?: boolean;               // bypass cooldown (admin/test only)
  }): boolean {
    if (!params.force && !this.canRunRitual()) return false;
    if (this.running) this.abort();
    this.running = true;
    this.momentsSinceLastRitual = 0; // reset cooldown counter
    const now = Date.now();
    const orch = getGlobalOrchestrator();

    const {
      triggerUserId,
      topContributorIds = [],
      winnerFactionId,
      loserFactionId,
      roomId,
      xpBurst = 75,
      consolationXp = 20,
    } = params;

    // Record rivalry events
    if (winnerFactionId && loserFactionId) {
      recordCrownWitnessed(triggerUserId, winnerFactionId, loserFactionId, roomId);
    }
    for (const uid of topContributorIds) recordMomentCarried(uid, roomId);

    // Build reward lines
    const rewardLines = topContributorIds.map(uid => ({
      userId: uid,
      label: getRewardLabel(uid, true, uid === triggerUserId),
      xp: xpBurst,
    }));

    // ── PHASE 1: LOCK ──────────────────────────────────────────────────────
    this.emit({
      phase: "lock",
      lockMessage: "👑 remember this.",
      rewardLines,
      foreshadowLine: "",
      startedAt: now,
    });
    orch.signal("RETENTION_PEAK", 0.9);

    // ── PHASE 2: REWARD ────────────────────────────────────────────────────
    this.after(LOCK_DURATION_MS, () => {
      this.emit({
        phase: "reward",
        lockMessage: "👑 remember this.",
        rewardLines,
        foreshadowLine: "",
        startedAt: now,
      });
      orch.dispatch({ type: "FLASH_XP_GAIN", amount: xpBurst });
      orch.dispatch({ type: "SHOW_SOCIAL_PROOF", message: rewardLines[0]?.label ?? "⚡ moment locked" });
      // Consolation flash at staggered time
      this.after(800, () => {
        orch.dispatch({ type: "FLASH_XP_GAIN", amount: consolationXp });
      });
    });

    // ── PHASE 3: FADE ──────────────────────────────────────────────────────
    this.after(LOCK_DURATION_MS + REWARD_DURATION_MS, () => {
      this.emit({
        phase: "fade",
        lockMessage: "",
        rewardLines,
        foreshadowLine: "",
        startedAt: now,
      });
      // Gradually normalize the orchestrator's momentum score
      // (Achieved by not feeding any more signals — natural decay handles it)
    });

    // ── PHASE 4: FORESHADOW ────────────────────────────────────────────────
    // Fires 10s into the fade — NOT immediately after peak
    this.after(LOCK_DURATION_MS + REWARD_DURATION_MS + FORESHADOW_DELAY_MS, () => {
      const foreshadowLine = getForeshadowLine(triggerUserId);
      this.emit({
        phase: "foreshadow",
        lockMessage: "",
        rewardLines: [],
        foreshadowLine,
        startedAt: now,
      });

      // Clean return to idle
      this.after(FORESHADOW_DISPLAY_MS, () => {
        this.running = false;
        this.emit({ phase: "idle", lockMessage: "", rewardLines: [], foreshadowLine: "", startedAt: now });
      });
    });

    return true;
  }

  isRunning(): boolean { return this.running; }

  getMomentCount(): number { return this.momentsSinceLastRitual; }
}

// Singleton — one closure sequence per room session
let _engine: ClosureSequenceEngine | null = null;

export function getClosureEngine(): ClosureSequenceEngine {
  if (!_engine) _engine = new ClosureSequenceEngine();
  return _engine;
}

