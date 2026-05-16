import type { ChatRole } from "./RoomChatEngine";
import type { ChatWidgetId } from "./ChatWidgetDockingEngine";
import type { ChatWidgetMinimizeStyle, ChatWidgetVisibilityMode } from "./ChatWidgetPreferenceEngine";

export type HideMode = "none" | "15s" | "performance" | "round" | "manual";

export type ChatWidgetRuntimeVisibility = {
  widgetId: ChatWidgetId;
  minimizeStyle: ChatWidgetMinimizeStyle;
  hideMode: HideMode;
  hiddenUntilMs?: number;
  hiddenAtMs?: number;
  restoredAtMs?: number;
};

export type VisibilityContext = {
  nowMs: number;
  performanceActive: boolean;
  scoringActive: boolean;
  roundActive: boolean;
};

export class ChatWidgetMinimizeEngine {
  minimize(current: ChatWidgetRuntimeVisibility, style: Exclude<ChatWidgetMinimizeStyle, "none">): ChatWidgetRuntimeVisibility {
    return {
      ...current,
      minimizeStyle: style,
    };
  }

  restore(current: ChatWidgetRuntimeVisibility): ChatWidgetRuntimeVisibility {
    return {
      ...current,
      minimizeStyle: "none",
      hideMode: "none",
      hiddenUntilMs: undefined,
      restoredAtMs: Date.now(),
    };
  }

  hide(current: ChatWidgetRuntimeVisibility, mode: HideMode, nowMs: number): ChatWidgetRuntimeVisibility {
    const hiddenUntilMs = mode === "15s" ? nowMs + 15000 : undefined;

    return {
      ...current,
      hideMode: mode,
      hiddenAtMs: nowMs,
      hiddenUntilMs,
    };
  }

  isVisible(current: ChatWidgetRuntimeVisibility, context: VisibilityContext): boolean {
    if (current.hideMode === "none") return true;
    if (current.hideMode === "manual") return false;
    if (current.hideMode === "15s") return !current.hiddenUntilMs || context.nowMs >= current.hiddenUntilMs;
    if (current.hideMode === "performance") return !context.performanceActive;
    if (current.hideMode === "round") return !context.roundActive;
    return true;
  }

  toVisibilityMode(runtime: ChatWidgetRuntimeVisibility): ChatWidgetVisibilityMode {
    if (runtime.hideMode === "none") return "visible";
    if (runtime.hideMode === "15s") return "hidden-15s";
    if (runtime.hideMode === "performance") return "hidden-performance";
    if (runtime.hideMode === "round") return "hidden-round";
    return "hidden-manual";
  }

  shouldRoleStayVisible(role: ChatRole, context: VisibilityContext, manuallyHidden: boolean): boolean {
    if (manuallyHidden) return false;
    if (role === "host") return true;
    if (role === "performer" && context.performanceActive) return true;
    if (role === "judge" && context.scoringActive) return true;
    return false;
  }
}

export const chatWidgetMinimizeEngine = new ChatWidgetMinimizeEngine();
