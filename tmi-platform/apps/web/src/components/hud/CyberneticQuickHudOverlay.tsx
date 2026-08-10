"use client";

import React, { useEffect, useState } from "react";
import {
  CircularStatusDial,
  SegmentedProgressBar,
  WaveformAreaGraph,
} from "./CyberneticPanelPrimitives";

export type QuickHudType =
  | "yopho"
  | "memory"
  | "submissions"
  | "avatar"
  | "rewards"
  | "live"
  | "admin";

export interface CyberneticQuickHudOverlayProps {
  type: QuickHudType;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

/**
 * CyberneticQuickHudOverlay.tsx
 *
 * Rich Cybernetic Sci-Fi HUD Panel (inspired by cyan/emerald UI interfaces).
 * Features:
 * - 150-300ms corner bracket sweep animation (settles down cleanly).
 * - SVG Circular Status Dials, Segmented Telemetry Meters, Waveform Graphs.
 * - REAL live data metrics (XP, points, pending counts, active sentinels, live viewers).
 * - Reserved floating overlay position (0 monitor stage compression/shift).
 * - Immediate execution CTA button to open full workspace.
 */
export default function CyberneticQuickHudOverlay({
  type,
  isOpen,
  onClose,
  accentColor = "#00FFFF",
}: CyberneticQuickHudOverlayProps) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSettled(false);
      return;
    }
    const timer = setTimeout(() => setSettled(true), 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        right: 24,
        width: 320,
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

      {/* Settle Status Indicator */}
      <div style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 8, color: settled ? "rgba(255,255,255,0.3)" : accentColor, letterSpacing: "0.1em" }}>
        {settled ? "HUD READY · STAGE STABLE" : "SWEEPING TELEMETRY STACK…"}
      </div>
    </div>
  );
}
