import {
  DockSide,
  LayoutPreset,
  PanelRole,
  ResponsiveBehavior,
  WindowLayout,
  WindowRect,
  WindowRuntimeApi,
  WindowRuntimeState,
} from './WindowTypes';

const STORAGE_KEY = 'tmi.window.manager.layout.v1';
const DEFAULT_RECT: WindowRect = { x: 24, y: 120, width: 420, height: 620 };

const listeners = new Set<(state: WindowRuntimeState) => void>();

let state: WindowRuntimeState = {
  windows: {},
  activeWindowId: null,
  zCounter: 1000,
};

function emit() {
  for (const listener of listeners) listener(state);
}

function now() {
  return Date.now();
}

function viewportSize() {
  if (typeof window === 'undefined') return { vw: 1440, vh: 900 };
  return { vw: window.innerWidth, vh: window.innerHeight };
}

function roleRect(role?: PanelRole): WindowRect {
  const { vw, vh } = viewportSize();
  switch (role) {
    case 'performer-panel':
      return { x: Math.round(vw * 0.04), y: Math.round(vh * 0.1), width: Math.round(vw * 0.52), height: Math.round(vh * 0.62) };
    case 'audience-panel':
      return { x: Math.round(vw * 0.6), y: Math.round(vh * 0.16), width: Math.round(vw * 0.32), height: Math.round(vh * 0.5) };
    case 'avatar-center-module':
      return { x: Math.round(vw * 0.44), y: Math.round(vh * 0.72), width: 260, height: 140 };
    case 'memory-wall':
      return { x: Math.max(0, vw - 380), y: 0, width: Math.min(380, vw), height: vh };
    case 'left-context-rail':
      return { x: 0, y: 0, width: Math.min(300, vw), height: vh };
    case 'right-social-rail':
      return { x: Math.max(0, vw - Math.min(340, vw)), y: 0, width: Math.min(340, vw), height: vh };
    default:
      return { ...DEFAULT_RECT };
  }
}

function resolvePresetRect(preset?: LayoutPreset, role?: PanelRole): WindowRect {
  const { vw, vh } = viewportSize();
  if (!preset || preset === 'desktop-default') return roleRect(role);
  switch (preset) {
    case 'focus-mode':
      return { x: Math.round(vw * 0.08), y: Math.round(vh * 0.08), width: Math.round(vw * 0.84), height: Math.round(vh * 0.84) };
    case 'mobile':
      return { x: 0, y: Math.round(vh * 0.08), width: vw, height: Math.round(vh * 0.84) };
    case 'tablet':
      return { x: Math.round(vw * 0.04), y: Math.round(vh * 0.08), width: Math.round(vw * 0.92), height: Math.round(vh * 0.82) };
    default:
      return roleRect(role);
  }
}

function applyResponsiveBehavior(rect: WindowRect, behavior?: ResponsiveBehavior): WindowRect {
  const { vw, vh } = viewportSize();
  if (!behavior) return rect;
  switch (behavior) {
    case 'fullscreen-on-mobile':
      if (vw <= 768) return { x: 0, y: 0, width: vw, height: vh };
      return rect;
    case 'hide-on-mobile':
      if (vw <= 768) return { ...rect, width: 0, height: 0 };
      return rect;
    case 'hide-on-tablet':
      if (vw > 768 && vw <= 1024) return { ...rect, width: 0, height: 0 };
      return rect;
    case 'scale':
      return {
        ...rect,
        width: Math.min(rect.width, vw),
        height: Math.min(rect.height, vh),
      };
    default:
      return rect;
  }
}

function computeDockRect(side: DockSide): WindowRect {
  if (typeof window === 'undefined') return { ...DEFAULT_RECT };
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  switch (side) {
    case 'left':
      return { x: 0, y: 0, width: Math.min(420, vw), height: vh };
    case 'right':
      return { x: Math.max(0, vw - Math.min(420, vw)), y: 0, width: Math.min(420, vw), height: vh };
    case 'top':
      return { x: 0, y: 0, width: vw, height: Math.min(280, vh) };
    case 'bottom':
      return { x: 0, y: Math.max(0, vh - Math.min(280, vh)), width: vw, height: Math.min(280, vh) };
    default:
      return { ...DEFAULT_RECT };
  }
}

function withWindow(id: string, updater: (current: WindowLayout) => WindowLayout) {
  const current = state.windows[id];
  if (!current) return;
  state = {
    ...state,
    windows: {
      ...state.windows,
      [id]: updater(current),
    },
  };
  emit();
}

function nextZ() {
  state = { ...state, zCounter: state.zCounter + 1 };
  return state.zCounter;
}

function defaultLayout(id: string): WindowLayout {
  return {
    id,
    state: 'hidden',
    pinned: false,
    visible: false,
    zIndex: nextZ(),
    rect: { ...DEFAULT_RECT },
    updatedAt: now(),
    allowFloating: true,
    allowFullscreen: true,
    allowResize: true,
    allowPin: true,
    cinematicPriority: 0,
    zPriority: 0,
    defaultAnimation: 'spring',
  };
}

export const WindowManagerRuntime: WindowRuntimeApi = {
  getState() {
    return state;
  },

  registerWindow(id, defaults) {
    if (state.windows[id]) return;
    const base = defaultLayout(id);
    const resolvedRect = applyResponsiveBehavior(
      defaults?.rect
        ? { ...base.rect, ...defaults.rect }
        : resolvePresetRect(defaults?.layoutPreset, defaults?.panelRole),
      defaults?.responsiveBehavior
    );

    state = {
      ...state,
      windows: {
        ...state.windows,
        [id]: {
          ...base,
          ...defaults,
          rect: resolvedRect,
          restoreGeometry: defaults?.restoreGeometry ?? resolvedRect,
          updatedAt: now(),
        },
      },
    };
    emit();
  },

  unregisterWindow(id) {
    if (!state.windows[id]) return;
    const { [id]: _removed, ...rest } = state.windows;
    state = {
      ...state,
      windows: rest,
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    };
    emit();
  },

  show(id) {
    withWindow(id, (w) => {
      const resolvedRect = applyResponsiveBehavior(
        w.rect.width > 0 && w.rect.height > 0 ? w.rect : resolvePresetRect(w.layoutPreset, w.panelRole),
        w.responsiveBehavior
      );
      return {
        ...w,
        state: w.state === 'hidden' ? 'docked' : w.state,
        visible: true,
        rect: resolvedRect,
        zIndex: nextZ() + (w.zPriority ?? 0),
        updatedAt: now(),
      };
    });
    state = { ...state, activeWindowId: id };
    emit();
  },

  hide(id) {
    withWindow(id, (w) => ({
      ...w,
      restoreGeometry: w.state !== 'hidden' ? w.rect : w.restoreGeometry,
      state: 'hidden',
      visible: false,
      updatedAt: now(),
    }));
    if (state.activeWindowId === id) {
      state = { ...state, activeWindowId: null };
      emit();
    }
  },

  toggle(id) {
    const w = state.windows[id];
    if (!w) return;
    if (w.visible) this.hide(id);
    else this.show(id);
  },

  focus(id) {
    withWindow(id, (w) => ({
      ...w,
      visible: true,
      zIndex: nextZ(),
      updatedAt: now(),
    }));
    state = { ...state, activeWindowId: id };
    emit();
  },

  blur(id) {
    if (state.activeWindowId !== id) return;
    state = { ...state, activeWindowId: null };
    emit();
  },

  pin(id) {
    withWindow(id, (w) => ({ ...w, pinned: true, state: 'pinned', visible: true, updatedAt: now() }));
  },

  unpin(id) {
    withWindow(id, (w) => ({ ...w, pinned: false, state: w.visible ? 'floating' : 'hidden', updatedAt: now() }));
  },

  dock(id, side) {
    withWindow(id, (w) => ({
      ...w,
      dockSide: side,
      rect: computeDockRect(side),
      state: 'docked',
      visible: true,
      updatedAt: now(),
    }));
  },

  undock(id) {
    withWindow(id, (w) => ({
      ...w,
      dockSide: undefined,
      state: 'floating',
      visible: true,
      updatedAt: now(),
    }));
  },

  setState(id, nextState) {
    withWindow(id, (w) => ({
      ...w,
      state: nextState,
      visible: nextState !== 'hidden',
      updatedAt: now(),
    }));
  },

  drag(id, x, y) {
    withWindow(id, (w) => ({
      ...w,
      state: w.state === 'docked' ? 'floating' : w.state,
      rect: { ...w.rect, x, y },
      visible: true,
      updatedAt: now(),
    }));
  },

  resize(id, width, height) {
    withWindow(id, (w) => ({
      ...w,
      rect: { ...w.rect, width: Math.max(240, width), height: Math.max(180, height) },
      visible: true,
      updatedAt: now(),
    }));
  },

  fullscreen(id) {
    withWindow(id, (w) => ({
      ...w,
      restoreGeometry: w.state !== 'fullscreen' ? w.rect : w.restoreGeometry,
      state: 'fullscreen',
      visible: true,
      rect:
        typeof window === 'undefined'
          ? w.rect
          : { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
      updatedAt: now(),
    }));
  },

  expand(id) {
    withWindow(id, (w) => ({ ...w, state: 'expanded', visible: true, updatedAt: now() }));
  },

  collapse(id) {
    withWindow(id, (w) => ({ ...w, state: 'minimized', visible: true, updatedAt: now() }));
  },

  minimize(id) {
    withWindow(id, (w) => ({
      ...w,
      restoreGeometry: w.state !== 'minimized' ? w.rect : w.restoreGeometry,
      state: 'minimized',
      visible: true,
      updatedAt: now(),
    }));
  },

  restoreDefault(id) {
    withWindow(id, (w) => {
      const resetRect = applyResponsiveBehavior(
        resolvePresetRect(w.layoutPreset, w.panelRole),
        w.responsiveBehavior
      );
      return {
        ...defaultLayout(id),
        panelRole: w.panelRole,
        layoutPreset: w.layoutPreset,
        preferredDock: w.preferredDock,
        preferredSize: w.preferredSize,
        responsiveBehavior: w.responsiveBehavior,
        cinematicPriority: w.cinematicPriority,
        zPriority: w.zPriority,
        rect: w.restoreGeometry ?? resetRect,
        state: 'docked',
        visible: true,
        updatedAt: now(),
      };
    });
  },

  saveLayout() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  loadLayout() {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as WindowRuntimeState;
      state = parsed;
      emit();
    } catch {
      // ignore invalid persisted layout
    }
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
