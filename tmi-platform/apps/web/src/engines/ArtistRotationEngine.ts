/**
 * ArtistRotationEngine
 *
 * Centralized timing and state management for artist profile orbit rotation.
 * Provides:
 *   - Timed rotation scheduling (frame-based)
 *   - Crown highlight tracking
 *   - Artist index cycling
 *   - Hover interrupt handling
 */

export interface ArtistCardData {
  id: string;
  name: string;
  avatarUrl: string;
  crownRank?: number;
  route: string;
}

export interface ArtistOrbitState {
  currentIndex: number;
  isRotating: boolean;
  hoveredIndex: number | null;
  crowns: readonly number[];
}

export class ArtistRotationEngine {
  private state: ArtistOrbitState = {
    currentIndex: 0,
    isRotating: true,
    hoveredIndex: null,
    crowns: [],
  };

  private artists: ArtistCardData[] = [];
  private rotationInterval: number = 3500; // ms per rotation
  private frameId: number | null = null;
  private lastRotationTime: number = 0;
  private listeners: Set<(state: ArtistOrbitState) => void> = new Set();

  constructor(artists: ArtistCardData[], rotationInterval = 3500) {
    this.artists = artists;
    this.rotationInterval = rotationInterval;
    this.state.crowns = artists.map((_, i) => i === 0 ? 1 : 0);
    this.lastRotationTime = Date.now();
  }

  /**
   * Update artists (e.g., refresh from feed)
   */
  setArtists(artists: ArtistCardData[]): void {
    this.artists = artists;
    this.state.currentIndex = Math.min(this.state.currentIndex, artists.length - 1);
    this.state.crowns = artists.map((_, i) => i === this.state.currentIndex ? 1 : 0);
    this.emit();
  }

  /**
   * Start orbit animation
   */
  start(): void {
    if (this.state.isRotating) return;
    this.state.isRotating = true;
    this.lastRotationTime = Date.now();
    this.animate();
    this.emit();
  }

  /**
   * Stop orbit animation
   */
  stop(): void {
    this.state.isRotating = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.emit();
  }

  /**
   * Manual rotate forward
   */
  next(): void {
    this.state.currentIndex = (this.state.currentIndex + 1) % this.artists.length;
    this.updateCrowns();
    this.lastRotationTime = Date.now();
    this.emit();
  }

  /**
   * Manual rotate backward
   */
  prev(): void {
    this.state.currentIndex =
      (this.state.currentIndex - 1 + this.artists.length) % this.artists.length;
    this.updateCrowns();
    this.lastRotationTime = Date.now();
    this.emit();
  }

  /**
   * Set hovered card index
   */
  setHovered(index: number | null): void {
    this.state.hoveredIndex = index;
    this.emit();
  }

  /**
   * Get current state
   */
  getState(): Readonly<ArtistOrbitState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get current artist
   */
  getCurrentArtist(): ArtistCardData | null {
    return this.artists[this.state.currentIndex] ?? null;
  }

  /**
   * Get all artists in rotation
   */
  getArtists(): readonly ArtistCardData[] {
    return Object.freeze([...this.artists]);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ArtistOrbitState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Frame-based animation loop
   */
  private animate(): void {
    if (!this.state.isRotating) return;

    const now = Date.now();
    const elapsed = now - this.lastRotationTime;

    if (elapsed >= this.rotationInterval) {
      this.next();
    }

    this.frameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update crown highlight on current artist
   */
  private updateCrowns(): void {
    this.state.crowns = this.artists.map((_, i) =>
      i === this.state.currentIndex ? 1 : 0
    );
  }

  /**
   * Emit state to all listeners
   */
  private emit(): void {
    const frozenState: ArtistOrbitState = Object.freeze({
      ...this.state,
      crowns: Object.freeze([...this.state.crowns]),
    });
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
 * Singleton instance (managed per component mount)
 */
let _instance: ArtistRotationEngine | null = null;

export function createArtistRotationEngine(
  artists: ArtistCardData[],
  interval?: number
): ArtistRotationEngine {
  _instance?.dispose();
  _instance = new ArtistRotationEngine(artists, interval);
  return _instance;
}

export function getArtistRotationEngine(): ArtistRotationEngine | null {
  return _instance;
}
