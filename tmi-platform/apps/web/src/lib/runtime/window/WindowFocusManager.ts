import { WindowManagerRuntime } from './WindowManagerRuntime';

export function focusWindow(id: string) {
  WindowManagerRuntime.focus(id);
}

export function blurWindow(id: string) {
  WindowManagerRuntime.blur(id);
}

export function getActiveWindowId(): string | null {
  return WindowManagerRuntime.getState().activeWindowId;
}
