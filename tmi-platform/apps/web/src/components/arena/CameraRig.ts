/**
 * PROMPT #3B: Camera Rig System
 * Handles camera modes (stage focus, seat focus, crowd scan, cinematic)
 * Heat targeting: tracks emotes/tips/chat per seat → auto-focus hot seats
 */

export type CameraMode = 'STAGE_WIDE' | 'ARTIST_CLOSEUP' | 'CROWD_REACTION' | 'HOT_SEAT_FOCUS' | 'SWEEP' | 'MANUAL';

export interface CameraState {
  targetX: number;
  targetY: number;
  zoom: number;
  mode: CameraMode;
  currentX: number; // Actual camera position (interpolated)
  currentY: number;
  currentZoom: number;
}

export interface CameraRigConfig {
  stageCenterX?: number;
  stageCenterY?: number;
  defaultZoom?: number;
  interpolationSpeed?: number; // 0.1 = slow, 1 = instant
  reducedMotion?: boolean; // Accessibility: disable auto-pan
  scanInterval?: number; // ms between auto-scans (default 5000)
}

export interface SeatHeatScore {
  seatId: string;
  score: number; // Higher = more activity
  lastActivity: number; // Timestamp
}

// Easing function for smooth camera movement
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Camera Rig Controller
 * Manages camera position, zoom, and auto-targeting
 */
export class CameraRig {
  private state: CameraState;
  private config: Required<CameraRigConfig>;
  private seatHeatMap: Map<string, SeatHeatScore> = new Map();
  private scanTimer: NodeJS.Timeout | null = null;
  private animationFrame: number | null = null;

  constructor(config: CameraRigConfig = {}) {
    this.config = {
      stageCenterX: config.stageCenterX ?? 500,
      stageCenterY: config.stageCenterY ?? 300,
      defaultZoom: config.defaultZoom ?? 1.0,
      interpolationSpeed: config.interpolationSpeed ?? 0.08,
      reducedMotion: config.reducedMotion ?? false,
      scanInterval: config.scanInterval ?? 5000,
    };

    this.state = {
      targetX: this.config.stageCenterX,
      targetY: this.config.stageCenterY,
      zoom: this.config.defaultZoom,
      mode: 'STAGE_WIDE',
      currentX: this.config.stageCenterX,
      currentY: this.config.stageCenterY,
      currentZoom: this.config.defaultZoom,
    };
  }

  /**
   * Focus on stage center (wide view)
   */
  focusStage(): void {
    this.state.mode = 'STAGE_WIDE';
    this.state.targetX = this.config.stageCenterX;
    this.state.targetY = this.config.stageCenterY;
    this.state.zoom = this.config.defaultZoom;
  }

  /**
   * Focus on specific seat position
   */
  focusSeat(seatX: number, seatY: number, zoom: number = 1.5): void {
    this.state.mode = 'HOT_SEAT_FOCUS';
    this.state.targetX = seatX;
    this.state.targetY = seatY;
    this.state.zoom = zoom;
  }

  /**
   * Start automatic crowd scan (heat-based targeting)
   */
  crowdScan(): void {
    if (this.config.reducedMotion) return; // Respect accessibility

    this.state.mode = 'SWEEP';
    this.startAutoScan();
  }

  /**
   * Set camera mode manually
   */
  setMode(mode: CameraMode): void {
    this.state.mode = mode;
    if (mode === 'STAGE_WIDE') this.focusStage();
    if (mode === 'SWEEP') this.crowdScan();
  }

  /**
   * Track activity at a seat (for heat targeting)
   */
  trackActivity(seatId: string, activityType: 'EMOTE' | 'TIP' | 'CHAT' | 'HYPE'): void {
    const scoreMap = { EMOTE: 1, CHAT: 2, TIP: 3, HYPE: 5 };
    const scoreIncrease = scoreMap[activityType];

    const current = this.seatHeatMap.get(seatId) || { seatId, score: 0, lastActivity: 0 };
    current.score += scoreIncrease;
    current.lastActivity = Date.now();
    this.seatHeatMap.set(seatId, current);

    // Decay old scores (5s half-life)
    this.seatHeatMap.forEach((heat, id) => {
      const age = Date.now() - heat.lastActivity;
      if (age > 5000) {
        heat.score *= Math.exp((-age / 5000) * Math.log(2));
        if (heat.score < 0.1) this.seatHeatMap.delete(id);
      }
    });
  }

  /**
   * Get hottest seat (highest activity)
   */
  getHottestSeat(): SeatHeatScore | null {
    if (this.seatHeatMap.size === 0) return null;
    let hottest: SeatHeatScore | null = null;
    this.seatHeatMap.forEach((heat) => {
      if (!hottest || heat.score > hottest.score) hottest = heat;
    });
    return hottest;
  }

  /**
   * Update camera position (interpolate toward target)
   * Call this every frame (via requestAnimationFrame)
   */
  update(deltaTime: number): CameraState {
    if (this.config.reducedMotion) {
      // Instant snap (no interpolation)
      this.state.currentX = this.state.targetX;
      this.state.currentY = this.state.targetY;
      this.state.currentZoom = this.state.zoom;
      return { ...this.state };
    }

    // Smooth interpolation
    const speed = this.config.interpolationSpeed;
    this.state.currentX += (this.state.targetX - this.state.currentX) * speed;
    this.state.currentY += (this.state.targetY - this.state.currentY) * speed;
    this.state.currentZoom += (this.state.zoom - this.state.currentZoom) * speed;

    return { ...this.state };
  }

  /**
   * Start automatic scan timer
   */
  private startAutoScan(): void {
    this.stopAutoScan(); // Clear existing

    this.scanTimer = setInterval(() => {
      if (this.state.mode !== 'SWEEP') {
        this.stopAutoScan();
        return;
      }

      // Find hottest seat and focus it
      const hottest = this.getHottestSeat();
      if (hottest) {
        // Would need seat position lookup here (passed from parent)
        // For now, just demonstrate the heat system works
        console.log(`[CameraRig] Auto-scan focusing seat ${hottest.seatId} (heat: ${hottest.score.toFixed(1)})`);
      }
    }, this.config.scanInterval);
  }

  /**
   * Stop automatic scan
   */
  private stopAutoScan(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  /**
   * Manual pan (for user control)
   */
  pan(deltaX: number, deltaY: number): void {
    this.state.mode = 'MANUAL';
    this.state.targetX += deltaX;
    this.state.targetY += deltaY;
  }

  /**
   * Manual zoom
   */
  zoomTo(zoomLevel: number): void {
    this.state.zoom = Math.max(0.5, Math.min(zoomLevel, 3.0)); // Clamp 0.5x - 3x
  }

  /**
   * Get current camera state
   */
  getState(): CameraState {
    return { ...this.state };
  }

  /**
   * Cleanup (stop timers)
   */
  destroy(): void {
    this.stopAutoScan();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}

/**
 * Helper: Start camera update loop
 */
export function startCameraLoop(rig: CameraRig, onUpdate: (state: CameraState) => void): () => void {
  let lastTime = Date.now();
  let running = true;

  const loop = () => {
    if (!running) return;

    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    const state = rig.update(deltaTime);
    onUpdate(state);

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  return () => {
    running = false;
  };
}
