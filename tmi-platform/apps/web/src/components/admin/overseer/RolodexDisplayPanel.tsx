"use client";

/**
 * RolodexDisplayPanel.tsx — 3D Digital Rolodex Display Container for Admin Panels
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Implements 3D cylindrical rotation (rotateX) for side and desk display panels.
 * Provides controls: NEXT (roll forward) · PREVIOUS (roll back) · DIRECT SELECT · EXPAND (lift) · PIN.
 * Content reflows into active faces without remounting services.
 */

import { useState, useCallback, type ReactNode, type CSSProperties } from "react";
import { ADMIN_MOTION_PRESETS, getAdminMotionTransition } from "@/lib/admin/motion/AdminMotionPresets";

export interface RolodexFace {
  id: string;
  title: string;
  accent: string;
  content: ReactNode;
  summaryBadge?: string;
}

export interface RolodexDisplayPanelProps {
  slotId: string;
  faces: RolodexFace[];
  initialFaceIndex?: number;
  isFolded?: boolean;
  canExpand?: boolean;
  onExpand?: (slotId: string, activeFace: RolodexFace) => void;
  reducedMotion?: boolean;
  canisterStyle?: CSSProperties;
}

export default function RolodexDisplayPanel({
  slotId,
  faces,
  initialFaceIndex = 0,
  isFolded = false,
  canExpand = true,
  onExpand,
  reducedMotion = false,
  canisterStyle,
}: RolodexDisplayPanelProps) {
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, Math.min(initialFaceIndex, faces.length - 1)),
  );
  const [rotationDirection, setRotationDirection] = useState<"forward" | "back" | "direct">("forward");
  const [isRotating, setIsRotating] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const activeFace = faces[activeIndex] ?? faces[0];

  const rollForward = useCallback(() => {
    if (faces.length <= 1 || isRotating) return;
    setRotationDirection("forward");
    setIsRotating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % faces.length);
      setIsRotating(false);
    }, reducedMotion ? 50 : 180);
  }, [faces.length, isRotating, reducedMotion]);

  const rollBack = useCallback(() => {
    if (faces.length <= 1 || isRotating) return;
    setRotationDirection("back");
    setIsRotating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + faces.length) % faces.length);
      setIsRotating(false);
    }, reducedMotion ? 50 : 180);
  }, [faces.length, isRotating, reducedMotion]);

  const directSelect = useCallback(
    (index: number) => {
      if (index === activeIndex || isRotating || index < 0 || index >= faces.length) return;
      setRotationDirection("direct");
      setIsRotating(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsRotating(false);
      }, reducedMotion ? 50 : 140);
    },
    [activeIndex, faces.length, isRotating, reducedMotion],
  );

  const handleExpand = () => {
    if (onExpand && activeFace) {
      onExpand(slotId, activeFace);
    }
  };

  // 3D Rolodex rotation transform calculation
  const getTransform = () => {
    if (reducedMotion || !isRotating) return "rotateX(0deg) scale(1)";
    if (rotationDirection === "forward") {
      return "rotateX(-35deg) scale(0.96) translateY(-8px)";
    }
    if (rotationDirection === "back") {
      return "rotateX(35deg) scale(0.96) translateY(8px)";
    }
    return "scale(0.97) opacity(0.8)";
  };

  return (
    <div
      data-rolodex-slot={slotId}
      data-active-face={activeFace?.id}
      data-folded={isFolded ? "true" : "false"}
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        borderRadius: 10,
        border: `1.5px solid ${activeFace?.accent ?? "rgba(255,215,0,0.35)"}`,
        background: "linear-gradient(180deg, rgba(8,10,22,0.95) 0%, rgba(4,5,12,0.95) 100%)",
        boxShadow: `0 4px 18px rgba(0,0,0,0.5), inset 0 0 16px ${activeFace?.accent ? `${activeFace.accent}15` : "rgba(0,0,0,0.2)"}`,
        overflow: "hidden",
        perspective: 1000,
        transition: isFolded
          ? ADMIN_MOTION_PRESETS.FOLD_TO_FIT.cssTransition
          : ADMIN_MOTION_PRESETS.UNFOLD_TO_AVAILABLE.cssTransition,
        maxHeight: isFolded ? 130 : undefined,
        ...canisterStyle,
      }}
    >
      {/* Rolodex Navigation Bezel Header */}
      <div
        data-rolodex-bezel
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          padding: "4px 8px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: activeFace?.accent ?? "#FFD700",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeFace?.title}
          </span>
          {activeFace?.summaryBadge ? (
            <span
              style={{
                fontSize: 7,
                fontWeight: 800,
                padding: "1px 5px",
                borderRadius: 999,
                background: `${activeFace.accent}25`,
                color: activeFace.accent,
                border: `1px solid ${activeFace.accent}50`,
                letterSpacing: "0.06em",
              }}
            >
              {activeFace.summaryBadge}
            </span>
          ) : null}
        </div>

        {/* Rolodex Carousel Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {faces.length > 1 ? (
            <>
              <button
                type="button"
                data-rolodex-action="prev"
                onClick={rollBack}
                title="Roll back to previous face"
                style={{
                  padding: "2px 5px",
                  borderRadius: 3,
                  border: "1px solid rgba(255,215,0,0.3)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#FFD700",
                  fontSize: 8,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ▲
              </button>
              <button
                type="button"
                data-rolodex-action="next"
                onClick={rollForward}
                title="Roll forward to next face"
                style={{
                  padding: "2px 5px",
                  borderRadius: 3,
                  border: "1px solid rgba(255,215,0,0.3)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#FFD700",
                  fontSize: 8,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ▼
              </button>
            </>
          ) : null}

          <button
            type="button"
            data-rolodex-action="pin"
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? "Unpin face" : "Pin face"}
            style={{
              padding: "2px 5px",
              borderRadius: 3,
              border: isPinned ? "1px solid #AA2DFF" : "1px solid rgba(255,255,255,0.15)",
              background: isPinned ? "rgba(170,45,255,0.2)" : "rgba(0,0,0,0.3)",
              color: isPinned ? "#AA2DFF" : "rgba(255,255,255,0.6)",
              fontSize: 7.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📌
          </button>

          {canExpand ? (
            <button
              type="button"
              data-rolodex-action="expand"
              onClick={handleExpand}
              title="Expand into readable workspace (PANEL_LIFT_EXPAND)"
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid #00FFFF",
                background: "rgba(0,255,255,0.15)",
                color: "#00FFFF",
                fontSize: 7.5,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Expand
            </button>
          ) : null}
        </div>
      </div>

      {/* 3D Cylindrical Display Surface */}
      <div
        data-rolodex-surface
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: getTransform(),
          transition: getAdminMotionTransition(
            rotationDirection === "forward" ? "ROLODEX_FORWARD" : "ROLODEX_BACK",
            reducedMotion,
          ),
          overflow: isFolded ? "hidden" : "auto",
        }}
      >
        {activeFace ? activeFace.content : null}
      </div>

      {/* Direct-Select Indicators for Multi-face Decks */}
      {faces.length > 1 ? (
        <div
          data-rolodex-pips
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            gap: 4,
            padding: "3px 0",
            background: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {faces.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => directSelect(i)}
              title={`Switch to ${f.title}`}
              style={{
                width: i === activeIndex ? 14 : 5,
                height: 4,
                borderRadius: 2,
                border: "none",
                background: i === activeIndex ? (f.accent || "#FFD700") : "rgba(255,255,255,0.2)",
                cursor: "pointer",
                transition: "all 160ms ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
