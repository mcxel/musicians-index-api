import type { ChatRole } from "./RoomChatEngine";
import type { ChatWidgetId, DockZone, Point, WidgetSize, WidgetDockState } from "./ChatWidgetDockingEngine";

export type ChatWidgetOpacity = 1 | 0.75 | 0.5 | 0.25;

export type ChatWidgetCompactMode = "full-bubble" | "tiny-ticker";

export type ChatWidgetFocusMode = "all" | "host-only" | "performer-only" | "judges-only" | "crowd-only";

export type ChatWidgetMinimizeStyle = "none" | "pill" | "icon" | "tab";

export type ChatWidgetVisibilityMode = "visible" | "hidden-15s" | "hidden-performance" | "hidden-round" | "hidden-manual";

export type ChatWidgetPreference = {
  widgetId: ChatWidgetId;
  dock: WidgetDockState;
  size: WidgetSize;
  opacity: ChatWidgetOpacity;
  compactMode: ChatWidgetCompactMode;
  minimizeStyle: ChatWidgetMinimizeStyle;
  visibilityMode: ChatWidgetVisibilityMode;
  focusMode: ChatWidgetFocusMode;
  pinnedUserId?: string;
  pinnedRole?: ChatRole;
  updatedAtMs: number;
};

export type ChatViewerPreferenceState = {
  userId: string;
  widgets: Record<ChatWidgetId, ChatWidgetPreference>;
};

const STORAGE_PREFIX = "tmi.chat.widget.preferences";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}.${userId}`;
}

function defaultDock(widgetId: ChatWidgetId): WidgetDockState {
  const zone: DockZone = widgetId === "overflow-panel" ? "top-right" : widgetId === "performer-rail" ? "bottom-right" : "bottom-left";
  const position: Point = zone === "top-right" ? { x: 12, y: 12 } : zone === "bottom-right" ? { x: 12, y: 12 } : { x: 12, y: 12 };

  return {
    widgetId,
    zone,
    position,
    snapped: true,
    lastUpdatedAtMs: Date.now(),
  };
}

function defaultPreference(widgetId: ChatWidgetId): ChatWidgetPreference {
  const size: WidgetSize =
    widgetId === "overflow-panel"
      ? { width: 340, height: 500 }
      : widgetId === "performer-rail"
        ? { width: 320, height: 400 }
        : { width: 420, height: 260 };

  return {
    widgetId,
    dock: defaultDock(widgetId),
    size,
    opacity: 1,
    compactMode: "full-bubble",
    minimizeStyle: "none",
    visibilityMode: "visible",
    focusMode: "all",
    updatedAtMs: Date.now(),
  };
}

function defaultState(userId: string): ChatViewerPreferenceState {
  return {
    userId,
    widgets: {
      "bubble-rail": defaultPreference("bubble-rail"),
      "overflow-panel": defaultPreference("overflow-panel"),
      "performer-rail": defaultPreference("performer-rail"),
    },
  };
}

export class ChatWidgetPreferenceEngine {
  load(userId: string): ChatViewerPreferenceState {
    if (typeof window === "undefined") {
      return defaultState(userId);
    }

    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      if (!raw) return defaultState(userId);

      const parsed = JSON.parse(raw) as ChatViewerPreferenceState;
      return {
        userId,
        widgets: {
          "bubble-rail": parsed.widgets?.["bubble-rail"] ?? defaultPreference("bubble-rail"),
          "overflow-panel": parsed.widgets?.["overflow-panel"] ?? defaultPreference("overflow-panel"),
          "performer-rail": parsed.widgets?.["performer-rail"] ?? defaultPreference("performer-rail"),
        },
      };
    } catch {
      return defaultState(userId);
    }
  }

  save(state: ChatViewerPreferenceState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(state.userId), JSON.stringify(state));
    } catch {
      // Ignore storage write failures.
    }
  }

  updateWidget(
    state: ChatViewerPreferenceState,
    widgetId: ChatWidgetId,
    partial: Partial<Omit<ChatWidgetPreference, "widgetId" | "updatedAtMs">>,
  ): ChatViewerPreferenceState {
    const current = state.widgets[widgetId] ?? defaultPreference(widgetId);
    const nextWidget: ChatWidgetPreference = {
      ...current,
      ...partial,
      widgetId,
      updatedAtMs: Date.now(),
    };

    const next = {
      ...state,
      widgets: {
        ...state.widgets,
        [widgetId]: nextWidget,
      },
    };

    this.save(next);
    return next;
  }

  reset(userId: string): ChatViewerPreferenceState {
    const state = defaultState(userId);
    this.save(state);
    return state;
  }
}

export const chatWidgetPreferenceEngine = new ChatWidgetPreferenceEngine();
