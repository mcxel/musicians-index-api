// apps/web/src/engines/homepage/homepageScheduler.engine.ts
// The master conductor of Homepage 1.
// Controls what appears, for how long, and in what order.
// Total loop: 8-11 minutes before full repeat.
// Uses bounded randomness — not chaos.

import { SCENE_REGISTRY, SceneId, SceneConfig } from "./homepageScene.types";
import { LOOP_PROFILES } from "./homepageLoopProfile";
import { checkInterruptConditions } from "./homepageInterruptRules";

export interface SchedulerState {
  currentScene: SceneId;
  sceneStartedAt: number;
  sceneEndsAt: number;
  nextScene: SceneId;
  cycleIndex: number;       // which position in the loop profile we're in
  loopCount: number;        // how many full loops have completed
  isInterrupted: boolean;   // currently in an urgent override
  liveEventActive: boolean;
  cypherBattleActive: boolean;
  winnerRevealPending: boolean;
  activeCTA: string | null;
}

// ── BOUNDED RANDOM DURATION ────────────────────────────────────
// Picks a duration within [min, max], biased toward the middle.
// This prevents the "always feels the same" problem without chaos.
function boundedRandom(min: number, max: number): number {
  const mid = (min + max) / 2;
  const jitter = (max - min) * 0.3;
  return Math.round(mid + (Math.random() * jitter * 2) - jitter);
}

// ── MASTER LOOP PROFILE ───────────────────────────────────────
// The sequence of scenes for one full loop.
// Repeats but with varying durations each time.
const MASTER_LOOP: SceneId[] = [
  "genre_cluster",        // 70-95s
  "crown_top10",          // 55-80s
  "bridge_transition",    // 20-30s
  "genre_cluster",        // another genre set (different genres)
  "bridge_transition",    // 20-30s
  "magazine_insert",      // 120-180s ← the identity moment
  "bridge_transition",    // 20-30s
  "crown_top10",          // 55-80s
  "show_game_interrupt",  // 35-60s
  "bridge_transition",    // 20-30s
  "genre_cluster",        // 70-95s (third genre rotation)
  "fan_join_cta",         // 20-35s
  "bridge_transition",    // 20-30s
];

// Every 3rd loop: add sponsor_cta + artist_join_cta
const EXTENDED_LOOP_ADDITIONS: SceneId[] = ["sponsor_cta", "artist_join_cta"];
// Every 5th loop: add winner_reveal if pending
const WINNER_LOOP_ADDITIONS: SceneId[] = ["winner_reveal"];

// ── SCHEDULER CLASS ────────────────────────────────────────────
export class HomepageScheduler {
  private state: SchedulerState;
  private loopIndex = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onSceneChange?: (state: SchedulerState) => void;

  constructor(onSceneChange?: (state: SchedulerState) => void) {
    this.onSceneChange = onSceneChange;
    this.state = this.getInitialState();
  }

  private getInitialState(): SchedulerState {
    return {
      currentScene: "genre_cluster",
      sceneStartedAt: Date.now(),
      sceneEndsAt: Date.now() + boundedRandom(70000, 95000),
      nextScene: "crown_top10",
      cycleIndex: 0,
      loopCount: 0,
      isInterrupted: false,
      liveEventActive: false,
      cypherBattleActive: false,
      winnerRevealPending: false,
      activeCTA: null,
    };
  }

  start(): void {
    this.scheduleNext();
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  // External signal: urgent event started (live show, winner reveal, etc.)
  signal(event: "live_started" | "live_ended" | "cypher_active" | "cypher_ended" | "winner_pending" | "winner_cleared"): void {
    switch (event) {
      case "live_started":
        this.state.liveEventActive = true;
        this.interruptWith("live_event_urgent");
        break;
      case "live_ended":
        this.state.liveEventActive = false;
        break;
      case "cypher_active":
        this.state.cypherBattleActive = true;
        this.interruptWith("cypher_arena");
        break;
      case "cypher_ended":
        this.state.cypherBattleActive = false;
        break;
      case "winner_pending":
        this.state.winnerRevealPending = true;
        break;
      case "winner_cleared":
        this.state.winnerRevealPending = false;
        break;
    }
  }

  private interruptWith(scene: SceneId): void {
    if (this.timer) clearTimeout(this.timer);
    const config = SCENE_REGISTRY[scene];
    const duration = boundedRandom(config.durationRange[0], config.durationRange[1]);
    const ctas = config.ctaMessages || [];
    this.state = {
      ...this.state,
      currentScene: scene,
      sceneStartedAt: Date.now(),
      sceneEndsAt: Date.now() + duration,
      isInterrupted: true,
      activeCTA: ctas.length ? ctas[Math.floor(Math.random() * ctas.length)] : null,
    };
    this.onSceneChange?.(this.state);
    this.timer = setTimeout(() => {
      this.state.isInterrupted = false;
      this.scheduleNext();
    }, duration);
  }

  private scheduleNext(): void {
    // Build current loop sequence
    let loop = [...MASTER_LOOP];
    if (this.state.loopCount % 3 === 2) loop = [...loop, ...EXTENDED_LOOP_ADDITIONS];
    if (this.state.loopCount % 5 === 4 && this.state.winnerRevealPending) loop = [...loop, ...WINNER_LOOP_ADDITIONS];

    if (this.loopIndex >= loop.length) {
      this.loopIndex = 0;
      this.state.loopCount++;
    }

    const sceneId = loop[this.loopIndex];
    const config = SCENE_REGISTRY[sceneId];
    const duration = boundedRandom(config.durationRange[0], config.durationRange[1]);
    const ctas = config.ctaMessages || [];

    this.state = {
      ...this.state,
      currentScene: sceneId,
      sceneStartedAt: Date.now(),
      sceneEndsAt: Date.now() + duration,
      cycleIndex: this.loopIndex,
      nextScene: loop[(this.loopIndex + 1) % loop.length],
      activeCTA: ctas.length ? ctas[Math.floor(Math.random() * ctas.length)] : null,
    };

    this.onSceneChange?.(this.state);
    this.loopIndex++;

    this.timer = setTimeout(() => this.scheduleNext(), duration);
  }

  getState(): SchedulerState { return this.state; }
}

// ── SINGLETON EXPORT (use in React context) ───────────────────
let _scheduler: HomepageScheduler | null = null;
export function getHomepageScheduler(onSceneChange?: (s: SchedulerState) => void): HomepageScheduler {
  if (!_scheduler) _scheduler = new HomepageScheduler(onSceneChange);
  return _scheduler;
}
