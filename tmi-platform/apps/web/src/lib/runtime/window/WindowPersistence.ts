import { WindowManagerRuntime } from './WindowManagerRuntime';

export function loadPersistedWindowLayout() {
  WindowManagerRuntime.loadLayout();
}

export function savePersistedWindowLayout() {
  WindowManagerRuntime.saveLayout();
}
