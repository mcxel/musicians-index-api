/**
 * UniversalWorkspaceWindow — geometry shell (dock/float/resize/maximize/fullscreen/PiP).
 * Content is provided by children and kept mounted via PersistentWorkspaceRuntime.
 */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { getWorkspaceDef } from "@/lib/workspace/universal/UniversalWorkspaceRegistry";
import { universalWorkspaceRuntime } from "@/lib/workspace/universal/UniversalWorkspaceRuntime";
import { getWorkspaceMotion } from "@/lib/workspace/universal/WorkspaceTransitionRuntime";
import type {
  UniversalWorkspaceId,
  WorkspaceInstanceState,
} from "@/lib/workspace/universal/types";
import PersistentWorkspaceRuntime from "./PersistentWorkspaceRuntime";

export interface UniversalWorkspaceWindowProps {
  id: UniversalWorkspaceId;
  instance: WorkspaceInstanceState;
  children: ReactNode;
}

type DragMode = "move" | "resize-se" | null;

export default function UniversalWorkspaceWindow({
  id,
  instance,
  children,
}: UniversalWorkspaceWindowProps) {
  const def = getWorkspaceDef(id);
  const dragMode = useRef<DragMode>(null);
  const origin = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
  const [snapHint, setSnapHint] = useState<"left" | "right" | "top" | null>(null);

  const visible =
    instance.windowState !== "CLOSED" && instance.windowState !== "CLOSING";
  const showShell =
    instance.keepMounted ||
    instance.windowState === "OPENING" ||
    instance.windowState === "CLOSING" ||
    visible;

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragMode.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      if (dragMode.current === "move") {
        const nx = origin.current.x + dx;
        const ny = origin.current.y + dy;
        universalWorkspaceRuntime.dragTo(id, nx, ny);
        const edge = 28;
        const vw = window.innerWidth;
        if (nx <= edge) setSnapHint("left");
        else if (nx + origin.current.w >= vw - edge) setSnapHint("right");
        else if (ny <= edge) setSnapHint("top");
        else setSnapHint(null);
      } else if (dragMode.current === "resize-se") {
        universalWorkspaceRuntime.resizeTo(
          id,
          origin.current.w + dx,
          origin.current.h + dy,
        );
      }
    },
    [id],
  );

  const endPointer = useCallback(() => {
    if (!dragMode.current) return;
    const mode = dragMode.current;
    dragMode.current = null;
    setSnapHint(null);
    if (mode === "move") {
      universalWorkspaceRuntime.endDragWithSnap(id);
    } else if (mode === "resize-se") {
      universalWorkspaceRuntime.endResize(id);
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endPointer);
  }, [id, onPointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
    };
  }, [onPointerMove, endPointer]);

  if (!showShell) return null;

  const motion =
    instance.windowState === "CLOSING"
      ? getWorkspaceMotion("close")
      : instance.windowState === "OPENING"
        ? getWorkspaceMotion("open")
        : getWorkspaceMotion("float");

  const g = instance.geometry;
  const isPip = instance.windowState === "PICTURE_IN_PICTURE";
  const shellHidden =
    instance.windowState === "CLOSED" ||
    instance.windowState === "CLOSING" ||
    instance.windowState === "OPENING";

  const shellStyle: CSSProperties = {
    position: "fixed",
    left: g.x,
    top: g.y,
    width: g.width,
    height: g.height,
    zIndex: instance.zIndex,
    display: shellHidden && instance.windowState !== "OPENING" ? "none" : "flex",
    flexDirection: "column",
    opacity: instance.windowState === "OPENING" ? 0 : instance.windowState === "CLOSING" ? 0 : 1,
    transform:
      instance.windowState === "OPENING"
        ? `scale(${motion.scaleFrom}) translateY(${motion.yFrom}px)`
        : "none",
    transition:
      motion.durationMs > 0
        ? `opacity ${motion.durationMs}ms ${motion.easing}, transform ${motion.durationMs}ms ${motion.easing}, left 180ms ease, top 180ms ease, width 180ms ease, height 180ms ease`
        : "none",
    background: "rgba(8, 6, 20, 0.94)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${def.accent}66`,
    borderRadius: instance.windowState === "FULLSCREEN" ? 0 : 14,
    boxShadow: `0 18px 48px rgba(0,0,0,0.75), 0 0 28px ${def.accent}33`,
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
    pointerEvents: shellHidden ? "none" : "auto",
  };

  const startMove = (e: ReactPointerEvent) => {
    if (
      instance.windowState === "FULLSCREEN" ||
      instance.windowState === "MAXIMIZED" ||
      instance.windowState === "DOCKED"
    ) {
      return;
    }
    e.preventDefault();
    dragMode.current = "move";
    origin.current = {
      mx: e.clientX,
      my: e.clientY,
      x: g.x,
      y: g.y,
      w: g.width,
      h: g.height,
    };
    universalWorkspaceRuntime.focus(id);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endPointer);
  };

  const startResize = (e: ReactPointerEvent) => {
    if (
      instance.windowState === "FULLSCREEN" ||
      instance.windowState === "MAXIMIZED" ||
      instance.windowState === "DOCKED" ||
      isPip
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    dragMode.current = "resize-se";
    origin.current = {
      mx: e.clientX,
      my: e.clientY,
      x: g.x,
      y: g.y,
      w: g.width,
      h: g.height,
    };
    universalWorkspaceRuntime.beginResize(id);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endPointer);
  };

  return (
    <>
      {snapHint ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            zIndex: instance.zIndex - 1,
            pointerEvents: "none",
            background: "rgba(0,255,255,0.12)",
            border: "1px solid rgba(0,255,255,0.35)",
            ...(snapHint === "left"
              ? { left: 0, top: 0, width: "50vw", height: "100vh" }
              : snapHint === "right"
                ? { right: 0, top: 0, width: "50vw", height: "100vh" }
                : { left: 0, top: 0, width: "100vw", height: "50vh" }),
          }}
        />
      ) : null}

      <div
        role="dialog"
        aria-label={def.label}
        data-workspace-id={id}
        data-workspace-state={instance.windowState}
        style={shellStyle}
        onMouseDown={() => universalWorkspaceRuntime.focus(id)}
      >
        <header
          onPointerDown={startMove}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: isPip ? "6px 8px" : "8px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            cursor:
              instance.windowState === "FLOATING" || instance.windowState === "RESIZING"
                ? "grab"
                : "default",
            userSelect: "none",
            background: `linear-gradient(90deg, ${def.accent}22, transparent)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 12 }} aria-hidden>
              ▦
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: isPip ? 10 : 12,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {def.label}
              </div>
              {!isPip ? (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                  {instance.windowState}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <HeaderBtn
              label="Collapse to PiP"
              onClick={() => {
                if (instance.windowState === "PICTURE_IN_PICTURE") {
                  universalWorkspaceRuntime.returnFromMode(id);
                } else {
                  universalWorkspaceRuntime.pictureInPicture(id);
                }
              }}
            >
              ▭
            </HeaderBtn>
            <HeaderBtn
              label="Dock right"
              onClick={() => {
                if (instance.windowState === "DOCKED") {
                  universalWorkspaceRuntime.float(id);
                } else {
                  universalWorkspaceRuntime.dock(id, "right");
                }
              }}
            >
              ⧉
            </HeaderBtn>
            <HeaderBtn
              label="Maximize"
              onClick={() => {
                if (instance.windowState === "MAXIMIZED") {
                  universalWorkspaceRuntime.returnFromMode(id);
                } else {
                  universalWorkspaceRuntime.maximize(id);
                }
              }}
            >
              □
            </HeaderBtn>
            <HeaderBtn
              label="Fullscreen"
              onClick={() => {
                if (instance.windowState === "FULLSCREEN") {
                  universalWorkspaceRuntime.returnFromMode(id);
                } else {
                  universalWorkspaceRuntime.fullscreen(id);
                }
              }}
            >
              ⛶
            </HeaderBtn>
            <HeaderBtn label="Close" onClick={() => universalWorkspaceRuntime.close(id)} danger>
              ✕
            </HeaderBtn>
          </div>
        </header>

        <PersistentWorkspaceRuntime
          windowState={instance.windowState}
          keepMounted={instance.keepMounted}
          style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>
        </PersistentWorkspaceRuntime>

        {instance.windowState !== "FULLSCREEN" &&
        instance.windowState !== "MAXIMIZED" &&
        instance.windowState !== "DOCKED" &&
        !isPip ? (
          <div
            onPointerDown={startResize}
            aria-label="Resize window"
            style={{
              position: "absolute",
              right: 2,
              bottom: 2,
              width: 16,
              height: 16,
              cursor: "nwse-resize",
              background:
                "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.35) 50%)",
            }}
          />
        ) : null}
      </div>
    </>
  );
}

function HeaderBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 26,
        height: 24,
        borderRadius: 6,
        border: danger
          ? "1px solid rgba(255,80,80,0.45)"
          : "1px solid rgba(255,255,255,0.14)",
        background: danger ? "rgba(255,60,60,0.15)" : "rgba(255,255,255,0.06)",
        color: danger ? "#ffb0b0" : "rgba(255,255,255,0.85)",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
