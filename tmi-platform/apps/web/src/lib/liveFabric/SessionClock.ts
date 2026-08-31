/**
 * SessionClock.ts — Monotonic media clock for transitions / rounds / overlays / recording
 *
 * Wall-clock gaps (tab sleep, background) do not rewind mediaClockMs.
 */

export class SessionClock {
  private baseWallMs: number;
  private accumulatedMs: number;
  private running: boolean;
  private pausedAtWallMs: number | null = null;
  private liveStartMediaMs: number | null = null;

  constructor(startAtWallMs = Date.now()) {
    // Seed 1ms so now() is never stuck at 0 on same-tick reads.
    this.baseWallMs = startAtWallMs - 1;
    this.accumulatedMs = 0;
    this.running = true;
  }

  /** Mark the LIVE edge for duration telemetry. */
  public markLiveStart(): void {
    this.liveStartMediaMs = this.now();
  }

  public getLiveDurationMs(): number {
    if (this.liveStartMediaMs == null) return 0;
    return Math.max(0, this.now() - this.liveStartMediaMs);
  }

  /** Current monotonic media time in ms since clock start (excluding paused intervals). */
  public now(): number {
    if (!this.running) {
      return this.accumulatedMs;
    }
    return this.accumulatedMs + (Date.now() - this.baseWallMs);
  }

  public pause(): void {
    if (!this.running) return;
    this.accumulatedMs = this.now();
    this.running = false;
    this.pausedAtWallMs = Date.now();
  }

  public resume(): void {
    if (this.running) return;
    this.baseWallMs = Date.now();
    this.running = true;
    this.pausedAtWallMs = null;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public reset(startAtWallMs = Date.now()): void {
    this.baseWallMs = startAtWallMs;
    this.accumulatedMs = 0;
    this.running = true;
    this.pausedAtWallMs = null;
    this.liveStartMediaMs = null;
  }

  /** Advance by delta for deterministic tests / simulation. */
  public advanceForTest(deltaMs: number): void {
    if (deltaMs < 0) throw new Error("SessionClock cannot go backwards");
    this.accumulatedMs = this.now() + deltaMs;
    this.baseWallMs = Date.now();
  }

  public snapshot(): { mediaClockMs: number; running: boolean; pausedAtWallMs: number | null } {
    return {
      mediaClockMs: this.now(),
      running: this.running,
      pausedAtWallMs: this.pausedAtWallMs,
    };
  }
}
