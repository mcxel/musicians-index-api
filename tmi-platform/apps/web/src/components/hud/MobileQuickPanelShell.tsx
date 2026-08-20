"use client";

/**
 * MobileQuickPanelShell — shared animated container for every quick panel.
 *
 * Mobile: bottom-sheet with drag handle, snap positions, monitor selector [A][B][⇄].
 * Desktop: floating card (existing style, top-right).
 *
 * The shell never unmounts monitors or triggers media restarts — it is purely
 * a visual container. The monitor-yield behavior lives in MobileMonitorYield.
 */

import React, { useCallback, useRef, useState } from "react";
import {
  useMobileQuickPanelRuntime,
  PANEL_SNAP_HEIGHTS,
  type PanelSnapState,
  type MonitorSide,
} from "@/lib/hud/mobileQuickPanelRuntime";

const CYAN = "#00FFFF";

interface MobileQuickPanelShellProps {
  isOpen: boolean;
  title: string;
  accentColor?: string;
  /** Show [A] [B] [⇄] monitor selector in header (mobile only). Default true. */
  showMonitorSelector?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

// ── Animation keyframes injected once ───────────────────────────────────────
const KEYFRAMES = `
@keyframes tmiPanelRise {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes tmiPanelFall {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}
@keyframes tmiCardFade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

let keyframesInjected = false;
function ensureKeyframes() {
  if (keyframesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

// ── Monitor selector pill ────────────────────────────────────────────────────
function MonitorPill({
  side,
  active,
  accentColor,
  onClick,
}: {
  side: MonitorSide;
  active: boolean;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Keep Monitor ${side.toUpperCase()} visible`}
      style={{
        minWidth: 28,
        height: 22,
        borderRadius: 6,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: "pointer",
        background: active ? accentColor : "rgba(255,255,255,0.07)",
        border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.14)"}`,
        color: active ? "#050510" : "rgba(255,255,255,0.5)",
        transition: "background 140ms, color 140ms, border-color 140ms",
        lineHeight: 1,
        padding: "0 6px",
      }}
    >
      {side.toUpperCase()}
    </button>
  );
}

// ── Snap dots row ────────────────────────────────────────────────────────────
function SnapDots({
  current,
  accentColor,
  onChange,
}: {
  current: PanelSnapState;
  accentColor: string;
  onChange: (s: PanelSnapState) => void;
}) {
  const snaps: PanelSnapState[] = ["compact", "standard", "expanded"];
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {snaps.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          title={s}
          aria-label={`Snap panel to ${s}`}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            cursor: "pointer",
            background: current === s ? accentColor : "rgba(255,255,255,0.18)",
            border: "none",
            padding: 0,
            transition: "background 140ms",
          }}
        />
      ))}
    </div>
  );
}

// ── Main shell ───────────────────────────────────────────────────────────────
export default function MobileQuickPanelShell({
  isOpen,
  title,
  accentColor = CYAN,
  showMonitorSelector = true,
  children,
  onClose,
}: MobileQuickPanelShellProps) {
  ensureKeyframes();

  const {
    snapState,
    activeMonitor,
    isMobile,
    setSnap,
    swapMonitor,
    setActiveMonitor,
    applyDragDelta,
  } = useMobileQuickPanelRuntime();

  // Touch drag state
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    dragCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragStartY.current === null) { setIsDragging(false); return; }
    // deltaY positive = dragged up
    const deltaY = dragCurrentY.current - dragStartY.current;
    applyDragDelta(-deltaY, onClose); // negate: upward finger movement = positive growth
    dragStartY.current = null;
    setIsDragging(false);
  }, [applyDragDelta, onClose]);

  if (!isOpen) return null;

  const panelHeightDvh = PANEL_SNAP_HEIGHTS[snapState];

  // ── Mobile bottom-sheet ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${panelHeightDvh}dvh`,
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px 20px 0 0",
          background: "rgba(5, 5, 20, 0.97)",
          border: "1px solid rgba(0, 255, 255, 0.18)",
          borderBottom: "none",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(0,255,255,0.08)",
          animation: isDragging
            ? "none"
            : "tmiPanelRise 230ms cubic-bezier(0.16,1,0.3,1) both",
          transition: isDragging ? "none" : "height 240ms cubic-bezier(0.4,0,0.2,1)",
          willChange: "height",
          touchAction: "none",
        }}
        data-quick-panel="mobile"
      >
        {/* ── Drag handle ── */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 10,
            paddingBottom: 4,
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
          }}
          aria-label="Drag to resize panel"
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.20)",
            }}
          />
        </div>

        {/* ── Header ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px 10px",
            borderBottom: "1px solid rgba(0,255,255,0.09)",
          }}
        >
          {/* Title */}
          <span
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: accentColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>

          {/* Monitor selector */}
          {showMonitorSelector && (
            <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
              {(["a", "b"] as MonitorSide[]).map((side) => (
                <MonitorPill
                  key={side}
                  side={side}
                  active={activeMonitor === side}
                  accentColor={accentColor}
                  onClick={() => setActiveMonitor(side)}
                />
              ))}
              <button
                type="button"
                onClick={swapMonitor}
                title="Swap active monitor"
                style={{
                  minWidth: 28,
                  height: 22,
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  color: "rgba(255,255,255,0.45)",
                  padding: "0 4px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ⇄
              </button>
            </div>
          )}

          {/* Snap dots */}
          <SnapDots
            current={snapState}
            accentColor={accentColor}
            onChange={setSnap}
          />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 17,
              cursor: "pointer",
              padding: "2px 2px",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // ── Desktop floating card ────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 12px)",
        right: 12,
        width: "min(88vw, 380px)",
        maxHeight: "56dvh",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        borderRadius: 20,
        background: "rgba(5, 5, 20, 0.97)",
        border: "1px solid rgba(0, 255, 255, 0.2)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,255,255,0.07)",
        animation: "tmiCardFade 200ms cubic-bezier(0.16,1,0.3,1) both",
      }}
      data-quick-panel="desktop"
    >
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px 10px",
          borderBottom: "1px solid rgba(0,255,255,0.1)",
          position: "sticky",
          top: 0,
          background: "rgba(5, 5, 20, 0.99)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: accentColor,
          }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            cursor: "pointer",
            padding: "2px 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ overflowY: "auto", overscrollBehavior: "contain" }}>
        {children}
      </div>
    </div>
  );
}
