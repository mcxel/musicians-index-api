/**
 * WorkspaceTransitionRuntime — motion presets for Universal Workspace Window.
 * Respects prefers-reduced-motion.
 */

export type WorkspaceMotionPreset =
  | "open"
  | "close"
  | "dock"
  | "float"
  | "maximize"
  | "fullscreen"
  | "pip"
  | "return"
  | "resize";

export interface WorkspaceMotionTokens {
  durationMs: number;
  easing: string;
  scaleFrom: number;
  opacityFrom: number;
  yFrom: number;
}

const FULL: Record<WorkspaceMotionPreset, WorkspaceMotionTokens> = {
  open: { durationMs: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 0.98, opacityFrom: 0, yFrom: 12 },
  close: { durationMs: 140, easing: "cubic-bezier(0.4, 0, 1, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  dock: { durationMs: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  float: { durationMs: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  maximize: { durationMs: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  fullscreen: { durationMs: 160, easing: "ease-out", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  pip: { durationMs: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  return: { durationMs: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
  resize: { durationMs: 0, easing: "linear", scaleFrom: 1, opacityFrom: 1, yFrom: 0 },
};

const REDUCED: WorkspaceMotionTokens = {
  durationMs: 0,
  easing: "linear",
  scaleFrom: 1,
  opacityFrom: 1,
  yFrom: 0,
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getWorkspaceMotion(preset: WorkspaceMotionPreset): WorkspaceMotionTokens {
  if (prefersReducedMotion()) return REDUCED;
  return FULL[preset];
}

export const WorkspaceTransitionRuntime = {
  prefersReducedMotion,
  getMotion: getWorkspaceMotion,
};
