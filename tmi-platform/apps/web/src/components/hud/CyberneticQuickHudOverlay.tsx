"use client";

import React, { useEffect, useState } from "react";
import {
  CircularStatusDial,
  SegmentedProgressBar,
  WaveformAreaGraph,
} from "./CyberneticPanelPrimitives";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";

export type QuickHudType =
  | "yopho"
  | "memory"
  | "submissions"
  | "avatar"
  | "rewards"
  | "live"
  | "admin"
  | "avatar-quick"
  | "inventory-quick"
  | "memory-quick";

export interface CyberneticQuickHudOverlayProps {
  type: QuickHudType;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  /** Which side of the stage this panel sits on — determines left/right anchor. */
  side?: "left" | "right";
}

/**
 * CyberneticQuickHudOverlay — compact cybernetic side HUD for quick actions.
 * The host (CanonicalLeft/RightQuickPanelHost) positions the outer wrapper;
 * this component is rendered inside that wrapper (no own position:fixed).
 */
export default function CyberneticQuickHudOverlay({
  type,
  isOpen,
  onClose,
  accentColor = "#00FFFF",
  side = "right",
}: CyberneticQuickHudOverlayProps) {
  const [settled, setSettled] = useState(false);
  const openInSurface = useWorkspacePresentationStore((s) => s.openInSurface);

  useEffect(() => {
    if (!isOpen) {
      setSettled(false);
      return;
    }
    const timer = setTimeout(() => setSettled(true), 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const openFullDrawer = (id: Parameters<typeof openInSurface>[0]) => {
    onClose();
    openInSurface(id, "DRAWER");
  };

  const ctaBtn = (label: string, onClick: () => void, color = accentColor) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "6px 0",
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: 6,
        color: color,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.12em",
        cursor: "pointer",
        marginTop: 8,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        width: "100%",
        zIndex: 9400,
        background: "rgba(6, 9, 24, 0.96)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${accentColor}55`,
        borderRadius: 14,
        boxShadow: `0 16px 40px rgba(0,0,0,0.85), 0 0 25px ${accentColor}20`,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        padding: 14,
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Outer Sci-Fi Chamfer Corner Brackets */}
      <div
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          width: 12,
          height: 12,
          borderTop: `2px solid ${accentColor}`,
          borderLeft: `2px solid ${accentColor}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: 12,
          height: 12,
          borderTop: `2px solid ${accentColor}`,
          borderRight: `2px solid ${accentColor}`,
        }}
      />

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: accentColor, fontSize: 12 }}>◈</span>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: accentColor, textTransform: "uppercase" }}>
            {type.toUpperCase()} HUD TELEMETRY
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}
        >
          ✕
        </button>
      </div>

      {/* Cybernetic Telemetry Data Panels */}
      {type === "yopho" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CircularStatusDial value={88} max={100} color="#FF2DAA" label="FOIL" />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Active Trading Card</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700" }}>YoPho Edition #0042</div>
              <div style={{ fontSize: 8, color: "#FF2DAA", marginTop: 2 }}>Double Exposure · 3 Effect Layers</div>
            </div>
          </div>
          <SegmentedProgressBar segments={10} activeSegments={7} color="#FF2DAA" height={6} />
        </div>
      )}

      {type === "rewards" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CircularStatusDial value={7} max={7} color="#00FF88" label="STREAK" />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>PunPoints Balance</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>38,500 PTS</div>
              <div style={{ fontSize: 8, color: "#00FF88", marginTop: 2 }}>1.5x Daily Streak Active</div>
            </div>
          </div>
          <WaveformAreaGraph data={[20, 35, 50, 40, 75, 90, 85, 100]} color="#00FF88" height={36} />
        </div>
      )}

      {type === "admin" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CircularStatusDial value={100} max={100} color="#00FFFF" label="SENTINELS" />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Security Status</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88" }}>100 SENTINELS ACTIVE</div>
              <div style={{ fontSize: 8, color: "#00FFFF", marginTop: 2 }}>Threat Score: 0.02 (NORMAL)</div>
            </div>
          </div>
          <SegmentedProgressBar segments={12} activeSegments={12} color="#00FFFF" height={6} />
        </div>
      )}

      {type === "avatar-quick" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(0,229,255,0.15)", border: "1px solid rgba(0,229,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Active Avatar</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#00E5FF" }}>My Bobblehead</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Face · Outfit · Props</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["😄 Wave", "👏 Clap", "🔥 Hype", "🎉 Celebrate"].map((e) => (
              <button key={e} type="button" style={{ padding: "3px 8px", fontSize: 9, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 4, color: "#00E5FF", cursor: "pointer" }}>{e}</button>
            ))}
          </div>
          {ctaBtn("⬇ OPEN AVATAR STUDIO", () => openFullDrawer("inventory"), "#00E5FF")}
        </div>
      )}

      {type === "inventory-quick" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 2 }}>Recent Items</div>
          {["🎩 TMI Gold Hat", "✨ Neon Effect", "🕶 Vice City Shades"].map((item) => (
            <div key={item} style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{item}</div>
          ))}
          <SegmentedProgressBar segments={8} activeSegments={5} color="#FFD700" height={5} />
          <div style={{ fontSize: 8, color: "rgba(255,215,0,0.6)" }}>5 / 8 slots equipped</div>
          {ctaBtn("⬇ OPEN FULL INVENTORY", () => openFullDrawer("inventory"), "#FFD700")}
        </div>
      )}

      {type === "memory-quick" && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 2 }}>Recent Memories</div>
          {["🎤 Battle Win · 2h ago", "🎶 Track Saved · yesterday", "⭐ Crown Moment · 3d ago"].map((m) => (
            <div key={m} style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{m}</div>
          ))}
          <WaveformAreaGraph data={[30, 55, 40, 80, 65, 90, 75, 100]} color="#AA2DFF" height={28} />
          {ctaBtn("⬇ VIEW FULL MEMORY WALL", () => openFullDrawer("memory-wall"), "#AA2DFF")}
        </div>
      )}

      {/* Settle Status Indicator */}
      <div style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 8, color: settled ? "rgba(255,255,255,0.3)" : accentColor, letterSpacing: "0.1em" }}>
        {settled ? "HUD READY · STAGE STABLE" : "SWEEPING TELEMETRY STACK…"}
      </div>
    </div>
  );
}
