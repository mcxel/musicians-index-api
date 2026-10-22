"use client";

/**
 * HubGpsLauncher — the one GPS button on the phone Hub.
 * Lives in the top bar at the docked edge (left by default). Tap opens/closes
 * the GPS rail. Hold and drag sideways to move it; it snaps to the left or
 * right edge and remembers the side. A drag never opens the rail.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  GPS_LAUNCHER_DRAG_THRESHOLD_PX,
  isGpsDrawerVisible,
  resolveGpsDockSide,
  useMobileGpsMonitorLayoutStore,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";

export default function HubGpsLauncher() {
  const dockSide = useMobileGpsMonitorLayoutStore((s) => s.dockSide);
  const setDockSide = useMobileGpsMonitorLayoutStore((s) => s.setDockSide);
  const hydrateDockSide = useMobileGpsMonitorLayoutStore((s) => s.hydrateDockSide);
  const toggleGpsDrawer = useMobileGpsMonitorLayoutStore((s) => s.toggleGpsDrawer);
  const open = useMobileGpsMonitorLayoutStore((s) => isGpsDrawerVisible(s.layout));
  const pressRef = useRef<{ x: number; dragging: boolean; pointerId: number } | null>(null);
  const suppressClickRef = useRef(false);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    hydrateDockSide();
  }, [hydrateDockSide]);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pressRef.current = { x: event.clientX, dragging: false, pointerId: event.pointerId };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;
    const delta = event.clientX - press.x;
    if (!press.dragging && Math.abs(delta) >= GPS_LAUNCHER_DRAG_THRESHOLD_PX) {
      press.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (press.dragging) setDragX(delta);
  };

  const finishPress = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press || !press.dragging) return;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    setDragX(0);
    setDockSide(resolveGpsDockSide(event.clientX, window.innerWidth));
  };

  return (
    <button
      type="button"
      data-testid="hub-gps-recall"
      data-gps-dock-side={dockSide}
      data-gps-dragging={dragX !== 0 ? "1" : "0"}
      aria-label={open ? "Close GPS navigation" : "Open GPS navigation. Hold and drag sideways to move it."}
      aria-expanded={open}
      aria-controls="hub-mobile-gps-drawer"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPress}
      onPointerCancel={() => {
        pressRef.current = null;
        setDragX(0);
      }}
      onClick={(event) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          event.preventDefault();
          return;
        }
        toggleGpsDrawer();
      }}
      style={{
        order: dockSide === "left" ? -1 : 99,
        position: "relative",
        zIndex: dragX !== 0 ? 96 : undefined,
        flex: "0 0 44px",
        width: 44,
        height: 44,
        padding: 0,
        display: "grid",
        placeItems: "center",
        background: "transparent",
        border: "none",
        cursor: dragX !== 0 ? "grabbing" : "pointer",
        touchAction: "none",
        transform: dragX !== 0 ? `translateX(${dragX}px)` : undefined,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 34,
          height: 30,
          borderRadius: 8,
          border: `1px solid ${open ? "#00E5FF" : "rgba(0,229,255,0.45)"}`,
          background: open ? "rgba(0,229,255,0.2)" : "rgba(8,10,18,0.92)",
          color: "#fff",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.04em",
          boxShadow: open ? "0 0 10px rgba(0,229,255,0.45)" : "none",
          pointerEvents: "none",
        }}
      >
        GPS
      </span>
    </button>
  );
}
