"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type WindowMode = "docked" | "floating" | "closed";

export type WindowState = {
  mode: WindowMode;
  x: number;
  y: number;
};

type DrawerRail = "left" | "right" | "bottom";

type DrawerState = {
  rails: Record<DrawerRail, boolean>;
  windows: Record<string, WindowState>;
};

const DEFAULT_STATE: DrawerState = {
  rails: {
    left: false,
    right: false,
    bottom: false,
  },
  windows: {},
};

function readState(storageKey: string): DrawerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as DrawerState;
    return {
      rails: {
        left: Boolean(parsed.rails?.left),
        right: Boolean(parsed.rails?.right),
        bottom: Boolean(parsed.rails?.bottom),
      },
      windows: parsed.windows ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useDrawerManager(storageKey = "tmi.admin.drawer-manager.v1") {
  const [state, setState] = useState<DrawerState>(DEFAULT_STATE);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    setState(readState(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const api = useMemo(
    () => ({
      isRailCollapsed: (rail: DrawerRail) => state.rails[rail],
      toggleRail: (rail: DrawerRail) => {
        setState((current) => ({
          ...current,
          rails: { ...current.rails, [rail]: !current.rails[rail] },
        }));
      },
      getWindowState: (id: string): WindowState | undefined => state.windows[id],
      setWindowMode: (id: string, mode: WindowMode) => {
        setState((current) => ({
          ...current,
          windows: {
            ...current.windows,
            [id]: {
              mode,
              x: current.windows[id]?.x ?? 32,
              y: current.windows[id]?.y ?? 32,
            },
          },
        }));
      },
      toggleWindowFloat: (id: string) => {
        setState((current) => {
          const existing = current.windows[id] ?? { mode: "docked" as WindowMode, x: 32, y: 32 };
          const nextMode: WindowMode = existing.mode === "floating" ? "docked" : "floating";
          return {
            ...current,
            windows: {
              ...current.windows,
              [id]: { ...existing, mode: nextMode },
            },
          };
        });
      },
      closeWindow: (id: string) => {
        setState((current) => ({
          ...current,
          windows: {
            ...current.windows,
            [id]: {
              mode: "closed",
              x: current.windows[id]?.x ?? 32,
              y: current.windows[id]?.y ?? 32,
            },
          },
        }));
      },
      restoreWindow: (id: string) => {
        setState((current) => ({
          ...current,
          windows: {
            ...current.windows,
            [id]: {
              mode: "docked",
              x: current.windows[id]?.x ?? 32,
              y: current.windows[id]?.y ?? 32,
            },
          },
        }));
      },
      beginDrag: (id: string, event: React.PointerEvent<HTMLDivElement>) => {
        const target = event.currentTarget.getBoundingClientRect();
        dragRef.current = { id, offsetX: event.clientX - target.left, offsetY: event.clientY - target.top };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      moveDrag: (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        const { id, offsetX, offsetY } = dragRef.current;
        setState((current) => ({
          ...current,
          windows: {
            ...current.windows,
            [id]: {
              ...(current.windows[id] ?? { mode: "floating", x: 32, y: 32 }),
              mode: "floating",
              x: Math.max(12, event.clientX - offsetX),
              y: Math.max(12, event.clientY - offsetY),
            },
          },
        }));
      },
      endDrag: () => {
        dragRef.current = null;
      },
      rawState: state,
    }),
    [state],
  );

  return api;
}
