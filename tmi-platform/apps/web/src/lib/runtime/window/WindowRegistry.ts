import { WindowLayout } from './WindowTypes';
import { WindowManagerRuntime } from './WindowManagerRuntime';

const registered = new Set<string>();

export function registerCanisterWindow(id: string, defaults?: Partial<WindowLayout>) {
  if (registered.has(id)) return;
  WindowManagerRuntime.registerWindow(id, defaults);
  registered.add(id);
}

export function unregisterCanisterWindow(id: string) {
  if (!registered.has(id)) return;
  WindowManagerRuntime.unregisterWindow(id);
  registered.delete(id);
}

export function listRegisteredCanisterWindows(): string[] {
  return Array.from(registered);
}
