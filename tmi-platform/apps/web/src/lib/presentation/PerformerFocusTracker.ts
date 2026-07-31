/**
 * PerformerFocusTracker.ts
 * Manages performer focus bounds and tracking states for real cameras and 3D avatars.
 * Outputs normalized bounds (0..1) for spatial battle frames and overlay anchoring.
 */

export type TrackingStatus = "LOCKED" | "PREDICTED" | "SEARCHING" | "LOST";

export interface NormalizedBounds {
  x: number;      // Normalized top-left X (0..1)
  y: number;      // Normalized top-left Y (0..1)
  width: number;  // Normalized width (0..1)
  height: number; // Normalized height (0..1)
}

export interface PerformerFocusState {
  performerId: string;
  normalizedBounds: NormalizedBounds;
  confidence: number;
  lastConfirmedAt: number;
  trackingStatus: TrackingStatus;
  isAvatar: boolean;
  avatarSeatAnchorId?: string;
}

class PerformerFocusTrackerEngine {
  private states: Map<string, PerformerFocusState> = new Map();
  private listeners: Set<(states: PerformerFocusState[]) => void> = new Set();

  /**
   * Update or initialize focus state for a performer.
   * Smoothly interpolates coordinates if existing state exists.
   */
  public updatePerformerBounds(
    performerId: string,
    targetBounds: NormalizedBounds,
    confidence: number = 0.95,
    isAvatar: boolean = false,
    avatarSeatAnchorId?: string,
  ): PerformerFocusState {
    const existing = this.states.get(performerId);
    const now = Date.now();

    let smoothedBounds: NormalizedBounds = targetBounds;

    if (existing && existing.trackingStatus === "LOCKED") {
      // Smooth interpolation (alpha = 0.35 for stable bounding frame movement)
      const alpha = 0.35;
      smoothedBounds = {
        x: existing.normalizedBounds.x + alpha * (targetBounds.x - existing.normalizedBounds.x),
        y: existing.normalizedBounds.y + alpha * (targetBounds.y - existing.normalizedBounds.y),
        width: existing.normalizedBounds.width + alpha * (targetBounds.width - existing.normalizedBounds.width),
        height: existing.normalizedBounds.height + alpha * (targetBounds.height - existing.normalizedBounds.height),
      };
    }

    const nextState: PerformerFocusState = {
      performerId,
      normalizedBounds: smoothedBounds,
      confidence,
      lastConfirmedAt: now,
      trackingStatus: confidence > 0.6 ? "LOCKED" : confidence > 0.3 ? "PREDICTED" : "SEARCHING",
      isAvatar,
      avatarSeatAnchorId,
    };

    this.states.set(performerId, nextState);
    this.notify();
    return nextState;
  }

  /** Retrieve current focus state for a performer */
  public getPerformerState(performerId: string): PerformerFocusState | undefined {
    return this.states.get(performerId);
  }

  /** Get default centered bounds if untracked */
  public getDefaultBounds(performerId: string, isAvatar: boolean = false): PerformerFocusState {
    return {
      performerId,
      normalizedBounds: { x: 0.25, y: 0.15, width: 0.5, height: 0.7 },
      confidence: 1.0,
      lastConfirmedAt: Date.now(),
      trackingStatus: "LOCKED",
      isAvatar,
    };
  }

  /** Subscribe to focus tracking updates */
  public subscribe(callback: (states: PerformerFocusState[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const all = Array.from(this.states.values());
    this.listeners.forEach((fn) => fn(all));
  }
}

export const PerformerFocusTracker = new PerformerFocusTrackerEngine();
export default PerformerFocusTracker;
