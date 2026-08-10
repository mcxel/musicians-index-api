"use client";

import React from "react";

export interface SidebarTwoLevelControlProps {
  label: string;
  quickLabel?: string;
  drawerLabel?: string;
  accentColor?: string;
  onOpenQuickHud: () => void;
  onOpenWorkspace: () => void;
  className?: string;
}

/**
 * SidebarTwoLevelControl.tsx
 *
 * Canonical TMI Two-Level Control:
 * LABEL
 * [ ◈ QUICK HUD  │  ▾ FULL WORKSPACE ]
 *
 * Invariants:
 * 1. One Click = Immediate Execution on either half (0 detours, no "OPEN" buttons).
 * 2. Left half = Floating Eye-Level Cybernetic Quick HUD (real data, 150-300ms sweep).
 * 3. Right half = Full Workspace / Drawer underneath monitor stack.
 * 4. Zero Stage Disruption (monitors never squeezed, shifted, or interrupted).
 */
export default function SidebarTwoLevelControl({
  label,
  quickLabel = "QUICK",
  drawerLabel = "WORKSPACE",
  accentColor = "#00FFFF",
  onOpenQuickHud,
  onOpenWorkspace,
  className = "",
}: SidebarTwoLevelControlProps) {
  return (
    <div className={`flex flex-col gap-1 w-full my-1.5 ${className}`}>
      {/* Label above control */}
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: accentColor,
          textTransform: "uppercase",
          paddingLeft: 2,
        }}
      >
        {label}
      </span>

      {/* Two-Level Split Control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: 28,
          borderRadius: 6,
          border: `1px solid ${accentColor}44`,
          background: `linear-gradient(180deg, ${accentColor}12, rgba(4,8,22,0.95))`,
          boxShadow: `0 0 12px ${accentColor}15`,
          overflow: "hidden",
        }}
      >
        {/* Left half: Quick HUD */}
        <button
          type="button"
          onClick={onOpenQuickHud}
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            borderRight: `1px solid ${accentColor}33`,
            color: "#fff",
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.08em",
            cursor: "pointer",
            padding: "0 6px",
            textTransform: "uppercase",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${accentColor}25`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span style={{ color: accentColor }}>◈</span> {quickLabel}
        </button>

        {/* Right half: Full Workspace / Drawer */}
        <button
          type="button"
          onClick={onOpenWorkspace}
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.08em",
            cursor: "pointer",
            padding: "0 6px",
            textTransform: "uppercase",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span style={{ color: accentColor }}>▾</span> {drawerLabel}
        </button>
      </div>
    </div>
  );
}
