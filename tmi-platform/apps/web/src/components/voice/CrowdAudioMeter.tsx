"use client";

// CrowdAudioMeter.tsx
// Visualizes crowd audio level and current active moment.

import React from "react";
import type { CrowdMoment } from "@/lib/voice/CrowdAudioMixEngine";

interface CrowdAudioMeterProps {
  crowdOpen: boolean;
  activeMoment: CrowdMoment;
  level: number; // 0–1
}

const MOMENT_COLOR: Partial<Record<CrowdMoment, string>> = {
  YAY: "#00ffcc",
  BOO: "#ff4444",
  APPLAUSE: "#ffcc00",
  COMEBACK: "#ff9f00",
  WINNER: "#00e5ff",
  BEBO_PULL: "#ff6600",
  BEBO_RETURN: "#66ff99",
  NONE: "#333",
};

const MOMENT_LABEL: Partial<Record<CrowdMoment, string>> = {
  YAY: "YAY",
  BOO: "BOO",
  APPLAUSE: "APPLAUSE",
  COMEBACK: "COMEBACK",
  WINNER: "WINNER",
  BEBO_PULL: "BEBO PULL",
  BEBO_RETURN: "BEBO BACK",
  NONE: "CROWD MUTED",
};

const BAR_COUNT = 12;

export default function CrowdAudioMeter({
  crowdOpen,
  activeMoment,
  level,
}: CrowdAudioMeterProps) {
  const activeColor = crowdOpen
    ? (MOMENT_COLOR[activeMoment] ?? "#00ffcc")
    : "#333";

  const filledBars = crowdOpen ? Math.round(level * BAR_COUNT) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontFamily: "monospace",
        fontSize: "11px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: activeColor,
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        <span>CROWD</span>
        <span>{MOMENT_LABEL[activeMoment] ?? "—"}</span>
      </div>
      {/* Bar meter */}
      <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "20px" }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const isActive = i < filledBars;
          const height = 6 + ((i / BAR_COUNT) * 14);
          return (
            <div
              key={i}
              style={{
                width: "6px",
                height: `${height}px`,
                borderRadius: "2px",
                background: isActive ? activeColor : "rgba(255,255,255,0.08)",
                boxShadow: isActive ? `0 0 4px ${activeColor}` : "none",
                transition: "background 0.1s",
                alignSelf: "flex-end",
              }}
            />
          );
        })}
      </div>
      {/* Level label */}
      <div style={{ color: "#555", fontSize: "9px" }}>
        {crowdOpen
          ? `LEVEL ${Math.round(level * 100)}%`
          : "GATED"}
      </div>
    </div>
  );
}
