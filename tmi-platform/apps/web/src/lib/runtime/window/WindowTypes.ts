export type WindowState =
  | 'hidden'
  | 'peek'
  | 'docked'
  | 'floating'
  | 'pinned'
  | 'minimized'
  | 'expanded'
  | 'fullscreen';

export type DockSide = 'left' | 'right' | 'top' | 'bottom';

export type PanelRole =
  | 'performer-panel'
  | 'audience-panel'
  | 'avatar-center-module'
  | 'memory-wall'
  | 'left-context-rail'
  | 'right-social-rail'
  | 'floating-canister'
  | 'chat'
  | 'friends'
  | 'playlist'
  | 'store'
  | 'rewards'
  | 'notifications'
  | 'upload'
  | 'camera'
  | 'settings'
  | 'moderation'
  | 'custom';

export type LayoutPreset =
  | 'performer-studio'
  | 'audience-view'
  | 'battle'
  | 'cypher'
  | 'challenge'
  | 'world-concert'
  | 'focus-mode'
  | 'mobile'
  | 'tablet'
  | 'desktop-default'
  | 'custom';

export type ResponsiveBehavior =
  | 'preserve'
  | 'scale'
  | 'collapse-to-chip'
  | 'convert-to-sheet'
  | 'hide-on-mobile'
  | 'hide-on-tablet'
  | 'fullscreen-on-mobile';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowLayout {
  id: string;
  state: WindowState;
  dockSide?: DockSide;
  pinned: boolean;
  zIndex: number;
  rect: WindowRect;
  visible: boolean;
  updatedAt: number;

  panelRole?: PanelRole;
  layoutPreset?: LayoutPreset;
  preferredDock?: DockSide;
  preferredSize?: Pick<WindowRect, 'width' | 'height'>;
  restoreGeometry?: WindowRect;
  cinematicPriority?: number;
  responsiveBehavior?: ResponsiveBehavior;
  zPriority?: number;
  allowFloating?: boolean;
  allowFullscreen?: boolean;
  allowResize?: boolean;
  allowPin?: boolean;
  minimumSize?: Pick<WindowRect, 'width' | 'height'>;
  maximumSize?: Pick<WindowRect, 'width' | 'height'>;
  defaultAnimation?: 'spring' | 'fade' | 'slide' | 'scale';
}

export interface WindowRuntimeState {
  windows: Record<string, WindowLayout>;
  activeWindowId: string | null;
  zCounter: number;
}

export interface WindowRuntimeApi {
  getState(): WindowRuntimeState;
  registerWindow(id: string, defaults?: Partial<WindowLayout>): void;
  unregisterWindow(id: string): void;
  show(id: string): void;
  hide(id: string): void;
  toggle(id: string): void;
  focus(id: string): void;
  blur(id: string): void;
  pin(id: string): void;
  unpin(id: string): void;
  dock(id: string, side: DockSide): void;
  undock(id: string): void;
  setState(id: string, state: WindowState): void;
  drag(id: string, x: number, y: number): void;
  resize(id: string, width: number, height: number): void;
  fullscreen(id: string): void;
  expand(id: string): void;
  collapse(id: string): void;
  minimize(id: string): void;
  restoreDefault(id: string): void;
  saveLayout(): void;
  loadLayout(): void;
  subscribe(listener: (state: WindowRuntimeState) => void): () => void;
}
