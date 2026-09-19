"use client";

/**
 * CanonicalPanelExpansionAuthority.tsx — In-Place Panel Expansion & Inspection Engine
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Coordinates:
 * 1. COMPACT -> LARGE -> FOCUSED -> COMPACT presentation transitions
 * 2. Pop-up lift animation (PANEL_LIFT_EXPAND) and return animation (PANEL_RETURN)
 * 3. In-place 3D Rolodex navigation while remaining expanded
 * 4. Touch swipe-down dismissal and desktop ESC hotkey
 * 5. Complete preservation of underlying services without unmounting/recreating
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  CANONICAL_PANEL_GEOMETRIES,
  type PanelGeometryMode,
} from "@/lib/admin/AdminPanelGeometryResolver";
import { ADMIN_MOTION_PRESETS } from "@/lib/admin/motion/AdminMotionPresets";
import type { RolodexFace } from "./RolodexDisplayPanel";

export interface ExpandedPanelContext {
  slotId: string;
  faces: RolodexFace[];
  currentFaceIndex: number;
}

export interface CanonicalPanelExpansionAuthorityProps {
  expandedContext: ExpandedPanelContext | null;
  onClose: () => void;
  reducedMotion?: boolean;
}

export default function CanonicalPanelExpansionAuthority({
  expandedContext,
  onClose,
  reducedMotion = false,
}: CanonicalPanelExpansionAuthorityProps) {
  const [geometryMode, setGeometryMode] = useState<PanelGeometryMode>("LARGE");
  const [activeFaceIndex, setActiveFaceIndex] = useState(
    expandedContext?.currentFaceIndex ?? 0,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  // Sync index when context updates
  useEffect(() => {
    if (expandedContext) {
      setActiveFaceIndex(expandedContext.currentFaceIndex);
      setGeometryMode("LARGE");
      setTouchDeltaY(0);
    }
  }, [expandedContext]);

  // Handle ESC key to collapse
  useEffect(() => {
    if (!expandedContext) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleReturn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedContext, onClose]);

  const handleReturn = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, reducedMotion ? 40 : 220);
  }, [onClose, reducedMotion]);

  // Touch swipe-down gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartY === null) return;
    const delta = Math.max(0, e.touches[0].clientY - touchStartY);
    setTouchDeltaY(delta);
  };

  const handleTouchEnd = () => {
    if (touchDeltaY > 100) {
      handleReturn();
    } else {
      setTouchDeltaY(0);
    }
    setTouchStartY(null);
  };

  if (!expandedContext || typeof document === "undefined") {
    return null;
  }

  const faces = expandedContext.faces;
  const activeFace = faces[activeFaceIndex] ?? faces[0];
  const geometry = CANONICAL_PANEL_GEOMETRIES[geometryMode];

  const rollNext = () => {
    if (faces.length <= 1) return;
    setActiveFaceIndex((prev) => (prev + 1) % faces.length);
  };

  const rollPrev = () => {
    if (faces.length <= 1) return;
    setActiveFaceIndex((prev) => (prev - 1 + faces.length) % faces.length);
  };

  const toggleFocus = () => {
    setGeometryMode((cur) => (cur === "LARGE" ? "FOCUSED" : "LARGE"));
  };

  return createPortal(
    <div
      data-panel-expansion-portal
      data-geometry={geometryMode}
      data-slot={expandedContext.slotId}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(4, 5, 14, ${geometry.scrimDim ?? 0.6})`,
        backdropFilter: "blur(8px)",
        transition: "background 240ms ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReturn();
      }}
    >
      {/* Expanded Surface */}
      <div
        data-expanded-surface
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: geometry.width ?? "85vw",
          height: geometry.height ?? "78vh",
          maxWidth: "100vw",
          maxHeight: "96vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          border: `2px solid ${activeFace?.accent ?? "#00FFFF"}`,
          background: "linear-gradient(180deg, #090b1c 0%, #04060f 100%)",
          boxShadow: `0 24px 60px rgba(0,0,0,0.9), 0 0 35px ${activeFace?.accent ? `${activeFace.accent}30` : "rgba(0,255,255,0.25)"}`,
          overflow: "hidden",
          transform: isAnimating
            ? "scale(0.94) translateY(30px)"
            : `translateY(${touchDeltaY}px) scale(1)`,
          opacity: isAnimating ? 0 : 1,
          transition: reducedMotion
            ? "opacity 120ms ease"
            : ADMIN_MOTION_PRESETS.PANEL_LIFT_EXPAND.cssTransition,
        }}
      >
        {/* Expanded Surface Bezel Header */}
        <div
          data-expanded-bezel
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "8px 14px",
            background: "rgba(0,0,0,0.7)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: activeFace?.accent ?? "#00FFFF",
                boxShadow: `0 0 10px ${activeFace?.accent ?? "#00FFFF"}`,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: activeFace?.accent ?? "#00FFFF",
                textTransform: "uppercase",
              }}
            >
              {activeFace?.title}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.08em",
              }}
            >
              {geometryMode}
            </span>
          </div>

          {/* Header Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {faces.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={rollPrev}
                  title="Previous presentation in deck (rolled in-place)"
                  style={expandedActionBtn()}
                >
                  ◀ Prev Face
                </button>
                <button
                  type="button"
                  onClick={rollNext}
                  title="Next presentation in deck (rolled in-place)"
                  style={expandedActionBtn()}
                >
                  Next Face ▶
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={toggleFocus}
              title={geometryMode === "LARGE" ? "Expand to Full Workspace" : "Contract to Large View"}
              style={expandedActionBtn(true)}
            >
              {geometryMode === "LARGE" ? "⛶ Maximize" : "🗗 Standard Large"}
            </button>

            <button
              type="button"
              data-testid="expanded-panel-close-btn"
              onClick={handleReturn}
              title="Return to exact prior deck position (ESC)"
              style={{
                ...expandedActionBtn(),
                border: "1px solid rgba(255,45,170,0.5)",
                color: "#FF2DAA",
                background: "rgba(255,45,170,0.12)",
                fontWeight: 900,
              }}
            >
              ✕ Return
            </button>
          </div>
        </div>

        {/* Reflowed Body Container */}
        <div
          data-expanded-content
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: 16,
          }}
        >
          {activeFace ? activeFace.content : null}
        </div>

        {/* Swipe Down Hint for Touch Viewports */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "4px 0",
            background: "rgba(0,0,0,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
            SWIPE DOWN OR PRESS ESC TO RETURN
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function expandedActionBtn(highlight = false) {
  return {
    padding: "4px 10px",
    borderRadius: 6,
    border: highlight ? "1px solid #00FFFF" : "1px solid rgba(255,215,0,0.35)",
    background: highlight ? "rgba(0,255,255,0.15)" : "rgba(0,0,0,0.45)",
    color: highlight ? "#00FFFF" : "#FFD700",
    fontSize: 8.5,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "all 140ms ease",
  };
}
