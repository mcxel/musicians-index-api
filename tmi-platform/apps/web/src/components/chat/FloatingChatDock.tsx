"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  chatWidgetDockingEngine,
  type ChatWidgetId,
  type DockZone,
  type SafeZone,
  type WidgetDockState,
  type WidgetSize,
} from "@/lib/chat/ChatWidgetDockingEngine";
import {
  chatWidgetPreferenceEngine,
  type ChatViewerPreferenceState,
  type ChatWidgetOpacity,
  type ChatWidgetPreference,
  type ChatWidgetFocusMode,
  type ChatWidgetCompactMode,
  type ChatWidgetMinimizeStyle,
} from "@/lib/chat/ChatWidgetPreferenceEngine";
import { chatWidgetMinimizeEngine, type ChatWidgetRuntimeVisibility } from "@/lib/chat/ChatWidgetMinimizeEngine";
import { ChatWidgetHandle } from "./ChatWidgetHandle";
import { ChatWidgetMinimizedPill } from "./ChatWidgetMinimizedPill";
import { ChatWidgetSettingsMenu } from "./ChatWidgetSettingsMenu";

type FloatingChatDockProps = {
  userId: string;
  widgetId: ChatWidgetId;
  title: string;
  size: WidgetSize;
  containerSize: WidgetSize;
  safeZones?: SafeZone[];
  unreadCount?: number;
  children: React.ReactNode;
};

export function FloatingChatDock({
  userId,
  widgetId,
  title,
  size,
  containerSize,
  safeZones = [],
  unreadCount = 0,
  children,
}: FloatingChatDockProps) {
  const [prefs, setPrefs] = useState<ChatViewerPreferenceState>(() => chatWidgetPreferenceEngine.load(userId));
  const [runtime, setRuntime] = useState<ChatWidgetRuntimeVisibility>({
    widgetId,
    minimizeStyle: "none",
    hideMode: "none",
  });
  const [showSettings, setShowSettings] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  const preference = useMemo<ChatWidgetPreference>(() => {
    return prefs.widgets[widgetId];
  }, [prefs, widgetId]);

  const setWidgetPref = useCallback(
    (partial: Partial<Omit<ChatWidgetPreference, "widgetId" | "updatedAtMs">>) => {
      setPrefs((current) => chatWidgetPreferenceEngine.updateWidget(current, widgetId, partial));
    },
    [widgetId],
  );

  const startDrag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragRef.current = { startX: event.clientX, startY: event.clientY };

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return;
        const delta = {
          x: moveEvent.clientX - dragRef.current.startX,
          y: moveEvent.clientY - dragRef.current.startY,
        };

        const nextDock = chatWidgetDockingEngine.applyDrag(
          widgetId,
          preference.dock,
          delta,
          containerSize,
          size,
          safeZones,
        );

        dragRef.current = { startX: moveEvent.clientX, startY: moveEvent.clientY };
        setWidgetPref({ dock: nextDock, size });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [widgetId, preference.dock, containerSize, size, safeZones, setWidgetPref],
  );

  const minimized = runtime.minimizeStyle !== "none";
  const visible = chatWidgetMinimizeEngine.isVisible(runtime, {
    nowMs: Date.now(),
    performanceActive: false,
    scoringActive: false,
    roundActive: false,
  });

  if (!visible) {
    return null;
  }

  if (minimized) {
    return (
      <div
        style={{
          position: "absolute",
          left: preference.dock.position.x,
          top: preference.dock.position.y,
          zIndex: 30,
          opacity: preference.opacity,
        }}
      >
        <ChatWidgetMinimizedPill
          label={title}
          styleMode={runtime.minimizeStyle as Exclude<ChatWidgetMinimizeStyle, "none">}
          unreadCount={unreadCount}
          onRestore={() => setRuntime((current) => chatWidgetMinimizeEngine.restore(current))}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: preference.dock.position.x,
        top: preference.dock.position.y,
        width: size.width,
        height: size.height,
        zIndex: 30,
        opacity: preference.opacity,
        border: "1px solid rgba(56,189,248,0.3)",
        borderRadius: 10,
        overflow: "hidden",
        background: "rgba(2,6,23,0.85)",
        boxShadow: "0 10px 26px rgba(2,6,23,0.42)",
      }}
    >
      <ChatWidgetHandle
        widgetId={widgetId}
        title={title}
        onStartDrag={startDrag}
        onOpenSettings={() => setShowSettings((value) => !value)}
        onToggleMinimize={() =>
          setRuntime((current) =>
            current.minimizeStyle === "none"
              ? chatWidgetMinimizeEngine.minimize(current, preference.minimizeStyle === "none" ? "pill" : preference.minimizeStyle)
              : chatWidgetMinimizeEngine.restore(current),
          )
        }
        onHide={() => setRuntime((current) => chatWidgetMinimizeEngine.hide(current, "manual", Date.now()))}
        minimized={false}
      />

      {showSettings && (
        <div style={{ position: "absolute", top: 36, right: 8, zIndex: 50 }}>
          <ChatWidgetSettingsMenu
            preference={preference}
            onOpacityChange={(opacity: ChatWidgetOpacity) => setWidgetPref({ opacity })}
            onCompactModeChange={(compactMode: ChatWidgetCompactMode) => setWidgetPref({ compactMode })}
            onFocusModeChange={(focusMode: ChatWidgetFocusMode) => setWidgetPref({ focusMode })}
            onMinimizeStyleChange={(minimizeStyle: ChatWidgetMinimizeStyle) => setWidgetPref({ minimizeStyle })}
            onDockZoneChange={(zone: DockZone) => {
              const dock = chatWidgetDockingEngine.resolveDock(widgetId, zone, containerSize, size, safeZones, preference.dock.position);
              setWidgetPref({ dock });
            }}
            onPinUser={(pinnedUserId) => setWidgetPref({ pinnedUserId })}
            onHideModeChange={(mode) => setRuntime((current) => chatWidgetMinimizeEngine.hide(current, mode, Date.now()))}
          />
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: `calc(100% - 36px)`,
          overflow: "auto",
          pointerEvents: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
