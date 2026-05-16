/**
 * WidgetDockEngine
 * Move, pin, resize, stack, hide, and restore UI widgets across the platform.
 */

export type WidgetId =
  | "chat"
  | "reactions"
  | "scoreboard"
  | "timer"
  | "hud-mini"
  | "queue"
  | "now-playing"
  | "crowd-meter"
  | "vote-panel"
  | "notifications"
  | "avatar-preview"
  | "wallet-mini"
  | "host-cam"
  | "stage-map";

export type DockZone =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "floating"
  | "minimized"
  | "hidden";

export type WidgetSize = "xs" | "sm" | "md" | "lg" | "fullscreen";

export interface WidgetState {
  id: WidgetId;
  zone: DockZone;
  size: WidgetSize;
  isPinned: boolean;
  isVisible: boolean;
  isMinimized: boolean;
  opacity: number;       // 0–1
  zIndex: number;
  x?: number;            // px, only when floating
  y?: number;
  order: number;         // stacking order within zone
  lastMovedAt: number;
}

export interface WidgetConfig {
  defaultZone: DockZone;
  defaultSize: WidgetSize;
  resizable: boolean;
  movable: boolean;
  hideable: boolean;
  label: string;
}

const WIDGET_CONFIGS: Record<WidgetId, WidgetConfig> = {
  chat:           { defaultZone: "bottom-right", defaultSize: "md",  resizable: true,  movable: true,  hideable: true,  label: "Chat" },
  reactions:      { defaultZone: "center-right", defaultSize: "sm",  resizable: false, movable: true,  hideable: true,  label: "Reactions" },
  scoreboard:     { defaultZone: "top-right",    defaultSize: "md",  resizable: true,  movable: true,  hideable: true,  label: "Scoreboard" },
  timer:          { defaultZone: "top-center",   defaultSize: "xs",  resizable: false, movable: true,  hideable: false, label: "Timer" },
  "hud-mini":     { defaultZone: "top-left",     defaultSize: "xs",  resizable: false, movable: true,  hideable: true,  label: "HUD" },
  queue:          { defaultZone: "center-right", defaultSize: "sm",  resizable: true,  movable: true,  hideable: true,  label: "Queue" },
  "now-playing":  { defaultZone: "bottom-left",  defaultSize: "sm",  resizable: false, movable: true,  hideable: true,  label: "Now Playing" },
  "crowd-meter":  { defaultZone: "top-right",    defaultSize: "xs",  resizable: false, movable: true,  hideable: true,  label: "Crowd Meter" },
  "vote-panel":   { defaultZone: "center-right", defaultSize: "md",  resizable: false, movable: true,  hideable: false, label: "Vote" },
  notifications:  { defaultZone: "top-right",    defaultSize: "sm",  resizable: false, movable: true,  hideable: true,  label: "Notifications" },
  "avatar-preview":{ defaultZone: "bottom-left", defaultSize: "sm",  resizable: true,  movable: true,  hideable: true,  label: "Avatar" },
  "wallet-mini":  { defaultZone: "bottom-left",  defaultSize: "xs",  resizable: false, movable: true,  hideable: true,  label: "Wallet" },
  "host-cam":     { defaultZone: "top-left",     defaultSize: "sm",  resizable: true,  movable: true,  hideable: true,  label: "Host Cam" },
  "stage-map":    { defaultZone: "bottom-right", defaultSize: "sm",  resizable: true,  movable: true,  hideable: true,  label: "Stage Map" },
};

let _nextZ = 100;

export class WidgetDockEngine {
  private static _instance: WidgetDockEngine | null = null;

  private _widgets: Map<WidgetId, WidgetState> = new Map();
  private _listeners: Set<(id: WidgetId, state: WidgetState) => void> = new Set();

  static getInstance(): WidgetDockEngine {
    if (!WidgetDockEngine._instance) {
      WidgetDockEngine._instance = new WidgetDockEngine();
    }
    return WidgetDockEngine._instance;
  }

  // ── Initialization ────────────────────────────────────────────────────────

  initAll(): void {
    let order = 0;
    for (const [id, config] of Object.entries(WIDGET_CONFIGS)) {
      if (!this._widgets.has(id as WidgetId)) {
        this._widgets.set(id as WidgetId, {
          id: id as WidgetId,
          zone: config.defaultZone,
          size: config.defaultSize,
          isPinned: false,
          isVisible: true,
          isMinimized: false,
          opacity: 1,
          zIndex: _nextZ++,
          order: order++,
          lastMovedAt: Date.now(),
        });
      }
    }
  }

  initWidget(id: WidgetId): WidgetState {
    if (this._widgets.has(id)) return this._widgets.get(id)!;
    const config = WIDGET_CONFIGS[id];
    const state: WidgetState = {
      id,
      zone: config.defaultZone,
      size: config.defaultSize,
      isPinned: false,
      isVisible: true,
      isMinimized: false,
      opacity: 1,
      zIndex: _nextZ++,
      order: this._widgets.size,
      lastMovedAt: Date.now(),
    };
    this._widgets.set(id, state);
    return state;
  }

  getState(id: WidgetId): WidgetState | null {
    return this._widgets.get(id) ?? null;
  }

  getAllStates(): WidgetState[] {
    return [...this._widgets.values()];
  }

  // ── Move ──────────────────────────────────────────────────────────────────

  move(id: WidgetId, zone: DockZone, x?: number, y?: number): boolean {
    const state = this._widgets.get(id);
    if (!state || state.isPinned) return false;
    const config = WIDGET_CONFIGS[id];
    if (!config.movable) return false;
    state.zone = zone;
    if (zone === "floating") { state.x = x; state.y = y; }
    state.zIndex = _nextZ++;
    state.lastMovedAt = Date.now();
    this._emit(id, state);
    return true;
  }

  // ── Pin ───────────────────────────────────────────────────────────────────

  pin(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.isPinned = true;
    this._emit(id, state);
  }

  unpin(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.isPinned = false;
    this._emit(id, state);
  }

  // ── Visibility ────────────────────────────────────────────────────────────

  hide(id: WidgetId): boolean {
    const state = this._widgets.get(id);
    const config = WIDGET_CONFIGS[id];
    if (!state || !config?.hideable) return false;
    state.isVisible = false;
    state.zone = "hidden";
    this._emit(id, state);
    return true;
  }

  show(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    const config = WIDGET_CONFIGS[id];
    state.isVisible = true;
    if (state.zone === "hidden" || state.zone === "minimized") {
      state.zone = config.defaultZone;
    }
    state.zIndex = _nextZ++;
    this._emit(id, state);
  }

  minimize(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.isMinimized = true;
    state.zone = "minimized";
    this._emit(id, state);
  }

  restore(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.isMinimized = false;
    const config = WIDGET_CONFIGS[id];
    state.zone = config.defaultZone;
    state.zIndex = _nextZ++;
    this._emit(id, state);
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  resize(id: WidgetId, size: WidgetSize): boolean {
    const state = this._widgets.get(id);
    const config = WIDGET_CONFIGS[id];
    if (!state || !config?.resizable) return false;
    state.size = size;
    this._emit(id, state);
    return true;
  }

  // ── Opacity ───────────────────────────────────────────────────────────────

  setOpacity(id: WidgetId, opacity: number): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.opacity = Math.max(0.1, Math.min(1, opacity));
    this._emit(id, state);
  }

  // ── Focus (bring to front) ────────────────────────────────────────────────

  bringToFront(id: WidgetId): void {
    const state = this._widgets.get(id);
    if (!state) return;
    state.zIndex = _nextZ++;
    this._emit(id, state);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetToDefaults(id: WidgetId): void {
    const config = WIDGET_CONFIGS[id];
    const state = this._widgets.get(id);
    if (!state) return;
    state.zone = config.defaultZone;
    state.size = config.defaultSize;
    state.isPinned = false;
    state.isVisible = true;
    state.isMinimized = false;
    state.opacity = 1;
    state.x = undefined;
    state.y = undefined;
    this._emit(id, state);
  }

  resetAll(): void {
    for (const id of this._widgets.keys()) {
      this.resetToDefaults(id);
    }
  }

  // ── Config access ─────────────────────────────────────────────────────────

  getConfig(id: WidgetId): WidgetConfig {
    return WIDGET_CONFIGS[id];
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (id: WidgetId, state: WidgetState) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(id: WidgetId, state: WidgetState): void {
    for (const cb of this._listeners) cb(id, state);
  }
}

export const widgetDockEngine = WidgetDockEngine.getInstance();
