export type TmiWindowState =
  | "hidden"
  | "peek"
  | "docked"
  | "floating"
  | "pinned"
  | "minimized"
  | "expanded"
  | "fullscreen";

export interface WindowPositionEvent {
  windowId: string;
  x: number;
  y: number;
}

export interface WindowResizeEvent {
  windowId: string;
  width: number;
  height: number;
}