"use client";

/**
 * HubDrawerFrame — the one frame every Hub drawer opens in on a phone.
 *
 * Same region for every drawer (edges, top anchor, safe areas, border, radius,
 * close position). The body owns its own vertical scroll. A backdrop keeps the
 * Hub mounted underneath but takes its taps while a drawer is open. Back and
 * ✕ close the topmost drawer and put the Hub back where it was.
 */

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import HubDrawerHeader from "@/components/workspace/universal/HubDrawerHeader";
import { useHubDrawerBackContract } from "@/lib/workspace/universal/hubDrawerBackStack";

/** Above the GPS launcher (9350) and rail (9360); below the welcome dialog (9450) and camera (9500). */
export const HUB_DRAWER_FRAME_Z = 9390;

export const HUB_DRAWER_FRAME_GEOMETRY = {
  left: "max(8px, env(safe-area-inset-left))",
  right: "max(8px, env(safe-area-inset-right))",
  top: "max(60px, calc(env(safe-area-inset-top) + 8px))",
  topFull: "max(8px, env(safe-area-inset-top))",
  bottom: "max(8px, env(safe-area-inset-bottom))",
} as const;

let openFrame: { id: number; replace: () => void } | null = null;
let nextFrameId = 1;

interface SavedHubPosition {
  x: number;
  y: number;
  column: number | null;
}

function captureHubPosition(): SavedHubPosition {
  const column = document.querySelector<HTMLElement>('[data-testid="hub-mobile-column"]');
  return { x: window.scrollX, y: window.scrollY, column: column ? column.scrollTop : null };
}

function restoreHubPosition(saved: SavedHubPosition) {
  const apply = () => {
    window.scrollTo(saved.x, saved.y);
    if (saved.column !== null) {
      const column = document.querySelector<HTMLElement>('[data-testid="hub-mobile-column"]');
      if (column) column.scrollTop = saved.column;
    }
  };
  apply();
  window.requestAnimationFrame(() => {
    apply();
    window.requestAnimationFrame(apply);
  });
}

export default function HubDrawerFrame({
  drawerId,
  title,
  onRequestClose,
  children,
  headerActions,
  fullscreen = false,
  bodyMode = "scroll",
}: {
  drawerId: string;
  title?: string;
  /** Returns true when the drawer closed; false keeps it open (e.g. unsaved prompt). */
  onRequestClose: () => boolean | void;
  children: ReactNode;
  headerActions?: ReactNode;
  fullscreen?: boolean;
  /** "contain" holds a workspace that lays out its own fixed panes inside the frame. */
  bodyMode?: "scroll" | "contain";
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;
  const requestClose = () => closeRef.current() !== false;

  useHubDrawerBackContract(true, requestClose);

  useLayoutEffect(() => {
    const saved = captureHubPosition();
    return () => restoreHubPosition(saved);
  }, []);

  useEffect(() => {
    const id = nextFrameId++;
    const previous = openFrame;
    openFrame = { id, replace: () => void closeRef.current() };
    if (previous) previous.replace();
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openFrame?.id === id) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (openFrame?.id === id) openFrame = null;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div data-testid="hub-drawer-frame-root" data-hub-drawer-id={drawerId} style={{ position: "fixed", inset: 0, zIndex: HUB_DRAWER_FRAME_Z }}>
      <button
        type="button"
        data-testid="hub-drawer-backdrop"
        aria-label="Close drawer"
        tabIndex={-1}
        onClick={() => closeRef.current()}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          padding: 0,
          background: "rgba(2,2,10,0.62)",
          touchAction: "none",
          cursor: "default",
        }}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? drawerId}
        tabIndex={-1}
        data-testid="hub-drawer-frame"
        data-hub-drawer-id={drawerId}
        data-hub-drawer-full={fullscreen ? "1" : "0"}
        style={{
          position: "absolute",
          left: HUB_DRAWER_FRAME_GEOMETRY.left,
          right: HUB_DRAWER_FRAME_GEOMETRY.right,
          top: fullscreen ? HUB_DRAWER_FRAME_GEOMETRY.topFull : HUB_DRAWER_FRAME_GEOMETRY.top,
          bottom: HUB_DRAWER_FRAME_GEOMETRY.bottom,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 14,
          border: "1px solid rgba(0,229,255,0.35)",
          background: "linear-gradient(180deg, rgba(10,6,20,0.99), rgba(5,5,16,0.99))",
          boxShadow: "0 18px 48px rgba(0,0,0,0.6), 0 0 22px rgba(170,45,255,0.18)",
          outline: "none",
        }}
      >
        <HubDrawerHeader drawerId={drawerId} title={title} onClose={() => closeRef.current()} scopeRef={panelRef} actions={headerActions} />
        <div
          data-testid="hub-drawer-body"
          className="tmi-hub-drawer-scroll"
          style={
            bodyMode === "contain"
              ? { flex: 1, minHeight: 0, position: "relative", overflow: "hidden", transform: "translateZ(0)" }
              : {
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                  padding: "10px 10px 14px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,229,255,0.45) transparent",
                }
          }
        >
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}
