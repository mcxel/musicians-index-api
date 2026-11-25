/**
 * One size law for every TMI drawer.
 * Compact stays in the workspace. Expanded and full screen only change the frame.
 */

export type DrawerPresentation = "compact" | "expanded" | "fullscreen";

export interface DrawerPresentationState {
  presentation: DrawerPresentation;
  beforeFullscreen: "compact" | "expanded";
}

export const INITIAL_DRAWER_PRESENTATION: DrawerPresentationState = {
  presentation: "compact",
  beforeFullscreen: "compact",
};

export type DrawerPresentationAction = "expand" | "fullscreen" | "restore" | "close" | "escape";

export function reduceDrawerPresentation(
  state: DrawerPresentationState,
  action: DrawerPresentationAction,
): { state: DrawerPresentationState; close: boolean } {
  if (action === "close") {
    return { state: INITIAL_DRAWER_PRESENTATION, close: true };
  }
  if (action === "expand") {
    if (state.presentation === "compact") {
      return { state: { ...state, presentation: "expanded" }, close: false };
    }
    return { state, close: false };
  }
  if (action === "fullscreen") {
    if (state.presentation === "fullscreen") return { state, close: false };
    return {
      state: {
        presentation: "fullscreen",
        beforeFullscreen: state.presentation === "expanded" ? "expanded" : "compact",
      },
      close: false,
    };
  }
  if (action === "restore" || (action === "escape" && state.presentation !== "compact")) {
    if (state.presentation === "fullscreen") {
      return {
        state: { presentation: state.beforeFullscreen, beforeFullscreen: "compact" },
        close: false,
      };
    }
    return { state: { presentation: "compact", beforeFullscreen: "compact" }, close: false };
  }
  if (action === "escape") {
    return { state, close: true };
  }
  return { state, close: false };
}
