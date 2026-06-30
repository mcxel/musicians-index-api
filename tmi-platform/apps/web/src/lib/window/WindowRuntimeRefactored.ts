/**
 * TMI Universal Window Runtime — Event-Driven Refactor
 *
 * This is the IMPROVED version that uses the Event Bus instead of direct mutation.
 *
 * Before (❌ direct mutation):
 *   window.state = 'visible';
 *
 * After (✅ event-driven):
 *   dispatch({ type: 'WINDOW_OPENED', data: { windowId } });
 *
 * This makes the system:
 * - Debuggable (every state change is an event)
 * - Testable (events can be replayed/mocked)
 * - Extensible (listeners added without changing runtime)
 * - Portable (Desktop/VR/Mobile consume same events)
 *
 * @see CLAUDE.md Rule 21 (Venue Runtime Convergence), Rule 22 (Adaptive Platform Rule)
 */

import { EventBus, EventPayload, emitEvent } from '../events/EventBus';

export type WindowAction =
  | { type: 'REGISTER_WINDOW'; windowId: string; config: any }
  | { type: 'OPEN_WINDOW'; windowId: string }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'BLUR_WINDOW'; windowId: string }
  | { type: 'PIN_WINDOW'; windowId: string }
  | { type: 'UNPIN_WINDOW'; windowId: string }
  | { type: 'MOVE_WINDOW'; windowId: string; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; windowId: string; width: number; height: number }
  | { type: 'DOCK_WINDOW'; windowId: string; dock: string }
  | { type: 'UNDOCK_WINDOW'; windowId: string };

export interface WindowState {
  id: string;
  state: 'registered' | 'initialized' | 'loaded' | 'visible' | 'focused' | 'hidden' | 'destroyed';
  position: { x: number; y: number; dock?: string };
  dimensions: { width: number; height: number };
  isPinned: boolean;
  isFocused: boolean;
  history: string[]; // 'opened', 'focused', 'moved', etc.
}

/**
 * Improved Window Runtime — Event-driven state machine
 *
 * Instead of mutating objects directly, all state changes emit events.
 * External systems (renderer, analytics, scene) listen to events.
 * This creates a one-way data flow: Action → Event → State Update → Re-render
 */
export class WindowRuntimeRefactored {
  private windowStates = new Map<string, WindowState>();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to our own events to update state
    this.eventBus.on('WINDOW_OPENED', this.handleWindowOpened.bind(this));
    this.eventBus.on('WINDOW_CLOSED', this.handleWindowClosed.bind(this));
    this.eventBus.on('WINDOW_FOCUSED', this.handleWindowFocused.bind(this));
    this.eventBus.on('WINDOW_MOVED', this.handleWindowMoved.bind(this));
    this.eventBus.on('WINDOW_RESIZED', this.handleWindowResized.bind(this));
  }

  /**
   * Dispatch an action to the runtime
   * This is the ONLY way to change state
   */
  async dispatch(action: WindowAction): Promise<void> {
    switch (action.type) {
      case 'REGISTER_WINDOW':
        await this.registerWindow(action.windowId, action.config);
        break;

      case 'OPEN_WINDOW':
        await this.openWindow(action.windowId);
        break;

      case 'CLOSE_WINDOW':
        await this.closeWindow(action.windowId);
        break;

      case 'FOCUS_WINDOW':
        await this.focusWindow(action.windowId);
        break;

      case 'BLUR_WINDOW':
        await this.blurWindow(action.windowId);
        break;

      case 'PIN_WINDOW':
        await this.pinWindow(action.windowId);
        break;

      case 'UNPIN_WINDOW':
        await this.unpinWindow(action.windowId);
        break;

      case 'MOVE_WINDOW':
        await this.moveWindow(action.windowId, action.x, action.y);
        break;

      case 'RESIZE_WINDOW':
        await this.resizeWindow(action.windowId, action.width, action.height);
        break;

      case 'DOCK_WINDOW':
        await this.dockWindow(action.windowId, action.dock);
        break;

      case 'UNDOCK_WINDOW':
        await this.undockWindow(action.windowId);
        break;
    }
  }

  private async registerWindow(windowId: string, config: any): Promise<void> {
    const state: WindowState = {
      id: windowId,
      state: 'registered',
      position: { x: 0, y: 0, dock: config.defaultDock },
      dimensions: config.dimensions,
      isPinned: false,
      isFocused: false,
      history: ['registered'],
    };

    this.windowStates.set(windowId, state);

    await emitEvent({
      type: 'WINDOW_REGISTERED',
      source: 'WindowRuntime',
      data: { windowId, config },
    });
  }

  private async openWindow(windowId: string): Promise<void> {
    const state = this.windowStates.get(windowId);
    if (!state) return;

    // Emit event (handler will update state)
    await emitEvent({
      type: 'WINDOW_OPENED',
      source: 'WindowRuntime',
      data: { windowId },
    });

    // Trigger viewport recalculation
    await emitEvent({
      type: 'AVAILABLE_SPACE_CHANGED',
      source: 'WindowRuntime',
      data: { windowId, action: 'opened' },
    });
  }

  private async closeWindow(windowId: string): Promise<void> {
    const state = this.windowStates.get(windowId);
    if (!state) return;

    await emitEvent({
      type: 'WINDOW_CLOSED',
      source: 'WindowRuntime',
      data: { windowId },
    });

    // Trigger viewport recalculation
    await emitEvent({
      type: 'AVAILABLE_SPACE_CHANGED',
      source: 'WindowRuntime',
      data: { windowId, action: 'closed' },
    });
  }

  private async focusWindow(windowId: string): Promise<void> {
    const state = this.windowStates.get(windowId);
    if (!state) return;

    await emitEvent({
      type: 'WINDOW_FOCUSED',
      source: 'WindowRuntime',
      data: { windowId },
    });
  }

  private async blurWindow(windowId: string): Promise<void> {
    await emitEvent({
      type: 'WINDOW_BLURRED',
      source: 'WindowRuntime',
      data: { windowId },
    });
  }

  private async pinWindow(windowId: string): Promise<void> {
    const state = this.windowStates.get(windowId);
    if (!state) return;

    await emitEvent({
      type: 'WINDOW_PINNED',
      source: 'WindowRuntime',
      data: { windowId },
    });
  }

  private async unpinWindow(windowId: string): Promise<void> {
    await emitEvent({
      type: 'WINDOW_UNPINNED',
      source: 'WindowRuntime',
      data: { windowId },
    });
  }

  private async moveWindow(windowId: string, x: number, y: number): Promise<void> {
    await emitEvent({
      type: 'WINDOW_MOVED',
      source: 'WindowRuntime',
      data: { windowId, x, y },
    });
  }

  private async resizeWindow(windowId: string, width: number, height: number): Promise<void> {
    await emitEvent({
      type: 'WINDOW_RESIZED',
      source: 'WindowRuntime',
      data: { windowId, width, height },
    });
  }

  private async dockWindow(windowId: string, dock: string): Promise<void> {
    await emitEvent({
      type: 'WINDOW_DOCKED',
      source: 'WindowRuntime',
      data: { windowId, dock },
    });
  }

  private async undockWindow(windowId: string): Promise<void> {
    await emitEvent({
      type: 'WINDOW_UNDOCKED',
      source: 'WindowRuntime',
      data: { windowId },
    });
  }

  // Event handlers — these update internal state
  private handleWindowOpened(event: EventPayload): void {
    const windowId = event.data?.windowId;
    const state = this.windowStates.get(windowId);
    if (state) {
      state.state = 'visible';
      state.history.push('opened');
    }
  }

  private handleWindowClosed(event: EventPayload): void {
    const windowId = event.data?.windowId;
    const state = this.windowStates.get(windowId);
    if (state) {
      state.state = 'hidden';
      state.history.push('closed');
    }
  }

  private handleWindowFocused(event: EventPayload): void {
    const windowId = event.data?.windowId;
    const state = this.windowStates.get(windowId);
    if (state) {
      state.isFocused = true;
      state.history.push('focused');
    }
  }

  private handleWindowMoved(event: EventPayload): void {
    const data = event.data;
    if (!data) return;
    const { windowId, x, y } = data as { windowId?: string; x?: number; y?: number };
    if (!windowId || typeof x !== 'number' || typeof y !== 'number') return;

    const state = this.windowStates.get(windowId);
    if (state) {
      state.position = { ...state.position, x, y };
      state.history.push('moved');
    }
  }

  private handleWindowResized(event: EventPayload): void {
    const data = event.data;
    if (!data) return;
    const { windowId, width, height } = data as { windowId?: string; width?: number; height?: number };
    if (!windowId || typeof width !== 'number' || typeof height !== 'number') return;

    const state = this.windowStates.get(windowId);
    if (state) {
      state.dimensions = { width, height };
      state.history.push('resized');
    }
  }

  // Getters for reading state (never directly mutate)
  getWindowState(windowId: string): WindowState | undefined {
    return this.windowStates.get(windowId);
  }

  getAllWindowStates(): WindowState[] {
    return Array.from(this.windowStates.values());
  }

  getWindowHistory(windowId: string): string[] {
    return this.windowStates.get(windowId)?.history || [];
  }
}

/**
 * Example usage (reactive pattern):
 *
 * const runtime = new WindowRuntimeRefactored(eventBus);
 *
 * // Listen for events (React component, analytics, scene, etc.)
 * eventBus.on('WINDOW_OPENED', async (event) => {
 *   const { windowId } = event.data;
 *   // Update React state, trigger animation, log, etc.
 *   setOpenWindows(prev => [...prev, windowId]);
 * });
 *
 * // Dispatch actions (user clicks, drag, etc.)
 * runtime.dispatch({ type: 'OPEN_WINDOW', windowId: 'chat' });
 *
 * // Events flow through the system:
 * // Open button clicked
 *   ↓ (dispatch action)
 * // Runtime processes action
 *   ↓ (emits WINDOW_OPENED event)
 * // All listeners react (animation, state update, analytics, etc.)
 *   ↓ (re-render happens naturally)
 * // UI shows window
 */
