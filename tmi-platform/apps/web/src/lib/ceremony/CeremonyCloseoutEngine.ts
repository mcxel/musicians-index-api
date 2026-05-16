/**
 * CeremonyCloseoutEngine
 * Manages the post-ceremony grace period and coordinated pullout sequence.
 *
 * Rules:
 * - Grace period: 8–15 seconds after reward reveal (randomized)
 * - During grace: overlay stays visible, camera is on pullout shot
 * - After grace: trigger fade + room return
 * - Room state restored to "live" after closeout completes
 *
 * Purpose:
 * - People screen record
 * - People share
 * - People celebrate
 * - Don't rip the moment away
 */

export type CloseoutPhase =
  | "grace"       // Recording grace period — overlay visible, user can screen record
  | "pullout"     // Camera slowly zooms back
  | "fade"        // Overlay fades to 0
  | "restore"     // Room returns to live state
  | "complete";   // Closeout done

export interface CloseoutState {
  closeoutId: string;
  ceremonyId: string;
  phase: CloseoutPhase;
  graceDurationMs: number;
  gracePeriodStartedAt: number;
  graceEndsAt: number;
  /** 0–1. Starts 1, approaches 0 during fade */
  overlayOpacity: number;
  /** 0–1. Starts 1 (zoomed in), approaches 0.5 (pulled back) */
  cameraZoom: number;
  completedAt?: number;
}

function randomGraceDuration(): number {
  // 8–15 seconds
  return 8000 + Math.floor(Math.random() * 7001);
}

let closeoutSeq = 0;

class CeremonyCloseoutEngine {
  private states = new Map<string, CloseoutState>();

  /**
   * Begin the closeout sequence for a ceremony.
   * Returns the initial state. The caller polls `tick()` every ~100ms
   * to get updated state for animation.
   */
  begin(ceremonyId: string): CloseoutState {
    const graceDurationMs = randomGraceDuration();
    const now = Date.now();

    const state: CloseoutState = {
      closeoutId: `closeout-${Date.now()}-${++closeoutSeq}`,
      ceremonyId,
      phase: "grace",
      graceDurationMs,
      gracePeriodStartedAt: now,
      graceEndsAt: now + graceDurationMs,
      overlayOpacity: 1.0,
      cameraZoom: 1.0,
    };

    this.states.set(ceremonyId, state);
    return state;
  }

  /**
   * Compute current state based on elapsed time.
   * Call this on every render tick to get animated values.
   */
  tick(ceremonyId: string): CloseoutState | null {
    const state = this.states.get(ceremonyId);
    if (!state || state.phase === "complete") return state ?? null;

    const now = Date.now();
    const elapsed = now - state.gracePeriodStartedAt;
    const total = state.graceDurationMs;

    if (state.phase === "grace") {
      if (now >= state.graceEndsAt) {
        state.phase = "pullout";
      }
      return { ...state };
    }

    if (state.phase === "pullout") {
      // Pullout takes 3 seconds after grace ends
      const pulloutElapsed = now - state.graceEndsAt;
      const pulloutDuration = 3000;
      const progress = Math.min(1.0, pulloutElapsed / pulloutDuration);
      state.cameraZoom = 1.0 - progress * 0.5; // 1.0 → 0.5
      if (progress >= 1.0) {
        state.phase = "fade";
      }
      return { ...state };
    }

    if (state.phase === "fade") {
      const fadeStart = state.graceEndsAt + 3000;
      const fadeDuration = 2000;
      const fadeElapsed = now - fadeStart;
      const progress = Math.min(1.0, fadeElapsed / fadeDuration);
      state.overlayOpacity = 1.0 - progress;
      if (progress >= 1.0) {
        state.phase = "restore";
        // Auto-complete after 500ms
        setTimeout(() => {
          state.phase = "complete";
          state.completedAt = Date.now();
        }, 500);
      }
      return { ...state };
    }

    return { ...state };
  }

  /**
   * Compute grace period remaining in seconds (0 if elapsed).
   */
  graceSecondsRemaining(ceremonyId: string): number {
    const state = this.states.get(ceremonyId);
    if (!state || state.phase !== "grace") return 0;
    return Math.max(0, Math.ceil((state.graceEndsAt - Date.now()) / 1000));
  }

  /**
   * Allow manual early skip (user presses CLOSE).
   */
  skipGrace(ceremonyId: string): void {
    const state = this.states.get(ceremonyId);
    if (!state) return;
    state.phase = "pullout";
    state.graceEndsAt = Date.now();
  }

  getState(ceremonyId: string): CloseoutState | undefined {
    return this.states.get(ceremonyId);
  }

  isComplete(ceremonyId: string): boolean {
    return this.states.get(ceremonyId)?.phase === "complete";
  }

  clearState(ceremonyId: string): void {
    this.states.delete(ceremonyId);
  }
}

export const ceremonyCloseoutEngine = new CeremonyCloseoutEngine();
