/**
 * Rotation Color Engine
 * Handles timed color palette rotations across different sections.
 * Manages: genre rotation in live feeds, gallery color cycles, animated color strips.
 */

import {
  getAllGenres,
  getPaletteByGenre,
  getRandomGenrePalette,
  type GenreKey,
  type GenrePalette,
} from "./genre-colors";

export interface ColorRotationState {
  currentGenre: GenreKey;
  nextGenre: GenreKey;
  currentPalette: GenrePalette;
  progress: number; // 0-1 for smooth transitions
  isTransitioning: boolean;
}

export class RotationColorEngine {
  private state: ColorRotationState;
  private rotationInterval: number;
  private transitionDuration: number;
  private lastRotationTime: number = 0;
  private frameId: number | null = null;
  private listeners: Set<(state: ColorRotationState) => void> = new Set();
  private genres: GenreKey[];
  private currentGenreIndex: number = 0;

  constructor(
    rotationInterval: number = 8000, // ms between color changes
    transitionDuration: number = 1000 // ms for smooth transition
  ) {
    this.genres = getAllGenres();
    this.rotationInterval = rotationInterval;
    this.transitionDuration = transitionDuration;

    const currentGenre = this.genres[0];
    const nextGenre = this.genres[1] || this.genres[0];

    this.state = {
      currentGenre,
      nextGenre,
      currentPalette: getPaletteByGenre(currentGenre),
      progress: 0,
      isTransitioning: false,
    };

    this.lastRotationTime = Date.now();
  }

  /**
   * Start the color rotation animation loop
   */
  start(): void {
    if (this.frameId !== null) return;
    this.animate();
  }

  /**
   * Stop the rotation
   */
  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Manually jump to specific genre
   */
  jumpToGenre(genre: GenreKey): void {
    this.currentGenreIndex = this.genres.indexOf(genre);
    if (this.currentGenreIndex === -1) this.currentGenreIndex = 0;

    const nextIdx = (this.currentGenreIndex + 1) % this.genres.length;
    const nextGenre = this.genres[nextIdx];

    this.state.currentGenre = genre;
    this.state.nextGenre = nextGenre;
    this.state.currentPalette = getPaletteByGenre(genre);
    this.state.progress = 0;
    this.state.isTransitioning = false;
    this.lastRotationTime = Date.now();

    this.emit();
  }

  /**
   * Get current state
   */
  getState(): Readonly<ColorRotationState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get interpolated color during transition
   */
  getInterpolatedColor(
    colorStart: string,
    colorEnd: string,
    progress: number
  ): string {
    // Simple hex interpolation
    const startHex = colorStart.replace("#", "");
    const endHex = colorEnd.replace("#", "");

    const sr = parseInt(startHex.slice(0, 2), 16);
    const sg = parseInt(startHex.slice(2, 4), 16);
    const sb = parseInt(startHex.slice(4, 6), 16);

    const er = parseInt(endHex.slice(0, 2), 16);
    const eg = parseInt(endHex.slice(2, 4), 16);
    const eb = parseInt(endHex.slice(4, 6), 16);

    const r = Math.round(sr + (er - sr) * progress);
    const g = Math.round(sg + (eg - sg) * progress);
    const b = Math.round(sb + (eb - sb) * progress);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  /**
   * Get current color (blended during transition)
   */
  getCurrentPrimaryColor(): string {
    if (!this.state.isTransitioning) {
      return this.state.currentPalette.primary;
    }

    const nextPalette = getPaletteByGenre(this.state.nextGenre);
    return this.getInterpolatedColor(
      this.state.currentPalette.primary,
      nextPalette.primary,
      this.state.progress
    );
  }

  /**
   * Get current gradient (blended during transition)
   */
  getCurrentGradient(): string {
    if (!this.state.isTransitioning) {
      return this.state.currentPalette.gradient;
    }

    const nextPalette = getPaletteByGenre(this.state.nextGenre);
    const p = this.state.progress;
    return `linear-gradient(135deg, 
      ${this.getInterpolatedColor(
        this.state.currentPalette.primary,
        nextPalette.primary,
        p
      )} 0%, 
      ${this.getInterpolatedColor(
        this.state.currentPalette.secondary,
        nextPalette.secondary,
        p
      )} 50%, 
      ${this.getInterpolatedColor(
        this.state.currentPalette.accent,
        nextPalette.accent,
        p
      )} 100%)`;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ColorRotationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Animation loop
   */
  private animate(): void {
    const now = Date.now();
    const elapsed = now - this.lastRotationTime;

    if (elapsed < this.transitionDuration && !this.state.isTransitioning) {
      // Start transition
      this.state.isTransitioning = true;
      this.emit();
    }

    if (this.state.isTransitioning) {
      const transitionElapsed = elapsed;
      this.state.progress = Math.min(
        transitionElapsed / this.transitionDuration,
        1
      );

      if (this.state.progress >= 1) {
        // Rotation complete
        this.currentGenreIndex =
          (this.currentGenreIndex + 1) % this.genres.length;
        this.state.currentGenre = this.genres[this.currentGenreIndex];
        this.state.currentPalette = getPaletteByGenre(this.state.currentGenre);

        const nextIdx = (this.currentGenreIndex + 1) % this.genres.length;
        this.state.nextGenre = this.genres[nextIdx];

        this.state.progress = 0;
        this.state.isTransitioning = false;
        this.lastRotationTime = now;
      }

      this.emit();
    }

    if (elapsed >= this.rotationInterval + this.transitionDuration) {
      this.lastRotationTime = now;
    }

    this.frameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Emit state to all listeners
   */
  private emit(): void {
    const frozenState = Object.freeze({ ...this.state });
    this.listeners.forEach((listener) => listener(frozenState));
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stop();
    this.listeners.clear();
  }
}

/**
 * Color animation playback controller
 * Manages visual effects during color transitions
 */
export class ColorAnimationController {
  private engine: RotationColorEngine;
  private pulseIntensity: number = 0;
  private pulseDirection: number = 1; // 1 or -1

  constructor(engine: RotationColorEngine) {
    this.engine = engine;
  }

  /**
   * Get CSS filter for pulsing glow effect
   */
  getPulseFilter(intensity: number = 0.5): string {
    const blur = 2 + intensity * 8;
    const opacity = 0.4 + intensity * 0.6;
    return `drop-shadow(0 0 ${blur}px rgba(255, 255, 255, ${opacity}))`;
  }

  /**
   * Get CSS keyframe animation for shimmer effect
   */
  getShimmerKeyframes(): string {
    return `
      @keyframes color-shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
    `;
  }

  /**
   * Get CSS for rotating color strip (like a neon sign)
   */
  getRotatingStripStyle(): React.CSSProperties {
    const palette = this.engine.getState().currentPalette;
    return {
      backgroundImage: palette.gradient,
      backgroundSize: "200% 200%",
      animation: "gradient-rotate 4s ease infinite",
      WebkitMaskImage:
        "linear-gradient(90deg, transparent 0%, black 50%, transparent 100%)",
    };
  }
}
