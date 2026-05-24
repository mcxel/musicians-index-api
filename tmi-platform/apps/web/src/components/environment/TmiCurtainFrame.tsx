"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

export type CurtainColor = "red" | "purple" | "gold" | "navy" | "emerald";

const CURTAIN_PALETTE: Record<CurtainColor, { main: string; shadow: string; tassel: string }> = {
  red:     { main: "#8b0000", shadow: "#4a0000", tassel: "#FFD700" },
  purple:  { main: "#4a0080", shadow: "#220044", tassel: "#FF2DAA" },
  gold:    { main: "#7a5900", shadow: "#3a2800", tassel: "#FFD700" },
  navy:    { main: "#001060", shadow: "#000830", tassel: "#00FFFF" },
  emerald: { main: "#005030", shadow: "#002018", tassel: "#4ade80" },
};

const CURTAIN_SPRING = { type: "spring" as const, stiffness: 60, damping: 18, mass: 1.1 };

interface TmiCurtainFrameProps {
  children?: ReactNode;
  color?: CurtainColor;
  /** When true, curtains slide apart (open). When false, curtains close to center. */
  open?: boolean;
  isOpen?: boolean;
  width?: number | string;
  height?: number | string;
  label?: string;
  showTassels?: boolean;
  /** Called when the curtain animation completes */
  onComplete?: () => void;
}

export default function TmiCurtainFrame({
  children,
  color = "red",
  open,
  isOpen,
  width = "100%",
  height = "100%",
  label,
  showTassels = true,
  onComplete,
}: TmiCurtainFrameProps) {
  // Support both `open` and `isOpen` prop names
  const curtainOpen = isOpen ?? open ?? true;
  const p = CURTAIN_PALETTE[color];

  return (
    <div
      style={{
        position: "relative",
        width, height,
        display: "flex", flexDirection: "column",
        background: "#050010",
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      {/* ── Pelmet (top valance) ── */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 32, zIndex: 20, pointerEvents: "none",
          background: `linear-gradient(to bottom, ${p.main}, ${p.shadow})`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.6)`,
          display: "flex", alignItems: "center",
        }}
      >
        {/* Gold valance rod */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: p.tassel, opacity: 0.8 }} />
        {/* Tassels */}
        {showTassels && (
          <div style={{ position: "absolute", bottom: -12, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 2, height: 12,
                  background: `linear-gradient(to bottom, ${p.tassel}, ${p.tassel}88)`,
                  borderRadius: "0 0 2px 2px",
                  animation: `curtainTasselSway ${1.4 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                  transformOrigin: "top center",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Left curtain panel (slides to -100% when open) ── */}
      <motion.div
        animate={{ x: curtainOpen ? "-88%" : "0%" }}
        transition={CURTAIN_SPRING}
        onAnimationComplete={onComplete}
        style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: "50%",
          zIndex: 15, pointerEvents: "none",
          background: `linear-gradient(to right, ${p.main} 0%, ${p.shadow} 70%, transparent 100%)`,
          boxShadow: `inset -8px 0 20px rgba(0,0,0,0.4)`,
        }}
      >
        <FoldLines color={p.tassel} side="left" />
      </motion.div>

      {/* ── Right curtain panel (slides to 100% when open) ── */}
      <motion.div
        animate={{ x: curtainOpen ? "88%" : "0%" }}
        transition={CURTAIN_SPRING}
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: "50%",
          zIndex: 15, pointerEvents: "none",
          background: `linear-gradient(to left, ${p.main} 0%, ${p.shadow} 70%, transparent 100%)`,
          boxShadow: `inset 8px 0 20px rgba(0,0,0,0.4)`,
        }}
      >
        <FoldLines color={p.tassel} side="right" />
      </motion.div>

      {/* ── Label ── */}
      {label && (
        <div
          style={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            zIndex: 18, pointerEvents: "none",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.16em",
            textTransform: "uppercase", color: p.tassel,
            textShadow: `0 0 8px ${p.tassel}`,
            background: "rgba(0,0,0,0.55)", padding: "3px 10px", borderRadius: 4,
          }}
        >
          {label}
        </div>
      )}

      {/* ── Content behind curtains ── */}
      <div style={{ flex: 1, position: "relative", marginTop: 32, zIndex: 5, overflow: "hidden" }}>
        {children}
      </div>

      <style>{`
        @keyframes curtainTasselSway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
      `}</style>
    </div>
  );
}

function FoldLines({ color, side }: { color: string; side: "left" | "right" }) {
  const positions = [15, 30, 50, 70];
  return (
    <>
      {positions.map((pct, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            [side === "left" ? "left" : "right"]: `${pct}%`,
            width: 1,
            background: `linear-gradient(to bottom, transparent, ${color}33, transparent)`,
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
}
