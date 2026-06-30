import { WindowManagerRuntime } from './WindowManagerRuntime';

export function saveWindowLayoutSnapshot() {
  WindowManagerRuntime.saveLayout();
}

export function restoreWindowLayoutSnapshot() {
  WindowManagerRuntime.loadLayout();
}

export function restoreWindowDefaults(windowIds: string[]) {
  for (const id of windowIds) {
    WindowManagerRuntime.restoreDefault(id);
  }
}
