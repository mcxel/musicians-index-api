import { DockSide } from './WindowTypes';
import { WindowManagerRuntime } from './WindowManagerRuntime';

export function dockWindow(id: string, side: DockSide) {
  WindowManagerRuntime.dock(id, side);
}

export function undockWindow(id: string) {
  WindowManagerRuntime.undock(id);
}
