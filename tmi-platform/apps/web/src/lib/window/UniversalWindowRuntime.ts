/**
 * TMI Universal Window Runtime
 *
 * Top-level orchestrator for all floating panels (canisters).
 * Coordinates viewport layout, priorities, persistence, and animation.
 *
 * Architecture:
 * UniversalWindowRuntime (orchestrator)
 *   ↓
 *   ├── WindowRegistry (tracks all windows)
 *   ├── WindowManager (creates/destroys)
 *   ├── DockManager (handles docking)
 *   ├── LayoutManager (manages layouts)
 *   ├── ViewportManager (tracks available space)
 *   ├── AnimationManager (handles animations)
 *   └── PersistenceManager (saves state)
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula), Rule 21 (Venue Runtime Convergence)
 */

export type WindowPriority = 'critical' | 'primary' | 'secondary' | 'utility';

export type WindowState =
  | 'registered'   // Window exists in registry
  | 'initialized'  // Ready to open
  | 'loaded'       // Content loaded
  | 'visible'      // On screen
  | 'focused'      // Has input focus
  | 'pinned'       // User pinned it (optional state)
  | 'floating'     // User dragging (optional state)
  | 'docked'       // Snapped to edge (optional state)
  | 'hidden'       // User closed it
  | 'destroyed';   // Removed from runtime

export interface WindowViewport {
  width: number;
  height: number;
  x: number;
  y: number;
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  availableArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WindowDimensions {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WindowPosition {
  x: number;
  y: number;
  dock?: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';
  zIndex: number;
}

export interface WindowDefinition {
  id: string;
  title: string;
  icon: string;
  priority: WindowPriority;
  defaultVisible: boolean;
  defaultDock?: string;
  dimensions: WindowDimensions;
  state: WindowState;
  position: WindowPosition;
  isPinned: boolean;
  isMinimized: boolean;
  canFloat: boolean;
  canResize: boolean;
  canMinimize: boolean;
  canClose: boolean;
}

/**
 * Window Registry — tracks all registered windows
 * Responsibilities:
 * - Register/unregister windows
 * - Query windows by ID, priority, state
 * - Manage window metadata
 */
export class WindowRegistry {
  private windows = new Map<string, WindowDefinition>();

  register(window: WindowDefinition): void {
    this.windows.set(window.id, window);
  }

  unregister(windowId: string): void {
    this.windows.delete(windowId);
  }

  get(windowId: string): WindowDefinition | undefined {
    return this.windows.get(windowId);
  }

  getAll(): WindowDefinition[] {
    return Array.from(this.windows.values());
  }

  getByPriority(priority: WindowPriority): WindowDefinition[] {
    return this.getAll().filter((w) => w.priority === priority);
  }

  getByState(state: WindowState): WindowDefinition[] {
    return this.getAll().filter((w) => w.state === state);
  }

  getVisible(): WindowDefinition[] {
    return this.getAll().filter((w) => w.state !== 'hidden' && w.state !== 'destroyed');
  }

  getCritical(): WindowDefinition[] {
    return this.getByPriority('critical').filter((w) => w.state !== 'destroyed');
  }
}

/**
 * Viewport Manager — tracks available screen space
 * Responsibilities:
 * - Monitor viewport size
 * - Calculate available area as windows open/close
 * - Notify when stage should resize
 */
export class ViewportManager {
  private viewport: WindowViewport;
  private listeners: ((viewport: WindowViewport) => void)[] = [];

  constructor(width: number, height: number) {
    this.viewport = {
      width,
      height,
      x: 0,
      y: 0,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
      availableArea: { x: 0, y: 0, width, height },
    };
  }

  getViewport(): WindowViewport {
    return this.viewport;
  }

  updateSize(width: number, height: number): void {
    this.viewport.width = width;
    this.viewport.height = height;
    this.notifyListeners();
  }

  setSafeArea(top: number, right: number, bottom: number, left: number): void {
    this.viewport.safeArea = { top, right, bottom, left };
    this.recalculateAvailable();
  }

  /**
   * Calculate available space based on visible windows
   * Used to determine where stage can grow
   */
  recalculateAvailable(dockedWindows: WindowDefinition[] = []): void {
    let availX = 0;
    let availY = 0;
    let availWidth = this.viewport.width;
    let availHeight = this.viewport.height;

    // Subtract space used by docked windows
    dockedWindows.forEach((w) => {
      if (w.position.dock === 'left') {
        availX += w.dimensions.width;
        availWidth -= w.dimensions.width;
      } else if (w.position.dock === 'right') {
        availWidth -= w.dimensions.width;
      } else if (w.position.dock === 'top') {
        availY += w.dimensions.height;
        availHeight -= w.dimensions.height;
      } else if (w.position.dock === 'bottom') {
        availHeight -= w.dimensions.height;
      }
    });

    this.viewport.availableArea = {
      x: availX,
      y: availY,
      width: Math.max(availWidth, 0),
      height: Math.max(availHeight, 0),
    };

    this.notifyListeners();
  }

  onViewportChange(callback: (viewport: WindowViewport) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.viewport));
  }
}

/**
 * Dock Manager — handles docking/undocking behavior
 * Responsibilities:
 * - Snap windows to edges
 * - Prevent overlaps
 * - Calculate snap positions
 */
export class DockManager {
  private snapThreshold = 20; // pixels

  snapToEdge(
    position: WindowPosition,
    dimensions: WindowDimensions,
    viewport: WindowViewport,
  ): WindowPosition {
    const { x, y } = position;
    const { width, height } = dimensions;

    // Check proximity to edges
    const distToLeft = x;
    const distToRight = viewport.width - (x + width);
    const distToTop = y;
    const distToBottom = viewport.height - (y + height);

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    if (minDist < this.snapThreshold) {
      if (minDist === distToLeft) {
        return { ...position, x: 0, dock: 'left' };
      }
      if (minDist === distToRight) {
        return { ...position, x: viewport.width - width, dock: 'right' };
      }
      if (minDist === distToTop) {
        return { ...position, y: 0, dock: 'top' };
      }
      if (minDist === distToBottom) {
        return { ...position, y: viewport.height - height, dock: 'bottom' };
      }
    }

    return { ...position, dock: 'floating' };
  }

  getDockedPosition(
    dock: string,
    windowIndex: number,
    viewport: WindowViewport,
    dimensions: WindowDimensions,
  ): WindowPosition {
    const positions: Record<string, WindowPosition> = {
      left: {
        x: 0,
        y: 0,
        dock: 'left',
        zIndex: 100,
      },
      right: {
        x: viewport.width - dimensions.width,
        y: 0,
        dock: 'right',
        zIndex: 100,
      },
      top: {
        x: 0,
        y: 0,
        dock: 'top',
        zIndex: 100,
      },
      bottom: {
        x: 0,
        y: viewport.height - dimensions.height,
        dock: 'bottom',
        zIndex: 100,
      },
    };

    return positions[dock] || { x: 0, y: 0, zIndex: 100 };
  }
}

/**
 * Animation Manager — orchestrates window animations
 * Responsibilities:
 * - Animate window open/close
 * - Animate drag/dock snap
 * - Coordinate multi-window transitions
 */
export class AnimationManager {
  animateOpen(windowId: string, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      // Animation implementation here
      // For now, just resolve after duration
      setTimeout(resolve, duration);
    });
  }

  animateClose(windowId: string, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  animateDrag(windowId: string): void {
    // Drag animation implementation
  }

  animateSnap(windowId: string, targetPosition: WindowPosition, duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  animateResize(windowId: string, targetDimensions: WindowDimensions, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}

/**
 * Persistence Manager — saves/restores window state
 * Responsibilities:
 * - Save layout to localStorage/DB
 * - Restore layout on app load
 * - Track user preferences
 */
export class PersistenceManager {
  private storageKey = 'tmi_window_state';

  saveLayout(layoutName: string, windows: WindowDefinition[]): void {
    const state = {
      name: layoutName,
      timestamp: Date.now(),
      windows: windows.map((w) => ({
        id: w.id,
        position: w.position,
        dimensions: w.dimensions,
        state: w.state,
        isPinned: w.isPinned,
        isMinimized: w.isMinimized,
      })),
    };

    try {
      const existing = this.loadAllLayouts();
      existing[layoutName] = state;
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save window layout:', e);
    }
  }

  loadLayout(layoutName: string): WindowDefinition[] | null {
    try {
      const layouts = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return layouts[layoutName]?.windows || null;
    } catch (e) {
      console.error('Failed to load window layout:', e);
      return null;
    }
  }

  loadAllLayouts(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch (e) {
      return {};
    }
  }

  deleteLayout(layoutName: string): void {
    try {
      const existing = this.loadAllLayouts();
      delete existing[layoutName];
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to delete window layout:', e);
    }
  }

  getLayoutNames(): string[] {
    return Object.keys(this.loadAllLayouts());
  }
}

/**
 * Universal Window Runtime — orchestrates all window managers
 */
export class UniversalWindowRuntime {
  private registry: WindowRegistry;
  private viewportManager: ViewportManager;
  private dockManager: DockManager;
  private animationManager: AnimationManager;
  private persistenceManager: PersistenceManager;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.registry = new WindowRegistry();
    this.viewportManager = new ViewportManager(viewportWidth, viewportHeight);
    this.dockManager = new DockManager();
    this.animationManager = new AnimationManager();
    this.persistenceManager = new PersistenceManager();
  }

  // Getters for subsystems
  getRegistry(): WindowRegistry {
    return this.registry;
  }

  getViewportManager(): ViewportManager {
    return this.viewportManager;
  }

  getDockManager(): DockManager {
    return this.dockManager;
  }

  getAnimationManager(): AnimationManager {
    return this.animationManager;
  }

  getPersistenceManager(): PersistenceManager {
    return this.persistenceManager;
  }

  // High-level operations
  async openWindow(windowId: string): Promise<void> {
    const window = this.registry.get(windowId);
    if (!window) return;

    window.state = 'visible';
    await this.animationManager.animateOpen(windowId);
  }

  async closeWindow(windowId: string): Promise<void> {
    const window = this.registry.get(windowId);
    if (!window) return;

    window.state = 'hidden';
    await this.animationManager.animateClose(windowId);
  }

  ensureCriticalWindowsVisible(): void {
    const critical = this.registry.getCritical();
    critical.forEach((window) => {
      if (window.state === 'hidden' || window.state === 'destroyed') {
        window.state = 'visible';
      }
    });
  }

  updateViewport(width: number, height: number): void {
    this.viewportManager.updateSize(width, height);
    this.recalculateLayout();
  }

  private recalculateLayout(): void {
    const docked = this.registry.getVisible().filter((w) => w.position.dock !== 'floating');
    this.viewportManager.recalculateAvailable(docked);
  }
}
